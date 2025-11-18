import api from "./api";

export interface KYCData {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  dateOfBirth: string;
  aiSummary?: string;
  status?: "pending" | "approved" | "rejected";
  submittedAt?: string;
}

// User endpoints
export const submitKYC = async (data: KYCData) => {
  const response = await api.post("/kyc", data);
  return response.data;
};

export const getKYCById = async (id: string) => {
  const response = await api.get(`/kyc/${id}`);
  return response.data;
};

// Get user's KYC submissions
export const getUserKYCList = async () => {
  const response = await api.get("/kyc/list/my");
  return response.data;
};

// Admin endpoints
export const getAllKYC = async () => {
  const response = await api.get("/admin/kyc");
  return response.data;
};

export const getKYCByIdAdmin = async (id: string) => {
  const response = await api.get(`/admin/kyc/${id}`);
  return response.data;
};

export const updateKYCStatus = async (
  id: string,
  status: "approved" | "rejected"
) => {
  const response = await api.patch(`/admin/kyc/${id}`, { status });
  return response.data;
};

export const generateKYCPDF = async (id: string) => {
  const response = await api.get(`/admin/kyc/${id}/pdf`, {
    responseType: "blob",
    // Allow 202 so we can surface a friendly message when the PDF isn't ready yet
    validateStatus: (status) => status < 500,
  });

  const contentType = response.headers["content-type"];

  // If the backend returned JSON (e.g., queued) or 202, bubble up a helpful error
  if (response.status === 202 || contentType?.includes("application/json")) {
    try {
      const text = await (response.data as Blob).text();
      const payload = JSON.parse(text);
      throw new Error(
        payload.message ||
          "PDF generation queued. Please try downloading again in a moment."
      );
    } catch {
      throw new Error(
        "PDF generation queued. Please try downloading again in a moment."
      );
    }
  }

  return response.data as Blob;
};

export const downloadPDF = (pdfBlob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
