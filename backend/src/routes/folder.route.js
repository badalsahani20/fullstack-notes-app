import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
  getFolderById,
} from "../controllers/folder.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getAllFolders);

router.get("/:id/notes", authMiddleware, getFolderById);

router.post("/", authMiddleware, createFolder);

router.put("/:id", authMiddleware, updateFolder);

router.delete("/:id", authMiddleware, deleteFolder);

export default router;
