import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import { getTrash, hardDeleteNote, emptyTrash, hardDeleteFolder, restoreNote, restoreFolder } from "../controllers/trash.controller.js";


const router = express.Router();

router.use(authMiddleware);

router.get("/", getTrash);
router.delete("/empty", emptyTrash);

//Restore 
router.patch("/restore/note/:id", restoreNote);
router.patch("/restore/folder/:id", restoreFolder);

//Hard delete
router.delete("/note/:id", hardDeleteNote);
router.delete("/folder/:id", hardDeleteFolder);

export default router;