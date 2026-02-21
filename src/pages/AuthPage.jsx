import { motion } from "framer-motion";

export default function AuthPage({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authLoading,
  authError,
  authNotice,
  onAuthSubmit,
  isLoggedIn,
  userEmail,
  onGoToApp,
  onGoToLanding,
  onSignOut,
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #0f172a !important; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <button
            type="button"
            onClick={onGoToLanding}
            style={{ background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 14 }}
          >
            ← Back
          </button>
          {isLoggedIn && (
            <button
              type="button"
              onClick={onGoToApp}
              style={{ background: "#0f172a", border: "none", color: "white", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
            >
              Open Scanner
            </button>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 32, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <button
            type="button"
            onClick={onGoToLanding}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src="/Supasecured.jpg"
              alt="SupaSecure logo"
              style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: "1px solid #e2e8f0" }}
            />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>SupaSecure</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Security Scanner</div>
            </div>
          </button>

          {isLoggedIn ? (
            <>
              <div style={{ fontSize: 16, color: "#0f172a", marginBottom: 8 }}>Welcome back!</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
                Signed in as <strong style={{ color: "#0f172a" }}>{userEmail}</strong>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onGoToApp}
                  style={{ flex: 1, background: "#0f172a", border: "none", color: "white", padding: "12px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                >
                  Go to Scanner
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  style={{ flex: 1, background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "12px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 500, fontSize: 14 }}
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
                {authMode === "signup" ? "Create your account" : "Sign in to your account"}
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
                {authMode === "signup" ? "Start scanning your Supabase projects for vulnerabilities." : "Access your dashboard and scan history."}
              </div>

              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: authMode === "signup" ? "white" : "transparent",
                    color: authMode === "signup" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: authMode === "signup" ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none",
                  }}
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: authMode === "signin" ? "white" : "transparent",
                    color: authMode === "signin" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: authMode === "signin" ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none",
                  }}
                >
                  Sign in
                </button>
              </div>

              <form onSubmit={onAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", color: "#0f172a", fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", color: "#0f172a", fontSize: 15 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: "100%",
                    padding: 14,
                    background: authLoading ? "#e2e8f0" : "#0f172a",
                    border: "none",
                    borderRadius: 10,
                    color: authLoading ? "#94a3b8" : "white",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: authLoading ? "not-allowed" : "pointer",
                    boxShadow: authLoading ? "none" : "0 4px 14px 0 rgba(15, 23, 42, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {authLoading && (
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  )}
                  {authLoading ? "Working..." : authMode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>

              {authNotice && (
                <div style={{ marginTop: 16, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: 14, fontSize: 14, color: "#065f46" }}>
                  {authNotice}
                </div>
              )}
              {authError && (
                <div style={{ marginTop: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, fontSize: 14, color: "#dc2626" }}>
                  {authError}
                </div>
              )}
            </>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          We never store row data. Only metadata and exposure status are saved.
        </motion.div>
      </div>
    </div>
  );
}
