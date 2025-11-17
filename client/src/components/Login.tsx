import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { username, password });

      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // Redirect based on role
        if (response.data.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }

        // Reload page to update App state
        window.location.reload();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🔐 Login</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="info-box">
          <p>
            <strong>👤 Regular User:</strong> Username: testuser (or register
            new)
          </p>
          <p>
            <strong>👨‍💼 Admin User:</strong> Username: admin | Password: admin123
          </p>
          <p style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
            ℹ️ Admin can view and manage all KYC submissions
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <a
            href="/register"
            style={{ color: "#667eea", textDecoration: "none" }}
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
