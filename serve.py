"""Server lokal untuk development RepData.

Sama seperti `python3 -m http.server`, tapi menyuruh browser untuk tidak
menyimpan cache, jadi setiap perubahan file langsung terlihat saat refresh.

Jalankan:  python3 serve.py        (lalu buka http://localhost:8000)
           python3 serve.py 3000   (port lain)
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"RepData berjalan di http://localhost:{port} (tanpa cache)")
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
