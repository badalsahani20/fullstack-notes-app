import * as NoteService from "../services/notes.service.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";
import { redis } from "../../config/redis.js";

export const getAllNotes = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const cacheKey = `notes:${userId}`;
    const lockKey = `lock:notes:${userId}`;

    //Check cache
    const cachedNotes = await redis.get(cacheKey);

    if (cachedNotes) {
        // Upstash automatically parses objects, no need for JSON.parse
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
      
      // Upstash automatically stringifies objects, no need for JSON.stringify
      await redis.set(cacheKey, notes, { ex: 3600 });
      await redis.del(lockKey); 
      
      res.status(200).json(notes);
    }else{
       // 3️⃣ Another request is fetching DB
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

export const createNote = catchAsync(async (req, res) => {
    const { content, title, color, folder, createdAt} = req.body;
    const note = await NoteService.createNewNote(req.user._id, {content, title, color, folder, createdAt});

    // Invalidate cache
    await redis.del(`notes:${req.user._id}`);

    res.status(201).json(note);
});

export const getNoteById = catchAsync(async (req, res) => {
    const note = await NoteService.findNotesById(req.params.id, req.user._id);
    if(!note) {
      return res.status(404).json({message: "Note not found."});
    }
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
  const finalUpdateData = {...updateData, grammarErrors: [] };
  const result = await NoteService.updateNoteWithVersionCheck(
    req.params.id,
    req.user.id,
    version,
    finalUpdateData
  );

  if(!result) {
    return res.status(404).json({ message: "Note not found" });
  }
  
  if(result.conflict) {
    return res.status(409).json({
      message: "Conflict detected",
      serverVersion: result.serverNote,
    });
  }

    // Invalidate cache
    await redis.del(`notes:${req.user._id}`);

    res.status(200).json(result.updatedNote);
});

export const deleteNote = catchAsync(async (req, res) => {
    const { version } = req.body;

    const result = await NoteService.removeNote(req.params.id, req.user._id, version);
    if(!result) return res.status(404).json({message: "Note not found"});
    if(result.conflict) {
      return res.status(409).json({
        message: "Conflict detected: Note was updated on another device",
        serverNote: result.serverNote,
      });
    }

    // Invalidate cache
    await redis.del(`notes:${req.user._id}`);

    res.status(200).json({message: "Note Moved to Trash" });
})

export const togglePin = catchAsync(async (req, res) => {
    const note = await NoteService.flipPinStatus(req.params.id,req.user._id);
    if(!note) {
        return res.status(404).json({message: "Note not found"});
    }

    // Invalidate cache
    await redis.del(`notes:${req.user._id}`);

    res.status(200).json({message: "Pin status toggled" , note});
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
  const userId = req.user.id;

  const restoredNote = await NoteService.restoreNote(id, userId);
  if(!restoredNote) {
    return res.status(404).json({
      success: false,
      message: "Note not found or not in trash"
    });
  }

  // Invalidate cache
  await redis.del(`notes:${userId}`);

  res.status(200).json({
    success: true,
    message: "Note restored!",
    note: restoredNote
  });
})
