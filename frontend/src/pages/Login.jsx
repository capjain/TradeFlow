import React, { useEffect, useState } from 'react';
import axios from 'axios';
import loginImage from '../assets/login.png';

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const storedUserId = localStorage.getItem("user_id");
  const url = storedUserId
    ? `${apiUrl}/login?user_id=${storedUserId}`
    : `${apiUrl}/login`;

  axios.get(url)
    .then(res => {
      if (res.data?.login_url) {
        window.location.href = res.data.login_url;
      } else if (res.data?.user_id) {
        window.location.href = `/dashboard?user_id=${res.data.user_id}`;
      }
    })
    .catch(err => {
      console.error("Login failed", err);
      setError("Failed to auto login. Try again.");
      setLoading(false);
    });
}, [apiUrl]); // ✅ add this


  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ flex: 1, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <h1 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>TRADE FLOW</h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>Welcome back! Please login to your account.</p>
        {loading ? (
          <p>Checking login status...</p>
        ) : (
          <button
            onClick={() => window.location.href = `${apiUrl}/login`}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Login with ZERODHA
          </button>
        )}
        {error && (
          <p style={{ marginTop: '1rem', color: '#dc2626', fontSize: '14px' }}>{error}</p>
        )}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(to right, #3979f9ff, #00c6ff)',
      }}>
        <img src={loginImage} alt="Login Illustration" style={{ maxWidth: '80%', height: 'auto' }} />
      </div>
    </div>
  );
};

export default Login;
