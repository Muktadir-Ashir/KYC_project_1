import express from "express";
import {
  generatePDF,
  getAllKYC,
  getKYCById,
  updateKYCStatus,
} from "../controllers/adminController";

const router = express.Router();

router.get("/admin/kyc", getAllKYC);
router.get("/admin/kyc/:id", getKYCById);
router.patch("/admin/kyc/:id", updateKYCStatus);
router.get("/admin/kyc/:id/pdf", generatePDF);

export default router;
