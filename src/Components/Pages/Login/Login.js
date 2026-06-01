import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseURL from "../../../Url/NodeBaseURL";
import backgroundImage from './d-wallpaper-mural-design-floral-geometric-objects-gold-ball-pearls-gold-jewelry-wallpaper-purple-flowers-will-154345462.webp';
import Swal from 'sweetalert2';
import { AuthContext } from './Context';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!email || !password) {
      setErrorMessage('Please provide both email/username and password.');
      return;
    }
  
    try {
      const response = await axios.post(`${baseURL}/login`, { email, password });
  
      if (response.data.success) {
        const { userId, role, fullName, userType, stockPointName } = response.data;
        
        // Generate a simple token
        const token = btoa(`${userId}:${Date.now()}`);
        
        // Call the login function from context with all data
        login(token, userId, role, fullName, userType);

        console.log('Login successful:', { userType, fullName, role });
  
        // Check user type and redirect accordingly
        if (userType === 'stock_point') {
          // For stock point users, go to stock dashboard
          navigate('/stock-dashboard');
        } else {
          // For admin users, show the update rates prompt
          Swal.fire({
            title: 'Update Rates?',
            text: 'Do you want to update rates?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, update rates',
            cancelButtonText: 'No, go to dashboard',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/rates');
            } else {
              navigate('/dashboard');
            }
          });
        }
      } else {
        setErrorMessage(response.data.message || 'Login failed. Please try again.');
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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
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
          maxWidth: '500px',
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
          {/* Email/Username Field */}
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label"
              style={{ color: '#b77318' }}
            >
              Email / Username
            </label>
            <input
              type="text"
              className="form-control"
              id="email"
              placeholder="Enter your email or username"
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
        </form>
      </div>
    </div>
  );
}

export default Login;