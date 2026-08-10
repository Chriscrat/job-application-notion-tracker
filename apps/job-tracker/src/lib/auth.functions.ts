import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { authenticate, clearSession, hasSession } from './auth.server'

const credentialsSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const getSession = createServerFn({ method: 'GET' }).handler(async () => ({
  authenticated: await hasSession(),
}))

export const login = createServerFn({ method: 'POST' })
  .validator(credentialsSchema)
  .handler(async ({ data }) => ({ authenticated: await authenticate(data.username, data.password) }))

export const logout = createServerFn({ method: 'POST' }).handler(() => {
  clearSession()
  return { authenticated: false }
})
