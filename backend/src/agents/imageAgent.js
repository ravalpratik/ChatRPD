import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { config, missing } from '../config.js'

// const MODEL = 'black-forest-labs/FLUX.1-schnell'
const MODEL = 'Tongyi-MAI/Z-Image-Turbo'
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')

fs.mkdirSync(uploadsDir, { recursive: true })

export async function runImageAgent({ prompt }) {
  if (!config.huggingfaceApiKey) {
    throw missing('HUGGINGFACE_API_KEY')
  }

  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${MODEL}`,
    `https://api-inference.huggingface.co/models/${MODEL}`,
  ]

  let lastError = 'Image generation failed'
  for (const url of endpoints) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.huggingfaceApiKey}`,
        'Content-Type': 'application/json',
        Accept: 'image/png',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    if (!response.ok) {
      lastError = `Image generation failed: ${(await response.text()).slice(0, 240)}`
      continue
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const filename = `${crypto.randomUUID()}.png`
    fs.writeFileSync(path.join(uploadsDir, filename), buffer)
    return {
      content: `Generated image for: ${prompt}`,
      imageUrl: `/uploads/${filename}`,
      agent: 'image',
    }
  }

  throw new Error(lastError)
}
