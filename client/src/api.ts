// Tiny fetch helper for the auth API and session (token) storage.
// Vite proxies /api to http://localhost:5000 in development.

export type Role = 'student' | 'club_admin' | 'super_admin'

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended'
  universityId?: string
  studentId?: string
  phone?: string
}

export interface University {
  _id: string
  name: string
  domain?: string
}

export interface Session {
  token: string
  user: User
}

export class ApiError extends Error {
  status: number
  code: string
  details: Record<string, string>
  constructor(status: number, code: string, message: string, details: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Check that the API is running.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, body.code || 'ERROR', body.message || 'Something went wrong', body.details)
  }
  return body as T
}

const post = <T,>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) })

export const api = {
  universities: () => request<{ universities: University[] }>('/universities').then((r) => r.universities),
  register: (data: Record<string, unknown>) => post<{ user: User; message?: string }>('/auth/register', data),
  login: (data: { email: string; password: string; role: Role }) => post<Session>('/auth/login', data),
  me: (token: string) => request<{ user: User }>('/auth/me', {}, token).then((r) => r.user),
}

// "Remember me" keeps the session in localStorage; otherwise it lasts for the tab (sessionStorage).
const KEY = 'unievent.session'

export function saveSession(session: Session, remember: boolean) {
  clearSession()
  ;(remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session))
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}

// Where each role lands after logging in (the existing mock screens).
export const HOME_FOR_ROLE = { student: 'student', club_admin: 'club', super_admin: 'super' } as const
