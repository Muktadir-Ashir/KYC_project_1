import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import KYCForm from "./components/KYCForm";
import KYCList from "./components/KYCList";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
    return token ? element : <Navigate to="/login" />;
  };

  const AdminRoute = ({ element }: { element: React.ReactElement }) => {
    return token && user?.role === "admin" ? element : <Navigate to="/login" />;
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">🔐 KYC System</h1>
            <ul className="nav-links">
              {user?.role === "user" ? (
                <>
                  <li>
                    <Link to="/">Submit Application</Link>
                  </li>
                  <li>
                    <Link to="/status">Check Status</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/admin">Dashboard</Link>
                  </li>
                </>
              )}
              <li>
                <span className="user-info">Welcome, {user?.username}</span>
              </li>
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            {user?.role === "user" ? (
              <>
                <Route
                  path="/"
                  element={<ProtectedRoute element={<KYCForm />} />}
                />
                <Route
                  path="/status"
                  element={<ProtectedRoute element={<KYCList />} />}
                />
              </>
            ) : (
              <>
                <Route
                  path="/admin"
                  element={<AdminRoute element={<AdminDashboard />} />}
                />
              </>
            )}
            <Route
              path="*"
              element={
                <Navigate to={user?.role === "admin" ? "/admin" : "/"} />
              }
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 KYC System. All rights reserved. Secure & Verified.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
