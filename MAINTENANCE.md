# Verificación y Mantenimiento del Sistema

## 🔍 Verificación Pre-Lanzamiento

Ejecuta este checklist antes de ir a producción:

### 1. Dependencias ✅
```bash
npm audit
npm audit fix
```

### 2. Ambiente ✅
- [ ] `.env` configurado correctamente
- [ ] `frontend/.env.local` configurado
- [ ] Puerto 4000 disponible
- [ ] Firebase Project activo

### 3. Construcción ✅
```bash
cd frontend && npm run build
cd backend && npm start
```

### 4. Testing ✅
```bash
# Probar API
curl -X GET http://localhost:4000/api/health

# Probar Frontend
http://localhost:5173
```

---

## 🚀 Comandos Útiles

### Backend
```bash
npm start           # Producción
npm run dev         # Desarrollo (con Nodemon)
npm audit          # Auditar seguridad
```

### Frontend
```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run preview     # Previsualizar build
npm run lint        # Linting
npm run tauri-dev   # Desktop app
```

---

## 📊 Monitoreo

### Logs
```bash
# Backend (si usas PM2)
pm2 logs api

# Frontend (revisar consola del navegador)
F12 > Console
```

### Performance
- Chrome DevTools: Network & Performance tabs
- Firebase Console: Monitoreo de Firestore

### Errores
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Verifica Firebase Console

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| CORS error | Verifica `FRONTEND_ORIGIN` en .env |
| Firebase no conecta | Comprueba credenciales en .env |
| Puerto ocupado | `lsof -i :4000` o cambia PORT en .env |
| Uploads no funcionan | Verifica permisos en `backend/uploads/` |
| Build fallando | `rm -rf node_modules && npm install` |

---

## 🔄 Actualizaciones

```bash
# Actualizar dependencias
npm update

# Actualizar a versión mayor (cuidado)
npm install package@latest

# Auditar vulnerabilidades
npm audit fix --force
```

---

## 📈 Escalado

Si el tráfico aumenta:
1. Implementa caché (Redis)
2. Usa CDN para imágenes
3. Optimiza queries Firestore
4. Considera load balancer

