from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
from kite_auth import get_login_url, generate_access_token
from fetch_data import fetch_stock_data
from dotenv import load_dotenv
from models.user import get_user_token
from kiteconnect import KiteConnect
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("API_KEY")
api_secret = os.getenv("API_SECRET")

def get_kite_client(access_token=None):
    kite = KiteConnect(api_key=api_key)
    if access_token:
        kite.set_access_token(access_token)
    return kite

@app.route("/")
def home():
    return jsonify({"message": "Kite App Running ✅"})

@app.route("/callback")
def kite_callback():
    try:
        request_token = request.args.get("request_token")
        if not request_token:
            return "Missing request token", 400

        user_id, access_token = generate_access_token(request_token)

        # Save access token to file (consider storing in DB securely)
        with open("access_token.txt", "w") as f:
            f.write(access_token)

        return redirect(f"http://localhost:5173/dashboard?user_id={user_id}")

    except Exception as e:
        return f"❌ Error during callback: {str(e)}", 500

@app.route("/login")
def login():
    user_id = request.args.get("user_id")

    if user_id:
        token = get_user_token(user_id)
        if token:
            kite = get_kite_client(token)
            try:
                kite.profile()  # validate token
                return jsonify({
                    "message": "Already authenticated",
                    "user_id": user_id
                })
            except:
                pass  # token invalid

    login_url = get_login_url()
    return jsonify({"login_url": login_url})

@app.route("/search-symbols")
def search_symbols():
    query = request.args.get("q", "").upper()
    if not query:
        return jsonify([])

    try:
        kite = get_kite_client()
        instruments = kite.instruments()

        matches = [
            f"{item['exchange']}:{item['tradingsymbol']}"
            for item in instruments
            if item["tradingsymbol"].startswith(query)
        ][:20]

        return jsonify(matches)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/fetch", methods=["POST"])
def fetch():
    data = request.get_json()
    symbol = data.get("symbol")
    user_id = data.get("user_id")

    if not symbol or not user_id:
        return jsonify({"error": "Symbol and user_id required"}), 400

    try:
        stock_data = fetch_stock_data(user_id, symbol)
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
