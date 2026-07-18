# ✅ Checklist Pre-Lanzamiento

## 🔍 Verificación Técnica

### Backend
- [ ] `.env` configurado con credenciales Firebase
- [ ] Puerto 4000 disponible
- [ ] `npm install` ejecutado sin errores
- [ ] `npm start` inicia sin problemas
- [ ] Endpoint `/api/health` responde OK
- [ ] Uploads funcionan en `backend/uploads/`

### Frontend
- [ ] `frontend/.env.local` configurado
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run build` genera `dist/` sin errores
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Búsqueda de productos funciona

### Firebase
- [ ] Proyecto creado y activo
- [ ] Autenticación habilitada (Email/Password)
- [ ] Firestore Database creada
- [ ] Storage configurado
- [ ] Reglas de seguridad ajustadas
- [ ] Credenciales copiadas correctamente

## 📋 Configuración de Producción

### Seguridad
- [ ] `.env` NO está en `.gitignore` (ya configurado)
- [ ] HTTPS habilitado en servidor
- [ ] CORS apuntando al dominio correcto
- [ ] Rate limiting activo (100 req/15min)
- [ ] Credenciales Firebase rotadas
- [ ] Contraseña de admin cambiada

### Datos
- [ ] Base de datos respaldada
- [ ] Backups automáticos configurados
- [ ] Ubicación de uploads asegurada
- [ ] Permisos de archivo correctos (755)

### Performance
- [ ] Compresión GZIP activada
- [ ] Caché de navegador configurado
- [ ] Imágenes optimizadas
- [ ] Bundler minificado

## 🚀 Deployment

### Opción 1: Heroku
- [ ] Heroku CLI instalado
- [ ] Proyecto creado en Heroku
- [ ] Variables de entorno configuradas
- [ ] Buildpacks correctos

### Opción 2: Azure
- [ ] Azure CLI instalado
- [ ] Resource Group creado
- [ ] App Service creado
- [ ] Static Web App creado
- [ ] Dominios configurados

### Opción 3: Docker
- [ ] Docker instalado
- [ ] Dockerfiles validados
- [ ] Docker Compose funciona: `docker-compose up`
- [ ] Imágenes suben a registry (Docker Hub/ACR)

### Opción 4: VPS
- [ ] SSH acceso verificado
- [ ] Node.js 18+ instalado
- [ ] Firewall configurado (puertos 80, 443, 4000)
- [ ] SSL/TLS (Let's Encrypt)
- [ ] PM2 instalado para supervisor

## 📊 Monitoreo

- [ ] Logs configurados
- [ ] Alertas por email activas
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (New Relic/DataDog)

## 👥 Usuario Final

- [ ] Admin creado
- [ ] Permisos configurados
- [ ] Capacitación completada
- [ ] Manual de usuario disponible
- [ ] Número de soporte documentado

## 🔄 Post-Launch

- [ ] Monitoreo primeras 24h
- [ ] Feedback de usuarios recogido
- [ ] Bugs críticos documentados
- [ ] Plan de mejoras siguiente sprint

## 📞 Contacto de Emergencia

En caso de problemas:

1. **Servidor caído**: SSH y revisar `pm2 logs`
2. **Lentitud**: Revisar uso de CPU/memoria
3. **Datos perdidos**: Restaurar desde backup
4. **Seguridad**: Cambiar credenciales inmediatamente

---

## 📝 Notas

```
Fecha de launch: _______________
Versión: _______________
URL: _______________
Email admin: _______________
```

