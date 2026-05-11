import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import axios from 'axios';
import logo from '../Login/Logo/logo_dark.png';
import InputField from '../InputField/InputField';
import baseURL from "../../../Url/NodeBaseURL";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // To navigate to the dashboard

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Submitting credentials:', { email, password }); // Debug log
    setErrorMessage(''); // Clear any previous error message

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      // Send login request
      const response = await axios.post(`${baseURL}/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data); // Debug log

      // Handle success response from backend
      if (response.data.success) {
        // Prompt user for next action
        const wantsToUpdateRate = window.confirm('Do you want to update rates?');
        if (wantsToUpdateRate) {
          navigate('/rates'); // Navigate to rates page
        } else {
          navigate('/dashboard'); // Navigate to dashboard
        }
      } else {
        setErrorMessage(response.data.message || 'You do not have admin access.');
      }
    } catch (error) {
      // Improved error handling
      console.error('Login error:', error); // Debug log for the entire error object

      const errorMessage =
        error.response?.data?.message || // Server-provided error message
        (error.response ? 'An error occurred. Please try again.' : 'Network error. Please check your connection.');

      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5 pt-5">
      <div className="card" style={{ width: '36rem', marginTop: '100px' }}>
        <div className="card-body" style={{
          backgroundColor: 'rgba(163, 110, 41, 0.08)',
        }}>
          <div className="text-center mb-4">
            <img src={logo} alt="Logo" className="mb-3" style={{ width: "350px", height: "80px" }} />
            <h3>Login</h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <InputField
                label="Email:"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <InputField
                type={showPassword ? 'text' : 'password'}
                label="Password:"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute"
                style={{ right: '10px', top: '10px', cursor: 'pointer' }}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            {errorMessage && (
              <div className="text-danger mb-3">
                {errorMessage}
              </div>
            )}
            <div className="text-center">
              <button
                type="submit"
                style={{
                  backgroundColor: '#a36e29',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
