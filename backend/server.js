const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

app.use(helmet())
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({ origin: FRONTEND_ORIGIN }))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }
})
app.use(globalLimiter)

// --- Protecciones básicas para intentos de autenticación (antibrute-force)
const authAttemptsByEmail = new Map()
const authAttemptsByIP = new Map()
const AUTH_WINDOW_MS = 15 * 60 * 1000 // 15 minutos
const AUTH_MAX_ATTEMPTS = 5
const AUTH_BLOCK_MS = 15 * 60 * 1000 // 15 minutos

const now = () => Date.now()

function recordFailure(email, ip) {
  const ts = now()

  // Email tracking
  const e = authAttemptsByEmail.get(email) || { count: 0, first: ts, blockedUntil: 0 }
  if (e.blockedUntil && e.blockedUntil > ts) {
    // already blocked
  } else {
    if (ts - e.first > AUTH_WINDOW_MS) {
      e.count = 1
      e.first = ts
    } else {
      e.count = (e.count || 0) + 1
    }
    if (e.count >= AUTH_MAX_ATTEMPTS) {
      e.blockedUntil = ts + AUTH_BLOCK_MS
    }
    authAttemptsByEmail.set(email, e)
  }

  // IP tracking
  const p = authAttemptsByIP.get(ip) || { count: 0, first: ts, blockedUntil: 0 }
  if (p.blockedUntil && p.blockedUntil > ts) {
    // already blocked
  } else {
    if (ts - p.first > AUTH_WINDOW_MS) {
      p.count = 1
      p.first = ts
    } else {
      p.count = (p.count || 0) + 1
    }
    if (p.count >= AUTH_MAX_ATTEMPTS * 6) {
      // stricter per-ip block
      p.blockedUntil = ts + AUTH_BLOCK_MS
    }
    authAttemptsByIP.set(ip, p)
  }
}

function recordSuccess(email) {
  authAttemptsByEmail.delete(email)
}

function checkAllowed(email, ip) {
  const ts = now()
  const e = authAttemptsByEmail.get(email)
  if (e && e.blockedUntil && e.blockedUntil > ts) {
    return { allowed: false, blockedUntil: e.blockedUntil }
  }
  const p = authAttemptsByIP.get(ip)
  if (p && p.blockedUntil && p.blockedUntil > ts) {
    return { allowed: false, blockedUntil: p.blockedUntil }
  }
  return { allowed: true }
}

// Simple pruning to avoid memory growth
setInterval(() => {
  const ts = now()
  for (const [k, v] of authAttemptsByEmail) {
    if (v.blockedUntil && v.blockedUntil < ts) authAttemptsByEmail.delete(k)
    else if (ts - v.first > AUTH_WINDOW_MS * 4) authAttemptsByEmail.delete(k)
  }
  for (const [k, v] of authAttemptsByIP) {
    if (v.blockedUntil && v.blockedUntil < ts) authAttemptsByIP.delete(k)
    else if (ts - v.first > AUTH_WINDOW_MS * 4) authAttemptsByIP.delete(k)
  }
}, 60 * 1000)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // limitar llamadas a endpoints de auth por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes al servicio de autenticación. Intenta más tarde.' }
})

// Endpoints básicos para que el frontend consulte/actualice el estado de bloqueo
app.post('/api/auth/check', authLimiter, (req, res) => {
  const email = String(req.body.email || '').toLowerCase()
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  if (!email) return res.status(400).json({ error: 'email requerido' })
  const result = checkAllowed(email, ip)
  res.json(result)
})

app.post('/api/auth/failed', authLimiter, (req, res) => {
  const email = String(req.body.email || '').toLowerCase()
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  if (!email) return res.status(400).json({ error: 'email requerido' })
  recordFailure(email, ip)
  const result = checkAllowed(email, ip)
  res.json(result)
})

app.post('/api/auth/success', authLimiter, (req, res) => {
  const email = String(req.body.email || '').toLowerCase()
  if (!email) return res.status(400).json({ error: 'email requerido' })
  recordSuccess(email)
  res.json({ ok: true })
})

// Carpeta pública para servir imágenes
const UPLOADS_ROOT = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_ROOT)) fs.mkdirSync(UPLOADS_ROOT, { recursive: true })
app.use('/uploads', express.static(UPLOADS_ROOT))

// Multer storage que guarda en dirs por producto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productoId = req.params.productoId || 'tmp'
    const dir = path.join(UPLOADS_ROOT, 'productos', productoId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9.\-_%() ]/g, '')
    cb(null, safeName)
  }
})

const sanitizeId = (id = '') => String(id).replace(/[^a-zA-Z0-9_-]/g, '_')

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'))
    }
    cb(null, true)
  },
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados uploads. Intenta de nuevo más tarde.' }
})

// Endpoint para subir múltiples imágenes de producto
app.post('/api/uploads/productos/:productoId', uploadLimiter, upload.array('files', 10), (req, res) => {
  const files = req.files || []
  const productoId = req.params.productoId
  const urls = files.map(f => {
    const relPath = path.relative(UPLOADS_ROOT, f.path).split(path.sep).join('/')
    return `${req.protocol}://${req.get('host')}/uploads/${relPath}`
  })
  res.json({ urls })
})

// Endpoint para subir imagen de marca
app.post('/api/uploads/marcas/:marcaId', uploadLimiter, upload.array('files', 1), (req, res) => {
  const files = req.files || []
  const marcaId = sanitizeId(req.params.marcaId)
  const urls = files.map(f => {
    const relPath = path.relative(UPLOADS_ROOT, f.path).split(path.sep).join('/')
    return `${req.protocol}://${req.get('host')}/uploads/${relPath}`
  })
  res.json({ urls })
})

// Endpoint para subir imagen de perfil
app.post('/api/uploads/perfiles/:userId', uploadLimiter, upload.array('files', 1), (req, res) => {
  const files = req.files || []
  const userId = sanitizeId(req.params.userId)
  const urls = files.map(f => {
    const relPath = path.relative(UPLOADS_ROOT, f.path).split(path.sep).join('/')
    return `${req.protocol}://${req.get('host')}/uploads/${relPath}`
  })
  res.json({ urls })
})

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Error handler to log unexpected errors and return JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err)
  res.status(500).json({ error: (err && err.message) || 'Internal Server Error' })
})

app.listen(PORT, () => console.log(`Backend uploads server running on http://localhost:${PORT}`))
