import mongoose from "mongoose";
import dotenv from "dotenv";
import Prompt from "../models/prompts.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const STUDENT_PROMPTS = [
  "Explain any concept in simple terms",
  "Give me a quick crash course on any subject",
  "Simplify something that feels confusing",
  "Teach me a topic from scratch",
  "Summarize a complex topic quickly",
  "Generate ideas for a project or topic",
  "Turn rough thoughts into structured notes",
  "Help me improve my writing clarity",
  "Give me a structured learning path",
  "Help me plan something from start to finish",
  "Translate complex ideas into plain English"
];

const DEV_PROMPTS = [
  "Explain how a system works",
  "Break down a complex concept",
  "Teach me a new backend concept",
  "How do modern web apps scale?",
  "Explain how APIs work in real-world apps",
  "What happens behind the scenes in a request?",
  "How does authentication actually work?",
  "Explain caching in simple terms",
  "How do databases handle large data?",
  "Compare different backend architectures",
  "How does Docker fit into development?",
  "Explain how frontend and backend connect",
  "What are common system design patterns?",
  "How do real-time systems work?",
  "Explain trade-offs in system design",
  "Help me choose the right tech stack",
  "Optimize frontend performance",
  "Structure a scalable project",
  "Guide me step-by-step to build a feature",
  "Design a backend or system architecture",
  "Help me think through a problem logically",
];

const seedDB = async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected!");

    console.log("🧹 Clearing existing prompts...");
    await Prompt.deleteMany({});

    const promptsToInsert = [
      ...STUDENT_PROMPTS.map(text => ({ text, category: "student", priority: 1 })),
      ...DEV_PROMPTS.map(text => ({ text, category: "developer", priority: 1 }))
    ];

    console.log(`🌱 Seeding ${promptsToInsert.length} prompts...`);
    await Prompt.insertMany(promptsToInsert);

    console.log("✨ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
