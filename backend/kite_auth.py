from kiteconnect import KiteConnect
from dotenv import load_dotenv
import os
from models.user import save_user_token

load_dotenv()

api_key = os.getenv("API_KEY")
api_secret = os.getenv("API_SECRET")

kite = KiteConnect(api_key=api_key)

def get_login_url():
    return kite.login_url()

def generate_access_token(request_token):
    try:
        session_data = kite.generate_session(request_token, api_secret=api_secret)
        if not session_data or "access_token" not in session_data:
            raise Exception("Invalid session")
        access_token = session_data["access_token"]
        user_id = session_data["user_id"]
        kite.set_access_token(access_token)
        save_user_token(user_id, access_token)
        return user_id, access_token
    except Exception as e:
        print("Error generating access token:", e)
        return None, None
