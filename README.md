# 📊 Sistema de Gestión de Ventas

Sistema integral para gestionar inventario, ventas, clientes y reportes de tu empresa.

## ✨ Características

### 🏢 Dashboard
- KPIs de ventas en tiempo real
- Gráficos de tendencias
- Actividades recientes
- Alertas de bajo stock

### 📦 Inventario
- Gestión de productos
- Categorías y marcas
- Imágenes de productos
- Control de stock

### 💰 Punto de Venta (POS)
- Venta rápida
- Búsqueda de productos
- Cálculo automático
- Generación de comprobantes

### 👥 Clientes
- Registro de clientes
- Historial de compras
- Información de contacto

### 📈 Reportes
- Ventas por período
- Top productos
- Ganancias
- Análisis de tendencias

### 🔄 Devoluciones
- Gestión de devoluciones
- Historial de cambios

---

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### Desarrollo

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

Accede a **http://localhost:5173**

### Producción

Ver archivo [SETUP.md](SETUP.md) para instrucciones de deploy.

---

## 📂 Estructura del Proyecto

```
├── backend/              # Servidor Express
│   ├── server.js        # Punto de entrada
│   └── uploads/         # Imágenes de productos
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas principales
│   │   ├── services/    # APIs y Firebase
│   │   └── utils/       # Utilidades
│   └── vite.config.ts   # Configuración Vite
└── database/            # Schema SQL
```

---

## 🔐 Configuración de Seguridad

### Backend
- ✅ CORS habilitado
- ✅ Helmet para headers seguros
- ✅ Rate limiting (100 req/15min)
- ✅ Protección anti-brute-force
- ✅ Validación de archivos uploadados

### Frontend
- ✅ Autenticación con Firebase
- ✅ Tokens JWT automáticos
- ✅ Redirección a login si no autorizado

---

## 🛠 Variables de Entorno

Crear archivo `.env` en raíz del proyecto:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
FIREBASE_API_KEY=tu_key
FIREBASE_AUTH_DOMAIN=tu_domain.firebaseapp.com
FIREBASE_PROJECT_ID=tu_project
FIREBASE_STORAGE_BUCKET=tu_bucket.appspot.com
```

---

## 📱 Aplicación Desktop (Tauri)

```bash
cd frontend
npm run tauri-dev        # Desarrollo
npm run tauri-build      # Build
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores, abre un issue primero.

---

## 📄 Licencia

MIT

---

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo o abre un issue.

**Última actualización:** 2026-07-17
