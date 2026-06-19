import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["PROFILE", "PREFERENCE", "GOAL", "PROJECT", "SKILL", "OTHER"],
      default: "OTHER",
    },
    // thenlper/gte-base produces 768-dimensional embeddings
    embedding: {
      type: [Number],
      required: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
