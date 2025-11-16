import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import KYC from "../models/KYC";

// Get all KYC applications
export const getAllKYC = async (req: Request, res: Response) => {
  try {
    const kycList = await KYC.find().sort({ submittedAt: -1 });
    res.json({ success: true, data: kycList });
  } catch (error) {
    console.error("Error fetching KYC list:", error);
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
    console.error("Error fetching KYC:", error);
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
    console.error("Error updating KYC:", error);
    res.status(500).json({ success: false, message: "Error updating KYC" });
  }
};

// Generate PDF for approved KYC
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

    // Create PDF document
    const doc = new PDFDocument();
    const filename = `KYC_${kyc._id}_${Date.now()}.pdf`;

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe document to response
    doc.pipe(res);

    // Add header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("KYC Verification Document", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Know Your Customer Information", { align: "center" });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Add content
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Personal Information:", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica");
    doc.text(`Full Name: ${kyc.fullName}`);
    doc.text(`Email: ${kyc.email}`);
    doc.text(`Phone: ${kyc.phone}`);
    doc.text(`Address: ${kyc.address}`);
    doc.text(`ID Number: ${kyc.idNumber}`);
    doc.text(
      `Date of Birth: ${new Date(kyc.dateOfBirth).toLocaleDateString()}`
    );

    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Verification Details:", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica");
    // Use fillColor to set text color in PDFKit (TextOptions doesn't accept a 'color' property)
    doc.fillColor("#008000").text(`Status: APPROVED`);
    doc.text(`Verification Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Document ID: ${kyc._id}`);

    if (kyc.aiSummary) {
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("AI Summary:", { underline: true });
      doc.moveDown(0.3);
      doc.font("Helvetica").text(kyc.aiSummary);
    }

    // Add footer with relative positioning
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "This document is generated automatically. For verification queries, please contact support.",
        { align: "center" }
      );
    doc.text(`Generated on: ${new Date().toLocaleString()}`, {
      align: "center",
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};
