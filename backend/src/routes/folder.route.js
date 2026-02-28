import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
  getFolderById,
  getNotesByFolder
} from "../controllers/folder.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllFolders);
router.post("/", authMiddleware, createFolder);

router.get("/:id", authMiddleware, getFolderById);
router.get("/:id/notes", authMiddleware, getNotesByFolder);


router.put("/:id", authMiddleware, updateFolder);
router.delete("/:id", authMiddleware, deleteFolder);

export default router;

