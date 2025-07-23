from kiteconnect import KiteConnect
from dotenv import load_dotenv
import os
from models.user import get_user_token
from models.stock_data import save_stock_query

load_dotenv()

api_key = os.getenv("API_KEY")

def get_kite_instance(user_id):
    access_token = get_user_token(user_id)
    if not access_token:
        raise Exception("Access token not found. Please login again.")

    kite = KiteConnect(api_key=api_key)
    kite.set_access_token(access_token)
    return kite

def fetch_stock_data(user_id, raw_input):
    kite = get_kite_instance(user_id)

    if ":" in raw_input:
        exchange, symbol = raw_input.strip().split(":")
    else:
        symbol = raw_input.strip().upper()
        exchange = None

    instruments = kite.instruments()
    stock = next(
        (item for item in instruments if item["tradingsymbol"] == symbol and
         (exchange is None or item["exchange"] == exchange)),
        None
    )

    if not stock:
        raise Exception(f"Symbol '{symbol}' not found")

    exchange = stock["exchange"]

    try:
        quote_data = kite.quote(f"{exchange}:{symbol}")
        quote = quote_data.get(f"{exchange}:{symbol}")
    except Exception as e:
        raise Exception("Failed to fetch quote data: " + str(e))

    # ✅ Get margin for equity and commodity
    try:
        margin_data = kite.margins("equity")
        margin_commodity = kite.margins("commodity")
        print("Equity Margin:", margin_data)
        print("Commodity Margin:", margin_commodity)
    except Exception as e:
        raise Exception("Failed to fetch margin data: " + str(e))

    # ✅ Build order margin request
    try:
        order_payload = [{
            "exchange": stock["exchange"],
            "tradingsymbol": stock["tradingsymbol"],
            "transaction_type": "BUY",
            "variety": "regular",
            "product": "NRML" if stock["exchange"] in ["MCX", "BFO", "CDS"] else "MIS",
            "order_type": "LIMIT",
            "quantity": stock.get("lot_size", 1),
            "price": float(quote["last_price"]) if quote and "last_price" in quote else 1.0
        }]

        order_margin = kite.order_margins(order_payload)
        order_margin_data = order_margin[0] if order_margin else {}
    except Exception as e:
        print("Failed to fetch order margin:", e)
        order_margin_data = {}

    # ✅ Extract available margin (cash or fallback to collateral)
    if stock["exchange"] == "MCX":
        available_info = margin_commodity.get("available", {})
    else:
        available_info = margin_data.get("available", {})

    available_cash = available_info.get("cash", 0.0)
    if not available_cash or available_cash == 0:
        available_cash = available_info.get("collateral", 0.0)

    required_margin_total = order_margin_data.get("total", 0.0)

    # ✅ Log to verify values
    print("Required Margin:", required_margin_total)
    print("Available Cash:", available_cash)

    # ✅ Final result for frontend
    result = {
        "symbol": symbol,
        "exchange": exchange,
        "quote": quote,
        "last_price": quote.get("last_price", None),
        "available_cash": available_cash,
        "required_margin": required_margin_total,
        "instrument": stock,
        "margin": margin_data if exchange != "MCX" else margin_commodity,
        "order_margin": {
            "total": required_margin_total,
            "available": available_cash
        }
    }

    save_stock_query(user_id, symbol, exchange, result)
    return result
