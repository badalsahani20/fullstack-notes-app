import { Timestamp } from "bson";
import mongoose from "mongoose";

const notesSchema = await mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type:String,
        required: true,
    },
    folder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },

    pinned: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: "#ffffff"
    }
},{timestamps: true});

const Notes = mongoose.model("Notes", notesSchema);
export default Notes;
