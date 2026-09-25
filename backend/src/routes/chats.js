import { Router } from 'express'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import { Chat } from '../models/Chat.js'
import { getAgentRunner } from '../agents/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

const AGENTS = new Set(['chat', 'search', 'image', 'code', 'docs'])

function titleFrom(text) {
  const cleaned = (text || 'New chat').replace(/\s+/g, ' ').trim()
  return cleaned.slice(0, 48) || 'New chat'
}

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim()
    const filter = { userId: req.user._id }
    if (q) {
      filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    }
    const chats = await Chat.find(filter)
      .select('title agent updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(80)
    res.json({ chats })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const agent = AGENTS.has(req.body?.agent) ? req.body.agent : 'chat'
    const title = titleFrom(req.body?.title)
    const chat = await Chat.create({
      userId: req.user._id,
      title,
      agent,
      messages: [],
    })
    res.status(201).json({ chat })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.json({ chat })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const title = titleFrom(req.body?.title)
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    )
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.json({ chat })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/messages', upload.single('file'), async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })

    const agent = AGENTS.has(req.body?.agent) ? req.body.agent : chat.agent || 'chat'
    const content = (req.body?.content || '').trim()
    if (!content && !req.file) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    let fileName = ''
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are supported' })
      }
      const parsed = await pdfParse(req.file.buffer)
      chat.documentText = parsed.text || ''
      fileName = req.file.originalname
    }

    const userMessage = {
      role: 'user',
      content: content || `Uploaded ${fileName}`,
      agent,
      fileName,
    }
    chat.messages.push(userMessage)
    chat.agent = agent
    if (chat.title === 'New chat' && content) {
      chat.title = titleFrom(content)
    }

    const history = chat.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }))

    const runner = getAgentRunner(agent)
    const result = await runner({
      prompt: content || `Summarize the uploaded document ${fileName}`,
      history: history.slice(0, -1),
      documentText: chat.documentText,
    })

    chat.messages.push({
      role: 'assistant',
      content: result.content,
      agent: result.agent || agent,
      imageUrl: result.imageUrl || '',
    })
    await chat.save()
    res.json({ chat })
  } catch (err) {
    next(err)
  }
})

export default router
