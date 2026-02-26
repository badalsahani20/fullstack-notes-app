import Notes from "../models/notes.model.js";
import Folder from "../models/folder.model.js";
export const emptyTrash = async (userId) => {
    const [notesResult, foldersResult] = await Promise.all([
        Notes.deleteMany({ user: userId, isDeleted: true}),
        Folder.deleteMany({ user: userId, isDeleted: true})
    ]);

    return {
        notesDeleted: notesResult.deletedCount,
        foldersDeleted: foldersResult.deletedCount
    }
}

export const permanentlyDeleteFolderAndNotes = async (folderId, userId) => {
    const folderResult = await Folder.findOneAndDelete({ id: folderId, user: userId, isDeleted: true});

    if (folderResult) {
        await Notes.deleteMany({ folder: folderId, user: userId});
    }

    return folderResult;
}
export const getTrashItems = async (userId) => {
    const[notes, folders] = await Promise.all([
        Notes.find({ user: userId, isDeleted: true}).sort({ updatedAt: -1 }),
        Folder.find({user: userId, isDeleted: true}).sort({ updatedAt: -1 })
    ])

    return { notes, folders };
}

