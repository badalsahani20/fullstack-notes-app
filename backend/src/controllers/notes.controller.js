import Notes from "../models/notes.model.js";
export const getAllNotes = async (req, res, next) => {
  try {
    const note = await Notes.find({ user: req.user._id }).sort({
      pinned: -1,
      updatedAt: -1,
    });

    if(!note || note.length === 0) return res.status(404).json({message: "No notes found. Create one!"});
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Notes.create({
      user: req.user._id,
      title: req.body.title,
      content: req.body.content,
    });

    res.status(201).json({message: "Note created", note});
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req,res,next) => {
  try {
    const note = await Notes.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if(!note) {
      return res.status(404).json({message: "Note not found"});
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
}

export const updateNote = async (req, res, next) => {
  try {
    const note = await Notes.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      { new: true }
    );
    if(!note) return res.status(404).json({message: "Note not found"});
    res.status( 200).json({message: "Note updated", note}) //Updated status code
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
    try {
        const note = await Notes.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if(!note) return res.status(404).json({message: "Note not found"});
        res.status(200).json({message: "Note deleted"});
    } catch (error) {
        next(error);
    }
}

export const togglePin = async (req, res, next) => {
    try {
        const note = await Notes.findOne({_id:req.params.id, user: req.user._id});
        if(!note) {
            return res.status(404).json({message: "Note not found"});
        }
        note.pinned = !note.pinned;
        await note.save();
        res.status(200).json({message: "Note pinned successfully" , note});
    } catch (error) {
        next(error);
    }
}
