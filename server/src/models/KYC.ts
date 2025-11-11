import mongoose, { Schema, Document } from 'mongoose';

export interface IKYC extends Document {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  dateOfBirth: Date;
  aiSummary?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

const kycSchema = new Schema<IKYC>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  idNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  aiSummary: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IKYC>('KYC', kycSchema);