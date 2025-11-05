import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    color:{
        type: String,
        default: "#dfe3ff"
    },
}, {timestamps: true});

const Folder = mongoose.model("Folder", folderSchema);
export default Folder;