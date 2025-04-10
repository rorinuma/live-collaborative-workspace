import express from "express";
import { authenticateToken } from "../utils/authUtils";
import {
  createWorkspace,
  currentWorkspace,
  joinWorkspace,
  verifyInviteToken,
} from "../controllers/workspacesController";
import upload from "../config/multer";

const router = express.Router();

router.post(
  "/create",
  [authenticateToken, upload.single("workspaceImage")],
  createWorkspace,
);
router.post("/join", authenticateToken, joinWorkspace);
router.get("/invite-verify", authenticateToken, verifyInviteToken);
router.get("/:workspaceId", authenticateToken, currentWorkspace);

export default router;
