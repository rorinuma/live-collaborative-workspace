import express from "express";
import { myself } from "../controllers/userController";
import { authenticateToken } from "../utils/authUtils";

const router = express.Router();

router.get("/myself", authenticateToken, myself);

export default router;
