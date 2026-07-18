#!/bin/bash

# Script de instalación para Sistema
# Ejecutar: chmod +x install.sh && ./install.sh

echo "🚀 Iniciando instalación del Sistema..."

# Color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js$(node -v)${NC}"
echo -e "${GREEN}✓ npm$(npm -v)${NC}"

# Crear archivos .env si no existen
echo -e "${YELLOW}📝 Configurando variables de entorno...${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}Creando .env para backend${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Edita .env con tus credenciales Firebase${NC}"
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}Creando .env.local para frontend${NC}"
    cp frontend/.env.example frontend/.env.local
    echo -e "${YELLOW}⚠️  Edita frontend/.env.local con tu API_URL${NC}"
fi

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"

echo "Backend:"
cd backend
npm install
cd ..

echo "Frontend:"
cd frontend
npm install
cd ..

echo -e "${GREEN}✅ Instalación completada!${NC}"
echo ""
echo -e "${GREEN}Próximos pasos:${NC}"
echo "1. Edita .env y frontend/.env.local"
echo "2. Terminal 1: cd backend && npm run dev"
echo "3. Terminal 2: cd frontend && npm run dev"
echo "4. Accede a http://localhost:5173"
echo ""
echo -e "${YELLOW}📖 Para más información, ver SETUP.md${NC}"
