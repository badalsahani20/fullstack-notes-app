import express from "express";
import * as trashController from "../controllers/trash.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getTrash, hardDeleteNote, emptyTrash, hardDeleteFolder } from "../controllers/trash.controller.js";
import { permanentlyDeleteFolderAndNotes } from "../services/folder.service.js";
import { restoreNote } from "../services/notes.service.js";
import { restoreFolder } from "../controllers/folder.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authMiddleware, getTrash);
router.delete("/empty", emptyTrash);

//Restore 
router.patch("/restore/note/:id", restoreNote);
router.patch("/restore/folder/:id", restoreFolder);

//Hard delete
router.delete("/note/:id", hardDeleteNote);
router.delete("/folder/:id", hardDeleteFolder);