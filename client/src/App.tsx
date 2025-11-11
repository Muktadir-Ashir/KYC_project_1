import { useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import KYCForm from "./components/KYCForm";
import KYCList from "./components/KYCList";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">🔐 KYC System</h1>
            <ul className="nav-links">
              {!isAdmin ? (
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
                <button className="admin-toggle-btn" onClick={toggleAdminMode}>
                  {isAdmin ? "User Mode" : "Admin Mode"}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          {isAdmin ? (
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<AdminDashboard />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<KYCForm />} />
              <Route path="/status" element={<KYCList />} />
            </Routes>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 KYC System. All rights reserved. Secure & Verified.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
