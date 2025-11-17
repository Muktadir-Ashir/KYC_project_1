import express, { Router } from "express";
import { getCurrentUser, login, register } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);

// Protected routes
router.get("/auth/me", verifyToken, getCurrentUser);

export default router;
