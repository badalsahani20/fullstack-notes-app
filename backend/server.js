import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRoute from "./src/routes/auth.route.js";
import notesRoute from "./src/routes/notes.route.js";
import folderRoute from "./src/routes/folder.route.js";
import aiRoute from "./src/routes/aiRoute.js"
import cookieParser from "cookie-parser";
import trashRoute from "./src/routes/trash.route.js";
import passport from "./config/passport.js";
import path from "path";
import { fileURLToPath } from "url";
import publicRoute from "./src/routes/public.route.js";
import studyRoute from "./src/routes/study.route.js";
import userRoute from "./src/routes/user.route.js";
import { processInactiveSessions } from "./src/services/memoryService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.set("trust proxy", 1); // Extract true client IP behind reverse proxies (Vercel/Render)

app.use(express.json({ limit: "15mb" })); // Increased limit to allow large Base64 Image Uploads
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["https://notesify.in", "https://www.notesify.in", "https://app.notesify.in", "https://notesify-eta.vercel.app", "https://notesify-home.vercel.app", "http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"],
    credentials: true,
}));

connectDB();
app.use("/api/public", publicRoute);
app.use(passport.initialize());
app.use("/api/users", authRoute);
app.use("/api/notes", notesRoute);
app.use("/api/folders", folderRoute);
app.use("/api/ai", aiRoute);
app.use("/api/trash", trashRoute);
app.use("/api/study", studyRoute);
app.use("/api/user", userRoute);

// Keep-alive route for monitoring and preventing sleep
app.get("/api/keep-alive", (req, res) => {
    res.status(200).json({ status: "alive" });
});

// Basic route for health checks on the root domain
app.get("/", (req, res) => {
    res.status(200).send("API is running");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

let isProcessing = false;

async function runMemoryCron() {
    if (isProcessing) return;

    try {
        isProcessing = true;
        await processInactiveSessions();
    } catch (err) {
        console.error(
            "Memory extraction cron failed:",
            err
        );
    } finally {
        isProcessing = false;
    }
}

runMemoryCron();

setInterval(runMemoryCron, 5 * 60 * 1000);


app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR: ", err.message);

    // If a streaming (SSE) response was already started, we cannot set headers or
    // call res.json() — that's what causes ERR_HTTP_HEADERS_SENT.
    // Destroy the socket to close the connection cleanly and bail out.
    if (res.headersSent) {
        console.error("  → headers already sent (likely mid-stream); destroying socket.");
        req.socket?.destroy();
        return;
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});