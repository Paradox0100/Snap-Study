import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Directory to serve
DIRECTORY = "www"

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

def run(server_class=HTTPServer, handler_class=CustomHandler, port=8000):
    os.chdir(DIRECTORY)  # Change the working directory to the specified directory
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving on port {port} from directory '{DIRECTORY}'...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()