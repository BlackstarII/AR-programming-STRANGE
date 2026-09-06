import http.server
import socketserver
import webbrowser
import os
import sys

# Force UTF-8 for console output on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                url = f"http://localhost:{port}"
                print("\n" + "=" * 65)
                print(">> DOCTOR STRANGE AR SPELLCASTING ENGINE <<")
                print(">> Developed & Crafted by: elsemary (c) 2026")
                print(f">> Server listening at: {url}")
                print(">> Open your browser, grant webcam access & cast your spells!")
                print("=" * 65 + "\n")
                webbrowser.open(url)
                httpd.serve_forever()
        except OSError:
            port += 1
            continue

if __name__ == '__main__':
    run()
