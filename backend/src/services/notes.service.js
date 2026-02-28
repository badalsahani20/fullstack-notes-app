import Notes from "../models/notes.model.js";
import Folder from "../models/folder.model.js";
// import { $regex } from "sift";
export const findUserNotes = async (userId) => {
    return await Notes.find({ user: userId, isDeleted: false}).sort({
        pinned: -1,
        updatedAt: -1,
    });
}

export const createNewNote = async (userId, noteData) => {
    return await Notes.create({
        user: userId,
        ...noteData
    });
};

export const updateNoteById = async (noteId, userId, updateData) => {
    return await Notes.findOneAndUpdate(
        { _id: noteId, user: userId },
        updateData,
        {new: true}
    );
};

export const updateNoteWithVersionCheck = async (
    noteId,
    userId,
    clientVersion,
    updateData
) => {
    const updatedNote = await Notes.findOneAndUpdate({ _id: noteId, user: userId, version: clientVersion },
        {
            $set: updateData,
            $inc: { version: 1 }
        },
        { new: true }
    );
    if (!updatedNote) {
        //Either note not found or version mismatch. We need to check which one it is.
        const existingNote = await Notes.findOne({ _id: noteId, user: userId});
        if (!existingNote) {
            return null; // Note not found
        }
        return { conflict: true, serverNote: existingNote }; // Version mismatch
    }

    return { updatedNote };
}

export const findNotesById = async (noteId, userId) => {
    return await Notes.findOne({ _id: noteId, user: userId, isDeleted: false });
};

export const removeNote = async (noteId, userId, clientVersion) => {
    // 1. Find the note first to check the version
    const existingNote = await Notes.findOne({ _id: noteId, user: userId });
    if (!existingNote) {
        return null; // Note not found
    }
    // 2. Check for version conflict
    if(clientVersion !== existingNote.version) {
        return {conflict: true, serverNote: existingNote}; // Version mismatch
    }

    // 3. Soft delete: we can either remove the note or set a "deleted" flag. Here we choose to remove it.
    existingNote.isDeleted = true;
    existingNote.version += 1; // Increment version on delete as well

    return await existingNote.save();
}

export const flipPinStatus = async (noteId, userId) => {
    return await Notes.findOneAndUpdate(
        { _id: noteId, user: userId, isDeleted: false },
        [
            { 
                $set: { 
                    pinned: { $not: "$pinned" },
                    version: { $add: ["$version", 1] }
                } 
            }
        ],
        { new: true }
    );
}

export const searchNote = async(userId, query, folderId = null) => {

    const searchRegex = new RegExp(query, 'i');

    //The base filter
    const queryFilter = {
        user: userId,
        isDeleted: false,
        $or:[
            { title: { $regex: searchRegex }},
            { content: { $regex: searchRegex }},
            { $text: { $search: query }}
        ]
    };

    const baseFilter = { user: userId, isDeleted: false };

    //If folderId provided
    if(folderId && folderId !== null && folderId !== 'undefined'){
        baseFilter.folder = folderId;
    }

    let notes = await Notes.find({...baseFilter, $text: {$search: query}})
    .select({ score: {$meta: "textScore" }})
    .sort({ score: {$meta: "textScore" }});

    //Fallback
    if(notes.length === 0) {
        const searchRegex = new RegExp(query, 'i');
        notes = await Notes.find({
            ...baseFilter,
            $or: [
                {title: { $regex: searchRegex }},
                {content: { $regex: searchRegex }}
            ]
        }).sort({updatedAt: -1});
    }
    return notes;
}

export const restoreNote = async (noteId, userId) => {
    return await Notes.findOneAndUpdate(
        { _id: noteId, user: userId, isDeleted: true },
        { isDeleted: false,
            $inc: {version: 1} 
        },
        { new: true }
    );
}

