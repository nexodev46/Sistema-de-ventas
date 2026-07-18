@echo off
REM Script de Backup para Windows

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

set TIMESTAMP=%mydate%_%mytime%
set BACKUP_DIR=.\backups
set BACKUP_NAME=sistema_backup_%TIMESTAMP%

echo.
echo ========================================
echo       Iniciando Backup del Sistema
echo ========================================
echo.

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo Respaldando archivos importantes...

REM Backup de uploads
if exist backend\uploads (
    powershell -Command "Compress-Archive -Path 'backend/uploads' -DestinationPath '%BACKUP_DIR%/%BACKUP_NAME%_uploads.zip' -Force"
    echo [OK] Uploads respaldados
)

REM Backup de configuracion
powershell -Command "Compress-Archive -Path '.env', 'frontend/.env.local', 'docker-compose.yml' -DestinationPath '%BACKUP_DIR%/%BACKUP_NAME%_config.zip' -Force" 2>nul
echo [OK] Configuracion respaldada

echo.
echo Informacion del backup:
echo   Nombre: %BACKUP_NAME%
echo   Ubicacion: %BACKUP_DIR%

REM Mostrar espacio usado
dir %BACKUP_DIR% | find "bytes"

echo.
echo ========================================
echo       Backup completado!
echo ========================================
echo.
pause
