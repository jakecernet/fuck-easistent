import json

import requests


def get_session_token(username: str, password: str):
    loginData = {"uporabnik": username, "geslo": password}
    s = requests.Session()

    login = s.post("https://www.easistent.com/p/ajax_prijava", data=loginData)
    if not login.ok:
        return None
    if json.loads(login.text)["status"] != "ok":
        return None

    cookies = login.cookies.get_dict()

    easistent_auth_token = cookies["easistent_auth_token"]
    easistent_session = cookies["easistent_session"]

    url = "https://www.easistent.com/webapp"

    headers = {
        'easistent_cookie': 'zapri',
        'k8seasistent': '1',
        'k8skom': '1',
        'easistent_session': easistent_session,
        'easistent_auth_token': easistent_auth_token,

    }

    response = requests.request("GET", url, headers=headers, data={}, allow_redirects=False, cookies=cookies)
    new_url = response.headers["location"]
    response = requests.request("GET",new_url, headers={}, data={}, allow_redirects=False)

    return response.cookies.get_dict()["ses"]


