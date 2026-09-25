import { Router } from 'express'
import { config, missing } from '../config.js'
import { User } from '../models/User.js'
import { publicUser, requireAuth, setAuthCookie, signToken } from '../middleware/auth.js'

const router = Router()

function googleAuthUrl() {
  if (!config.googleClientId) {
    throw missing('GOOGLE_CLIENT_ID')
  }
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleCallbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

router.get('/google', (req, res) => {
  try {
    res.redirect(googleAuthUrl())
  } catch (err) {
    res.redirect(`${config.clientOrigin}/?error=auth`)
  }
})

router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code
    if (!code) {
      return res.redirect(`${config.clientOrigin}/?error=auth`)
    }
    if (!config.googleClientId || !config.googleClientSecret) {
      return res.redirect(`${config.clientOrigin}/?error=auth`)
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleCallbackUrl,
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect(`${config.clientOrigin}/?error=auth`)
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()
    if (!profile.sub || !profile.email) {
      return res.redirect(`${config.clientOrigin}/?error=auth`)
    }

    const user = await User.findOneAndUpdate(
      { googleId: profile.sub },
      {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email,
        picture: profile.picture || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const token = signToken(user)
    setAuthCookie(res, token)
    res.redirect(`${config.clientOrigin}/app`)
  } catch {
    res.redirect(`${config.clientOrigin}/?error=auth`)
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

router.post('/logout', (req, res) => {
  res.clearCookie('chatrpd_token')
  res.json({ ok: true })
})

export default router
