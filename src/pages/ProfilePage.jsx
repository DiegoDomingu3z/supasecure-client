import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import AppNavbar from "../components/AppNavbar";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const API_BASE = "http://localhost:3001/api";

function toInputValue(value) {
  return typeof value === "string" ? value : "";
}

function toReadableDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "12px 14px",
          color: "#0f172a",
          fontSize: 14,
        }}
      />
    </label>
  );
}

export default function ProfilePage({ user, authToken, plan = "free", onGoToScan, onGoToHistory, onGoToDashboard, onSignOut }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [billingError, setBillingError] = useState(null);
  const [profileMeta, setProfileMeta] = useState({ created_at: null, updated_at: null });
  const [form, setForm] = useState({
    email: "", display_name: "", first_name: "", last_name: "", phone_number: "",
    company_name: "", job_title: "", country: "", timezone: "", marketing_opt_in: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      setNotice(null);

      const { data, error: loadError } = await supabase
        .from("profiles")
        .select("id,email,display_name,first_name,last_name,phone_number,company_name,job_title,country,timezone,marketing_opt_in,created_at,updated_at")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;
      if (loadError) { setError(loadError.message); setLoading(false); return; }

      const base = data || {};
      setForm({
        email: toInputValue(base.email || user.email),
        display_name: toInputValue(base.display_name),
        first_name: toInputValue(base.first_name),
        last_name: toInputValue(base.last_name),
        phone_number: toInputValue(base.phone_number),
        company_name: toInputValue(base.company_name),
        job_title: toInputValue(base.job_title),
        country: toInputValue(base.country),
        timezone: toInputValue(base.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone),
        marketing_opt_in: Boolean(base.marketing_opt_in),
      });
      setProfileMeta({ created_at: base.created_at || null, updated_at: base.updated_at || null });
      setLoading(false);
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [user?.id, user?.email]);

  const profileCompleteness = useMemo(() => {
    const fields = [form.display_name, form.first_name, form.last_name, form.phone_number, form.company_name, form.job_title, form.country, form.timezone];
    const filled = fields.filter((v) => String(v || "").trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      id: user.id,
      email: form.email || user.email || null,
      display_name: form.display_name || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      phone_number: form.phone_number || null,
      company_name: form.company_name || null,
      job_title: form.job_title || null,
      country: form.country || null,
      timezone: form.timezone || null,
      marketing_opt_in: Boolean(form.marketing_opt_in),
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (saveError) { setError(saveError.message); setSaving(false); return; }

    setNotice("Profile updated.");
    setProfileMeta((prev) => ({ ...prev, updated_at: new Date().toISOString() }));
    setSaving(false);
  }

  async function handleManageBilling() {
    if (!authToken) return;
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch(`${API_BASE}/stripe/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to open billing portal.");
      window.location.href = data.url;
    } catch (err) {
      setBillingError(err.message);
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!authToken || !user?.email) return;
    if (deleteConfirmation.toLowerCase() !== user.email.toLowerCase()) {
      setDeleteError("Email does not match. Please type your email exactly.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_BASE}/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account.");
      
      await supabase.auth.signOut();
      if (onSignOut) onSignOut();
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #0f172a !important; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      <AppNavbar
        userEmail={user?.email}
        plan={plan}
        activePage="profile"
        onGoToScan={onGoToScan}
        onGoToHistory={onGoToHistory}
        onGoToDashboard={onGoToDashboard}
        onSignOut={onSignOut}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Profile & Billing</h1>
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          <motion.div variants={fadeInUp} whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>PLAN</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: plan === "pro" ? "#0f172a" : "#0f172a" }}>{String(plan).toUpperCase()}</div>
          </motion.div>

          <motion.div variants={fadeInUp} whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>PROFILE COMPLETENESS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: profileCompleteness >= 80 ? "#0f172a" : "#0f172a" }}>{profileCompleteness}%</div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>Complete your profile for better support and reporting.</div>
          </motion.div>

          <motion.div variants={fadeInUp} whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>BILLING</div>
            <motion.button onClick={handleManageBilling} disabled={billingLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ background: "#0f172a", border: "none", color: "white", padding: "10px 16px", borderRadius: 8, cursor: billingLoading ? "not-allowed" : "pointer", fontWeight: 600, opacity: billingLoading ? 0.6 : 1 }}>
              {billingLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Opening...
                </span>
              ) : "Manage Billing"}
            </motion.button>
            {billingError && <div style={{ marginTop: 10, fontSize: 13, color: "#dc2626" }}>{billingError}</div>}
          </motion.div>
        </motion.div>

        <form onSubmit={handleSaveProfile} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Profile Information</div>

          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div className="skeleton" style={{ width: 120, height: 16 }} />
                  <div className="skeleton" style={{ flex: 1, height: 40, borderRadius: 8 }} />
                </div>
              ))}
              <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 8 }}>
                <div style={{ width: 18, height: 18, border: "2px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Loading profile...
              </div>
            </motion.div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <Field label="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="you@company.com" type="email" />
                <Field label="Display Name" value={form.display_name} onChange={(e) => setField("display_name", e.target.value)} placeholder="Your public handle" />
                <Field label="First Name" value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} placeholder="Jane" />
                <Field label="Last Name" value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} placeholder="Doe" />
                <Field label="Phone Number" value={form.phone_number} onChange={(e) => setField("phone_number", e.target.value)} placeholder="+1 555 123 4567" type="tel" />
                <Field label="Company Name" value={form.company_name} onChange={(e) => setField("company_name", e.target.value)} placeholder="Acme Security" />
                <Field label="Job Title" value={form.job_title} onChange={(e) => setField("job_title", e.target.value)} placeholder="Founding Engineer" />
                <Field label="Country" value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="United States" />
                <Field label="Timezone" value={form.timezone} onChange={(e) => setField("timezone", e.target.value)} placeholder="America/Los_Angeles" />
              </div>

              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 20 }}>
                <input type="checkbox" checked={form.marketing_opt_in} onChange={(e) => setField("marketing_opt_in", e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: "#0f172a" }} />
                <span style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>I agree to receive product updates and security best-practice emails.</span>
              </label>

              {error && <div style={{ marginTop: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, fontSize: 14, color: "#dc2626" }}>{error}</div>}
              {notice && <div style={{ marginTop: 16, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, padding: 12, fontSize: 14, color: "#065f46" }}>{notice}</div>}

              <div style={{ marginTop: 20 }}>
                <button type="submit" disabled={saving} style={{ background: saving ? "#e2e8f0" : "#0f172a", border: "none", color: saving ? "#94a3b8" : "white", padding: "12px 20px", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}>
                  {saving ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid #94a3b8", borderTopColor: "#64748b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Saving...
                    </span>
                  ) : "Save Profile"}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Danger Zone */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          style={{
            marginTop: 32,
            background: "white",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>Danger Zone</div>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <motion.button
            onClick={() => setShowDeleteModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "white",
              border: "1px solid #dc2626",
              color: "#dc2626",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Delete Account
          </motion.button>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 24,
            }}
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 32,
                maxWidth: 440,
                width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>Delete Account</div>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
                This will permanently delete your account, all scan history, and any associated data. 
                If you have an active subscription, it will be canceled. This action cannot be undone.
              </p>
              <p style={{ fontSize: 14, color: "#0f172a", fontWeight: 500, marginBottom: 8 }}>
                Type <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{user?.email}</span> to confirm:
              </p>
              <input
                type="email"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Enter your email"
                disabled={deleting}
                style={{
                  width: "100%",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#0f172a",
                  fontSize: 14,
                  marginBottom: 16,
                }}
              />

              {deleteError && (
                <div style={{ marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, fontSize: 14, color: "#dc2626" }}>
                  {deleteError}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    color: "#64748b",
                    padding: "10px 16px",
                    borderRadius: 8,
                    cursor: deleting ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation.toLowerCase() !== user?.email?.toLowerCase()}
                  style={{
                    background: deleting ? "#fca5a5" : "#dc2626",
                    border: "none",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: 8,
                    cursor: deleting || deleteConfirmation.toLowerCase() !== user?.email?.toLowerCase() ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    opacity: deleteConfirmation.toLowerCase() !== user?.email?.toLowerCase() ? 0.5 : 1,
                  }}
                >
                  {deleting ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Deleting...
                    </span>
                  ) : "Delete My Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
