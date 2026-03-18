import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import userRoute from "./src/routes/auth.route.js";
import notesRoute from "./src/routes/notes.route.js";
import folderRoute from "./src/routes/folder.route.js";
import aiRoute from "./src/routes/aiRoute.js"
import cookieParser from "cookie-parser";
import trashRoute from "./src/routes/trash.route.js";
import passport from "./config/passport.js";
// import { message } from "statuses";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["https://notesify-eta.vercel.app", "http://localhost:5173"],
    credentials: true,
}));

connectDB();
app.use(passport.initialize());
app.use("/api/users", userRoute);
app.use("/api/notes", notesRoute);
app.use("/api/folders", folderRoute);
app.use("/api/ai", aiRoute);
app.use("/api/trash", trashRoute);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR: ", err.message);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
})