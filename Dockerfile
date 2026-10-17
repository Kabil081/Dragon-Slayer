# The game and its online server in one small image.
#   docker build -t dragonslayer .
#   docker run -p 8080:8080 -e DATABASE_URL=postgresql://... dragonslayer
# Settings come from environment variables (see .env.example); .env is never copied in.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DS_HOST=0.0.0.0 \
    DS_PORT=8080 \
    DS_LOG=quiet

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# only what the server serves or runs (see .dockerignore)
COPY index.html asset_preview.html ./
COPY styles ./styles
COPY src ./src
COPY assets ./assets
COPY tools/serve.py ./tools/serve.py
COPY tools/gameserver ./tools/gameserver

# a SQLite fallback needs a writable data folder; the game runs as an ordinary user
RUN useradd --create-home --uid 10001 game && mkdir -p /app/data && chown game /app/data
USER game

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/api/health' % (os.environ.get('PORT') or os.environ['DS_PORT']), timeout=4)"
CMD ["python", "tools/serve.py"]
