import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react"
import Login from "./Login"
import Register from "./Register"
import { HOME_FOR_ROLE, Session, api, clearSession, loadSession, saveSession } from "./api"

// Minimal logged-in state shared with the header and dashboards.
const AuthContext = createContext<{ session: Session | null; logout: () => void }>({
  session: null,
  logout: () => {},
})

type Route = "home" | "explore" | "categories" | "about" | "event" | "booking" | "login" | "signup" | "student" | "ticket" | "club" | "editor" | "super" | "profile"

type IconName = "calendar" | "pin" | "clock" | "search" | "bell" | "user" | "ticket" | "chart" | "plus" | "users" | "check" | "arrow" | "eye" | "menu" | "home" | "edit" | "logout"

const photos = {
  students:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85",
  workshop:
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
  culture:
    "https://images.unsplash.com/photo-1663471984093-5925e87e72d5?auto=format&fit=crop&w=900&q=80",
  cricket:
    "https://images.unsplash.com/photo-1745180267166-71548e92f7ec?auto=format&fit=crop&w=900&q=80",
  lecture:
    "https://images.unsplash.com/photo-1758270704524-596810e891b5?auto=format&fit=crop&w=900&q=80",
  tech: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
  music:
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80",
}

const events = [
  {
    id: 1,
    title: "Campus Innovation Summit 2025",
    category: "Workshops",
    date: "12 Sep 2025",
    time: "9:00 AM",
    venue: "Main Auditorium, University of Colombo",
    price: "LKR 1,500",
    image: photos.workshop,
    seats: 28,
  },
  {
    id: 2,
    title: "Future Campus Walk",
    category: "Student Clubs",
    date: "18 Sep 2025",
    time: "3:30 PM",
    venue: "University of Moratuwa",
    price: "Free",
    image: photos.students,
    seats: 42,
  },
  {
    id: 3,
    title: "Rhythms of Campus",
    category: "Cultural",
    date: "21 Sep 2025",
    time: "6:00 PM",
    venue: "Nelum Pokuna Open Air",
    price: "LKR 2,000",
    image: photos.culture,
    seats: 16,
  },
  {
    id: 4,
    title: "Inter-University Cricket Cup",
    category: "Sports",
    date: "27 Sep 2025",
    time: "8:30 AM",
    venue: "University Grounds, Peradeniya",
    price: "LKR 500",
    image: photos.cricket,
    seats: 84,
  },
  {
    id: 5,
    title: "AI for Tomorrow Seminar",
    category: "Seminars",
    date: "03 Oct 2025",
    time: "10:00 AM",
    venue: "Faculty of Computing, SLIIT",
    price: "LKR 750",
    image: photos.lecture,
    seats: 31,
  },
  {
    id: 6,
    title: "Battle of the Bands",
    category: "Competitions",
    date: "08 Oct 2025",
    time: "5:00 PM",
    venue: "NIBM Green, Colombo 07",
    price: "LKR 1,200",
    image: photos.music,
    seats: 22,
  },
]

const categories = [
  [
    "Workshops",
    "Build practical skills with industry experts.",
    photos.workshop,
  ],
  [
    "Seminars",
    "Ideas, research and conversations that matter.",
    photos.lecture,
  ],
  [
    "Competitions",
    "Challenge yourself and represent your campus.",
    photos.tech,
  ],
  [
    "Cultural",
    "Celebrate the colour and creativity of campus life.",
    photos.culture,
  ],
  [
    "Sports",
    "Cheer, compete and connect through university sport.",
    photos.cricket,
  ],
  [
    "Student Clubs",
    "Find your people and grow your community.",
    photos.students,
  ],
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4Z" />
        <path d="M12 7v2M12 11v2M12 15v2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3M21 3v18" />
      </>
    ),
  }
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  icon,
  full,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  type?: "button" | "submit"
  icon?: IconName
  full?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-${variant}${full ? " btn-full" : ""}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}

function Logo({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <button
      className="logo"
      onClick={() => navigate("home")}
      aria-label="UniEvent Hub home"
    >
      <span>
        <Icon name="calendar" size={17} />
      </span>{" "}
      UniEvent Hub
    </button>
  )
}

function Header({
  route,
  navigate,
}: {
  route: Route
  navigate: (route: Route) => void
}) {
  const [open, setOpen] = useState(false)
  const { session, logout } = useContext(AuthContext)
  const links: [string, Route][] = [
    ["Home", "home"],
    ["Explore Events", "explore"],
    ["Categories", "categories"],
    ["About Us", "about"],
  ]
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Logo navigate={navigate} />
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <Icon name="menu" />
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([label, target]) => (
            <button
              key={target}
              className={route === target ? "active" : ""}
              onClick={() => {
                navigate(target)
                setOpen(false)
              }}
            >
              {label}
            </button>
          ))}
          <button
            className={
              route === "student" ? "active mobile-only" : "mobile-only"
            }
            onClick={() => navigate("student")}
          >
            My Bookings
          </button>
        </nav>
        <div className="nav-actions">
          {session ? (
            <div className="nav-user">
              <span title={session.user.email}>Hi, {session.user.name.split(" ")[0]}</span>
              <button className="nav-logout" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <button className="nav-login" onClick={() => navigate("login")}>
              Log in
            </button>
          )}
          <button
            className="notification"
            onClick={() => navigate("student")}
            aria-label="Notifications"
          >
            <Icon name="bell" size={17} />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <footer className="footer">
      <div className="footer-shell">
        <div>
          <Logo navigate={navigate} />
          <p>
            Your campus. Your events.
            <br />A student-first event experience across Sri Lanka.
          </p>
        </div>
        <div className="footer-links">
          <button onClick={() => navigate("about")}>About</button>
          <button onClick={() => navigate("explore")}>Explore</button>
          <button onClick={() => navigate("categories")}>Categories</button>
          <button onClick={() => navigate("club")}>Organizer Access</button>
          <button onClick={() => navigate("super")}>Admin</button>
        </div>
        <p className="copyright">© 2025 UniEvent Hub · Privacy & terms</p>
      </div>
    </footer>
  )
}

function Page({
  route,
  navigate,
  children,
  bare = false,
}: {
  route: Route
  navigate: (route: Route) => void
  children: ReactNode
  bare?: boolean
}) {
  return (
    <div className="app">
      {!bare && <Header route={route} navigate={navigate} />}
      <main>{children}</main>
      {!bare && <Footer navigate={navigate} />}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  text,
  centered = false,
}: {
  eyebrow?: string
  title: string
  text?: string
  centered?: boolean
}) {
  return (
    <div className={`section-heading${centered ? " centered" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function EventCard({
  event,
  navigate,
}: {
  event: typeof events[number]
  navigate: (route: Route) => void
}) {
  return (
    <article className="event-card">
      <div className="event-image">
        <img src={event.image} alt="" />
        <span>{event.category}</span>
      </div>
      <div className="event-body">
        <h3>{event.title}</h3>
        <div className="event-meta">
          <span>
            <Icon name="calendar" size={15} />
            {event.date} · {event.time}
          </span>
          <span>
            <Icon name="pin" size={15} />
            {event.venue}
          </span>
        </div>
        <div className="event-price">
          <div>
            <small>From</small>
            <strong>{event.price}</strong>
          </div>
          <small>{event.seats} spots left</small>
        </div>
        <div className="card-actions">
          <Button variant="secondary" onClick={() => navigate("event")}>
            View details
          </Button>
          <Button onClick={() => navigate("booking")}>Register now</Button>
        </div>
      </div>
    </article>
  )
}

function Home({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <Page route="home" navigate={navigate}>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">One campus community</span>
            <h1>Discover what’s happening across Sri Lanka’s universities.</h1>
            <p>
              Explore workshops, competitions, cultural nights and more—all in
              one student-first event hub.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate("explore")}>
                Explore events
              </Button>
              <Button variant="secondary" onClick={() => navigate("signup")}>
                Create student account
              </Button>
            </div>
            <div className="hero-trust">
              <div>
                <strong>50+</strong>
                <span>University clubs</span>
              </div>
              <div>
                <strong>120+</strong>
                <span>Events this term</span>
              </div>
              <div>
                <strong>8,000+</strong>
                <span>Students connected</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={photos.students}
              alt="University students enjoying campus life"
            />
            <div className="floating-event">
              <span className="date-tile">
                <strong>21</strong>SEP
              </span>
              <div>
                <strong>Rhythms of Campus</strong>
                <small>
                  <Icon name="pin" size={13} /> Colombo · 6:00 PM
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="heading-row">
            <SectionHeading
              eyebrow="Featured this week"
              title="Events worth showing up for"
              text="Hand-picked experiences from university clubs across the island."
            />
            <Button variant="ghost" onClick={() => navigate("explore")}>
              View all events →
            </Button>
          </div>
          <div className="event-grid three">
            {events.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>
      <section className="section tint">
        <div className="shell">
          <SectionHeading
            centered
            eyebrow="Find your community"
            title="Explore by category"
            text="Whatever you’re into, there’s a campus experience waiting."
          />
          <div className="category-strip">
            {categories.slice(0, 6).map(([name], i) => (
              <button
                key={name}
                onClick={() => {
                  sessionStorage.setItem("category", name)
                  navigate("explore")
                }}
              >
                <span>
                  <Icon
                    name={
                      ([
                        "plus",
                        "user",
                        "chart",
                        "ticket",
                        "calendar",
                        "users",
                      ] as IconName[])[i]
                    }
                  />
                </span>
                <strong>{name}</strong>
                <small>Explore events</small>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell about-split">
          <img
            src={photos.lecture}
            alt="Students attending a university lecture"
          />
          <div>
            <SectionHeading
              eyebrow="About UniEvent Hub"
              title="One place for the moments that shape campus life."
              text="We help students discover meaningful experiences and give university clubs simple tools to bring those experiences to life."
            />
            <ul className="check-list">
              <li>
                <Icon name="check" />
                Verified university communities
              </li>
              <li>
                <Icon name="check" />
                Simple registrations and digital tickets
              </li>
              <li>
                <Icon name="check" />
                Built for Sri Lankan campus life
              </li>
            </ul>
            <Button variant="secondary" onClick={() => navigate("about")}>
              Learn about us
            </Button>
          </div>
        </div>
      </section>
    </Page>
  )
}

function Explore({ navigate }: { navigate: (route: Route) => void }) {
  const initialCategory = sessionStorage.getItem("category") || "All categories"
  const [category, setCategory] = useState(initialCategory)
  const [query, setQuery] = useState("")
  const [freeOnly, setFreeOnly] = useState(false)
  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (category === "All categories" || e.category === category) &&
          (!freeOnly || e.price === "Free") &&
          e.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, freeOnly, query],
  )
  return (
    <Page route="explore" navigate={navigate}>
      <section className="explore-head">
        <div className="shell">
          <span className="eyebrow">Explore events</span>
          <h1>Find your next campus experience</h1>
          <p>
            Discover events created by university clubs and communities across
            Sri Lanka.
          </p>
          <div className="search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, university or location"
            />
            <Button>Search</Button>
          </div>
        </div>
      </section>
      <section className="section compact">
        <div className="shell explore-layout">
          <aside className="filters">
            <div className="filter-head">
              <h3>Refine your search</h3>
              <button
                onClick={() => {
                  setCategory("All categories")
                  setFreeOnly(false)
                }}
              >
                Clear
              </button>
            </div>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c[0]}>{c[0]}</option>
                ))}
              </select>
            </label>
            <label>
              Date
              <select>
                <option>Any date</option>
                <option>This week</option>
                <option>This month</option>
              </select>
            </label>
            <label>
              Location
              <select>
                <option>All locations</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Moratuwa</option>
              </select>
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />{" "}
              Free events only
            </label>
            <Button full>Apply filters</Button>
          </aside>
          <div className="results">
            <div className="results-head">
              <div>
                <strong>{filtered.length} events found</strong>
                <span>Showing upcoming university events</span>
              </div>
              <select aria-label="Sort events">
                <option>Recommended</option>
                <option>Soonest first</option>
                <option>Price: low to high</option>
              </select>
            </div>
            <div className="event-grid">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} navigate={navigate} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty">
                <Icon name="search" size={30} />
                <h3>No events found</h3>
                <p>Try changing your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Page>
  )
}

function Categories({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <Page route="categories" navigate={navigate}>
      <section className="page-hero">
        <div className="shell">
          <span className="eyebrow">Browse your way</span>
          <h1>There’s something for every student.</h1>
          <p>
            From skill-building workshops to unforgettable cultural nights, find
            events that feel like you.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell category-grid">
          {categories.map(([name, description, image]) => (
            <article className="category-card" key={name}>
              <img src={image} alt="" />
              <div>
                <span>{name}</span>
                <h2>{name}</h2>
                <p>{description}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    sessionStorage.setItem("category", name)
                    navigate("explore")
                  }}
                >
                  Explore {name.toLowerCase()}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Page>
  )
}

function About({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <Page route="about" navigate={navigate}>
      <section className="page-hero">
        <div className="shell">
          <span className="eyebrow">About us</span>
          <h1>Making campus life easier to discover.</h1>
          <p>
            UniEvent Hub connects students with the experiences, people and
            communities that make university memorable.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell about-split">
          <img
            src={photos.students}
            alt="A connected group of university students"
          />
          <div>
            <SectionHeading
              eyebrow="Our purpose"
              title="The campus connection layer."
              text="Great university experiences should never be hidden in scattered posts and group chats. We bring events into one trusted, accessible place."
            />
            <p>
              Students can discover, register and keep every ticket handy.
              Student clubs can publish events, understand attendance and reach
              the right campus communities.
            </p>
          </div>
        </div>
      </section>
      <section className="section tint">
        <div className="shell">
          <SectionHeading
            centered
            eyebrow="How it works"
            title="From discovery to the door in three steps"
          />
          <div className="steps">
            {[
              [
                "01",
                "Discover",
                "Explore verified events by interest, campus or date.",
              ],
              ["02", "Register", "Choose your ticket and reserve your place."],
              [
                "03",
                "Show up",
                "Use your secure QR ticket at the event entrance.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell benefits">
          <div>
            <SectionHeading
              eyebrow="For students"
              title="More of campus, less searching."
            />
            <p>
              One account, trusted event details, simple bookings and tickets
              always within reach.
            </p>
          </div>
          <div>
            <SectionHeading
              eyebrow="For student clubs"
              title="Tools that help great ideas grow."
            />
            <p>
              Publish confidently, manage registrations, track attendance and
              learn from every event.
            </p>
          </div>
        </div>
      </section>
    </Page>
  )
}

function Field({
  label,
  placeholder,
  type = "text",
  hint,
  required,
}: {
  label: string
  placeholder?: string
  type?: string
  hint?: string
  required?: boolean
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} required={required} />
      {hint && <small>{hint}</small>}
    </label>
  )
}

function EventDetails({ navigate }: { navigate: (route: Route) => void }) {
  const event = events[0]
  return (
    <Page route="event" navigate={navigate}>
      <section className="section compact">
        <div className="shell">
          <button className="back" onClick={() => history.back()}>
            <Icon name="arrow" />
            Back to events
          </button>
          <div className="detail-banner">
            <img
              src={event.image}
              alt="Students collaborating at the Campus Innovation Summit"
            />
            <span>{event.category}</span>
          </div>
          <div className="detail-layout">
            <article className="detail-copy">
              <span className="eyebrow">
                University of Colombo Innovation Club
              </span>
              <h1>{event.title}</h1>
              <p className="lead">
                A full-day gathering for students who want to turn meaningful
                ideas into real-world impact.
              </p>
              <h2>About this event</h2>
              <p>
                Meet student founders, industry mentors and creators from
                universities across Sri Lanka. The day includes hands-on
                workshops, practical panels and a campus innovation showcase.
              </p>
              <h2>What to expect</h2>
              <ul className="check-list">
                <li>
                  <Icon name="check" />
                  Three practical innovation workshops
                </li>
                <li>
                  <Icon name="check" />
                  Student startup showcase and networking
                </li>
                <li>
                  <Icon name="check" />
                  Lunch and event materials included
                </li>
              </ul>
              <div className="organizer-card">
                <div className="avatar">UC</div>
                <div>
                  <small>Organized by</small>
                  <strong>UoC Innovation Club</strong>
                  <span>Verified university organizer</span>
                </div>
                <Button variant="secondary">View profile</Button>
              </div>
            </article>
            <aside className="booking-card">
              <h3>Event details</h3>
              <div className="detail-row">
                <Icon name="calendar" />
                <div>
                  <small>Date</small>
                  <strong>Friday, 12 September 2025</strong>
                </div>
              </div>
              <div className="detail-row">
                <Icon name="clock" />
                <div>
                  <small>Time</small>
                  <strong>9:00 AM – 4:30 PM</strong>
                </div>
              </div>
              <div className="detail-row">
                <Icon name="pin" />
                <div>
                  <small>Venue</small>
                  <strong>Main Auditorium, University of Colombo</strong>
                </div>
              </div>
              <hr />
              <div className="ticket-option">
                <div>
                  <strong>Student pass</strong>
                  <small>Includes all sessions & lunch</small>
                </div>
                <strong>LKR 1,500</strong>
              </div>
              <div className="availability">
                <span>
                  <i style={{ width: "72%" }} />
                </span>
                <small>28 of 120 tickets remaining</small>
              </div>
              <p className="deadline">
                Registration closes 10 September, 11:59 PM
              </p>
              <Button full onClick={() => navigate("booking")}>
                Register now
              </Button>
              <button className="text-link" onClick={() => navigate("explore")}>
                Back to Explore Events
              </button>
            </aside>
          </div>
        </div>
      </section>
    </Page>
  )
}

function QRCode() {
  const cells =
    "111111101010111111110100001011100100000110111010111010111011101101110101010111011011101011101011101110110000101010101000011111111010101111111000000001110000000001101010110110101101011101101011001010011100110111100101001101100110001010111010101110101111001101010001010011111111101010111010110100001011110101110110111010110010101011101101110101101001011101011011101111101110111011000010001000101000111111111010101010101".split(
      "",
    )
  return (
    <div className="qr" aria-label="Demo QR ticket code">
      {cells.map((c, i) => (
        <i key={i} className={c === "1" ? "on" : ""} />
      ))}
    </div>
  )
}

function Booking({ navigate }: { navigate: (route: Route) => void }) {
  const [qty, setQty] = useState(1)
  const [pay, setPay] = useState("now")
  const [confirmed, setConfirmed] = useState(false)
  if (confirmed)
    return (
      <Page route="booking" navigate={navigate}>
        <section className="confirmation section">
          <div className="confirmation-card">
            <span className="success-icon">
              <Icon name="check" size={28} />
            </span>
            <span className="eyebrow">Booking confirmed</span>
            <h1>You’re going to the Innovation Summit.</h1>
            <p>
              Your booking is confirmed. A copy of this demo ticket has been
              added to your student dashboard.
            </p>
            <div className="ticket-preview">
              <div>
                <small>BOOKING ID</small>
                <strong>UEH-250912-084</strong>
                <small>FRI · 12 SEP · 9:00 AM</small>
              </div>
              <QRCode />
            </div>
            <div className="notice">
              Payment status:{" "}
              <strong>
                {pay === "now" ? "Demo payment approved" : "Pay at venue"}
              </strong>
              . No real payment was processed.
            </div>
            <div className="button-row">
              <Button onClick={() => navigate("ticket")}>
                View full ticket
              </Button>
              <Button variant="secondary" onClick={() => navigate("student")}>
                Go to dashboard
              </Button>
            </div>
          </div>
        </section>
      </Page>
    )
  return (
    <Page route="booking" navigate={navigate}>
      <section className="section compact">
        <div className="shell">
          <button className="back" onClick={() => history.back()}>
            <Icon name="arrow" />
            Back
          </button>
          <div className="booking-layout">
            <div>
              <SectionHeading
                eyebrow="Secure your place"
                title="Complete your booking"
                text="Choose your ticket and review the booking before confirming."
              />
              <article className="booking-event">
                <img src={events[0].image} alt="" />
                <div>
                  <span>Campus Innovation Summit 2025</span>
                  <small>
                    <Icon name="calendar" size={14} />
                    12 Sep 2025 · 9:00 AM
                  </small>
                  <small>
                    <Icon name="pin" size={14} />
                    University of Colombo
                  </small>
                </div>
              </article>
              <div className="selection-card">
                <h3>Select tickets</h3>
                <div className="ticket-select">
                  <div>
                    <strong>Student pass</strong>
                    <small>LKR 1,500 each</small>
                  </div>
                  <div className="stepper">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}>
                      −
                    </button>
                    <strong>{qty}</strong>
                    <button onClick={() => setQty(Math.min(4, qty + 1))}>
                      +
                    </button>
                  </div>
                </div>
                <h3>Payment preference</h3>
                <label
                  className={`pay-option${pay === "now" ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={pay === "now"}
                    onChange={() => setPay("now")}
                  />
                  <div>
                    <strong>Pay now</strong>
                    <small>Prototype checkout—no charge will be made</small>
                  </div>
                </label>
                <label
                  className={`pay-option${pay === "later" ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={pay === "later"}
                    onChange={() => setPay("later")}
                  />
                  <div>
                    <strong>Pay at venue</strong>
                    <small>Reserve now and pay before entry</small>
                  </div>
                </label>
              </div>
            </div>
            <aside className="summary-card">
              <h3>Booking summary</h3>
              <div>
                <span>Student pass × {qty}</span>
                <strong>LKR {(1500 * qty).toLocaleString()}</strong>
              </div>
              <div>
                <span>Service fee</span>
                <strong>LKR 0</strong>
              </div>
              <hr />
              <div className="total">
                <span>Total</span>
                <strong>LKR {(1500 * qty).toLocaleString()}</strong>
              </div>
              <Button full onClick={() => setConfirmed(true)}>
                {pay === "now" ? "Confirm demo payment" : "Confirm booking"}
              </Button>
              <p>
                <Icon name="check" size={14} /> This is a prototype. No real
                payment will be processed.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </Page>
  )
}

function DashboardLayout({
  kind,
  route,
  navigate,
  children,
}: {
  kind: "student" | "club" | "super"
  route: Route
  navigate: (route: Route) => void
  children: ReactNode
}) {
  const { logout } = useContext(AuthContext)
  const names = {
    student: "Student portal",
    club: "Club workspace",
    super: "Platform admin",
  }
  const links =
    kind === "student"
      ? [
          ["Overview", "home"],
          ["My bookings", "ticket"],
          ["Profile & settings", "user"],
        ]
      : kind === "club"
        ? [
            ["Overview", "home"],
            ["Create event", "plus"],
            ["Manage events", "calendar"],
            ["Registrations", "users"],
            ["Attendance", "check"],
            ["Reports", "chart"],
          ]
        : [
            ["Overview", "home"],
            ["Manage users", "users"],
            ["Club administrators", "user"],
            ["Manage events", "calendar"],
            ["Transactions", "ticket"],
            ["Reports", "chart"],
          ]
  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <Logo navigate={navigate} />
        <p>{names[kind]}</p>
        <nav>
          {links.map(([label, icon], i) => (
            <button
              key={label}
              className={i === 0 ? "active" : ""}
              onClick={() => {
                if (kind === "student" && i === 1) navigate("ticket")
                else if (kind === "student" && i === 2) navigate("profile")
                else if (kind === "club" && i === 1) navigate("editor")
                else
                  document
                    .getElementById(label.toLowerCase().replace(" ", "-"))
                    ?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Icon name={icon as IconName} />
              {label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" icon="logout" onClick={logout}>
          Log out
        </Button>
      </aside>
      <div className="dash-main">
        <header>
          <button className="dash-home" onClick={() => navigate("home")}>
            <Icon name="arrow" />
            Return to website
          </button>
          <div>
            <button aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <span className="avatar">
              {kind === "student" ? "NS" : kind === "club" ? "UC" : "SA"}
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: IconName
  label: string
  value: string
  note: string
}) {
  return (
    <article className="stat">
      <span>
        <Icon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </article>
  )
}

function StudentDashboard({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <DashboardLayout kind="student" route="student" navigate={navigate}>
      <div className="dash-content">
        <div className="dash-title">
          <div>
            <span className="eyebrow">Wednesday, 20 August</span>
            <h1>Welcome back, Nethmi.</h1>
            <p>Here’s what’s happening in your campus world.</p>
          </div>
          <Button onClick={() => navigate("explore")}>Explore events</Button>
        </div>
        <div className="stats">
          <Stat
            icon="ticket"
            label="Upcoming events"
            value="3"
            note="Next event in 8 days"
          />
          <Stat
            icon="check"
            label="Events attended"
            value="12"
            note="Across 6 categories"
          />
          <Stat
            icon="calendar"
            label="Saved events"
            value="5"
            note="2 closing soon"
          />
        </div>
        <div className="dash-grid">
          <section className="panel">
            <div className="panel-head">
              <h2>Upcoming registered events</h2>
              <button onClick={() => navigate("ticket")}>
                View booking history
              </button>
            </div>
            {events.slice(0, 3).map((e, i) => (
              <div className="booking-row" key={e.id}>
                <img src={e.image} alt="" />
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.date} · {e.time}
                  </span>
                  <small>{i === 0 ? "Paid · Ticket ready" : "Confirmed"}</small>
                </div>
                <Button variant="secondary" onClick={() => navigate("ticket")}>
                  {i === 0 ? "View ticket" : "Details"}
                </Button>
              </div>
            ))}
          </section>
          <aside className="panel profile-panel">
            <span className="avatar large">NS</span>
            <h2>Nethmi Silva</h2>
            <p>University of Colombo</p>
            <div>
              <small>Student ID</small>
              <strong>2023/ICT/104</strong>
            </div>
            <div>
              <small>Member since</small>
              <strong>January 2025</strong>
            </div>
            <Button
              variant="secondary"
              full
              onClick={() => navigate("profile")}
            >
              Manage profile
            </Button>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

function TicketPage({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <DashboardLayout kind="student" route="ticket" navigate={navigate}>
      <div className="dash-content">
        <button className="back" onClick={() => navigate("student")}>
          <Icon name="arrow" />
          Dashboard
        </button>
        <div className="dash-title">
          <div>
            <span className="eyebrow">My bookings</span>
            <h1>Ticket details</h1>
            <p>Present this QR code at the event entrance.</p>
          </div>
        </div>
        <div className="ticket-full">
          <div className="ticket-info">
            <img src={events[0].image} alt="" />
            <div>
              <span className="status success">Confirmed · Paid</span>
              <h2>{events[0].title}</h2>
              <p>
                <Icon name="calendar" />
                Friday, 12 September 2025 · 9:00 AM
              </p>
              <p>
                <Icon name="pin" />
                Main Auditorium, University of Colombo
              </p>
              <div className="ticket-data">
                <span>
                  <small>Attendee</small>
                  <strong>Nethmi Silva</strong>
                </span>
                <span>
                  <small>Ticket</small>
                  <strong>Student pass</strong>
                </span>
                <span>
                  <small>Booking ID</small>
                  <strong>UEH-250912-084</strong>
                </span>
                <span>
                  <small>Payment</small>
                  <strong>LKR 1,500 · Paid</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="ticket-qr">
            <QRCode />
            <strong>UEH-250912-084</strong>
            <small>Scan once at entry</small>
          </div>
        </div>
        <section className="panel history">
          <div className="panel-head">
            <h2>Booking history</h2>
            <span>3 bookings</span>
          </div>
          {events.slice(0, 3).map((e, i) => (
            <div className="history-row" key={e.id}>
              <span>
                <Icon name="calendar" />
              </span>
              <div>
                <strong>{e.title}</strong>
                <small>
                  {e.date} · {e.venue}
                </small>
              </div>
              <span className={`status ${i === 0 ? "success" : ""}`}>
                {i === 0 ? "Upcoming" : "Attended"}
              </span>
              <strong>{e.price}</strong>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}

function Profile({ navigate }: { navigate: (route: Route) => void }) {
  const [saved, setSaved] = useState(false)
  return (
    <DashboardLayout kind="student" route="profile" navigate={navigate}>
      <div className="dash-content">
        <div className="dash-title">
          <div>
            <span className="eyebrow">Account</span>
            <h1>Profile & settings</h1>
            <p>Keep your information and preferences up to date.</p>
          </div>
        </div>
        <div className="settings-grid">
          <section className="panel">
            <h2>Profile information</h2>
            <div className="profile-upload">
              <span className="avatar large">NS</span>
              <Button variant="secondary">Change photo</Button>
            </div>
            <div className="form-grid">
              <Field label="Full name" placeholder="Nethmi Silva" />
              <Field label="Student ID" placeholder="2023/ICT/104" />
              <Field label="University email" placeholder="nethmi@cmb.ac.lk" />
              <Field label="University" placeholder="University of Colombo" />
            </div>
            {saved && (
              <p className="form-success">
                <Icon name="check" />
                Profile changes saved.
              </p>
            )}
            <Button onClick={() => setSaved(true)}>Save changes</Button>
          </section>
          <aside>
            <section className="panel">
              <h2>Change password</h2>
              <Field
                label="Current password"
                type="password"
                placeholder="••••••••"
              />
              <Field
                label="New password"
                type="password"
                placeholder="At least 8 characters"
              />
              <Button variant="secondary">Update password</Button>
            </section>
            <section className="panel">
              <h2>Notifications</h2>
              <label className="toggle-row">
                <span>
                  <strong>Event reminders</strong>
                  <small>Before your registered events</small>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
              <label className="toggle-row">
                <span>
                  <strong>Club updates</strong>
                  <small>News from followed clubs</small>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
              <Button
                variant="danger"
                icon="logout"
                onClick={() => navigate("home")}
              >
                Log out
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ClubDashboard({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <DashboardLayout kind="club" route="club" navigate={navigate}>
      <div className="dash-content">
        <div className="dash-title">
          <div>
            <span className="eyebrow">UoC Innovation Club</span>
            <h1>Good morning, club team.</h1>
            <p>Your events and registrations at a glance.</p>
          </div>
          <Button icon="plus" onClick={() => navigate("editor")}>
            Create event
          </Button>
        </div>
        <div className="stats">
          <Stat
            icon="calendar"
            label="Live events"
            value="4"
            note="+1 this month"
          />
          <Stat
            icon="users"
            label="Registrations"
            value="328"
            note="+18% this term"
          />
          <Stat
            icon="ticket"
            label="Ticket sales"
            value="LKR 186K"
            note="LKR 42K pending payout"
          />
          <Stat
            icon="check"
            label="Attendance"
            value="84%"
            note="+6% from last event"
          />
        </div>
        <div className="dash-grid club-grid">
          <section className="panel" id="manage-events">
            <div className="panel-head">
              <h2>Manage events</h2>
              <button>View all</button>
            </div>
            <div className="data-table">
              <div className="table-head">
                <span>Event</span>
                <span>Status</span>
                <span>Registrations</span>
                <span>Revenue</span>
                <span />
              </div>
              {events.slice(0, 4).map((e, i) => (
                <div className="table-row" key={e.id}>
                  <span>
                    <img src={e.image} alt="" />
                    <b>{e.title}</b>
                  </span>
                  <span className={`status ${i < 2 ? "success" : ""}`}>
                    {i < 2 ? "Published" : "Draft"}
                  </span>
                  <span>{[92, 64, 48, 36][i]} / 120</span>
                  <span>
                    {i === 1 ? "Free" : `LKR ${[138, 96, 72, 54][i]},000`}
                  </span>
                  <Button variant="ghost" onClick={() => navigate("editor")}>
                    <Icon name="edit" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
          <aside className="panel scan-panel" id="attendance">
            <span>
              <Icon name="check" size={25} />
            </span>
            <h2>Validate attendance</h2>
            <p>
              Use the event check-in tool to scan and validate student QR
              tickets.
            </p>
            <div className="scanner">
              <Icon name="search" size={36} />
              <small>QR validation interface</small>
            </div>
            <Button full>Open scanner</Button>
          </aside>
        </div>
        <section className="panel" id="registrations">
          <div className="panel-head">
            <h2>Recent registrations</h2>
            <Button variant="secondary">Export list</Button>
          </div>
          <div className="simple-table">
            {[
              "Nethmi Silva",
              "Akash Fernando",
              "Tharushi Perera",
              "Ravindu Jayasinghe",
            ].map((name, i) => (
              <div key={name}>
                <span className="avatar">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <strong>{name}</strong>
                <span>
                  {
                    [
                      "University of Colombo",
                      "University of Moratuwa",
                      "University of Kelaniya",
                      "University of Peradeniya",
                    ][i]
                  }
                </span>
                <span>Student pass</span>
                <span className="status success">Paid</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel analytics" id="reports">
          <div>
            <span className="eyebrow">Reports & analytics</span>
            <h2>Registration momentum</h2>
            <p>Registrations are 18% higher than this point last term.</p>
          </div>
          <div className="bar-chart">
            {[38, 52, 44, 67, 62, 85, 78, 94].map((n, i) => (
              <i key={i} style={{ height: `${n}%` }} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function EventEditor({ navigate }: { navigate: (route: Route) => void }) {
  const [published, setPublished] = useState(false)
  return (
    <DashboardLayout kind="club" route="editor" navigate={navigate}>
      <div className="dash-content">
        <button className="back" onClick={() => navigate("club")}>
          <Icon name="arrow" />
          Back to events
        </button>
        <div className="dash-title">
          <div>
            <span className="eyebrow">Event workspace</span>
            <h1>Create a new event</h1>
            <p>Add the details students need to discover and register.</p>
          </div>
          <div className="button-row">
            <Button variant="secondary">Save draft</Button>
            <Button onClick={() => setPublished(true)}>Publish event</Button>
          </div>
        </div>
        {published && (
          <div className="success-banner">
            <Icon name="check" />
            Event published successfully. It is now visible in Explore Events.
          </div>
        )}
        <div className="editor-layout">
          <form className="panel editor-form">
            <h2>Event information</h2>
            <Field
              label="Event title"
              placeholder="e.g. Campus Innovation Summit 2025"
            />
            <label className="field">
              <span>Event description</span>
              <textarea
                rows={6}
                placeholder="Tell students what makes this event worth attending..."
              />
            </label>
            <label className="field">
              <span>Event image</span>
              <div className="upload">
                <Icon name="plus" />
                <strong>Upload event cover</strong>
                <small>PNG or JPG · Recommended 1600 × 900</small>
              </div>
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Category</span>
                <select>
                  <option>Workshops</option>
                  <option>Seminars</option>
                  <option>Sports</option>
                  <option>Cultural</option>
                </select>
              </label>
              <Field label="Venue" placeholder="Main Auditorium" />
              <Field label="Date" type="date" />
              <Field label="Start time" type="time" />
              <Field label="Registration deadline" type="date" />
            </div>
            <h2>Tickets</h2>
            <div className="ticket-builder">
              <Field label="Ticket name" placeholder="Student pass" />
              <Field label="Price (LKR)" type="number" placeholder="1500" />
              <Field label="Quantity" type="number" placeholder="120" />
              <Button variant="ghost">Remove</Button>
            </div>
            <Button variant="secondary" icon="plus">
              Add ticket type
            </Button>
          </form>
          <aside className="panel preview-card">
            <span className="eyebrow">Live preview</span>
            <div className="preview-image">
              <Icon name="plus" />
              <small>Event cover</small>
            </div>
            <h2>Your event title</h2>
            <p>Your event summary will appear here as you add details.</p>
            <div className="detail-row">
              <Icon name="calendar" />
              <span>Date and time</span>
            </div>
            <div className="detail-row">
              <Icon name="pin" />
              <span>Venue</span>
            </div>
            <Button full>Register now</Button>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

function SuperDashboard({ navigate }: { navigate: (route: Route) => void }) {
  const [tab, setTab] = useState<"overview" | "users" | "reports">("overview")
  return (
    <DashboardLayout kind="super" route="super" navigate={navigate}>
      <div className="dash-content">
        <div className="dash-title">
          <div>
            <span className="eyebrow">Platform administration</span>
            <h1>
              {tab === "overview"
                ? "UniEvent Hub overview"
                : tab === "users"
                  ? "User management"
                  : "Reports & analytics"}
            </h1>
            <p>Monitor platform health, activity and university communities.</p>
          </div>
          <div className="button-row">
            <Button
              variant={tab === "users" ? "primary" : "secondary"}
              onClick={() => setTab("users")}
            >
              Manage users
            </Button>
            <Button
              variant={tab === "reports" ? "primary" : "secondary"}
              onClick={() => setTab("reports")}
            >
              Reports
            </Button>
          </div>
        </div>
        {tab === "overview" && (
          <>
            <div className="stats">
              <Stat
                icon="users"
                label="Total users"
                value="8,482"
                note="+12.4% this month"
              />
              <Stat
                icon="calendar"
                label="Active events"
                value="124"
                note="18 awaiting review"
              />
              <Stat
                icon="ticket"
                label="Transactions"
                value="LKR 4.8M"
                note="This academic term"
              />
              <Stat
                icon="chart"
                label="Commission"
                value="LKR 240K"
                note="LKR 88K pending payout"
              />
            </div>
            <div className="dash-grid">
              <section className="panel">
                <div className="panel-head">
                  <h2>Platform activity</h2>
                  <select>
                    <option>Last 30 days</option>
                  </select>
                </div>
                <div className="large-chart">
                  <div className="chart-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <svg viewBox="0 0 500 180" preserveAspectRatio="none">
                    <path d="M0 160 C60 148 75 120 125 127 S190 92 240 105 S315 48 360 70 S440 28 500 35" />
                    <path d="M0 175 C80 165 100 150 155 155 S230 130 285 138 S365 100 410 112 S460 80 500 92" />
                  </svg>
                </div>
              </section>
              <aside className="panel">
                <div className="panel-head">
                  <h2>Event moderation</h2>
                  <span className="status">18 pending</span>
                </div>
                {events.slice(0, 3).map((e) => (
                  <div className="moderation" key={e.id}>
                    <img src={e.image} alt="" />
                    <div>
                      <strong>{e.title}</strong>
                      <small>Submitted by verified club</small>
                    </div>
                    <Button variant="secondary">Review</Button>
                  </div>
                ))}
              </aside>
            </div>
          </>
        )}
        {tab === "users" && (
          <section className="panel" id="manage-users">
            <div className="panel-head">
              <h2>Manage users & club administrators</h2>
              <div className="search-mini">
                <Icon name="search" />
                <input placeholder="Search people" />
              </div>
            </div>
            <div className="data-table users-table">
              <div className="table-head">
                <span>User</span>
                <span>Role</span>
                <span>University</span>
                <span>Status</span>
                <span>Joined</span>
              </div>
              {[
                "Nethmi Silva",
                "UoC Innovation Club",
                "Akash Fernando",
                "Kelaniya Arts Circle",
                "Tharushi Perera",
              ].map((n, i) => (
                <div className="table-row" key={n}>
                  <span>
                    <span className="avatar">
                      {n
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <b>{n}</b>
                  </span>
                  <span>{i % 2 ? "Club administrator" : "Student"}</span>
                  <span>
                    {
                      [
                        "Colombo",
                        "Colombo",
                        "Moratuwa",
                        "Kelaniya",
                        "Peradeniya",
                      ][i]
                    }
                  </span>
                  <span className="status success">Active</span>
                  <Button variant="ghost">Manage</Button>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === "reports" && (
          <>
            <div className="stats">
              <Stat
                icon="chart"
                label="Registration rate"
                value="74.8%"
                note="+5.3% from last term"
              />
              <Stat
                icon="ticket"
                label="Average ticket"
                value="LKR 1,240"
                note="+8% this quarter"
              />
              <Stat
                icon="users"
                label="Active clubs"
                value="56"
                note="Across 14 universities"
              />
            </div>
            <section className="panel analytics-report" id="reports">
              <div>
                <span className="eyebrow">Event category performance</span>
                <h2>Registrations by category</h2>
                <p>Download and share full platform reports.</p>
                <Button variant="secondary">Export report</Button>
              </div>
              <div className="horizontal-bars">
                {categories.map(([c], i) => (
                  <div key={c}>
                    <span>{c}</span>
                    <i>
                      <b style={{ width: `${[88, 64, 71, 93, 57, 76][i]}%` }} />
                    </i>
                    <strong>{[1240, 890, 1020, 1480, 760, 1110][i]}</strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function App() {
  const getRoute = (): Route => {
    const value = window.location.hash.replace("#/", "").split("?")[0] as Route
    return [
      "home",
      "explore",
      "categories",
      "about",
      "event",
      "booking",
      "login",
      "signup",
      "student",
      "ticket",
      "club",
      "editor",
      "super",
      "profile",
    ].includes(value)
      ? value
      : "home"
  }
  const [route, setRoute] = useState<Route>(getRoute)
  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])
  const navigate = (next: Route) => {
    if (window.location.hash === `#/${next}`) window.scrollTo(0, 0)
    else window.location.hash = `/${next}`
  }

  const [session, setSession] = useState<Session | null>(loadSession)
  const handleLogin = (next: Session, remember: boolean) => {
    saveSession(next, remember)
    setSession(next)
    navigate(HOME_FOR_ROLE[next.user.role]) // student -> student, club_admin -> club, super_admin -> super
  }
  const logout = () => {
    clearSession()
    setSession(null)
    navigate("home")
  }
  // On load, check the stored token is still valid (it expires after 1 day).
  useEffect(() => {
    if (!session) return
    api.me(session.token).catch((err) => {
      if (err.status === 401) {
        clearSession()
        setSession(null)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pages: Record<Route, ReactNode> = {
    home: <Home navigate={navigate} />,
    explore: <Explore navigate={navigate} />,
    categories: <Categories navigate={navigate} />,
    about: <About navigate={navigate} />,
    event: <EventDetails navigate={navigate} />,
    booking: <Booking navigate={navigate} />,
    login: (
      <Page route="login" navigate={navigate}>
        <Login navigate={navigate} onLogin={handleLogin} />
      </Page>
    ),
    signup: (
      <Page route="signup" navigate={navigate}>
        <Register navigate={navigate} />
      </Page>
    ),
    student: <StudentDashboard navigate={navigate} />,
    ticket: <TicketPage navigate={navigate} />,
    club: <ClubDashboard navigate={navigate} />,
    editor: <EventEditor navigate={navigate} />,
    super: <SuperDashboard navigate={navigate} />,
    profile: <Profile navigate={navigate} />,
  }
  return <AuthContext.Provider value={{ session, logout }}>{pages[route]}</AuthContext.Provider>
}
