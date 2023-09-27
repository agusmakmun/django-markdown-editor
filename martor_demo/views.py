
import requests

# Parse API Configuration
class ParseConfig:
    API_URL = "https://parseapi.back4app.com/classes/Post"
    HEADERS = {
        "X-Parse-Application-Id": "mxU2269a95LXAOsqGS7QCZzTSPm8X1N7SxumWYIb",
        "X-Parse-REST-API-Key": "fLu14PacNT1ce6lJXfEsj5Nf8IJnSygBLdqEElPq",
        "Content-Type": "application/json"
    }

    @staticmethod
    def save_post(data):
        response = requests.post(ParseConfig.API_URL, headers=ParseConfig.HEADERS, json=data)
        return response.json()

