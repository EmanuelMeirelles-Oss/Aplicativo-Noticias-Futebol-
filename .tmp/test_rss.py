import urllib.request
import xml.etree.ElementTree as ET

def test_rss(url):
    print(f"Testing {url}")
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        root = ET.fromstring(xml_data)
        count = 0
        for item in root.findall('./channel/item'):
            title = item.find('title').text
            print(f"- {title}")
            count += 1
            if count >= 3:
                break
    except Exception as e:
        print(f"Error: {e}")

test_rss("https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419")
test_rss("https://news.google.com/rss/search?q=futebol+internacional&hl=pt-BR&gl=BR&ceid=BR:pt-419")
