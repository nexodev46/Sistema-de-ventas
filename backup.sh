#!/bin/bash

# Script de Backup automático
# Uso: chmod +x backup.sh && ./backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_NAME="sistema_backup_$TIMESTAMP"

echo "🔄 Iniciando backup del sistema..."

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Backup de base de datos (si tienes MySQL/PostgreSQL)
echo "📦 Respaldando base de datos..."
# mysqldump -u usuario -p base_datos > $BACKUP_DIR/$BACKUP_NAME.sql

# Backup de archivos importantes
echo "📁 Respaldando uploads..."
tar -czf $BACKUP_DIR/$BACKUP_NAME\_uploads.tar.gz backend/uploads/

echo "📄 Respaldando configuración..."
tar -czf $BACKUP_DIR/$BACKUP_NAME\_config.tar.gz \
  .env \
  frontend/.env.local \
  docker-compose.yml \
  --exclude=node_modules

# Limpiar backups antiguos (más de 30 días)
echo "🧹 Limpiando backups antiguos..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "✅ Backup completado en: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Espacio usado: $(du -sh $BACKUP_DIR)"

# Opcional: Subir a cloud storage
# echo "☁️ Subiendo a Azure Storage..."
# az storage blob upload \
#   --container-name backups \
#   --file $BACKUP_DIR/$BACKUP_NAME\_uploads.tar.gz

echo "✅ Backup finalizado!"
