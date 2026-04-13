from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            # 1. Buscar Notícias do Google (Como o bot antigo)
            world_news = fetch_rss("https://news.google.com/rss/search?q=futebol+internacional&hl=pt-BR&gl=BR&ceid=BR:pt-419", 5)
            brazil_news = fetch_rss("https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419", 5)
            
            # 2. Buscar Notícias/Posts do Reddit em Tempo Real
            reddit_posts = fetch_reddit_posts("futebol", 5)
            
            # Intercalar Reddit com Mundo/Brasil (ou anexar ao final)
            world_combined = world_news + reddit_posts
            
            data = {
                "current_world": sorted_by_date(world_combined)[:10],
                "current_brazil": brazil_news,
                "history_world": [],
                "history_brazil": []
            }
        except Exception as e:
            data = {"error": str(e)}

        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
        return

def fetch_rss(url, limit=5):
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        root = ET.fromstring(xml_data)
        news_items = []
        for item in root.findall('./channel/item'):
            title = item.find('title').text if item.find('title') is not None else 'Sem Título'
            link = item.find('link').text if item.find('link') is not None else ''
            pubDate = item.find('pubDate').text if item.find('pubDate') is not None else str(datetime.now())
            news_items.append({'title': title, 'description': 'Google News', 'url': link, 'date': pubDate})
            if len(news_items) >= limit: break
        return news_items
    except Exception as e:
        return [{'title': 'Error Google News', 'description': str(e), 'url': '', 'date': str(datetime.now())}]

def fetch_reddit_posts(subreddit, limit=5):
    url = f"https://www.reddit.com/r/{subreddit}/top.json?limit={limit}&t=day"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            posts = []
            for child in data.get('data', {}).get('children', []):
                post = child.get('data', {})
                posts.append({
                    'title': post.get('title', 'Reddit Post'),
                    'description': f"Reddit (Score: {post.get('score', 0)})",
                    'url': f"https://www.reddit.com{post.get('permalink', '')}",
                    'date': str(datetime.now())
                })
            return posts
    except Exception as e:
        return [{'title': 'Error Reddit', 'description': str(e), 'url': '', 'date': str(datetime.now())}]

def sorted_by_date(items):
    # Simplest approach: leave them as is for UI presentation
    return items
