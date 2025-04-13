import express from "express";
import { myself, workspaces } from "../controllers/userController";
import { authenticateToken } from "../utils/authUtils";

const router = express.Router();

router.get("/myself", authenticateToken, myself);
router.get("/workspaces", authenticateToken, workspaces);

export default router;
