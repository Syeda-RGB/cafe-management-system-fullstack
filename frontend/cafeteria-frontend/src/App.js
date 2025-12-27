import React, { useState } from "react";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/UsersDashboard";
import "./styles.css";

function App() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");

  const isLogin = mode === "login";

  const handleLoginSuccess = (name, userRole) => {
    setUsername(name);
    setRole(userRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setUsername("");
    setMode("login");
  };

  // --------- AFTER LOGIN: SHOW DASHBOARD ---------
  if (isLoggedIn) {
    return (
      <div className="app-shell-logged">
        {role === "admin" ? (
          <AdminDashboard username={username} onLogout={handleLogout} />
        ) : (
          <UserDashboard username={username} onLogout={handleLogout} />
        )}
      </div>
    );
  }

  // --------- BEFORE LOGIN: AUTH SCREENS ---------
  return (
    <div className="auth-page">
      <header className="top-bar">
        <div className="logo-text">
          <span className="logo-light">Campus</span>
          <span className="logo-bold">Hub</span>
        </div>
      </header>

      <main className="auth-center">
        <div className="auth-panel">
          <div className="auth-header">
            <h2>{isLogin ? "Sign in" : "Sign up"}</h2>
            <p>{isLogin ? "Sign in to continue" : "Create your Campus Hub account"}</p>
          </div>

          <div className="auth-toggle-row">
            <button
              className={`auth-toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              className={`auth-toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div className="auth-form-area">
            {isLogin ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Register />
            )}
          </div>

          <p className="auth-bottom-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => setMode(isLogin ? "signup" : "login")}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
