import React, { useEffect, useState } from 'react';
import axios from 'axios';
import loginImage from '../assets/login.png';

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
          localStorage.setItem("user_id", res.data.user_id);
          window.location.href = `/dashboard?user_id=${res.data.user_id}`;
        } else {
          setError("Unknown server response");
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Login error", err);
        setError("Login failed. Please try again.");
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{
        flex: 1, padding: '2rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
      }}>
        <h1 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}>TRADE FLOW</h1>
        <p style={{ marginBottom: '1rem' }}>Welcome! Please wait...</p>
        {!loading && (
          <button
            onClick={() => window.location.href = `${apiUrl}/login`}
            style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '6px' }}
          >
            Login with Zerodha
          </button>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div style={{
        flex: 1,
        background: 'linear-gradient(to right, #3979f9ff, #00c6ff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img src={loginImage} alt="Login" style={{ maxWidth: '80%' }} />
      </div>
    </div>
  );
};

export default Login;
