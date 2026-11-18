import { FormEvent, ReactNode, Ref, useRef, useState } from "react"
import { api, ApiError, Role, Session } from "./api"

const STORY_PHOTO =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85"

type Navigate = (route: "home" | "login" | "signup") => void
type Errors = Partial<Record<"email" | "password", string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------- small shared pieces (also used by Register.tsx) ----------

export function AuthIcon({ name, size = 16 }: { name: "eye" | "eyeOff" | "alert" | "info" | "check" | "clock"; size?: number }) {
  const paths: Record<string, ReactNode> = {
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 7.5h.01" />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span className="field-error" id={id}>
      <AuthIcon name="alert" size={14} />
      {message}
    </span>
  )
}

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="form-error" role="alert">
      <AuthIcon name="alert" />
      <span>{message}</span>
    </p>
  )
}

export function PasswordInput({
  id,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  describedBy,
  inputRef,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  autoComplete: string
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="password-field">
      <input
        id={id}
        ref={inputRef}
        name={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? `${id}-error` : "", describedBy || ""].join(" ").trim() || undefined}
      />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
        <AuthIcon name={show ? "eyeOff" : "eye"} />
      </button>
    </div>
  )
}

export function AuthStory({ title, text, tag }: { title: string; text: string; tag: string }) {
  return (
    <div className="auth-story">
      <div className="auth-photo">
        <img src={STORY_PHOTO} alt="University friends together on campus" />
      </div>
      <h1>{title}</h1>
      <p>{text}</p>
      <span>{tag}</span>
    </div>
  )
}

export function RoleSwitch({ value, onChange }: { value: "student" | "club_admin"; onChange: (role: "student" | "club_admin") => void }) {
  return (
    <div className="role-switch" role="group" aria-label="Account type">
      {(
        [
          ["student", "Student"],
          ["club_admin", "Club Admin"],
        ] as const
      ).map(([role, label]) => (
        <button key={role} type="button" aria-pressed={value === role} onClick={() => onChange(role)}>
          {label}
        </button>
      ))}
    </div>
  )
}

// ---------- Login page ----------

const COPY: Record<Role, { title: string; text: string; tag: string; heading: string; intro: string; emailLabel: string; placeholder: string }> = {
  student: {
    title: "A campus connection starts here.",
    text: "Your campus. Your events. One student account for discovery, bookings and the moments that matter.",
    tag: "Student access",
    heading: "Welcome back",
    intro: "Log in to book events and manage your tickets.",
    emailLabel: "University email",
    placeholder: "name@university.lk",
  },
  club_admin: {
    title: "Run your society's events in one place.",
    text: "Create events, manage registrations and track attendance for your club or society.",
    tag: "Organizer access",
    heading: "Organizer sign in",
    intro: "Log in to manage your club's events and registrations.",
    emailLabel: "Email",
    placeholder: "club@university.lk",
  },
  super_admin: {
    title: "Keep the platform running smoothly.",
    text: "Approve organizers, oversee events and keep UniEvent Hub safe for every campus.",
    tag: "Platform admin",
    heading: "Admin sign in",
    intro: "Restricted to UniEvent Hub platform administrators.",
    emailLabel: "Admin email",
    placeholder: "admin@unievent.lk",
  },
}

const DEMO_ACCOUNTS: { role: Role; label: string; email: string; password: string }[] = [
  { role: "student", label: "Student", email: "student@unievent.lk", password: "Student@123" },
  { role: "club_admin", label: "Club Admin", email: "club@unievent.lk", password: "Club@1234" },
  { role: "super_admin", label: "Admin", email: "admin@unievent.lk", password: "Admin@1234" },
]

function validate(email: string, password: string): Errors {
  const errors: Errors = {}
  if (!email.trim()) errors.email = "Enter your email address"
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address, like name@university.lk"
  if (!password) errors.password = "Enter your password"
  return errors
}

export default function Login({
  navigate,
  onLogin,
}: {
  navigate: Navigate
  onLogin: (session: Session, remember: boolean) => void
}) {
  const [role, setRole] = useState<Role>("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResetNote, setShowResetNote] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const copy = COPY[role]

  const switchRole = (next: Role) => {
    setRole(next)
    setServerError("")
  }

  const update = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value)
    else setPassword(value)
    if (submitted) setErrors(validate(field === "email" ? value : email, field === "password" ? value : password))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError("")
    const found = validate(email, password)
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()

    setLoading(true)
    try {
      const session = await api.login({ email: email.trim(), password, role })
      onLogin(session, remember)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setRole(account.role)
    setEmail(account.email)
    setPassword(account.password)
    setErrors({})
    setServerError("")
  }

  return (
    <section className="auth-section">
      <div className="shell auth-layout">
        <AuthStory title={copy.title} text={copy.text} tag={copy.tag} />

        <form className="form-card auth-form" onSubmit={submit} noValidate aria-busy={loading}>
          {role === "super_admin" ? (
            <div className="admin-badge">
              <span>Platform admin sign-in</span>
              <button type="button" onClick={() => switchRole("student")}>
                Back to student login
              </button>
            </div>
          ) : (
            <RoleSwitch value={role} onChange={switchRole} />
          )}

          <div className="form-intro">
            <h2>{copy.heading}</h2>
            <p>{copy.intro}</p>
          </div>

          <label className="field" htmlFor="login-email">
            <span>{copy.emailLabel}</span>
            <input
              id="login-email"
              ref={emailRef}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.placeholder}
              value={email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            <FieldError id="login-email-error" message={errors.email} />
          </label>

          <label className="field" htmlFor="login-password">
            <span>Password</span>
            <PasswordInput
              id="login-password"
              inputRef={passwordRef}
              value={password}
              onChange={(v) => update("password", v)}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
            />
            <FieldError id="login-password-error" message={errors.password} />
          </label>

          <div className="form-options">
            <label>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </label>
            <button type="button" onClick={() => setShowResetNote(!showResetNote)} aria-expanded={showResetNote}>
              Forgot password?
            </button>
          </div>
          {showResetNote && (
            <p className="form-note" role="status">
              <AuthIcon name="info" />
              Password reset will be added in the next phase.
            </p>
          )}

          <FormError message={serverError} />

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Logging in…" : "Log in"}
          </button>

          {role === "student" && (
            <p className="form-switch">
              New here?{" "}
              <button type="button" onClick={() => navigate("signup")}>
                Create a student account
              </button>
            </p>
          )}
          {role === "club_admin" && (
            <p className="form-switch">
              New organizer?{" "}
              <button type="button" onClick={() => (window.location.hash = "/signup?role=club_admin")}>
                Request an organizer account
              </button>
            </p>
          )}
          {role !== "super_admin" && (
            <p className="admin-link">
              Platform admin?{" "}
              <button type="button" className="link-button" onClick={() => switchRole("super_admin")}>
                Sign in here
              </button>
            </p>
          )}

          {import.meta.env.DEV && (
            <details className="demo-box">
              <summary>Demo accounts (development only)</summary>
              <div>
                {DEMO_ACCOUNTS.map((account) => (
                  <button key={account.email} type="button" onClick={() => fillDemo(account)}>
                    <strong>{account.label}</strong>
                    {account.email}
                  </button>
                ))}
              </div>
            </details>
          )}
        </form>
      </div>
    </section>
  )
}
