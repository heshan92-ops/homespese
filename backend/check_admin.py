import urllib.request, json, urllib.parse

try:
    data = urllib.parse.urlencode({'username':'admin', 'password':'admin'}).encode()
    req = urllib.request.Request('http://localhost:8000/api/token', data=data)
    with urllib.request.urlopen(req) as f:
        token = json.loads(f.read().decode())['access_token']
        
    req2 = urllib.request.Request('http://localhost:8000/api/users/me')
    req2.add_header('Authorization', 'Bearer ' + token)
    with urllib.request.urlopen(req2) as f2:
        user_data = json.loads(f2.read().decode())
        print(f"User: {user_data.get('username')}")
        print(f"is_superuser: {user_data.get('is_superuser')}")
        print(f"family_id: {user_data.get('family_id')}")
except Exception as e:
    print(f"Error: {e}")
