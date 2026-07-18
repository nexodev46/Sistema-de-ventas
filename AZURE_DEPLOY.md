# ☁️ Deploy en Azure App Service - Guía Completa

## 📋 Requisitos

- Cuenta de Azure (crear en [azure.microsoft.com](https://azure.microsoft.com))
- Azure CLI instalado
- Git configurado

## 🚀 Paso 1: Instalar Azure CLI

### Windows
```bash
# Descargar MSI desde:
https://aka.ms/installazurecliwindows

# O con Chocolatey:
choco install azure-cli
```

### Mac/Linux
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

Verificar instalación:
```bash
az --version
```

## 🔑 Paso 2: Login en Azure

```bash
az login
# Se abrirá navegador para autenticarte
```

Verificar:
```bash
az account show
```

## 📦 Paso 3: Crear Resource Group

```bash
az group create \
  --name mi-empresa-rg \
  --location eastus
```

## 🖥️ Paso 4: Crear App Service Plan

```bash
az appservice plan create \
  --name mi-empresa-plan \
  --resource-group mi-empresa-rg \
  --sku B1 \
  --is-linux
```

Opciones de SKU:
- `B1` - Básico (recomendado para empezar) ~$7/mes
- `B2` - Estándar
- `S1` - Premium

## 🌐 Paso 5: Deploy Backend

### Crear Web App
```bash
az webapp create \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg \
  --plan mi-empresa-plan \
  --runtime "node|18-lts" \
  --deployment-type local_git
```

### Configurar Variables de Entorno
```bash
az webapp config appsettings set \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg \
  --settings \
    PORT=8080 \
    FRONTEND_ORIGIN=https://www-mi-empresa.azurewebsites.net \
    FIREBASE_API_KEY="tu_key" \
    FIREBASE_AUTH_DOMAIN="tu_domain" \
    FIREBASE_PROJECT_ID="tu_project" \
    FIREBASE_STORAGE_BUCKET="tu_bucket" \
    FIREBASE_MESSAGING_SENDER_ID="tu_sender" \
    FIREBASE_APP_ID="tu_app_id" \
    NODE_ENV=production
```

### Configurar Git para Deploy
```bash
cd backend

# Agregar remote de Azure
az webapp deployment user set \
  --user-name mi-usuario \
  --password mi-contrasena-segura

# Obtener URL de Git
REPO=$(az webapp deployment source config-local-git \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg \
  --query url \
  --output tsv)

# Agregar remote
git remote add azure $REPO

# Deploy
git push azure main
```

## 🎨 Paso 6: Deploy Frontend (Static Web App)

### Crear Static Web App
```bash
az staticwebapp create \
  --name www-mi-empresa \
  --resource-group mi-empresa-rg \
  --source https://github.com/tu-usuario/tu-repo \
  --location westus \
  --sku Standard \
  --branch main
```

### Configurar Variables de Entorno
```bash
az staticwebapp appsettings set \
  --name www-mi-empresa \
  --resource-group mi-empresa-rg \
  --setting-names \
    VITE_API_URL="https://api-mi-empresa.azurewebsites.net/api" \
    VITE_FIREBASE_API_KEY="tu_key" \
    VITE_FIREBASE_AUTH_DOMAIN="tu_domain" \
    VITE_FIREBASE_PROJECT_ID="tu_project" \
    VITE_FIREBASE_STORAGE_BUCKET="tu_bucket" \
    VITE_FIREBASE_MESSAGING_SENDER_ID="tu_sender" \
    VITE_FIREBASE_APP_ID="tu_app_id"
```

## 🔗 Paso 7: Conectar Dominio

```bash
# Agregar dominio personalizado
az webapp config hostname add \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg \
  --hostname api.mi-empresa.com
```

SSL/TLS automático se configura con Azure.

## ✅ Verificar Deploy

```bash
# Estado del backend
az webapp show \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg \
  --query "state"

# URL del backend
https://api-mi-empresa.azurewebsites.net/api/health

# Logs en tiempo real
az webapp log tail \
  --name api-mi-empresa \
  --resource-group mi-empresa-rg
```

## 💾 Paso 8: Backups Automáticos

```bash
az appservice plan backup create \
  --resource-group mi-empresa-rg \
  --name mi-empresa-plan \
  --backup-name backup-inicial
```

## 🔍 Monitoreo

### Ver métricas
```bash
az monitor metrics list \
  --resource /subscriptions/{subscriptionId}/resourceGroups/mi-empresa-rg/providers/Microsoft.Web/sites/api-mi-empresa
```

### Configurar alertas (en Azure Portal)
1. Resource Group → Alerts
2. New Alert Rule
3. Condition: CPU > 80%

## 🆘 Troubleshooting

### Deploy fallando
```bash
# Ver logs
az webapp log tail --name api-mi-empresa --resource-group mi-empresa-rg

# Reiniciar app
az webapp restart --name api-mi-empresa --resource-group mi-empresa-rg
```

### Variables de entorno no se aplican
```bash
# Reiniciar para recargar
az webapp restart --name api-mi-empresa --resource-group mi-empresa-rg
```

### CORS error
Verificar `FRONTEND_ORIGIN` en App Settings.

## 💰 Costo Mensual Estimado

- App Service Plan B1: ~$7
- Static Web App: ~$10
- Firestore: según consumo (primeros GB gratis)
- **Total estimado: $17-30/mes**

## 🔐 Seguridad Checklist

- [ ] HTTPS habilitado (automático en Azure)
- [ ] Variables de entorno seguras
- [ ] Backups configurados
- [ ] Alertas activas
- [ ] Firestore Rules securizadas

