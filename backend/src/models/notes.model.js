import mongoose from "mongoose";
import { generateSoftColor } from "../utils/colorUtils.js";

const notesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: "Untitled"
    },
    content: {
        type:String,
        default: ""
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
    },
    version: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true, versionKey: false});

notesSchema.index({ user: 1, pinned: -1, updatedAt: -1 });
notesSchema.index({ user: 1, folder: 1, updatedAt: -1 });
notesSchema.index({ user: 1, isDeleted: 1, title: "text", content: "text"},
    {
        weights: {
            title: 5,
            content: 1
        }
    }
);

    // Pre-save hook to assign soft random color if not provided
notesSchema.pre("save", function (next) {
    if(!this.color || this.color === "#ffffff") {
        this.color = generateSoftColor();
    }
    next();
});

notesSchema.pre(/^find/, function(next) {
    this.where({ isDeleted: {$ne: true} });
    next();
})


const Notes = mongoose.model("Notes", notesSchema);
export default Notes;
