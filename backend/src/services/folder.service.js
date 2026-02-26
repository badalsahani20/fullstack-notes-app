import Folder from "../models/folder.model.js";
import Notes from "../models/notes.model.js";
export const createFolder = async (userData) => {
  const { userId, name, color } = userData;

  //Check for duplicates
  const existingFolder = await Folder.findOne({
    user: userId,
    name: name.trim(),
  });
  if (existingFolder) {
    const error = new Error("Folder with this name already exists");
    error.statusCode = 400;
    throw error;
  }

  //Create folder
  return await Folder.create({
    user: userId,
    name: name.trim(),
    color,
  });
};

export const getUserFolders = async (userId) => {
  return await Folder.find({ user: userId, isDeleted: false }).sort({
    updatedAt: -1,
  });
};

export const getFolderById = async (folderId, userId) => {
  const folder = await Folder.findOne({
    _id: folderId,
    user: userId,
    isDeleted: false,
  });
  if (!folder) {
    const error = new Error("Folder not found");
    error.statusCode = 404;
    throw error;
  }
  return folder;
};

export const getNotesByFolder = async (folderId, userId) => {
  const folder = await Folder.findOne({
    _id: folderId,
    user: userId,
    isDeleted: false,
  });
  if (!folder) {
    return [];
  } // If folder doesn't exist, return empty array

  //Fetch notes in the folder
  return await Notes.find({
    user: userId,
    folder: folderId,
    isDeleted: false,
  }).sort({ pinned: -1, updatedAt: -1 });
};

export const updateFolderWithVersion = async (
  folderId,
  userId,
  clientVersion,
  updateData,
) => {
  //Find the current state of the folder
  const existingFolder = await Folder.findOne({ _id: folderId, user: userId });
  if (!existingFolder) {
    return null; // Folder not found
  }

  //Conflict detection
  if (clientVersion !== existingFolder.version) {
    return { conflict: true, serverFolder: existingFolder };
  }

  //Atomic update with version increment
  const updatedFolder = await Folder.findOneAndUpdate(
    { _id: folderId, user: userId },
    {
      ...updateData,
      version: existingFolder.version + 1,
    },
    { new: true },
  );
  return { updatedFolder };
};

export const removeFolderAndNotes = async (folderId, userId, clientVersion) => {
  // 1. Find the folder first to check the version
  const existingFolder = await Folder.findOne({ _id: folderId, user: userId });

  if (!existingFolder) {
    return null; // Folder not found
  }

  // 2. Check for version conflict
  if (clientVersion !== existingFolder.version) {
    return { conflict: true, serverFolder: existingFolder }; // Version mismatch
  }

  existingFolder.isDeleted = true;
  existingFolder.version += 1;
  await existingFolder.save();
  // 3. Soft delete the folder and its notes
  // we use UpdateMany for an O(n) bulk operation
  await Notes.updateMany(
    { folder: folderId, user: userId },
    {
      $set: { isDeleted: true },
      $inc: { version: 1 }, // Increment version so offline devices sync the delete
    },
  );
  return { success: true };
};

export const restoreFolderAndNotes = async (folderId, userId) => {
  //Find the deleted folder
  const folder = await Folder.findOne({
    _id: folderId,
    user: userId,
    isDeleted: true,
  });
  if (!folder) {
    const error = new Error("Deleted folder not found");
    error.statusCode = 404;
    throw error;
  }

  //Flip the folder back to active
  folder.isDeleted = false;
  folder.version += 1; // Increment version so offline devices sync the restore
  await folder.save();

  //Restore the notes in the folder
  await Notes.updateMany(
    { folder: folderId, user: userId, isDeleted: true },
    {
        $set: { isDeleted: false },
        $inc: { version: 1 }
    }
  );
  return folder;
};

export const permanentlyDeleteFolderAndNotes = async (folderId, userId) => {
    await Folder.findOneAndDelete({ _id: folderId, user: userId, isDeleted: true });

    await Notes.deleteMany({ folder: folderId, user: userId});
    return { success: true };
}