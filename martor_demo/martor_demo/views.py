
import requests

API_URL = 'https://parseapi.back4app.com/classes/Post'
HEADERS = {
    'X-Parse-Application-Id': 'mxU2269a95LXAOsqGS7QCZzTSPm8X1N7SxumWYIb',
    'X-Parse-REST-API-Key': 'fLu14PacNT1ce6lJXfEsj5Nf8IJnSygBLdqEElPq',
    'Content-Type': 'application/json'
}

def send_post_to_parse(title, content):
    data = {
        'title': title,
        'content': content
    }
    response = requests.post(API_URL, headers=HEADERS, json=data)
    return response.json()
