import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import kycRoutes from './routes/kycRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', kycRoutes);
app.use('/api', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'KYC API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});