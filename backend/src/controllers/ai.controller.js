import { checkGrammar } from "../services/ai.service.js"; 
import catchAsync from "../utils/catchAsync.js";
import Notes from "../models/notes.model.js";


export const checkGrammarController = catchAsync(async (req, res, next) => {
    const {noteId} = req.params;

    const note = await Notes.findById(noteId);
    if(!note){
        return res.status(404).json({ success: false, message: "Note not found"});
    }

    const result = await checkGrammar(note.content);
    note.grammarErrors = result.errors;
    await note.save();
    
    res.status(200).json({
        success: true,
        data: result
    })
})