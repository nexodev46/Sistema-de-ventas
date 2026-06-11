const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: FRONTEND_ORIGIN }))

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

const upload = multer({ storage })

// Endpoint para subir múltiples imágenes de producto
app.post('/api/uploads/productos/:productoId', upload.array('files', 10), (req, res) => {
  const files = req.files || []
  const productoId = req.params.productoId
  const urls = files.map(f => {
    const relPath = path.relative(UPLOADS_ROOT, f.path).split(path.sep).join('/')
    return `${req.protocol}://${req.get('host')}/uploads/${relPath}`
  })
  res.json({ urls })
})

// Endpoint para subir imagen de marca
app.post('/api/uploads/marcas/:marcaId', upload.array('files', 1), (req, res) => {
  const files = req.files || []
  const marcaId = req.params.marcaId
  const urls = files.map(f => {
    const relPath = path.relative(UPLOADS_ROOT, f.path).split(path.sep).join('/')
    return `${req.protocol}://${req.get('host')}/uploads/${relPath}`
  })
  res.json({ urls })
})

// Endpoint para subir imagen de perfil
app.post('/api/uploads/perfiles/:userId', upload.array('files', 1), (req, res) => {
  const files = req.files || []
  const userId = req.params.userId
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
