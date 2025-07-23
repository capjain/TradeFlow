import React from 'react';

const StockDataCard = ({ data }) => {
  const { symbol, exchange, quote, instrument, margin } = data;
  const ohlc = quote?.ohlc || {};

  return (
    <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3>{symbol} ({exchange})</h3>

      <p><strong>Current Price:</strong> ₹{quote?.last_price}</p>
      <p><strong>Last Trade Time:</strong> {quote?.last_trade_time}</p>
      <p><strong>Volume:</strong> {quote?.volume_traded}</p>
      <p><strong>Average Price:</strong> ₹{quote?.average_price}</p>

      <h4>OHLC</h4>
      <ul>
        <li>Open: ₹{ohlc.open}</li>
        <li>High: ₹{ohlc.high}</li>
        <li>Low: ₹{ohlc.low}</li>
        <li>Close: ₹{ohlc.close}</li>
      </ul>

      <h4>Instrument Info</h4>
      <ul>
        <li>Instrument Type: {instrument?.instrument_type}</li>
        <li>Segment: {instrument?.segment}</li>
        <li>Lot Size: {instrument?.lot_size}</li>
        <li>Tick Size: {instrument?.tick_size}</li>
        <li>ISIN: {instrument?.isin}</li>
      </ul>

      <h4>Margin Info</h4>
      <ul>
        <li>Available Margin: ₹{margin?.available?.cash}</li>
        <li>Utilised Margin: ₹{margin?.utilised?.debits}</li>
      </ul>
    </div>
  );
};


export default StockDataCard;
