import cors from "cors";
import express from "express";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import kycRoutes from "./routes/kycRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", kycRoutes);
app.use("/api", adminRoutes);

// Health route
app.get("/", (_req, res) => {
  res.json({ message: "KYC API is running" });
});

export default app;
