import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setMessage(res.data.message || "Login successful");
      if (onLoginSuccess) {
        onLoginSuccess(res.data.username, res.data.role);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Server error (check backend).");
      }
    }
  };

  return (
    <form className="form-layout" onSubmit={handleLogin}>
      <label className="field-label">Username</label>
      <input
        className="field-input"
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="field-label">Password</label>
      <input
        className="field-input"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="primary-btn" type="submit">
        Sign in
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}

export default Login;