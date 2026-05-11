import { ObjectId } from "bson";
import mongoose from "mongoose";

const flashCardSchema = new mongoose.Schema({
    note: {
        type: ObjectId, ref: "Notes", required: true
    },
    user: {
        type: ObjectId, ref: "User", required: true
    },
    cards: [{
        front: { type: String, required: true },
        back: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
            _id: false
        }
    }],
    generatedAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // 1 month TTL
    }
}, {timestamps: true, versionKey: false})

const FlashCard = mongoose.model("FlashCard", flashCardSchema)
export default FlashCard