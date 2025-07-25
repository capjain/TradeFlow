from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
from kite_auth import get_login_url, generate_access_token
from fetch_data import fetch_stock_data
from dotenv import load_dotenv
from models.user import get_user_token
from kiteconnect import KiteConnect
import os
from finance_calculator import run_finance_model

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("API_KEY")
api_secret = os.getenv("API_SECRET")

@app.before_request
def log_path():
    print("➡️ Requested path:", request.path)

@app.route("/")
def home():
    return jsonify({"message": "Kite App Running ✅"})

@app.route("/login")
def login():
    user_id = request.args.get("user_id")
    if user_id:
        token = get_user_token(user_id)
        if token:
            kite = KiteConnect(api_key=api_key)
            kite.set_access_token(token)
            try:
                kite.profile()
                return jsonify({"user_id": user_id})
            except:
                pass
    return jsonify({"login_url": get_login_url()})

@app.route("/search-symbols")
def search_symbols():
    query = request.args.get("q", "").upper()
    if not query:
        return jsonify([])

    try:
        kite = KiteConnect(api_key=api_key)
        instruments = kite.instruments()
        matches = [
            f"{item['exchange']}:{item['tradingsymbol']}"
            for item in instruments if item["tradingsymbol"].startswith(query)
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
        return jsonify(fetch_stock_data(user_id, symbol))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found", "path": request.path}), 404

@app.before_request
def log_all_requests():
    print("➡️ Incoming path:", request.path)



@app.route('/api/finance/calculate', methods=['POST'])
def calculate_finance():
    data = request.get_json()
    result = run_finance_model(data)
    return jsonify(result)

@app.route("/callback")
def callback():
    request_token = request.args.get("request_token")
    if not request_token:
        return "❌ Error: request_token missing", 400

    from kite_auth import generate_access_token
    user_id, access_token = generate_access_token(request_token)

    if not user_id or not access_token:
        return "❌ Failed to authenticate with Kite", 500

    return redirect(f"http://localhost:5173/dashboard?user_id={user_id}")




if __name__ == "__main__":
    app.run(debug=True)
