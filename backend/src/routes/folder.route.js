import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import verifiedMiddleware from "../middleware/verified.middleware.js";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
  getFolderById,
  getNotesByFolder
} from "../controllers/folder.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.use(verifiedMiddleware);

router.get("/", getAllFolders);
router.post("/", createFolder);

router.get("/:id", getFolderById);
router.get("/:id/notes", getNotesByFolder);


router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

export default router;

