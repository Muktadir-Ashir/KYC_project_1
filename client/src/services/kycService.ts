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
  });
  return response.data;
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
