import Folder from "../models/folder.model.js";
import Notes from "../models/notes.model.js";
export const createFolder = async (req, res, next) => {
  try {
    const folder = await Folder.create({
      user: req.user._id,
      name: req.body.name,
      color: req.body.color,
    });

    res.status(201).json({ message: "Folder Created", folder });
  } catch (error) {
    next(error);
  }
};

export const getAllFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(folders);
  } catch (error) {
    next(error);
  }
};

export const getNotesByFolder = async (req, res, next) => {
  try {
    const notes = await Notes.find({
      user: req.user._id,
      folder: req.params.id,
    }).sort({ updatedAt: -1 });

    if (!notes) return res.status(404).json({ message: "Empty Folder" });

    res.json(notes);
  } catch (error) {
    next(error);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json({ message: "Folder updated", folder });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    const folderId = req.params.id;
    await Notes.updateMany(
      {
        folder: folderId,
        user: req.user._id,
      },
      {
        $set: { folder: null },
      }
    );

    const folder = await Folder.findOneAndDelete({ _id: folderId, user: req.user._id });
    if(!folder) return res.status(404).json({message: "Folder Deleted"});
    res.json({ message: "Folder deleted" });
  } catch (error) {
    next(error);
  }
};
