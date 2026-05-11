import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseURL from "../../../Url/NodeBaseURL";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/login`, { email, password });

      if (response.data.success) {
        const wantsToUpdateRate = window.confirm('Do you want to update rates?');
        navigate(wantsToUpdateRate ? '/rates' : '/dashboard');
      } else {
        setErrorMessage(response.data.message || 'You do not have admin access.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'An error occurred. Please try again.';
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // background: "url('./Logo/sadashribg-2.jpg') no-repeat center center/cover",
        background: "url('./iiiQbets.jpeg') no-repeat center center/cover",
        paddingRight: '150px',
      }}
    >
      <div
        className="login-card"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          borderRadius: '15px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#b77318',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          Welcome Back
        </h1>
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label"
              style={{ color: '#b77318' }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: '8px', padding: '10px 12px', fontSize: '16px' }}
            />
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label
              htmlFor="password"
              className="form-label"
              style={{ color: '#b77318' }}
            >
              Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '16px',
                }}
              />
              <i
                className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} toggle-password`}
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#b77318',
                }}
              ></i>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-danger mb-3">{errorMessage}</div>
          )}

          {/* Remember Me and Forgot Password */}
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label
                className="form-check-label"
                htmlFor="rememberMe"
                style={{ fontSize: '14px', color: '#b77318' }}
              >
                Remember Me
              </label>
            </div>
            <a href="#" className="btn btn-link p-0" style={{ color: '#b77318' }}>
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '10px',
              background: '#b77318',
              border: 'none',
              outline: 'none',
            }}
          >
            Login
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            className="btn google-btn d-flex align-items-center justify-content-center"
            style={{
              width: '100%',
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '10px',
              background: '#ffffff',
              color: 'rgb(73, 62, 62)',
              marginTop: '15px',
              boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
              border: 'none',
            }}
          >
            <img
              src="/path-to-google-logo.png"
              alt="Google Logo"
              style={{
                width: '20px',
                height: '20px',
                marginRight: '8px',
              }}
            />
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
