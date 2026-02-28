import * as NoteService from "../services/notes.service.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";
export const getAllNotes = catchAsync(async (req, res, next) => {
    const notes = await NoteService.findUserNotes(req.user._id);

    if(!notes || notes.length === 0) {
      return res.status(404).json({message: "No notes found."});
    }
    res.status(200).json(notes);
});

export const createNote = catchAsync(async (req, res, next) => {
    const { content, title, color, folder, createdAt} = req.body;
    const note = await NoteService.createNewNote(req.user._id, {content, title, color, folder, createdAt});

    res.status(201).json(note);
});

export const getNoteById = catchAsync(async (req,res,next) => {
    const note = await NoteService.findNotesById(req.params.id, req.user._id);
    if(!note) {
      return res.status(404).json({message: "Note not found."});
    }
    res.json(note);
})

export const updateNote = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ message: "Invalid note id" });
}
  const { version, ...updateData } = req.body;
  if (version === undefined) {
   return res.status(400).json({
      message: "Version is required for update"
   });
}
  const result = await NoteService.updateNoteWithVersionCheck(
    req.params.id,
    req.user._id,
    version,
    updateData
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

    res.status(200).json(result.updatedNote);
});

export const deleteNote = catchAsync(async (req, res, next) => {
    const { version } = req.body;

    const result = await NoteService.removeNote(req.params.id, req.user._id, version);
    if(!result) return res.status(404).json({message: "Note not found"});
    if(result.conflict) {
      return res.status(409).json({
        message: "Conflict detected: Note was updated on another device",
        serverNote: result.serverNote,
      });
    }
    res.status(200).json({message: "Note Moved to Trash" });
})

export const togglePin = catchAsync(async (req, res, next) => {
    const note = await NoteService.flipPinStatus(req.params.id,req.user._id);
    if(!note) {
        return res.status(404).json({message: "Note not found"});
    }
    res.status(200).json({message: "Pin status toggled" , note});
})

export const searchAllNotes = catchAsync(async (req, res, next) => {
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
