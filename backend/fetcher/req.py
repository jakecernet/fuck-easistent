import requests
from fetcher.session import SessionParser

# Module-level Session for TCP/TLS connection reuse across all eAsistent API calls.
_http = requests.Session()
_adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20)
_http.mount("https://", _adapter)
_http.mount("http://", _adapter)


class AuthRequest:
    def __init__(self, session: str):
        self.session = SessionParser(session)

    def get_headers(self):
        headers = {
            'authorization': self.session.get_jwt(),
            'x-child-id': '662787',
            'x-client-platform': 'web',
            'x-client-version': '13',
        }
        return headers

    def send_request(self, url):
        if self.session.session_id is None:
            return None
        request = _http.get(url, headers=self.get_headers(), timeout=10)
        if not request.ok:
            return None
        if request.status_code == 204:
            return None

        return request.json()


def verify_session(session_token):
    auth_req = AuthRequest(session_token)
    response = auth_req.send_request("https://www.easistent.com/m/grades/")
    return response is not None
