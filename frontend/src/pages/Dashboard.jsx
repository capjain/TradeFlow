import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const userId = searchParams.get('user_id');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
  const userIdFromURL = searchParams.get("user_id");
  if (userIdFromURL) {
    localStorage.setItem("user_id", userIdFromURL);
  }
}, [searchParams]); // ✅ add this



  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSymbol(value);
    setStockData(null);
    setError('');

    if (!value) return setSuggestions([]);

    try {
      const res = await axios.get(`${apiUrl}/search-symbols?q=${value}`);
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('Symbol lookup failed', err);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s) => {
    setSymbol(s);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStockData(null);

    if (!symbol || !userId) {
      setError('Please enter symbol and login again if needed.');
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/fetch`, {
        user_id: userId,
        symbol: symbol.toUpperCase().trim()
      });

      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setStockData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch stock data.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)' }}>
      <aside style={{
        width: '240px',
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: '2rem 1.5rem',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: '600' }}>
          📊 Dashboard
        </h2>
      </aside>

      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', animation: 'fadeIn 0.5s ease-in-out' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem', transition: 'all 0.3s ease' }}>
            {error}
          </div>
        )}

        <h3 style={{ marginBottom: '0.75rem', fontWeight: '600', fontSize: '1.25rem', color: '#1e293b' }}>
          Stock Search
        </h3>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ position: 'relative', display: 'flex' }}>
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            placeholder="Type stock symbol (e.g. RELIANCE)"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #cbd5e1',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0 8px 8px 0',
              fontWeight: '500',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            Fetch
          </button>
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', listStyle: 'none', maxHeight: '200px', overflowY: 'auto', zIndex: 10, padding: 0, margin: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSuggestionClick(s)} style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </form>

        {stockData && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: '#0f172a' }}>{stockData?.symbol} ({stockData?.exchange})</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {/* Current Price */}
              <div style={{ flex: '1 1 300px', background: '#f9fafb', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h4>📈 Current Price</h4>
                <p style={{ fontSize: '1.4rem', color: '#2563eb', fontWeight: 'bold' }}>₹{stockData?.quote?.last_price?.toLocaleString('en-IN')}</p>
              </div>

              {/* OHLC */}
              <div style={{ flex: '1 1 300px', background: '#f0f9ff', padding: '1rem', borderRadius: '12px' }}>
                <h4>📊 OHLC</h4>
                <ul>
                  <li>Open: ₹{stockData?.quote?.ohlc?.open}</li>
                  <li>High: ₹{stockData?.quote?.ohlc?.high}</li>
                  <li>Low: ₹{stockData?.quote?.ohlc?.low}</li>
                  <li>Close: ₹{stockData?.quote?.ohlc?.close}</li>
                </ul>
              </div>

              {/* Margin Info */}
              {/* <div style={{ flex: '1 1 300px', background: '#ecfdf5', padding: '1rem', borderRadius: '12px' }}>
                <h4>💰 Margin Info</h4>
                <ul>
                  <li>Available: ₹{stockData?.margin?.available?.cash?.toLocaleString("en-IN")}</li>
                  <li>Utilised: ₹{stockData?.margin?.utilised?.debits?.toLocaleString("en-IN")}</li>
                </ul>
              </div> */}

              {/* Required Margin */}
              <div style={{ flex: '1 1 N300px', background: '#fef9c3', padding: '1rem', borderRadius: '12px' }}>
                <h4>🧾Margin</h4>
                <ul>
                  <li>Required: ₹{stockData?.order_margin?.total?.toLocaleString("en-IN")}</li>
                  <li>Total Collateral: ₹{stockData?.available_cash?.toLocaleString("en-IN")}</li>
                </ul>
              </div>

              {/* Instrument Info */}
              <div style={{ flex: '1 1 300px', background: '#fff7ed', padding: '1rem', borderRadius: '12px' }}>
                <h4>📦 Instrument Info</h4>
                <ul>
                  <li>Type: {stockData?.instrument?.instrument_type}</li>
                  <li>Segment: {stockData?.instrument?.segment}</li>
                  <li>Lot Size: {stockData?.instrument?.lot_size}</li>
                  <li>Tick Size: {stockData?.instrument?.tick_size}</li>
                  <li>ISIN: {stockData?.instrument?.isin}</li>
                </ul>
              </div>

              {/* Trade Stats */}
              <div style={{ flex: '1 1 300px', background: '#fce7f3', padding: '1rem', borderRadius: '12px' }}>
                <h4>📊 Trade Stats</h4>
                <ul>
                  <li>Volume: {stockData?.quote?.volume_traded}</li>
                  <li>Avg. Price: ₹{stockData?.quote?.average_price}</li>
                  <li>Last Trade: {stockData?.quote?.last_trade_time}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
