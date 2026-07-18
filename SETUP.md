# 🚀 Configuración y Deploy del Sistema

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **npm** 9+
- **Firebase Project** (configurado en [Firebase Console](https://console.firebase.google.com))
- **Servidor** (Azure, AWS, Heroku, VPS, etc.)

---

## 🔧 Instalación Local

### 1. Clonar y preparar

```bash
# Clonar el repositorio
git clone <tu-repo> Sistema
cd Sistema

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

cd ..
```

### 2. Configurar variables de entorno

**Backend:**
```bash
cp .env.example .env
# Editar .env con tus credenciales Firebase y puerto
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Editar .env.local con URL del API y credenciales Firebase
cd ..
```

### 3. Ejecutar en desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Ejecutará en http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Ejecutará en http://localhost:5173
```

---

## 📦 Build para Producción

### Backend

```bash
cd backend
npm run start
```

### Frontend

```bash
cd frontend
npm run build
# Esto genera la carpeta 'dist' lista para servir
```

---

## 🌐 Deploy Opciones

### Opción 1: **Heroku** (Recomendado para empezar)

**Backend:**
```bash
heroku create tu-app-backend
heroku config:set PORT=4000 FRONTEND_ORIGIN=https://tu-app-frontend.herokuapp.com -a tu-app-backend
heroku config:set FIREBASE_API_KEY=... (copiar todas las vars) -a tu-app-backend
git push heroku main
```

**Frontend:**
```bash
heroku create tu-app-frontend
heroku buildpacks:add buildpack/static
npm run build
git push heroku main
```

### Opción 2: **Azure App Service**

```bash
# Instalar CLI
npm install -g @azure/cli

# Login
az login

# Crear resource group
az group create --name mi-empresa --location eastus

# Crear App Service
az appservice plan create --name mi-plan --resource-group mi-empresa --sku B1 --is-linux

# Deploy backend
az webapp create --resource-group mi-empresa --plan mi-plan --name api-mi-empresa --runtime "node|18-lts"
az webapp config appsettings set --resource-group mi-empresa --name api-mi-empresa --settings FIREBASE_API_KEY=... PORT=4000

# Deploy frontend (static)
az staticwebapp create --name www-mi-empresa --resource-group mi-empresa --source . --location westus --sku Standard
```

### Opción 3: **VPS (Digital Ocean, Linode, AWS EC2)**

```bash
# SSH a tu servidor
ssh root@tu-ip

# Instalar Node.js
curl https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# Clonar repo
git clone <tu-repo>
cd Sistema

# Backend con PM2
npm install -g pm2
cd backend && npm install && cd ..
pm2 start backend/server.js --name "api" --env production
pm2 save && pm2 startup

# Frontend con Nginx
sudo apt-get install -y nginx
cd frontend && npm run build
sudo cp -r dist /var/www/html/
```

---

## ✅ Checklist Pre-Producción

- [ ] Firebase configurado correctamente
- [ ] Variables de entorno en servidor (.env)
- [ ] HTTPS/SSL activado
- [ ] CORS configurado para tu dominio
- [ ] Backups automáticos de datos
- [ ] Base de datos segura
- [ ] Logs habilitados
- [ ] Monitoreo de uptime
- [ ] Rate limiting activo
- [ ] Autenticación 2FA en Firebase (opcional)

---

## 🔒 Seguridad

**NUNCA** expongas:
- `.env` en git
- Claves Firebase públicamente
- Contraseñas o tokens

**SIEMPRE**:
- Usa HTTPS en producción
- Cambia las credenciales por las tuyas
- Habilita autenticación en Firebase
- Configura reglas de Firestore seguras

---

## 📞 Contacto & Soporte

Si necesitas ayuda:
1. Revisa los logs: `pm2 logs`
2. Verifica las variables de entorno: `env | grep FIREBASE`
3. Prueba el API: `curl http://localhost:4000/api/status`

