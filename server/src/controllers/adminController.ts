import { Request, Response } from "express";
import fs from "fs";
import KYC from "../models/KYC";
import { publishPDFJob } from "../services/rabbitmqService";
import { logger } from "../utils/logger";

// Get all KYC applications
export const getAllKYC = async (req: Request, res: Response) => {
  try {
    const kycList = await KYC.find().sort({ submittedAt: -1 });
    res.json({ success: true, data: kycList });
  } catch (error) {
    logger.error("Error fetching KYC list", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching KYC list" });
  }
};

// Get KYC by ID
export const getKYCById = async (req: Request, res: Response) => {
  try {
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }
    res.json({ success: true, data: kyc });
  } catch (error) {
    logger.error("Error fetching KYC", error);
    res.status(500).json({ success: false, message: "Error fetching KYC" });
  }
};

// Update KYC status (approve/reject)
export const updateKYCStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    res.json({ success: true, message: `KYC ${status}`, data: kyc });
  } catch (error) {
    logger.error("Error updating KYC", error);
    res.status(500).json({ success: false, message: "Error updating KYC" });
  }
};

// Generate PDF for approved KYC (queued via RabbitMQ)
export const generatePDF = async (req: Request, res: Response) => {
  try {
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    if (kyc.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved KYC can generate PDF",
      });
    }

    // Check if PDF already exists
    if (kyc.pdfPath && fs.existsSync(kyc.pdfPath)) {
      logger.info(`Serving existing PDF: ${kyc.pdfPath}`);
      return res.download(kyc.pdfPath);
    }

    // Publish job to RabbitMQ queue
    const published = await publishPDFJob({
      kycId: (kyc._id as any).toString(),
      userId: (kyc.userId as any).toString(),
      fullName: kyc.fullName,
      email: kyc.email,
    });

    if (published) {
      return res.status(202).json({
        success: true,
        message: "PDF generation queued. Your PDF will be ready shortly.",
        status: "queued",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to queue PDF generation",
    });
  } catch (error) {
    logger.error("Error generating PDF", error);
    res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};
