from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from typing import Dict, List, Optional

# Token for authentication
AUTH_TOKEN = "f68b4d7a-de73-4a55-857b-19b301fb3d59"

# In-memory storage for class data
class_data: Dict[str, dict] = {}

class Student:
    def __init__(self, name: str, rank: int, progress: int, photo: str):
        self.name = name
        self.rank = rank
        self.progress = progress
        self.photo = photo

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "rank": self.rank,
            "progress": self.progress,
            "photo": self.photo
        }

class ClassHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not self._verify_token():
            self._send_error(401, "Unauthorized")
            return

        parsed_path = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed_path.query)
        
        if parsed_path.path == "/api/class":
            class_id = params.get("class_id", [None])[0]
            if not class_id:
                self._send_error(400, "Missing class_id parameter")
                return
                
            if class_id not in class_data:
                self._send_error(404, "Class not found")
                return
                
            self._send_response(200, class_data[class_id])

    def do_POST(self):
        if not self._verify_token():
            self._send_error(401, "Unauthorized")
            return

        parsed_path = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed_path.query)
        
        if parsed_path.path == "/edit_class":
            class_id = params.get("class_id", [None])[0]
            if not class_id:
                self._send_error(400, "Missing class_id parameter")
                return

            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                data = json.loads(body)
                
                # Validate required fields
                if "total_students" not in data or "students" not in data:
                    self._send_error(400, "Missing required fields")
                    return

                # Update or create class data
                class_data[class_id] = {
                    "total_students": data["total_students"],
                    "students": data["students"]
                }
                
                self._send_response(200, {"message": "Class updated successfully"})
                
            except json.JSONDecodeError:
                self._send_error(400, "Invalid JSON data")
            except Exception as e:
                self._send_error(500, str(e))

    def _verify_token(self) -> bool:
        auth_header = self.headers.get("Authorization", "")
        return auth_header == f"Bearer {AUTH_TOKEN}"

    def _send_response(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, status_code: int, message: str):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode())

def run_server(port: int = 8000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, ClassHandler)
    print(f"Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()