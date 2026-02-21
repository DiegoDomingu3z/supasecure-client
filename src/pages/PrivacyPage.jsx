import { motion } from "framer-motion";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage({ onGoHome }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "40px 24px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onGoHome}
            style={{ background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}
          >
            ← Back to Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/Supasecured.jpg" alt="SupaSecure logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }} />
            <span style={{ fontWeight: 700, color: "#0f172a" }}>SupaSecure</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
        >
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Last updated: February 21, 2026</p>

          <Section title="Information We Collect">
            We collect account information (such as email), scan metadata (target, timestamps, risk summaries), and billing metadata required to operate the product.
            We do not store full row data returned from scanned targets as part of normal reporting.
          </Section>

          <Section title="How We Use Information">
            We use this information to provide security scans, show historical reports, enforce plan limits, support billing, and improve reliability and abuse prevention.
          </Section>

          <Section title="Data Retention">
            We retain account and scan metadata while your account is active or as needed for legal and operational purposes. You may request account deletion, subject to applicable legal obligations.
          </Section>

          <Section title="Third-Party Services">
            We use third-party providers such as Supabase (data/auth), Stripe (payments), and infrastructure services. Their processing is governed by their own policies.
          </Section>

          <Section title="Security">
            We implement reasonable technical and organizational safeguards, but no service can guarantee absolute security. You are responsible for protecting your account credentials.
          </Section>

          <Section title="Contact">
            For privacy requests, legal inquiries, or data access/deletion requests, contact your designated support channel for this deployment.
          </Section>
        </motion.div>
      </div>
    </div>
  );
}
