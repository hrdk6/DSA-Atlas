@echo off
rem Starts a small local web server for DSA Atlas and opens it in your browser.
rem (You can also just double-click index.html; use this if something doesn't load.)
cd /d "%~dp0"
start "" http://localhost:8000/
python -m http.server 8000
