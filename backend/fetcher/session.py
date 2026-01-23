import json
import base64
from urllib.parse import unquote


class SessionParser:
    def __init__(self,ses: str):
        if ses is None:
            print("Invalid session")
            self.session_id = None
            return
        ses = unquote(ses)

        ses_json = json.loads(ses)

        jwt = ses_json["accessToken"]
        self.jwt = jwt

        jwt_data = base64.urlsafe_b64decode(jwt.split(".")[1] + '=' * (4 - len(jwt) % 4))
        jwt_data_json = json.loads(jwt_data)

        self.session_id = jwt_data_json["sessionId"]

    def get_jwt(self):
        return self.jwt

    def get_session_id(self):
        return self.session_id




