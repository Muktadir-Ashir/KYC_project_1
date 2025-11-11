import express from 'express';
import { submitKYC, getKYC } from '../controllers/kycController';

const router = express.Router();

router.post('/kyc', submitKYC);
router.get('/kyc/:id', getKYC);

export default router;