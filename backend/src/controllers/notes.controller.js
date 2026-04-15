import * as NoteService from "../services/notes.service.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";
import { redis } from "../../config/redis.js";
import { sanitizeNoteHtml } from "../utils/sanitizeNoteHtml.js";
import { generateTitle } from "../services/ai.service.js";
import Notes from "../models/notes.model.js";
import { stripHtml } from "../utils/stripHtml.js";

const clearNoteCaches = async (userId) =>
  Promise.all([
    redis.del(`notes:${userId}`),
    redis.del(`notes:archive:${userId}`),
  ]);

const DEFAULT_NOTE_TITLES = ["Untitled Note", "Untitled"];

const queueAutoTitleGeneration = (note, userId) => {
  if (!note || !DEFAULT_NOTE_TITLES.includes(note.title) || !note.content) {
    return;
  }

  const plainText = stripHtml(note.content).trim();
  if (!plainText) {
    return;
  }

  generateTitle(plainText)
    .then(async (title) => {
      const normalizedTitle = title?.trim();
      if (!normalizedTitle) {
        return;
      }

      const updated = await Notes.findOneAndUpdate(
        {
          _id: note._id,
          user: userId,
          title: { $in: DEFAULT_NOTE_TITLES },
        },
        { title: normalizedTitle },
        { new: true }
      ).exec();

      if (updated) {
        await clearNoteCaches(userId);
      }
    })
    .catch((err) => console.error("[AutoTitle] failed:", err));
};

export const getAllNotes = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const cacheKey = `notes:${userId}`;
    const lockKey = `lock:notes:${userId}`;

    //Check cache
    const cachedNotes = await redis.get(cacheKey);

    if (cachedNotes) {
        // Upstash automatically parses objects
        return res.status(200).json(cachedNotes);
    }

    const lock = await redis.set(lockKey, "1", { nx: true, ex: 5});

    if(lock) {
      // 2. If not in cache, fetch from database
      const notes = await NoteService.findUserNotes(userId);
      if(!notes || notes.length === 0) {
        await redis.del(lockKey);
        return res.status(404).json({message: "No notes found."});
      }
      
      await redis.set(cacheKey, notes, { ex: 3600 });
      await redis.del(lockKey); 
      
      res.status(200).json(notes);
    }else{
       // Another request is fetching DB
       await new Promise((resolve) => setTimeout(resolve, 100));
       const retryCache = await redis.get(cacheKey);

       if(retryCache) {
        return res.status(200).json(retryCache);
       }

       //Fallback if cache still empty
       const notes = await NoteService.findUserNotes(userId);
       return res.status(200).json(notes);
    }
});

export const getArchivedNotes = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const cacheKey = `notes:archive:${userId}`;
    const lockKey = `lock:notes:archive:${userId}`;

    const cachedNotes = await redis.get(cacheKey);
    if (cachedNotes) {
      return res.status(200).json(cachedNotes);
    }

    const lock = await redis.set(lockKey, "1", { nx: true, ex: 5 });

    if (lock) {
      const notes = await NoteService.findArchivedNotes(userId);
      await redis.set(cacheKey, notes, { ex: 3600 });
      await redis.del(lockKey);
      return res.status(200).json(notes);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const retryCache = await redis.get(cacheKey);

    if (retryCache) {
      return res.status(200).json(retryCache);
    }

    const notes = await NoteService.findArchivedNotes(userId);
    return res.status(200).json(notes);
});

export const createNote = catchAsync(async (req, res) => {
    const { content, title, color, folder, createdAt} = req.body;
    const note = await NoteService.createNewNote(req.user._id, {
      content: sanitizeNoteHtml(content),
      title,
      color,
      folder,
      createdAt,
    });

    // Invalidate cache
    await clearNoteCaches(req.user._id);

    queueAutoTitleGeneration(note, req.user._id);

    res.status(201).json(note);
});

export const getNoteById = catchAsync(async (req, res) => {
    const note = await NoteService.findNotesById(req.params.id, req.user._id);
    if(!note) {
      return res.status(404).json({message: "Note not found."});
    }

    // Silently update lastAccessedAt without bumping updatedAt
    NoteService.stampNoteAccess(req.params.id, req.user._id).catch(() => {});

    res.json(note);
})

export const updateNote = catchAsync(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ message: "Invalid note id" });
}
  const { version, ...updateData } = req.body;
  if (version === undefined) {
   return res.status(400).json({
      message: "Version is required for update"
   });
} 
  const finalUpdateData = {
    ...updateData,
    ...(typeof updateData.content === "string" ? { content: sanitizeNoteHtml(updateData.content) } : {}),
    grammarErrors: [],
  };
  const result = await NoteService.updateNoteWithVersionCheck(
    req.params.id,
    req.user._id,
    version,
    finalUpdateData
  );

  if(!result) {
    await clearNoteCaches(req.user._id);
    return res.status(404).json({ message: "Note not found" });
  }
  
  if(result.conflict) {
    return res.status(409).json({
      message: "Conflict detected",
      serverVersion: result.serverNote,
    });
  }

    // Invalidate cache
    await clearNoteCaches(req.user._id);

    queueAutoTitleGeneration(result.updatedNote, req.user._id);

    res.status(200).json(result.updatedNote);
});

export const deleteNote = catchAsync(async (req, res) => {
    const { version } = req.body;

    const result = await NoteService.removeNote(req.params.id, req.user._id, version);
    if(!result) {
        await clearNoteCaches(req.user._id);
        return res.status(404).json({message: "Note not found"});
    }
    if(result.conflict) {
      return res.status(409).json({
        message: "Conflict detected: Note was updated on another device",
        serverNote: result.serverNote,
      });
    }

    // Invalidate cache
    await clearNoteCaches(req.user._id);

    res.status(200).json({message: "Note Moved to Trash" });
})

export const togglePin = catchAsync(async (req, res) => {
    const { version } = req.body;
    if (version === undefined) {
      return res.status(400).json({ message: "Version is required for pin toggle" });
    }

    const result = await NoteService.flipPinStatus(req.params.id, req.user._id, version);
    if(!result) {
        await clearNoteCaches(req.user._id);
        return res.status(404).json({message: "Note not found"});
    }
    if (result.conflict) {
      return res.status(409).json({
        message: "Conflict detected: Note was updated on another device",
        serverNote: result.serverNote,
      });
    }

    // Invalidate cache
    await clearNoteCaches(req.user._id);

    res.status(200).json({message: "Pin status toggled" , note: result.updatedNote});
})

export const toggleArchive = catchAsync(async (req, res) => {
    const { version } = req.body;
    if (version === undefined) {
      return res.status(400).json({ message: "Version is required for archive toggle" });
    }

    const result = await NoteService.flipArchiveStatus(req.params.id,req.user._id, version);
    if(!result) {
        await clearNoteCaches(req.user._id);
        return res.status(404).json({message: "Note not found"});
    }
    if (result.conflict) {
      return res.status(409).json({
        message: "Conflict detected: Note was updated on another device",
        serverNote: result.serverNote,
      });
    }

    // Invalidate cache
    await clearNoteCaches(req.user._id);

    res.status(200).json({message: result.updatedNote.isArchived ? "Note archived" : "Note unarchived" , note: result.updatedNote});
})

export const searchAllNotes = catchAsync(async (req, res) => {
  const { q, folderId } = req.query;
  if(!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query is required"});
  }

  const notes = await NoteService.searchNote(req.user._id, q, folderId);

  res.status(200).json({
    success: true,
    count: notes.length,
    notes
  });
});

export const restoreNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const restoredNote = await NoteService.restoreNote(id, userId);
  if(!restoredNote) {
    return res.status(404).json({
      success: false,
      message: "Note not found or not in trash"
    });
  }

  // Invalidate cache
  await clearNoteCaches(userId);

  res.status(200).json({
    success: true,
    message: "Note restored!",
    note: restoredNote
  });
})
