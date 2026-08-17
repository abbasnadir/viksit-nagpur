import json
import urllib.request
from jose import jwt
from app.config import settings
from typing import Dict, Any

_jwks = None

def get_jwks() -> Dict[str, Any]:
    global _jwks
    if _jwks is None and settings.JWKS_URL:
        try:
            with urllib.request.urlopen(settings.JWKS_URL) as response:
                _jwks = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            print(f"Error fetching JWKS from {settings.JWKS_URL}: {e}")
            _jwks = {"keys": []}
    return _jwks or {"keys": []}

def verify_token(token: str) -> dict:
    jwks = get_jwks()
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.JWTError:
        raise ValueError("Invalid token header")
        
    rsa_key = {}
    for key in jwks.get("keys", []):
        if key["kid"] == unverified_header.get("kid"):
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key.get("use", "sig"),
                "n": key["n"],
                "e": key["e"]
            }
            break
            
    if rsa_key:
        return jwt.decode(token, rsa_key, algorithms=["RS256"])
    else:
        raise ValueError("Unable to find appropriate key")
