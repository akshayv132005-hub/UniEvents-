import { FormEvent, useEffect, useState } from "react"
import { api, ApiError, University } from "./api"
import { AuthIcon, AuthStory, FieldError, FormError, PasswordInput, RoleSwitch } from "./Login"

type Navigate = (route: "home" | "login" | "signup") => void
type RegisterRole = "student" | "club_admin"
type FieldName =
  | "name"
  | "universityId"
  | "studentId"
  | "clubName"
  | "phone"
  | "email"
  | "password"
  | "confirm"
  | "acceptTerms"
type Values = Record<Exclude<FieldName, "acceptTerms">, string> & { acceptTerms: boolean }
type Errors = Partial<Record<FieldName, string>>

const EMPTY: Values = {
  name: "",
  universityId: "",
  studentId: "",
  clubName: "",
  phone: "",
  email: "",
  password: "",
  confirm: "",
  acceptTerms: false,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d{9,12}$/

// Same rules as the server: at least 8 characters, a letter and a number.
function passwordRules(pw: string) {
  return [
    { ok: pw.length >= 8, label: "8+ characters" },
    { ok: /[A-Za-z]/.test(pw), label: "A letter" },
    { ok: /\d/.test(pw), label: "A number" },
  ]
}

function strength(pw: string) {
  if (!pw) return { score: 0, label: "" }
  const met = passwordRules(pw).filter((r) => r.ok).length
  if (met < 3) return { score: met === 0 ? 1 : met, label: met < 2 ? "Too weak" : "Weak" }
  const bonus = (pw.length >= 12 ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) ? 1 : 0)
  return bonus >= 1 ? { score: 4, label: "Strong" } : { score: 3, label: "Good" }
}

function validate(role: RegisterRole, v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = "Enter your full name"
  if (!v.universityId) e.universityId = "Choose your university"
  if (role === "student" && v.studentId.trim().length < 3) e.studentId = "Enter your student / registration number"
  if (role === "club_admin") {
    if (v.clubName.trim().length < 2) e.clubName = "Enter the club or society name"
    if (!PHONE_RE.test(v.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid contact number, like +94 77 123 4567"
  }
  if (!v.email.trim()) e.email = "Enter your email address"
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address, like name@university.lk"
  const failed = passwordRules(v.password).find((r) => !r.ok)
  if (!v.password) e.password = "Create a password"
  else if (failed) e.password = "Use at least 8 characters with a letter and a number"
  if (!v.confirm) e.confirm = "Repeat your password"
  else if (v.confirm !== v.password) e.confirm = "Passwords do not match"
  if (!v.acceptTerms) e.acceptTerms = "You must accept the terms to continue"
  return e
}

const ORDER: FieldName[] = ["name", "universityId", "studentId", "clubName", "phone", "email", "password", "confirm", "acceptTerms"]

function initialRole(): RegisterRole {
  const query = window.location.hash.split("?")[1] || ""
  return new URLSearchParams(query).get("role") === "club_admin" ? "club_admin" : "student"
}

export default function Register({ navigate }: { navigate: Navigate }) {
  const [role, setRole] = useState<RegisterRole>(initialRole)
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<null | RegisterRole>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [uniError, setUniError] = useState("")

  useEffect(() => {
    api
      .universities()
      .then(setUniversities)
      .catch(() => setUniError("Could not load universities. Check that the API is running, then reload."))
  }, [])

  const set = <K extends keyof Values>(field: K, value: Values[K]) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (submitted) setErrors(validate(role, next))
  }

  const switchRole = (next: RegisterRole) => {
    setRole(next)
    setServerError("")
    if (submitted) setErrors(validate(next, values))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError("")
    const found = validate(role, values)
    setErrors(found)
    const first = ORDER.find((f) => found[f])
    if (first) {
      document.getElementById(`reg-${first}`)?.focus()
      return
    }

    setLoading(true)
    try {
      await api.register({
        role,
        name: values.name.trim(),
        universityId: values.universityId,
        email: values.email.trim(),
        password: values.password,
        acceptTerms: values.acceptTerms,
        ...(role === "student" ? { studentId: values.studentId.trim() } : { clubName: values.clubName.trim(), phone: values.phone }),
      })
      setDone(role)
      window.scrollTo(0, 0)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
        if (err.details) setErrors((prev) => ({ ...prev, ...err.details }))
      } else {
        setServerError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const story =
    role === "student"
      ? {
          title: "Your campus story starts here.",
          text: "Join students across Sri Lanka discovering experiences, communities and new possibilities.",
          tag: "Student access",
        }
      : {
          title: "Bring your society's events online.",
          text: "Request an organizer account to publish events, manage registrations and track attendance.",
          tag: "Organizer access",
        }

  if (done) {
    return (
      <section className="auth-section">
        <div className="shell auth-layout">
          <AuthStory {...story} />
          <div className="form-card auth-form auth-success" role="status">
            {done === "student" ? (
              <>
                <span className="success-icon">
                  <AuthIcon name="check" size={28} />
                </span>
                <h2>Account created</h2>
                <p>Your student account is ready. You can log in now.</p>
                <button type="button" className="btn btn-primary btn-full" onClick={() => navigate("login")}>
                  Go to log in
                </button>
              </>
            ) : (
              <>
                <span className="success-icon pending">
                  <AuthIcon name="clock" size={28} />
                </span>
                <h2>Request submitted</h2>
                <p>
                  Thanks! The Super Admin will review your organizer account. You will be able to log in once it is
                  approved.
                </p>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate("home")}>
                  Back to home
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    )
  }

  const field = (name: FieldName) => ({
    id: `reg-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `reg-${name}-error` : undefined,
  })
  const meter = strength(values.password)

  return (
    <section className="auth-section">
      <div className="shell auth-layout">
        <AuthStory {...story} />

        <form className="form-card auth-form" onSubmit={submit} noValidate aria-busy={loading}>
          <RoleSwitch value={role} onChange={switchRole} />

          <div className="form-intro">
            <h2>{role === "student" ? "Create your student account" : "Request an organizer account"}</h2>
            <p>
              {role === "student"
                ? "A simple account for campus events, tickets and bookings."
                : "For club and society administrators who run campus events."}
            </p>
          </div>

          {role === "club_admin" && (
            <p className="form-note">
              <AuthIcon name="info" />
              Organizer accounts are reviewed and approved by the Super Admin.
            </p>
          )}

          <label className="field" htmlFor="reg-name">
            <span>Full name</span>
            <input {...field("name")} autoComplete="name" placeholder="e.g. Nethmi Silva" value={values.name} onChange={(e) => set("name", e.target.value)} />
            <FieldError id="reg-name-error" message={errors.name} />
          </label>

          <label className="field" htmlFor="reg-universityId">
            <span>University</span>
            <select {...field("universityId")} value={values.universityId} onChange={(e) => set("universityId", e.target.value)} disabled={!universities.length && !uniError}>
              <option value="">{universities.length ? "Choose your university" : uniError ? "Unavailable" : "Loading universities…"}</option>
              {universities.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <FieldError id="reg-universityId-error" message={errors.universityId || uniError} />
          </label>

          {role === "student" ? (
            <label className="field" htmlFor="reg-studentId">
              <span>Student / registration number</span>
              <input {...field("studentId")} placeholder="e.g. AS2023104" value={values.studentId} onChange={(e) => set("studentId", e.target.value)} />
              <FieldError id="reg-studentId-error" message={errors.studentId} />
            </label>
          ) : (
            <div className="auth-grid">
              <label className="field" htmlFor="reg-clubName">
                <span>Club or society name</span>
                <input {...field("clubName")} autoComplete="organization" placeholder="e.g. Rotaract Club" value={values.clubName} onChange={(e) => set("clubName", e.target.value)} />
                <FieldError id="reg-clubName-error" message={errors.clubName} />
              </label>
              <label className="field" htmlFor="reg-phone">
                <span>Contact number</span>
                <input {...field("phone")} type="tel" autoComplete="tel" placeholder="+94 77 123 4567" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
                <FieldError id="reg-phone-error" message={errors.phone} />
              </label>
            </div>
          )}

          <label className="field" htmlFor="reg-email">
            <span>{role === "student" ? "University email" : "Email"}</span>
            <input
              {...field("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@university.lk"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {role === "student" && !errors.email && <small>Use your official student email</small>}
            <FieldError id="reg-email-error" message={errors.email} />
          </label>

          <label className="field" htmlFor="reg-password">
            <span>Password</span>
            <PasswordInput
              id="reg-password"
              value={values.password}
              onChange={(v) => set("password", v)}
              error={errors.password}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              describedBy="reg-password-strength"
            />
            <div className="strength" id="reg-password-strength">
              <div className="strength-track" aria-hidden="true">
                <div className="strength-fill" style={{ width: `${meter.score * 25}%` }} />
              </div>
              <ul className="strength-rules">
                {passwordRules(values.password).map((rule) => (
                  <li key={rule.label} className={rule.ok ? "ok" : ""}>
                    <AuthIcon name={rule.ok ? "check" : "info"} size={12} />
                    {rule.label}
                  </li>
                ))}
                {meter.label && (
                  <li className="strength-label" aria-live="polite">
                    Strength: {meter.label}
                  </li>
                )}
              </ul>
            </div>
            <FieldError id="reg-password-error" message={errors.password} />
          </label>

          <label className="field" htmlFor="reg-confirm">
            <span>Confirm password</span>
            <PasswordInput
              id="reg-confirm"
              value={values.confirm}
              onChange={(v) => set("confirm", v)}
              error={errors.confirm}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            <FieldError id="reg-confirm-error" message={errors.confirm} />
          </label>

          <div>
            <label className="check-field" htmlFor="reg-acceptTerms">
              <input
                {...field("acceptTerms")}
                type="checkbox"
                checked={values.acceptTerms}
                onChange={(e) => set("acceptTerms", e.target.checked)}
              />
              <span>I agree to the UniEvent Hub Terms of Use and Privacy Policy.</span>
            </label>
            <FieldError id="reg-acceptTerms-error" message={errors.acceptTerms} />
          </div>

          <FormError message={serverError} />

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Creating account…" : role === "student" ? "Create account" : "Submit request"}
          </button>

          <p className="form-switch">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("login")}>
              Log in
            </button>
          </p>
        </form>
      </div>
    </section>
  )
}
