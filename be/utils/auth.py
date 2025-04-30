import time
import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Move your SECRET_KEY here or import it from a config file
SECRET_KEY = "4f86320f08bec7df1c96740d5e0611471fd11485b070ddcb8c8847beb333a568e58fc35e7d63325cbc544ea7cbc20507b2f21449a01e0077e727bf6b16bb3fdc8e3cb382eb0dcaa5fe5f7f408aec2f0d5a047513f6425d7f03f3f03f22fd665eaf63dee213283897bccf35dc98d2bb1dc729debb1a3616108ca8c0dce44e69a8047f10ce7012ac515a2346ac5ec208586d70c273da47cb4e61501473f03e713da641a4d43245264b60acccf39434736cc97a6159d911087c7e654167085ad0cf2bf29f33f4cb5ac9ee55c54bf9ebcfa081c2eb856a012f70871d879bfbdba714150191cdd1cfa6b44dd202c8a2bc916d4dc8484afa59ca513fb2ddb1511112ab"

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        wallet_address = payload.get("wallet")
        if not wallet_address:
            raise HTTPException(status_code=401, detail="Invalid token: wallet address not found")
        return wallet_address
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")