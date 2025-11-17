import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/database";
import User from "./models/User";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import kycRoutes from "./routes/kycRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create default admin if doesn't exist
const createDefaultAdmin = async () => {
  try {
    // Always recreate admin for consistency (development only)
    await User.deleteOne({ username: "admin" });
    
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const defaultAdmin = new User({
      username: "admin",
      email: "admin@kyc.com",
      password: hashedPassword,
      role: "admin",
    });
    await defaultAdmin.save();
    console.log(
      "✅ Default admin created: username=admin, password=admin123"
    );
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

// Connect to MongoDB and create default admin
(async () => {
  await connectDB();
  await createDefaultAdmin();
})();

// Routes
app.use("/api", authRoutes);
app.use("/api", kycRoutes);
app.use("/api", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "KYC API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
