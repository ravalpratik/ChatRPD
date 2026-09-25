import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { connectDb } from './db.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chats.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'ChatRPD' })
})

app.use('/api/auth', authRoutes)
app.use('/api/chats', chatRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Server error' })
})

const frontendDist = path.resolve(__dirname, '../../frontend/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

connectDb()
  .then(() => {
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`ChatRPD API ready on ${config.port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start:', err.message)
    process.exit(1)
  })
