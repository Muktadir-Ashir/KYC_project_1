import express from "express";
import {
  getKYC,
  getUserKYCList,
  submitKYC,
} from "../controllers/kycController";
import { isAuthenticated, verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// Protected routes - user must be authenticated
router.post("/kyc", verifyToken, isAuthenticated, submitKYC);
router.get("/kyc/list/my", verifyToken, isAuthenticated, getUserKYCList); // Must come BEFORE /:id
router.get("/kyc/:id", verifyToken, isAuthenticated, getKYC);

export default router;
