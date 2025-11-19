import amqp from "amqplib";
import { logger } from "../utils/logger";

let connection: any = null;
let channel: any = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const PDF_QUEUE = "pdf_generation_queue";

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declare queue (creates if doesn't exist)
    await channel.assertQueue(PDF_QUEUE, { durable: true });

    logger.info("Connected to RabbitMQ");
    logger.info(`Queue "${PDF_QUEUE}" ready`);

    return channel;
  } catch (error) {
    logger.error("RabbitMQ Connection Error", error);
    throw error;
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};

export const publishPDFJob = async (jobData: {
  kycId: string;
  userId: string;
  fullName: string;
  email: string;
}) => {
  try {
    const channel = getChannel();
    const message = JSON.stringify(jobData);

    channel.sendToQueue(PDF_QUEUE, Buffer.from(message), {
      persistent: true,
    });

    logger.info(`PDF Job published for KYC: ${jobData.kycId}`);
    return true;
  } catch (error) {
    logger.error("Error publishing PDF job", error);
    return false;
  }
};

export const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error("Error closing RabbitMQ", error);
  }
};
