import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });
      if (response.data.success) {
        // Store the JWT token in localStorage or sessionStorage
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        
        {error && <p className="error">{error}</p>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn">Login</button>
        
        <p className="create-account">
          Don't have an account? 
          <button type="button" onClick={handleCreateAccount}>Create one</button>
        </p>
      </form>
    </div>
  );
};

export default Login;
