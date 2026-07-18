# 🔥 Configuración Firebase - Guía Paso a Paso

## 1️⃣ Crear Proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Hacer clic en "Crear proyecto"
3. Ingresar nombre: `sistema` (o tu empresa)
4. Aceptar términos y crear

## 2️⃣ Configurar Autenticación

### Email/Password
1. En la consola → **Authentication** (Crear)
2. Ir a **Sign-in method**
3. Habilitar **Email/Password**
4. Guardar

### (Opcional) Google Sign-In
1. **Sign-in method** → **Google**
2. Copiar ID de Cliente de Google
3. Guardar

## 3️⃣ Configurar Firestore Database

1. **Firestore Database** → **Crear base de datos**
2. Seleccionar región: `us-central1` (más cercana a ti)
3. Modo: **Inicio en modo prueba** (por ahora)
4. Crear

### Reglas de Seguridad (importante!)

En **Rules**, reemplazar con:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir sus datos
    match /usuarios/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Datos públicos (productos)
    match /productos/{productId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null && request.auth.token.admin == true;
    }
    
    // Ventas
    match /ventas/{ventaId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
    }
    
    // Default: denegar todo
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4️⃣ Configurar Storage (para imágenes)

1. **Storage** → **Comenzar**
2. Seleccionar región
3. Crear

### Reglas de Storage

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo usuarios autenticados pueden subir/leer imágenes
    match /productos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    match /perfiles/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5️⃣ Obtener Credenciales

1. **Project Settings** (engranaje arriba)
2. Ir a **Your apps** → Seleccionar tu app web
3. Copiar la configuración:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sistema-xxx.firebaseapp.com",
  projectId: "sistema-xxx",
  storageBucket: "sistema-xxx.appspot.com",
  messagingSenderId: "302905...",
  appId: "1:302905...:web:96e50..."
};
```

## 6️⃣ Usar en tu Proyecto

### Backend - `.env`
```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=sistema-xxx.firebaseapp.com
FIREBASE_PROJECT_ID=sistema-xxx
FIREBASE_STORAGE_BUCKET=sistema-xxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=302905...
FIREBASE_APP_ID=1:302905...:web:96e50...
```

### Frontend - `.env.local`
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sistema-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sistema-xxx
VITE_FIREBASE_STORAGE_BUCKET=sistema-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=302905...
VITE_FIREBASE_APP_ID=1:302905...:web:96e50...
```

## 7️⃣ Habilitar Métodos de Acceso

En **Firebase Console** → **Settings** → **General**:

- ✅ Google Analytics (opcional)
- ✅ Security Rules en modo estricto (importante)

## 8️⃣ Crear Colecciones Iniciales

En Firestore, crear:

1. **productos** - Catálogo de productos
2. **categorias** - Categorías
3. **marcas** - Marcas
4. **ventas** - Historial de ventas
5. **clientes** - Datos de clientes
6. **usuarios** - Usuarios del sistema

## ⚠️ SEGURIDAD - IMPORTANTE!

❌ **NUNCA**:
- Comitees credenciales a GitHub
- Las pongas en comentarios
- Las compartas por chat

✅ **SIEMPRE**:
- Usa archivos `.env` locales
- Actualiza reglas de Firestore
- Habilita autenticación
- Usa tokens JWT para APIs

## 🔑 Cambiar Credenciales (Production)

Si alguna credencial se expone:

1. Firebase Console → **Service Accounts**
2. Generar nueva clave privada
3. Actualizar en tu servidor
4. Eliminar antigua

## 📞 Monitoreo

En Firebase Console:
- **Firestore** → **Usage** - Ver consumo
- **Storage** → **Files** - Ver imágenes
- **Authentication** → **Users** - Ver usuarios

