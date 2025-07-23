# Gold Trade Bot using Kite Connect and TA-Lib
# Requirements: kiteconnect, ta-lib, python-telegram-bot, schedule, pandas, requests
 
import time
import pandas as pd
import talib
import requests
from kiteconnect import KiteConnect
from telegram import Bot
 
# --- Configuration ---
API_KEY = "mmbwvzbbrhmx1wrj"
ACCESS_TOKEN = "your_access_token"
GOLD_TOKEN = "your_instrument_token"  # e.g., 5633 for GOLDM AUG FUT
TELEGRAM_TOKEN = "7978485685:AAFUHmpROOCgmnSciPA9hWXuI6L4XaiM8gw"
TELEGRAM_CHAT_ID = "725167576"
kite = KiteConnect(api_key=API_KEY)
kite.set_access_token(ACCESS_TOKEN)
bot = Bot(token=TELEGRAM_TOKEN)
 
# --- Fetch historical data ---
def fetch_ohlc(token, interval, duration):
    from_date = pd.Timestamp.now() - pd.Timedelta(duration)
    to_date = pd.Timestamp.now()
    data = kite.historical_data(token, from_date, to_date, interval)
    df = pd.DataFrame(data)
    df.set_index("date", inplace=True)
    return df
 
# --- Strategy Logic ---
def check_trade_signal(df):
    df['EMA20'] = talib.EMA(df['close'], timeperiod=20)
    df['EMA50'] = talib.EMA(df['close'], timeperiod=50)
    df['VWAP'] = (df['high'] + df['low'] + df['close']) / 3
    df['RSI'] = talib.RSI(df['close'], timeperiod=14)
    macd, macdsignal, _ = talib.MACD(df['close'], fastperiod=12, slowperiod=26, signalperiod=9)
    df['MACD'] = macd - macdsignal
    df['ATR'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
 
    latest = df.iloc[-1]
    atr = latest['ATR']
    cmp = latest['close']
    vwap = latest['VWAP']
    rsi = latest['RSI']
    macd_val = latest['MACD']
 
    # Hard Reject Conditions
    if rsi > 75 or rsi < 25:
        return
    if atr < 35:
        return
    if abs(cmp - vwap) > 1.5 * atr:
        return
 
    # Trend Bias
    bullish = latest['EMA20'] > latest['EMA50'] and cmp > vwap
    bearish = latest['EMA20'] < latest['EMA50'] and cmp < vwap
 
    # MACD Confirmation
    macd_valid = macd_val > 0 and macd.iloc[-1] > macd.iloc[-2]
    macd_weak = abs(macd_val) < 0.1
 
    if macd_weak:
        return
 
    # RSI Range Logic
    rsi_mid = 40 <= rsi <= 60
 
    # Long Setup
    if bullish and rsi < 70 and macd_valid:
        sl = cmp - atr
        target = cmp + 2 * atr
        send_alert("BUY", cmp, sl, target)
 
    # Momentum scalp
    elif not bullish and cmp > vwap and macd_valid and rsi < 60:
        sl = cmp - atr
        target = cmp + 2 * atr
        send_alert("QUICK BUY", cmp, sl, target)
 
    # Short Setup
    elif bearish and rsi > 30 and macd_val < 0:
        sl = cmp + atr
        target = cmp - 2 * atr
        send_alert("SELL", cmp, sl, target)
 
# --- Telegram Alert ---
def send_alert(direction, cmp, sl, target):
    msg = f"\n{'🟢' if 'BUY' in direction else '🔴'} GOLD {direction} SIGNAL\nCMP: {cmp:.2f}\nSL: {sl:.2f}\nTarget: {target:.2f}"
    bot.send_message(chat_id=TELEGRAM_CHAT_ID, text=msg)
 
# --- Main Loop ---
if __name__ == "__main__":
    while True:
        try:
            df = fetch_ohlc(GOLD_TOKEN, "5minute", "60 minutes")
            check_trade_signal(df)
        except Exception as e:
            print("Error:", e)
        time.sleep(300)  # every 5 min