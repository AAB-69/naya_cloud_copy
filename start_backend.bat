@echo off
echo ========================================================
echo   Starting Nayatel Cloud - Django REST API Backend
echo ========================================================
cd /d "%~dp0"
call .\env\Scripts\activate
python manage.py runserver 127.0.0.1:8000
pause
