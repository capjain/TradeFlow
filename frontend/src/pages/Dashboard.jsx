// updated Dashboard with styled search and Zerodha-style watchlist cards
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const userId = searchParams.get('user_id');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const userIdFromURL = searchParams.get("user_id");
    if (userIdFromURL) {
      localStorage.setItem("user_id", userIdFromURL);
    }
  }, [searchParams]);

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
    setRecentSearches(prev => [...new Set([s, ...prev])].slice(0, 5));
  };

  const handleAddToWatchlist = (item) => {
    if (!watchlist.includes(item)) {
      setWatchlist(prev => [...prev, item]);
    }
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

  const totalValue = stockData?.quote?.last_price && quantity ? (stockData.quote.last_price * quantity).toFixed(2) : '--';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <aside style={{ width: '320px', backgroundColor: '#1f2937', color: '#fff', padding: '2.7rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>📊 Trade Dashboard</h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search eg: infy fut, index fund, etc."
            value={symbol}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '999px', border: '1px solid #ccc', outline: 'none' }}
          />
        </form>

        {symbol === '' && recentSearches.length > 0 && (
          <ul style={{ background: '#fff', color: '#000', borderRadius: '8px', padding: '0.5rem', marginBottom: '1rem' }}>
            <li style={{ fontWeight: 'bold', padding: '0.5rem 1rem' }}>Recent Searches</li>
            {recentSearches.map((s, i) => (
              <li key={i} onClick={() => handleSuggestionClick(s)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>{s}</li>
            ))}
          </ul>
        )}

        {suggestions.length > 0 && (
          <ul style={{ background: '#fff', color: '#000', borderRadius: '8px', padding: '0.5rem', marginBottom: '1rem' }}>
            {suggestions.map((s, i) => (
              <li
                key={i}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                <span onClick={() => handleSuggestionClick(s)}>{s}</span>
                <button
                  onClick={() => handleAddToWatchlist(s)}
                  style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                >+
                </button>
              </li>
            ))}
          </ul>
        )}

        {watchlist.length > 0 && (
          <div>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>📌 Watchlist</h3>
            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
              {watchlist.map((item, i) => (
                <li key={i} style={{ background: '#334155', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{item}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', border: 'none' }}>B</button>
                      <button style={{ background: '#f97316', color: '#fff', padding: '2px 6px', borderRadius: '4px', border: 'none' }}>S</button>
                      <button onClick={() => setOpenDropdown(openDropdown === i ? null : i)} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '1.2rem' }}>⋮</button>
                    </div>
                  </div>
                  {openDropdown === i && (
                    <ul style={{ position: 'absolute', top: '100%', right: 0, background: '#f8fafc', color: '#000', padding: '0.5rem', borderRadius: '8px', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>📌 Pin</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>📝 Notes</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>📈 Chart</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>🔔 Create Alert</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>🧮 Market Depth</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>🛒 Add to Basket</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>📊 Fundamentals</li>
                      <li style={{ padding: '0.4rem 1rem', cursor: 'pointer' }}>⚡ Technicals</li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        {/* Holdings Table */}
        {stockData && (
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Holdings</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ background: '#f9fafb', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '0.75rem' }}>Instrument</th>
                  <th style={{ padding: '0.75rem' }}>Qty</th>
                  <th style={{ padding: '0.75rem' }}>Avg. Cost</th>
                  <th style={{ padding: '0.75rem' }}>LTP</th>
                  <th style={{ padding: '0.75rem' }}>Invested</th>
                  <th style={{ padding: '0.75rem' }}>Current</th>
                  <th style={{ padding: '0.75rem' }}>P&L</th>
                  <th style={{ padding: '0.75rem' }}>% Chg</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>{stockData.symbol}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{ width: '60px', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>{stockData.quote?.average_price}</td>
                  <td style={{ padding: '0.75rem' }}>{stockData.quote?.last_price}</td>
                  <td style={{ padding: '0.75rem' }}>₹--</td>
                  <td style={{ padding: '0.75rem' }}>₹{totalValue}</td>
                  <td style={{ padding: '0.75rem' }}>₹--</td>
                  <td style={{ padding: '0.75rem' }}>--%</td>
                </tr>
              </tbody>
            </table>

            {/* Details Panels */}
            <div style={{ marginTop: '2rem' }}>
              <h3>Details</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 300px', background: '#f0f9ff', padding: '1rem', borderRadius: '8px' }}>
                  <h4>OHLC</h4>
                  <ul>
                    <li>Open: ₹{stockData.quote?.ohlc?.open}</li>
                    <li>High: ₹{stockData.quote?.ohlc?.high}</li>
                    <li>Low: ₹{stockData.quote?.ohlc?.low}</li>
                    <li>Close: ₹{stockData.quote?.ohlc?.close}</li>
                  </ul>
                </div>

                <div style={{ flex: '1 1 300px', background: '#fef9c3', padding: '1rem', borderRadius: '8px' }}>
                  <h4>🧾 Margin Info</h4>
                  <ul>
                    <li>Required Margin: ₹{stockData.order_margin?.total}</li>
                    <li>Available Cash: ₹{stockData.available_cash}</li>
                  </ul>
                </div>

                <div style={{ flex: '1 1 300px', background: '#fff7ed', padding: '1rem', borderRadius: '8px' }}>
                  <h4>📦 Instrument Info</h4>
                  <ul>
                    <li>Type: {stockData.instrument?.instrument_type}</li>
                    <li>Segment: {stockData.instrument?.segment}</li>
                    <li>Lot Size: {stockData.instrument?.lot_size}</li>
                    <li>Tick Size: {stockData.instrument?.tick_size}</li>
                    <li>ISIN: {stockData.instrument?.isin}</li>
                  </ul>
                </div>

                <div style={{ flex: '1 1 300px', background: '#fce7f3', padding: '1rem', borderRadius: '8px' }}>
                  <h4>📊 Trade Stats</h4>
                  <ul>
                    <li>Volume: {stockData.quote?.volume_traded}</li>
                    <li>Avg. Price: ₹{stockData.quote?.average_price}</li>
                    <li>Last Trade: {stockData.quote?.last_trade_time}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
