import { motion } from "framer-motion";

const DEMO_STATS = [
  { label: "Websites Protected", value: "2,418", icon: "🛡" },
  { label: "Scans Completed", value: "3,902", icon: "📊" },
  { label: "Critical Fixes", value: "1,144", icon: "🔒" },
  { label: "Average Time", value: "24s", icon: "⚡" },
];

const FEATURE_LIST = [
  { title: "Public Exposure Detection", desc: "We crawl your frontend, extract Supabase credentials, and test every exposed table.", icon: "🔍" },
  { title: "Manual Scan Mode", desc: "Paste a Supabase URL + anon key to scan mobile apps, APIs, and locked-down sites.", icon: "📱" },
  { title: "Actionable Remediation", desc: "Clear table-level findings with severity cues so you know exactly what to fix.", icon: "🔧" },
];

const PROCESS_STEPS = [
  { step: "01", title: "Extract", desc: "Identify public Supabase credentials in your JS bundle." },
  { step: "02", title: "Enumerate", desc: "Pull the PostgREST schema to find every exposed table." },
  { step: "03", title: "Probe", desc: "Attempt unauthenticated SELECT requests with a safe row limit." },
  { step: "04", title: "Report", desc: "Rank issues by severity and show exactly what leaked." },
];

const PRICING_TIERS = [
  {
    name: "Free", price: "$0", period: "forever", description: "Perfect for testing your first project",
    features: [
      { text: "1 scan per day", included: true }, { text: "Vulnerability count only", included: true },
      { text: "Basic pass/fail report", included: true }, { text: "Table names & details", included: false },
      { text: "Exposed data preview", included: false }, { text: "AI remediation guidance", included: false }
    ],
    cta: "Get Started", highlighted: false,
  },
  {
    name: "Pro", price: "$19", period: "one time fee", description: "For teams shipping production apps", badge: "MOST POPULAR",
    features: [
      { text: "Unlimited scans", included: true }, { text: "Full vulnerability details", included: true },
      { text: "Detailed security report", included: true }, { text: "Table names & endpoints", included: true },
      { text: "Exposed data preview", included: true }, { text: "AI remediation guidance", included: true },
    ],
    cta: "Upgrade to Pro", highlighted: true,
  },
];

const TESTIMONIALS = [
  { quote: "Found 3 exposed tables in our production app within 30 seconds. The RLS fix suggestions saved us hours of debugging.", author: "Sarah Chen", role: "Lead Developer", company: "Indie SaaS", avatar: "SC" },
  { quote: "We were vibe-coding fast and forgot RLS entirely. This scanner caught it before our launch. Crisis averted.", author: "Marcus Johnson", role: "Founder", company: "StartupX", avatar: "MJ" },
  { quote: "Running this on every PR now. The peace of mind is worth 10x the price. Essential for any Supabase project.", author: "Elena Rodriguez", role: "Security Engineer", company: "FinTech Co", avatar: "ER" },
];

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

function MarketingShell({ children }) {
  return (
    <div className="landing-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        :root {
          --bg: #ffffff; --bg-secondary: #f8fafc; --bg-tertiary: #f1f5f9;
          --text: #0f172a; --text-secondary: #475569; --text-muted: #94a3b8;
          --border: #e2e8f0; --border-light: #f1f5f9;
          --accent: #0f172a; --accent-light: #f1f5f9; --accent-dark: #1e293b;
          --warning: #0f172a; --danger: #ef4444;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', -apple-system, sans-serif; }
        a { color: inherit; text-decoration: none; }
        .landing-shell { min-height: 100vh; background: var(--bg); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid var(--border); }
        .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--text); }
        .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border); }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .nav-link { color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; transition: color 0.2s; }
        .nav-link:hover { color: var(--text); }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; font-family: inherit; }
        .btn-primary { background: var(--accent); color: white; box-shadow: var(--shadow); }
        .btn-secondary { background: white; color: var(--text); border: 1px solid var(--border); }
        .hero { padding: 80px 0; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--accent-light); color: var(--accent-dark); border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
        .hero-title { font-size: clamp(36px, 5vw, 64px); font-weight: 800; line-height: 1.1; color: var(--text); margin-bottom: 20px; letter-spacing: -0.02em; }
        .hero-subtitle { font-size: 18px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 32px; line-height: 1.7; }
        .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .hero-actions .btn { padding: 14px 28px; font-size: 15px; }
        .stats-section { padding: 60px 0; background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
        .stat-card { text-align: center; padding: 24px; }
        .stat-icon { font-size: 32px; margin-bottom: 12px; }
        .stat-value { font-size: 36px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
        .stat-label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
        .section { padding: 80px 0; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-label { display: inline-block; padding: 6px 12px; background: var(--bg-tertiary); color: var(--text-secondary); border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
        .section-title { font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
        .section-subtitle { font-size: 16px; color: var(--text-secondary); max-width: 600px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .feature-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
        .feature-icon { width: 48px; height: 48px; background: var(--accent-light); border-radius: 12px; display: grid; place-items: center; font-size: 24px; margin-bottom: 16px; }
        .feature-title { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .process-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .process-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .process-step { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: var(--accent); color: white; border-radius: 8px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
        .process-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .process-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; max-width: 800px; margin: 0 auto; }
        .pricing-card { background: white; border: 1px solid var(--border); border-radius: 20px; padding: 32px; position: relative; }
        .pricing-card.highlighted { border: 2px solid var(--accent); box-shadow: var(--shadow-lg); }
        .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; font-size: 11px; font-weight: 700; padding: 6px 16px; border-radius: 999px; letter-spacing: 0.05em; }
        .pricing-name { font-size: 20px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .pricing-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
        .pricing-amount { font-size: 48px; font-weight: 800; color: var(--text); }
        .pricing-period { font-size: 16px; color: var(--text-secondary); }
        .pricing-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }
        .pricing-features { list-style: none; margin-bottom: 24px; }
        .pricing-features li { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 14px; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
        .pricing-features li:last-child { border-bottom: none; }
        .check-icon { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 700; }
        .check-icon.included { background: var(--accent-light); color: var(--accent-dark); }
        .check-icon.excluded { background: var(--bg-tertiary); color: var(--text-muted); }
        .pricing-cta { width: 100%; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .testimonial-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
        .testimonial-quote { font-size: 15px; color: var(--text); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .testimonial-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), #3b82f6); border-radius: 12px; display: grid; place-items: center; color: white; font-size: 14px; font-weight: 700; }
        .testimonial-name { font-size: 14px; font-weight: 600; color: var(--text); }
        .testimonial-role { font-size: 13px; color: var(--text-secondary); }
        .cta-section { padding: 80px 0; background: linear-gradient(135deg, var(--accent-light), #dbeafe); text-align: center; }
        .cta-title { font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
        .cta-subtitle { font-size: 16px; color: var(--text-secondary); margin-bottom: 28px; }
        .footer { padding: 40px 0; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-text { font-size: 14px; color: var(--text-secondary); }
        .footer-links { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .footer-link-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 14px; cursor: pointer; padding: 0; }
        .footer-link-btn:hover { color: var(--text); text-decoration: underline; }
        .alert-banner { background: linear-gradient(90deg, #fef3c7, #fee2e2); border-bottom: 1px solid #fcd34d; padding: 12px 24px; text-align: center; font-size: 14px; color: #92400e; }
        .alert-highlight { font-weight: 700; color: #dc2626; }
        @media (max-width: 768px) { .hero { padding: 48px 0; } .section { padding: 48px 0; } .nav { flex-wrap: wrap; gap: 16px; } }
      `}</style>
      {children}
    </div>
  );
}

export function ConfigMissingPage() {
  return (
    <MarketingShell>
      <div className="container">
        <nav className="nav">
          <a href="/" className="brand"><img src="/Supasecured.jpg" alt="SupaSecure logo" className="brand-logo" />SupaSecure</a>
        </nav>
        <motion.div className="section" style={{ maxWidth: 600, margin: '0 auto' }} initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Connect Supabase</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>Add your Supabase project credentials so the frontend can create and sign in users.</p>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 14, marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
              Missing <code>VITE_SUPABASE_URL</code> or <code>VITE_SUPABASE_ANON_KEY</code>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 14 }}>Create a <code>.env.local</code> file with:</p>
            <pre style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, fontSize: 13, fontFamily: 'monospace', overflow: 'auto' }}>
{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY`}
            </pre>
          </div>
        </motion.div>
      </div>
    </MarketingShell>
  );
}

export default function LandingPage({ isLoggedIn, userEmail, onGoToApp, onGoToAuth, onGoToPrivacy, onGoToTerms }) {
  return (
    <MarketingShell>
      <motion.div className="alert-banner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="alert-highlight">87% of Supabase apps</span> we scan have at least one RLS misconfiguration
      </motion.div>

      <div className="container">
        <motion.nav className="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <a href="/" className="brand"><img src="/Supasecured.jpg" alt="SupaSecure logo" className="brand-logo" />SupaSecure</a>
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <span className="nav-link">{userEmail}</span>
                <motion.button className="btn btn-primary" onClick={onGoToApp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Open Scanner</motion.button>
              </>
            ) : (
              <>
                <motion.button className="btn btn-secondary" onClick={onGoToAuth} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Sign in</motion.button>
                <motion.button className="btn btn-primary" onClick={onGoToAuth} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Get Started</motion.button>
              </>
            )}
          </div>
        </motion.nav>

        <section className="hero">
          <motion.div className="hero-badge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <span>🔒</span>RLS Security Scanner
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            Find exposed tables<br /><span>before attackers do</span>
          </motion.h1>
          <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            Supabase credentials live in every frontend bundle. We run the same requests a bad actor would, flag what's exposed, and show how to lock it down.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <motion.button className="btn btn-primary" onClick={isLoggedIn ? onGoToApp : onGoToAuth} whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.3)" }} whileTap={{ scale: 0.97 }}>
              Start Free Scan
            </motion.button>
            <motion.button className="btn btn-secondary" onClick={isLoggedIn ? onGoToApp : onGoToAuth} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              See Pricing
            </motion.button>
          </motion.div>
        </section>
      </div>

      {/* <section className="stats-section">
        <div className="container">
          <motion.div className="stats-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            {DEMO_STATS.map((stat, i) => (
              <motion.div key={stat.label} className="stat-card" variants={fadeInUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="section-label">Features</div>
            <h2 className="section-title">What the scanner catches</h2>
            <p className="section-subtitle">Coverage for the most common Supabase exposure paths, with safe read-only checks.</p>
          </motion.div>
          <motion.div className="features-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {FEATURE_LIST.map((feature, i) => (
              <motion.div key={feature.title} className="feature-card" variants={scaleIn} transition={{ duration: 0.4, delay: i * 0.1 }} whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", borderColor: "#0f172a" }}>
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="section-label">How it works</div>
            <h2 className="section-title">Four steps to secure your app</h2>
            <p className="section-subtitle">Every scan mimics real attacker behavior using public credentials only.</p>
          </motion.div>
          <motion.div className="process-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {PROCESS_STEPS.map((step, i) => (
              <motion.div key={step.step} className="process-card" variants={fadeInUp} transition={{ duration: 0.4, delay: i * 0.1 }} whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
                <div className="process-step">{step.step}</div>
                <div className="process-title">{step.title}</div>
                <div className="process-desc">{step.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-subtitle">Start free. Upgrade when you need full visibility into your security posture.</p>
          </motion.div>
          <motion.div className="pricing-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {PRICING_TIERS.map((tier, i) => (
              <motion.div key={tier.name} className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`} variants={scaleIn} transition={{ duration: 0.5, delay: i * 0.15 }} whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
                {tier.badge && <div className="pricing-badge">{tier.badge}</div>}
                <div className="pricing-name">{tier.name}</div>
                <div className="pricing-price"><span className="pricing-amount">{tier.price}</span><span className="pricing-period">{tier.period}</span></div>
                <div className="pricing-desc">{tier.description}</div>
                <ul className="pricing-features">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className={`check-icon ${feature.included ? 'included' : 'excluded'}`}>{feature.included ? '✓' : '—'}</span>
                      <span style={{ color: feature.included ? 'var(--text)' : 'var(--text-muted)' }}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <motion.button className={`btn pricing-cta ${tier.highlighted ? 'btn-primary' : 'btn-secondary'}`} onClick={isLoggedIn ? onGoToApp : onGoToAuth} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {tier.cta}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Trusted by Supabase developers</h2>
            <p className="section-subtitle">Join hundreds of teams shipping secure applications with confidence.</p>
          </motion.div>
          <motion.div className="testimonials-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div key={idx} className="testimonial-card" variants={fadeInUp} transition={{ duration: 0.4, delay: idx * 0.1 }} whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
                <div className="testimonial-quote">"{testimonial.quote}"</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div><div className="testimonial-name">{testimonial.author}</div><div className="testimonial-role">{testimonial.role} at {testimonial.company}</div></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      <motion.section className="cta-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <div className="container">
          <motion.h2 className="cta-title" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            Ready to secure your Supabase app?
          </motion.h2>
          <motion.p className="cta-subtitle" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            Start with a free scan and see what's exposed in under 30 seconds.
          </motion.p>
          <motion.button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16 }} onClick={isLoggedIn ? onGoToApp : onGoToAuth} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(15, 23, 42, 0.35)" }} whileTap={{ scale: 0.97 }}>
            Start Free Scan
          </motion.button>
        </div>
      </motion.section>

      <div className="container">
        <motion.footer className="footer" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="footer-text">© 2026 SupaSecure. Built for responsible disclosure.</div>
          <div className="footer-links">
            <span className="footer-text">Ethical, transparent, read-only scanning.</span>
            <button type="button" className="footer-link-btn" onClick={onGoToPrivacy}>Privacy Policy</button>
            <button type="button" className="footer-link-btn" onClick={onGoToTerms}>Terms & Conditions</button>
          </div>
        </motion.footer>
      </div>
    </MarketingShell>
  );
}
