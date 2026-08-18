"""
Backend IAfluence — expose uniquement l'API des outils MCP.

Nginx proxyfie /api/ vers ce service sur localhost:5000.
Les pages du site sont servies statiquement par Nginx, pas par Flask.
"""
from flask import Flask
from dotenv import load_dotenv
from backend.mcp import mcp_bp

load_dotenv()

app = Flask(__name__)
app.register_blueprint(mcp_bp)


@app.route('/health')
def health():
    return {"status": "ok"}


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
