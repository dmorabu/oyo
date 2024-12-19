import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'; // Import the signup-specific CSS
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    console.log("running");
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post('http://localhost:5000/signup', userData);
      console.log(response.data.message);
      navigate("/login");
    } catch (error) {
      setMessage(error.response.data.message);
      // setMessage(message);
      console.log("error he bhai")
      console.log(error)
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Signup;
