import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Prompt text is required"],
        trim: true
    },
    category: {
        type: String,
        enum: ["student", "developer"],
        required: [true, "Category is required"],
        trim: true
    },
    priority: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {timestamps: true, versionKey: false});

const Prompt = mongoose.model("Prompt", PromptSchema);

export default Prompt;