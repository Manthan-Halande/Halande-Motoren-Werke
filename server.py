import http.server
import socketserver
import json
import os

PORT = 8000
DIRECTORY = "."
REVIEWS_FILE = "assets/reviews.json"

class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/reviews':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # 1. Parse the new review
                new_review = json.loads(post_data.decode('utf-8'))
                
                # 2. Add server-side timestamp if missing
                if 'timestamp' not in new_review:
                    import time
                    new_review['timestamp'] = int(time.time() * 1000)

                # 3. Read existing file
                if os.path.exists(REVIEWS_FILE):
                    with open(REVIEWS_FILE, 'r') as f:
                        try:
                            reviews = json.load(f)
                        except json.JSONDecodeError:
                            reviews = []
                else:
                    reviews = []

                # 4. Append and Save
                reviews.insert(0, new_review) # Add to top
                
                with open(REVIEWS_FILE, 'w') as f:
                    json.dump(reviews, f, indent=4)

                # 5. Respond
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "success", "message": "Review saved"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"New review saved for {new_review.get('car')}")

            except Exception as e:
                print(f"Error saving review: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_error(404, "File not found")

    def do_GET(self):
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

print(f"Starting HMW Server on http://localhost:{PORT}")
print("Press Ctrl+C to stop")

with socketserver.TCPServer(("", PORT), MyRequestHandler) as httpd:
    httpd.serve_forever()
