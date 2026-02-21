import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import AppNavbar from "../components/AppNavbar";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

const TIME_WINDOW_DAYS = { "7d": 7, "30d": 30, all: null };

function toLocalDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayLabelFromKey(key) {
  const [, m, d] = key.split("-").map(Number);
  return `${m}/${d}`;
}

function buildDailyBuckets(scans, days = 14) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = toLocalDayKey(day.toISOString());
    buckets.push({ key, label: dayLabelFromKey(key), scans: 0, vulnerabilities: 0, critical: 0 });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  scans.forEach((scan) => {
    const key = toLocalDayKey(scan.started_at);
    if (!key || !map.has(key)) return;
    const bucket = map.get(key);
    bucket.scans += 1;
    bucket.vulnerabilities += Number(scan.vulnerable_tables || 0);
    bucket.critical += Number(scan.critical_findings || 0);
  });
  return buckets;
}

function matchesTimeWindow(startedAt, timeWindow) {
  if (!TIME_WINDOW_DAYS[timeWindow]) return true;
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= Date.now() - TIME_WINDOW_DAYS[timeWindow] * 86400000;
}

function getChartDays(scans, timeWindow) {
  if (timeWindow === "7d") return 7;
  if (timeWindow === "30d") return 30;
  const validTimes = scans.map((s) => new Date(s.started_at).getTime()).filter(Number.isFinite).sort((a, b) => a - b);
  if (validTimes.length === 0) return 14;
  return Math.max(14, Math.min(90, Math.ceil((validTimes.at(-1) - validTimes[0]) / 86400000) + 1));
}

function MetricCard({ label, value, color = "#0f172a", hint }) {
  return (
    <motion.div variants={fadeInUp} whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      {hint && <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>{hint}</div>}
    </motion.div>
  );
}

function BarChart({ title, subtitle, data, keyName, color }) {
  const maxValue = Math.max(1, ...data.map((d) => d[keyName]));
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{subtitle}</div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(8px, 1fr))`, gap: 4 }}>
        {data.map((item, idx) => {
          const value = Number(item[keyName] || 0);
          const heightPct = Math.max(4, (value / maxValue) * 100);
          const showLabel = idx % 2 === 0 || idx === data.length - 1;
          return (
            <div key={item.key} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "#64748b", height: 16, lineHeight: "16px" }}>{value > 0 ? value : ""}</div>
              <div style={{ width: "100%", height: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div title={`${item.label}: ${value}`} style={{ width: "100%", height: `${heightPct}%`, minHeight: 3, background: color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", height: 16, lineHeight: "16px", marginTop: 4 }}>{showLabel ? item.label : ""}</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function DistributionRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: "#475569" }}>{label}</span>
        <span style={{ color: "#94a3b8" }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{ border: `1px solid ${active ? opt.color : "#e2e8f0"}`, background: active ? `${opt.color}15` : "white", color: active ? opt.color : "#64748b", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 12 }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function DashboardPage({ user, plan = "free", onGoToScan, onGoToHistory, onGoToProfile, onSignOut }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState("30d");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function loadScans() {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("scans").select("id, status, scan_mode, target_url, supabase_url, started_at, total_tables, vulnerable_tables, critical_findings, risk_level").order("started_at", { ascending: false }).limit(1000);
      if (!isMounted) return;
      if (loadError) { setError(loadError.message); setScans([]); }
      else setScans(data || []);
      setLoading(false);
    }
    if (user?.id) loadScans();
    return () => { isMounted = false; };
  }, [user?.id]);

  const filteredScans = useMemo(() => scans.filter((scan) => {
    if (!matchesTimeWindow(scan.started_at, timeWindow)) return false;
    if (modeFilter !== "all" && scan.scan_mode !== modeFilter) return false;
    if (statusFilter !== "all" && scan.status !== statusFilter) return false;
    return true;
  }), [scans, timeWindow, modeFilter, statusFilter]);

  const summary = useMemo(() => {
    const completed = filteredScans.filter((s) => s.status === "completed");
    return {
      totalScans: filteredScans.length,
      completedScans: completed.length,
      failedScans: filteredScans.filter((s) => s.status === "failed").length,
      totalVulnerable: completed.reduce((sum, s) => sum + Number(s.vulnerable_tables || 0), 0),
      totalCritical: completed.reduce((sum, s) => sum + Number(s.critical_findings || 0), 0),
      avgVulnerable: completed.length > 0 ? (completed.reduce((sum, s) => sum + Number(s.vulnerable_tables || 0), 0) / completed.length).toFixed(1) : "0.0",
      highRiskScans: completed.filter((s) => String(s.risk_level || "").toUpperCase() === "CRITICAL").length,
    };
  }, [filteredScans]);

  const chartDays = useMemo(() => getChartDays(filteredScans, timeWindow), [filteredScans, timeWindow]);
  const daily = useMemo(() => buildDailyBuckets(filteredScans, chartDays), [filteredScans, chartDays]);

  const riskDist = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, SAFE: 0, UNKNOWN: 0 };
    filteredScans.forEach((scan) => {
      const level = String(scan.risk_level || "").toUpperCase();
      if (counts[level] !== undefined) counts[level]++;
      else counts.UNKNOWN++;
    });
    return counts;
  }, [filteredScans]);

  const modeDist = useMemo(() => {
    const counts = { website: 0, manual: 0 };
    filteredScans.forEach((scan) => { counts[scan.scan_mode === "manual" ? "manual" : "website"]++; });
    return counts;
  }, [filteredScans]);

  const recent = filteredScans.slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      <AppNavbar
        userEmail={user?.email}
        plan={plan}
        activePage="dashboard"
        onGoToScan={onGoToScan}
        onGoToHistory={onGoToHistory}
        onGoToProfile={onGoToProfile}
        onSignOut={onSignOut}
      />

      {plan !== "pro" && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "#e2e8f0" }}>Upgrade to <strong>Pro</strong> for unlimited scans and full reports</span>
          <button style={{ background: "white", border: "none", color: "#0f172a", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Upgrade</button>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Security Dashboard</h1>
          </div>
        </div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                  <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 32, width: "80%" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                  <div className="skeleton" style={{ height: 18, width: "40%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 100, width: "100%" }} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, border: "2px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading dashboard...
            </div>
          </motion.div>
        ) : error ? <div style={{ color: "#dc2626" }}>{error}</div> : (
          <>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
              <FilterGroup label="Time Window" value={timeWindow} onChange={setTimeWindow} options={[{ value: "7d", label: "7D", color: "#0f172a" }, { value: "30d", label: "30D", color: "#0f172a" }, { value: "all", label: "All", color: "#0f172a" }]} />
              <FilterGroup label="Scan Mode" value={modeFilter} onChange={setModeFilter} options={[{ value: "all", label: "All", color: "#0f172a" }, { value: "website", label: "Website", color: "#0f172a" }, { value: "manual", label: "Manual", color: "#0f172a" }]} />
              <FilterGroup label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All", color: "#0f172a" }, { value: "completed", label: "Completed", color: "#0f172a" }, { value: "failed", label: "Failed", color: "#ea580c" }]} />
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
              <MetricCard label="Total Scans" value={summary.totalScans} color="#0f172a" />
              <MetricCard label="Completed" value={summary.completedScans} color="#0f172a" />
              <MetricCard label="Failed" value={summary.failedScans} color="#ea580c" />
              <MetricCard label="Vulnerable Tables" value={summary.totalVulnerable} color="#ea580c" />
              <MetricCard label="Critical Findings" value={summary.totalCritical} color="#dc2626" />
              <MetricCard label="Avg Vuln / Scan" value={summary.avgVulnerable} color="#0f172a" />
            </motion.div>

            {summary.highRiskScans > 0 && (
              <div style={{ marginBottom: 20, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, color: "#991b1b", fontSize: 14 }}>
                ⚠️ <strong>{summary.highRiskScans}</strong> scans classified as CRITICAL out of {summary.completedScans} completed.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
              <BarChart title="Scan Volume" subtitle={`Jobs per day (${chartDays}d)`} data={daily} keyName="scans" color="#0f172a" />
              <BarChart title="Vulnerabilities" subtitle={`Per day (${chartDays}d)`} data={daily} keyName="vulnerabilities" color="#ea580c" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Risk Distribution</div>
                <DistributionRow label="Critical" value={riskDist.CRITICAL} total={filteredScans.length} color="#dc2626" />
                <DistributionRow label="High" value={riskDist.HIGH} total={filteredScans.length} color="#ea580c" />
                <DistributionRow label="Safe" value={riskDist.SAFE} total={filteredScans.length} color="#0f172a" />
                <DistributionRow label="Unknown" value={riskDist.UNKNOWN} total={filteredScans.length} color="#94a3b8" />
              </div>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Scan Mode Mix</div>
                <DistributionRow label="Website" value={modeDist.website} total={filteredScans.length} color="#0f172a" />
                <DistributionRow label="Manual" value={modeDist.manual} total={filteredScans.length} color="#0f172a" />
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Recent Scans</div>
              {recent.length === 0 ? <div style={{ color: "#64748b" }}>No scans match current filters.</div> : (
                <div style={{ display: "grid", gap: 12 }}>
                  {recent.map((scan) => (
                    <div key={scan.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", padding: 14, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", fontSize: 13 }}>
                      <div style={{ color: "#0f172a", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.target_url || scan.supabase_url || "Unknown"}</div>
                      <div style={{ color: "#64748b" }}>{formatDateTime(scan.started_at)}</div>
                      <div style={{ color: "#ea580c" }}>Vuln: {scan.vulnerable_tables ?? "—"}</div>
                      <div style={{ color: "#dc2626" }}>Crit: {scan.critical_findings ?? "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
