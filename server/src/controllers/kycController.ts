import { Request, Response } from 'express';
import KYC from '../models/KYC';
import { generateAISummary } from '../services/llmService';

// Submit KYC application
export const submitKYC = async (req: Request, res: Response) => {
  try {
    const kycData = new KYC(req.body);
    
    // Generate AI summary before saving
    console.log('Generating AI summary for KYC submission...');
    const aiSummary = await generateAISummary(kycData);
    kycData.aiSummary = aiSummary;
    
    await kycData.save();
    res.status(201).json({ 
      success: true, 
      message: 'KYC submitted successfully',
      data: kycData 
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ success: false, message: 'Error submitting KYC' });
  }
};

// Get single KYC application
export const getKYC = async (req: Request, res: Response) => {
  try {
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC not found' });
    }
    res.json({ success: true, data: kyc });
  } catch (error) {
    console.error('Error fetching KYC:', error);
    res.status(500).json({ success: false, message: 'Error fetching KYC' });
  }
};