import React, { useEffect, useState } from "react";
import { getUserKYCList, KYCData } from "../services/kycService";
import "../styles/KYCList.css";

const KYCList: React.FC = () => {
  const [kycRecords, setKycRecords] = useState<KYCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);
      const response = await getUserKYCList();
      setKycRecords(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching KYC records");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="status-container">
        <div className="loading">Loading your KYC status...</div>
      </div>
    );

  return (
    <div className="status-container">
      <div className="status-header">
        <h2>Your Application Status</h2>
        <p>Track the status of your KYC applications</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {kycRecords.length === 0 ? (
        <div className="no-applications">
          <p>
            No KYC applications found. Start by submitting your application.
          </p>
        </div>
      ) : (
        <div className="status-grid">
          {kycRecords.map((record) => (
            <div key={record._id} className="status-card">
              <div className="card-header">
                <h3>{record.fullName}</h3>
                <span
                  className={`status-badge status-${
                    record.status || "pending"
                  }`}
                >
                  {(record.status || "Pending").toUpperCase()}
                </span>
              </div>

              <div className="card-content">
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{record.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{record.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">ID Number:</span>
                  <span className="value">{record.idNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {new Date(record.submittedAt || "").toLocaleDateString()}
                  </span>
                </div>

                <div className="status-info">
                  {record.status === "pending" && (
                    <div className="status-message pending">
                      ⏳ Your application is under review. Please check back
                      soon.
                    </div>
                  )}
                  {record.status === "approved" && (
                    <div className="status-message approved">
                      ✅ Congratulations! Your KYC has been approved. PDF is
                      available from admin.
                    </div>
                  )}
                  {record.status === "rejected" && (
                    <div className="status-message rejected">
                      ❌ Your application was rejected. Please contact support
                      for details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KYCList;
