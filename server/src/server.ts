import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import User from "./models/User";
import { startPDFWorker } from "./services/pdfWorker";
import { connectRabbitMQ } from "./services/rabbitmqService";
import { logger } from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 5000;

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
    logger.info("Default admin created: username=admin, password=admin123");
  } catch (error) {
    logger.error("Error creating default admin", error);
  }
};

// Initialize services
(async () => {
  await connectDB();
  await createDefaultAdmin();

  // Initialize RabbitMQ
  try {
    await connectRabbitMQ();
    await startPDFWorker();
    logger.info("PDF Worker initialized");
  } catch (error) {
    logger.warn("RabbitMQ not available - PDF generation will be skipped", error);
  }
})();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
