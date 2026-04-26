import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Notes from "../src/models/notes.model.js";
import { getWelcomeNote } from "../src/utils/welcomeNote.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected successfully.");

    const welcomeNote = getWelcomeNote();
    
    console.log("Looking for old welcome notes...");
    const result = await Notes.updateMany(
      { title: "Welcome to Notesify! 🚀" },
      { $set: { content: welcomeNote.content } }
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} welcome notes.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
