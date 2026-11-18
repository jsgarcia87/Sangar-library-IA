#!/usr/bin/env python3
"""
Sangar AI Library — Local Development Server
Lightweight HTTP server with auto-port detection and browser launcher support.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]}\n")

def run():
    global PORT
    os.chdir(DIRECTORY)
    
    # Try finding an open port if 3000 is taken
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                PORT = p
                url = f"http://localhost:{PORT}"
                print("\n" + "="*60)
                print(f"🪐 Sangar AI Library iniciada exitosamente")
                print(f"🔗 Abre tu navegador en: {url}")
                print(f"📁 Directorio raíz: {DIRECTORY}")
                print("Presiona Ctrl+C para detener el servidor.")
                print("="*60 + "\n")
                
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\nServidor detenido. ¡Hasta pronto!")
        sys.exit(0)
