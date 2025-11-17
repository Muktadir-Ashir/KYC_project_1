import express from "express";
import {
  generatePDF,
  getAllKYC,
  getKYCById,
  updateKYCStatus,
} from "../controllers/adminController";
import { isAdmin, verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// Protected admin routes - must be admin
router.get("/admin/kyc", verifyToken, isAdmin, getAllKYC);
router.get("/admin/kyc/:id", verifyToken, isAdmin, getKYCById);
router.patch("/admin/kyc/:id", verifyToken, isAdmin, updateKYCStatus);
router.get("/admin/kyc/:id/pdf", verifyToken, isAdmin, generatePDF);

export default router;
