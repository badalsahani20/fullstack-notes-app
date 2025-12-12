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

function generateSoftColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 25 + Math.floor(Math.random() * 15);
    const lightness = 75 + Math.floor(Math.random() * 10);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
    // Pre-save hook to assign soft random color if not provided
    notesSchema.pre("save", function (next) {
        if(!this.color || this.color === "#ffffff") {
            this.color = generateSoftColor();
        }
        next();
    })


const Notes = mongoose.model("Notes", notesSchema);
export default Notes;
