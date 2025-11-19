import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import KYC, { IKYC } from "../models/KYC";
import { getChannel } from "./rabbitmqService";

const PDF_QUEUE = "pdf_generation_queue";
const PDF_OUTPUT_DIR = path.join(__dirname, "../../pdfs");

// Create pdfs directory if it doesn't exist
if (!fs.existsSync(PDF_OUTPUT_DIR)) {
  fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
}

export const startPDFWorker = async () => {
  try {
    const channel = getChannel();

    // Set prefetch to 1 (process one job at a time)
    await channel.prefetch(1);

    console.log("🔄 PDF Worker started...");

    channel.consume(
      PDF_QUEUE,
      async (msg: any) => {
        if (msg) {
          try {
            const jobData = JSON.parse(msg.content.toString());
            console.log(`📥 Processing PDF for KYC: ${jobData.kycId}`);

            const kycRecord = await KYC.findById(jobData.kycId);

            if (!kycRecord) {
              console.warn(`⚠️ KYC record not found for job: ${jobData.kycId}`);
              channel.ack(msg);
              return;
            }

            // Generate PDF
            const pdfPath = await generatePDF(kycRecord);

            // Update KYC with PDF path
            await KYC.findByIdAndUpdate(jobData.kycId, {
              pdfPath: pdfPath,
              pdfGeneratedAt: new Date(),
            });

            console.log(`✅ PDF generated: ${pdfPath}`);

            // Acknowledge the message
            channel.ack(msg);
          } catch (error) {
            console.error("❌ Error processing PDF job:", error);
            // Negative acknowledge and requeue
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Error starting PDF Worker:", error);
    throw error;
  }
};

const generatePDF = async (kyc: IKYC): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `KYC_${kyc._id}_${Date.now()}.pdf`;
      const filePath = path.join(PDF_OUTPUT_DIR, fileName);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

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
      doc.text(`Status: ${kyc.status?.toUpperCase() || "APPROVED"}`);
      doc.text(`Document ID: ${kyc._id}`);

      if (kyc.aiSummary) {
        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("AI-Generated Summary:", { underline: true });
        doc.moveDown(0.3);
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(kyc.aiSummary, {
            align: "left",
          });
      }

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

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};
