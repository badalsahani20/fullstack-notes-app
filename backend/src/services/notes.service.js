import Notes from "../models/notes.model.js";
// import { $regex } from "sift";
export const findUserNotes = async (userId) => {
    return await Notes.find({ user: userId, isDeleted: { $ne: true }, isArchived: { $ne: true }}).sort({
        pinned: -1,
        updatedAt: -1,
    });
}

export const findArchivedNotes = async (userId) => {
    return await Notes.find({ user: userId, isDeleted: false, isArchived: true }).sort({
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

export const updateNoteById = async (noteId, userId, updateData, clientVersion) => {
    return await Notes.findOneAndUpdate(
        { _id: noteId, user: userId, version: clientVersion, isDeleted: { $ne: true } },
        { $set: updateData, $inc: {version: 1}},
        {new: true}
    );
};

export const updateNoteWithVersionCheck = async (
    noteId,
    userId,
    clientVersion,
    updateData
) => {
    const updatedNote = await Notes.findOneAndUpdate({ _id: noteId, user: userId, version: clientVersion, isDeleted: { $ne: true } },
        {
            $set: updateData,
            $inc: { version: 1 }
        },
        { new: true }
    );
    if (!updatedNote) {
        //Either note not found or version mismatch. We need to check which one it is.
        const existingNote = await Notes.findOne({ _id: noteId, user: userId, isDeleted: { $ne: true }});
        if (!existingNote) {
            return null; // Note not found
        }
        return { conflict: true, serverNote: existingNote }; // Version mismatch
    }

    return { updatedNote };
}

export const findNotesById = async (noteId, userId) => {
    return await Notes.findOne({ _id: noteId, user: userId, isDeleted: { $ne: true } });
};

export const removeNote = async (noteId, userId, clientVersion) => {
    // 1. Find the note first to check the version
    const existingNote = await Notes.findOne({ _id: noteId, user: userId, isDeleted: { $ne: true } });
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
        { _id: noteId, user: userId, isDeleted: { $ne: true } },
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

export const flipArchiveStatus = async (noteId, userId) => {
    return await Notes.findOneAndUpdate(
        { _id: noteId, user: userId, isDeleted: { $ne: true } },
        [
            {
                $set: {
                    isArchived: { $not: "$isArchived" },
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
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
        $or:[
            { title: { $regex: searchRegex }},
            { content: { $regex: searchRegex }},
            { $text: { $search: query }}
        ]
    };

    const baseFilter = { user: userId, isDeleted: { $ne: true }, isArchived: { $ne: true } };

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

export const permanentlyRemoveNote = async (noteId, userId) => {
    return await Notes.findOneAndDelete({ _id: noteId, user: userId, isDeleted: true });
};
