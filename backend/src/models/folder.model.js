    import mongoose from "mongoose";
    import { generateSoftColor } from "../utils/colorUtils.js";

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
        version: {
            type: Number,
            default: 0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {timestamps: true});

    folderSchema.pre(/^find/, function(next) {
        this.find({ isDeleted: {$ne: true} });
        next();
    });
    
    folderSchema.pre("save", function (next) {
        if(!this.color || this.color === "#dfe3ff") {
            this.color = generateSoftColor();
        }
        next();
    });
    folderSchema.index({ user: 1, name: 1 }, { unique: true });
    const Folder = mongoose.model("Folder", folderSchema);
    export default Folder;