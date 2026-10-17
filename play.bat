@echo off
rem Starts a local web server for the game (with caching off) and opens it.
cd /d "%~dp0"
start "" http://localhost:8642/
python tools\serve.py 8642
