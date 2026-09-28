import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
export function WelcomeHome() { 

  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  /* Reveal-on-scroll: watches every .reveal element */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Navbar shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Smooth scroll helper for nav links */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>

      {/* ================= NAVBAR ================= */}
      <nav className={`home-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Resume<span>AI</span>
        </div>
        <ul className="nav-links">
          <li><button onClick={() => scrollTo("features")}>Features</button></li>
          <li><button onClick={() => scrollTo("how-it-works")}>How It Works</button></li>
          <li><button onClick={() => scrollTo("stats")}>Stats</button></li>
          <li><button onClick={() => scrollTo("cta")}>Get Started</button></li>
        </ul>
        <button className="nav-cta" onClick={() => scrollTo("cta")}>Sign In</button>
      </nav>

      {/* ================= HERO ================= */}
      <header className="hero">
        <div className="hero-badge reveal">
          <span className="dot" />
          AI Based Resume Checker
        </div>
        <h1 className="reveal reveal-delay-1">
          Beat the ATS, <span className="gradient">land the interview</span>,<br />
          starting with your resume.
        </h1>
        <p className="sub reveal reveal-delay-2">
          Upload your resume and let our AI analyze it in seconds. Get a detailed
          report on what recruiters and ATS software look for — common mistakes,
          missing keywords, formatting issues, and actionable tips.
        </p>
        <div className="hero-actions reveal reveal-delay-3">
          <button className="btn-primary" onClick={() => scrollTo("features")}>
            Explore Features
          </button>
          <button className="btn-ghost" onClick={() => scrollTo("how-it-works")}>
            How It Works →
          </button>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="line" />
        </div>
      </header>

      {/* ================= FEATURES ================= */}
      <section className="section" id="features">
        <p className="section-tag reveal">Why it matters</p>
        <h2 className="reveal reveal-delay-1">Everything your resume needs to pass</h2>
        <p className="lead reveal reveal-delay-2">
          Our AI reads your resume the way an ATS and a recruiter do — then tells
          you exactly what to fix.
        </p>

        <div className="features-grid">
          {[
            {
              title: "ATS Compatibility",
              desc: "Checks structure, formatting and standard section headings so parsing software reads your resume correctly.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h10M4 18h7" />
                </svg>
              ),
            },
            {
              title: "Instant AI Score",
              desc: "Get a score out of 100 in seconds, with a detailed breakdown of what helps and what holds you back.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                </svg>
              ),
            },
            {
              title: "Keyword Matching",
              desc: "See the keywords recruiters and ATS software look for — and catch the ones your resume is missing.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
                  <path d="M12 12l9-5M12 12v10M12 12L3 7" />
                </svg>
              ),
            },
            {
              title: "Section-Wise Feedback",
              desc: "Review Summary, Skills, Experience and Education separately, with an actionable fix for each one.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18M3 12h18" />
                </svg>
              ),
            },
            {
              title: "Missing Information Alerts",
              desc: "Flags the sections recruiters expect but cannot find — so a critical detail is never left out.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              ),
            },
            {
              title: "Company Suggestions",
              desc: "Get tailored advice for the companies and roles you are targeting, based on what they look for.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
              ),
            },
          ].map((f, i) => (
            <div key={i} className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ABOUT THIS PROJECT ================= */}
      <section className="section" id="about-project">
        <p className="section-tag reveal">Behind the build</p>
        <h2 className="reveal reveal-delay-1">About this project</h2>
        <p className="lead reveal reveal-delay-2">
          A full-stack MERN monorepo built as four cooperating parts — a landing
          site, an auth API, the checker itself and an AI document engine. Here
          is what each language does.
        </p>

        <div className="features-grid">
          {[
            {
              title: "TypeScript",
              desc: "Types the report payload and both frontends, so a malformed API response is caught at compile time instead of crashing the dashboard.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                </svg>
              ),
            },
            {
              title: "JavaScript",
              desc: "Runs the two Express APIs, the Groq scoring layer and the Redis client as native ES modules on Node.js.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              ),
            },
            {
              title: "CSS",
              desc: "Builds the whole dark theme by hand — variables, grid, glassmorphism and keyframes, with zero UI libraries.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                </svg>
              ),
            },
            {
              title: "React 19",
              desc: "Powers the landing page, the sign-in screens and the score dashboard as composable components.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              ),
            },
            {
              title: "MongoDB",
              desc: "Stores user accounts only — passwords bcrypt-hashed and stripped from every query.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              ),
            },
            {
              title: "Redis",
              desc: "Holds your resume text and its AI analysis for one hour, then deletes them automatically.",
              icon: (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              ),
            },
          ].map((t, i) => (
            <div key={i} className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}>
              <div className="feature-icon">{t.icon}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="section" id="stats">
        <p className="section-tag reveal">By the numbers</p>
        <h2 className="reveal reveal-delay-1">Built for job seekers</h2>

        <div className="stats">
          {[
            { num: "100", lbl: "Score out of 100" },
            { num: "6", lbl: "Sections analyzed" },
            { num: "5MB", lbl: "PDF, DOC or DOCX upload" },
            { num: "1h", lbl: "Resume auto-deleted" },
          ].map((s, i) => (
            <div key={i} className={`stat-card reveal reveal-delay-${(i % 3) + 1}`}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section" id="how-it-works">
        <p className="section-tag reveal">Step by step</p>
        <h2 className="reveal reveal-delay-1">How it works &amp; how to prepare</h2>
        <p className="lead reveal reveal-delay-2">
          A quick walkthrough of the checker — and what to double-check before
          you drop your file in.
        </p>

        <div className="instructions-grid">
          <div className="instructions-App reveal reveal-delay-1">
            <h2 className="h2-inst">How It Works:</h2>
            <ul className="ul-listInt">
              <li>Upload your resume in PDF or DOCX format (max 5MB)</li>
              <li>Our AI scans your resume for ATS compatibility, keywords, and structure</li>
              <li>Receive an instant score (out of 100) with a detailed breakdown</li>
              <li>Review section-wise feedback: Summary, Skills, Experience, and Education</li>
              <li>Apply the suggested fixes and re-upload to track your improvement</li>
              <li>Download or share your full report as a PDF</li>
            </ul>
          </div>

          <div className="instructions-App reveal reveal-delay-2">
            <h2 className='h2-inst'>Before You Upload:</h2>
            <ul className="ul-listInt">
              <li>Make sure your resume is up-to-date and complete</li>
              <li>Use standard section headings (e.g., "Work Experience", "Education", "Skills")</li>
              <li>Avoid heavy graphics, tables, or columns — they can confuse ATS parsers</li>
              <li>Don't include personal details like passwords or ID numbers</li>
              <li>For best results, mention the job role or industry you're targeting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section" id="cta">
        <div className="cta-banner reveal">
          <h2>Ready to check your resume?</h2>
          <p>
            Sign in, upload your file, and get your AI score in seconds —
            plus the exact fixes to reach the top of the pile.
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary">Sign In to Continue</button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>© 2026 ResumeAI — Created By: <a href="https://github.com/Lavish09-Mehra">Lavish Mehra</a> </p>
        <div className="foot-links">
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top ↑</button>
        </div>
      </footer>
    </>
  );
}