import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, default: '' },
    agent: { type: String, default: 'chat' },
    imageUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
  },
  { timestamps: true }
)

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New chat' },
    agent: { type: String, default: 'chat' },
    documentText: { type: String, default: '' },
    messages: [messageSchema],
  },
  { timestamps: true }
)

chatSchema.index({ userId: 1, updatedAt: -1 })
chatSchema.index({ userId: 1, title: 'text' })

export const Chat = mongoose.model('Chat', chatSchema)
