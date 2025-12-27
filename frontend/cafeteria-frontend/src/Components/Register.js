import React, { useState } from "react";
import axios from "axios"; //get post 

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", {
        username,
        password,
        role,
      });
      setMessage(res.data.message);
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
    <form className="form-layout" onSubmit={handleRegister}>
      <label className="field-label">Username</label>
      <input
        className="field-input"
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="field-label">Password</label>
      <input
        className="field-input"
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="field-label">Role</label>
      <select
        className="field-input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button className="primary-btn" type="submit">
        Sign up
      </button>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}

export default Register;