import React, { useCallback, useEffect, useState } from "react";
import {
  downloadPDF,
  generateKYCPDF,
  getAllKYC,
  KYCData,
  updateKYCStatus,
} from "../services/kycService";
import "../styles/AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [kycRecords, setKycRecords] = useState<KYCData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KYCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<KYCData | null>(null);

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const filterRecords = useCallback(() => {
    if (statusFilter === "all") {
      setFilteredRecords(kycRecords);
    } else {
      setFilteredRecords(
        kycRecords.filter((record) => record.status === statusFilter)
      );
    }
  }, [kycRecords, statusFilter]);

  useEffect(() => {
    filterRecords();
  }, [filterRecords]);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);
      const response = await getAllKYC();
      setKycRecords(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching KYC records");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await updateKYCStatus(id, "approved");
      setKycRecords((prev) =>
        prev.map((record) =>
          record._id === id ? { ...record, status: "approved" } : record
        )
      );
      setError("");
      alert("KYC approved successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error approving KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      await updateKYCStatus(id, "rejected");
      setKycRecords((prev) =>
        prev.map((record) =>
          record._id === id ? { ...record, status: "rejected" } : record
        )
      );
      setError("");
      alert("KYC rejected successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error rejecting KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPDF = async (id: string, fullName: string) => {
    try {
      setProcessingId(id);
      const pdfBlob = await generateKYCPDF(id);
      downloadPDF(pdfBlob, `KYC_${fullName}_${new Date().getTime()}.pdf`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error generating PDF");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="admin-container">
        <div className="loading">Loading KYC records...</div>
      </div>
    );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>Manage and verify KYC applications</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-section">
        <label>Filter by Status:</label>
        <div className="filter-buttons">
          {(["all", "pending", "approved", "rejected"] as const).map(
            (filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  statusFilter === filter ? "active" : ""
                }`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} (
                {filteredRecords.length})
              </button>
            )
          )}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="no-records">
          No KYC records found with selected filter.
        </div>
      ) : (
        <div className="records-grid">
          {filteredRecords.map((record) => (
            <div key={record._id} className="record-card">
              <div className="card-header">
                <h3>{record.fullName}</h3>
                <span className={`status-badge status-${record.status}`}>
                  {record.status}
                </span>
              </div>

              <div className="card-body">
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{record.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{record.phone}</span>
                </div>
                <div className="info-item">
                  <span className="label">ID Number:</span>
                  <span className="value">{record.idNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">DOB:</span>
                  <span className="value">
                    {new Date(record.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">{record.address}</span>
                </div>
                {record.aiSummary && (
                  <div className="info-item">
                    <span className="label">AI Summary:</span>
                    <span className="value">{record.aiSummary}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {new Date(record.submittedAt || "").toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                {record.status === "pending" ? (
                  <>
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(record._id!)}
                      disabled={processingId === record._id}
                    >
                      {processingId === record._id ? "..." : "Approve"}
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleReject(record._id!)}
                      disabled={processingId === record._id}
                    >
                      {processingId === record._id ? "..." : "Reject"}
                    </button>
                  </>
                ) : record.status === "approved" ? (
                  <button
                    className="btn btn-pdf"
                    onClick={() =>
                      handleDownloadPDF(record._id!, record.fullName)
                    }
                    disabled={processingId === record._id}
                  >
                    {processingId === record._id ? "..." : "Download PDF"}
                  </button>
                ) : (
                  <span className="status-text">
                    Rejected - No action available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedRecord(null)}
            >
              ×
            </button>
            <h3>{selectedRecord.fullName}</h3>
            <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
