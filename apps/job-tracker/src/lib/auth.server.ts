import { SignJWT, jwtVerify } from 'jose'
import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'

const SESSION_COOKIE = 'job_desk_session'
const encoder = new TextEncoder()

type Credentials = { username: string; password: string; sessionSecret: string }

function credentials(): Credentials {
  const username = process.env.APP_USERNAME
  const password = process.env.APP_PASSWORD
  const sessionSecret = process.env.APP_SESSION_SECRET
  if (!username || !password || !sessionSecret) {
    throw new Error('Authentication is not configured. Add APP_USERNAME, APP_PASSWORD, and APP_SESSION_SECRET.')
  }
  if (sessionSecret.length < 32) {
    throw new Error('APP_SESSION_SECRET must be at least 32 characters long.')
  }
  return { username, password, sessionSecret }
}

function cookieValue(name: string) {
  const cookieHeader = getRequestHeader('cookie')
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(/;\s*/)) {
    const separator = part.indexOf('=')
    if (separator !== -1 && part.slice(0, separator) === name) return part.slice(separator + 1)
  }
  return null
}

function cookieOptions(maxAge: number) {
  const secure = process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test'
  return [`HttpOnly`, secure ? 'Secure' : '', 'SameSite=Strict', 'Path=/', `Max-Age=${maxAge}`]
    .filter(Boolean)
    .join('; ')
}

async function equal(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ])
  const a = new Uint8Array(leftHash)
  const b = new Uint8Array(rightHash)
  return a.reduce((difference, value, index) => difference | (value ^ b[index]), 0) === 0
}

export async function authenticate(username: string, password: string) {
  const config = credentials()
  const valid = (await equal(username, config.username)) && (await equal(password, config.password))
  if (!valid) return false

  const token = await new SignJWT({ sub: config.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(encoder.encode(config.sessionSecret))
  setResponseHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; ${cookieOptions(60 * 60 * 24 * 14)}`)
  return true
}

export async function hasSession() {
  const token = cookieValue(SESSION_COOKIE)
  if (!token) return false
  try {
    await jwtVerify(token, encoder.encode(credentials().sessionSecret))
    return true
  } catch {
    return false
  }
}

export async function requireSession() {
  if (!(await hasSession())) throw new Error('Unauthorized')
}

export function clearSession() {
  setResponseHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieOptions(0)}`)
}
