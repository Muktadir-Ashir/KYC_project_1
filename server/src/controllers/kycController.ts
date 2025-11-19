import { Request, Response } from "express";
import KYC from "../models/KYC";
import { generateAISummary } from "../services/llmService";
import { logger } from "../utils/logger";

// Submit KYC application
export const submitKYC = async (req: Request, res: Response) => {
  try {
    // Get userId from verified token
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    // Create KYC with userId
    const kycData = new KYC({
      ...req.body,
      userId,
    });

    // Generate AI summary before saving
    try {
      logger.info("Generating AI summary for KYC submission...");
      const aiSummary = await generateAISummary(kycData);
      kycData.aiSummary = aiSummary;
    } catch (aiError) {
      logger.error("AI summary generation failed, continuing without it", aiError);
      kycData.aiSummary = `KYC submission for ${kycData.fullName} received and pending verification.`;
    }

    await kycData.save();
    res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      data: kycData,
    });
  } catch (error) {
    logger.error("Error submitting KYC", error);
    res.status(500).json({ success: false, message: "Error submitting KYC" });
  }
};

// Get single KYC application (user can only get their own)
export const getKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const kycId = req.params.id;

    const kyc = await KYC.findById(kycId);

    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }

    // Check if user owns this KYC
    if (kyc.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    res.json({ success: true, data: kyc });
  } catch (error) {
    logger.error("Error fetching KYC", error);
    res.status(500).json({ success: false, message: "Error fetching KYC" });
  }
};

// Get user's KYC applications (new endpoint for user dashboard)
export const getUserKYCList = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const kycs = await KYC.find({ userId }).sort({ submittedAt: -1 });

    res.json({ success: true, data: kycs });
  } catch (error) {
    logger.error("Error fetching user KYC list", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching KYC list" });
  }
};
