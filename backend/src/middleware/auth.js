import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { User } from '../models/User.js'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, config.jwtSecret, { expiresIn: '7d' })
}

export function setAuthCookie(res, token) {
  res.cookie('chatrpd_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.chatrpd_token
    if (!token) {
      return res.status(401).json({ error: 'Sign in required' })
    }
    if (!config.jwtSecret) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' })
    }
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.sub)
    if (!user) {
      return res.status(401).json({ error: 'Account not found' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }
}

export function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
  }
}
