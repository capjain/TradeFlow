# backend/kite_auth.py

from kiteconnect import KiteConnect
from dotenv import load_dotenv
import os
from models.user import save_user_token

# Load environment variables from .env file
load_dotenv()

# Get API key and secret from .env
api_key = os.getenv("API_KEY")
api_secret = os.getenv("API_SECRET")

# Initialize KiteConnect instance
kite = KiteConnect(api_key=api_key)

def get_login_url():
    """
    Returns the Kite login URL to redirect the user.
    """
    return kite.login_url()

def generate_access_token(request_token):
    """
    Exchanges request_token for an access_token and saves it.

    Args:
        request_token (str): token received from kite after user logs in

    Returns:
        tuple: (user_id, access_token)
    """
    try:
        # Generate session and extract access token
        session_data = kite.generate_session(request_token, api_secret=api_secret)
        print("Session Data:", session_data)
        access_token = session_data["access_token"]
        user_id = session_data["user_id"]

        # Set access token for further API calls
        kite.set_access_token(access_token)

        # Store user_id and access_token in DB
        save_user_token(user_id, access_token)

        return user_id, access_token

    except Exception as e:
        print(f"Error generating access token: {e}")
        return None, None
