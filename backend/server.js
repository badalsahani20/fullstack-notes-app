import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./src/routes/user.route.js";
import notesRoute from "./src/routes/notes.route.js";
import folderRoute from "./src/routes/folder.route.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/users", userRoute);
app.use("/api/notes", notesRoute);
app.use("/api/folders", folderRoute);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use(errorMiddleware);