import * as TrashService from "../services/trash.service.js";
import * as NoteService from "../services/notes.service.js";
import catchAsync from "../utils/catchAsync.js";
export const getTrash = catchAsync(async (req, res, next) => {
    const trash = await TrashService.getTrashItems(req.user._id);

    res.status(200).json({success: true, ...trash});
});

export const hardDeleteNote = catchAsync(async (req, res, next) => {
    await NoteService.permanentlyRemoveNote(req.params.id, req.user._id);
    res.status(200).json({ message: "Note permanently deleted "});
});

export const hardDeleteFolder = catchAsync(async (req, res, next) => {
    await TrashService.permanentlyDeleteFolderAndNotes(req.params.id, req.user._id);
    res.status(200).json({ message: "Folder and its notes permanently deleted "});
});

export const emptyTrash = catchAsync(async (req, res, next) => {
    const result = await TrashService.emptyTrash(req.user._id);
    res.status(200).json({
        success: true,
        message: "All Cleared!",
        ...result
    });
})

export const restoreNote = catchAsync(async (req, res, next) => {
    const note = await NoteService.restoreNote(req.params.id, req.user._id);
    if (!note) {
        return res.status(404).json({ message: "Deleted note not found" });
    }
    res.status(200).json({
        success: true,
        message: "Note Restored",
        note
    });
});
