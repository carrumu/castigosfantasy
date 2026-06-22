import urllib.request

url = "https://cf.biwenger.com/api/v2/competitions/la-liga/data?score=2"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
)

try:
    with urllib.request.urlopen(req) as response:
        raw_bytes = response.read()
        
        # Search for "Divisi" in the bytes
        index = raw_bytes.find(b"Divisi")
        if index != -1:
            snippet = raw_bytes[index:index+15]
            print("Snippet containing Divisi:", snippet)
            print("Hex values:", list(snippet))
        else:
            print("Could not find 'Divisi'")
            
except Exception as e:
    print("Error:", e)
