@echo off
REM Script de instalación para Windows

echo.
echo ========================================
echo    Sistema - Script de Instalacion
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js no esta instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo [OK] Node.js %NODE_VERSION%
echo [OK] npm %NPM_VERSION%
echo.

REM Crear archivos .env
echo Configurando variables de entorno...
if not exist ".env" (
    copy .env.example .env
    echo [OK] Archivo .env creado - EDITA CON TUS CREDENCIALES
)

if not exist "frontend\.env.local" (
    copy frontend\.env.example frontend\.env.local
    echo [OK] Archivo frontend\.env.local creado - EDITA CON TU API_URL
)

echo.
echo Instalando dependencias...
echo.

REM Backend
echo [1/2] Backend...
cd backend
call npm install
cd ..

REM Frontend
echo [2/2] Frontend...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo    Instalacion completada!
echo ========================================
echo.
echo Proximos pasos:
echo   1. Edita .env y frontend\.env.local
echo   2. Terminal 1: cd backend ^&^& npm run dev
echo   3. Terminal 2: cd frontend ^&^& npm run dev
echo   4. Accede a http://localhost:5173
echo.
echo Para mas informacion, ver SETUP.md
echo.
pause
