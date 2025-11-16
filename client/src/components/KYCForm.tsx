import React, { useState } from "react";
import { KYCData, submitKYC } from "../services/kycService";
import "../styles/KYCForm.css";

interface KYCFormProps {
  onSuccess?: (id: string) => void;
}

const KYCForm: React.FC<KYCFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<KYCData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGeneratingSummary(true);
    setError("");
    setSuccess("");
    setSubmittedId("");
    setAiSummary("");

    try {
      const response = await submitKYC(formData);

      // Set the AI summary from response
      if (response.data.aiSummary) {
        setAiSummary(response.data.aiSummary);
      }

      setSuccess(
        "KYC submitted successfully! Your application is under review."
      );
      setSubmittedId(response.data._id);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        idNumber: "",
        dateOfBirth: "",
      });
      if (onSuccess && response.data._id) {
        onSuccess(response.data._id);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error submitting KYC. Please try again."
      );
    } finally {
      setLoading(false);
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="kyc-form-wrapper">
      <div className="kyc-form-container">
        <div className="form-header">
          <h2>KYC Application</h2>
          <p>Please provide your information for verification</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {generatingSummary && (
          <div className="alert alert-info">
            <strong>⏳ Generating AI Summary...</strong> Your submission is
            being analyzed by AI...
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <strong>Success!</strong> {success}
            {submittedId && (
              <p className="submission-id">
                Your Application ID: <strong>{submittedId}</strong>
              </p>
            )}
            {aiSummary && (
              <div className="ai-summary-section">
                <strong>📝 AI-Generated Summary:</strong>
                <p className="ai-summary-text">{aiSummary}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">ID Number *</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Passport, Driver's License, or National ID number"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || generatingSummary}
              className="submit-btn"
            >
              {loading
                ? "Processing..."
                : generatingSummary
                ? "⏳ Generating Summary..."
                : "Submit Application"}
            </button>
          </div>
        </form>

        <div className="form-footer">
          <p>
            Your information is secure and will only be used for verification
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
