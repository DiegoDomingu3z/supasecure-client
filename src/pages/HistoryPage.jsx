import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import AppNavbar from "../components/AppNavbar";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const API_BASE = "https://supasecure-production.up.railway.app/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: "COMPLETED", color: "white", bg: "#0f172a" },
    failed: { label: "FAILED", color: "#dc2626", bg: "#fef2f2" },
    running: { label: "RUNNING", color: "#0f172a", bg: "#fef3c7" },
    pending: { label: "PENDING", color: "#0f172a", bg: "#e0e7ff" },
  };
  const cfg = map[(status || "").toLowerCase()] || { label: (status || "UNKNOWN").toUpperCase(), color: "#64748b", bg: "#f1f5f9" };
  return (
    <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </motion.span>
  );
}

function MiniSparkline({ data, color = "#0f172a" }) {
  if (!Array.isArray(data) || data.length < 2) return <div style={{ fontSize: 11, color: "#94a3b8" }}>Trend: n/a</div>;
  const max = Math.max(1, ...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
      <div style={{ fontSize: 11, color: "#94a3b8", minWidth: 40 }}>Trend</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 20 }}>
        <polyline fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" points={points} />
      </svg>
      <div style={{ fontSize: 11, color: "#64748b", minWidth: 18 }}>{data.at(-1)}</div>
    </div>
  );
}

function buildTrendSeriesByScanId(scans, windowSize = 8) {
  const sorted = [...scans].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  const seriesById = new Map();
  const rolling = [];
  sorted.forEach((scan) => {
    rolling.push(Number(scan.vulnerable_tables || 0));
    if (rolling.length > windowSize) rolling.shift();
    seriesById.set(scan.id, [...rolling]);
  });
  return seriesById;
}

function AIReportTerminal({ reportText, status, errorMsg, onClose }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef(null);

  function toReportString(value) {
    if (typeof value === "string") return value;
    if (value == null) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  useEffect(() => {
    if (!reportText || status !== "done") return;
    const lines = toReportString(reportText).split(/\r?\n/);
    setIsTyping(true);
    setDisplayedLines([]);
    let i = 0;
    const timer = setInterval(() => {
      if (i < lines.length) {
        setDisplayedLines((prev) => [...prev, lines[i] ?? ""]);
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [reportText, status]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [displayedLines]);

  const renderLine = (line, i) => {
    const safeLine = typeof line === "string" ? line : String(line ?? "");
    if (safeLine.startsWith("## ")) return <div key={i} style={{ color: "#4ade80", fontWeight: 700, fontSize: 14, margin: "12px 0 4px" }}>{safeLine.replace(/^##\s*/, "")}</div>;
    if (safeLine.startsWith("### ")) return <div key={i} style={{ color: "#4ade80", fontWeight: 600, fontSize: 13, margin: "8px 0 2px" }}>{safeLine.replace(/^###\s*/, "")}</div>;
    if (safeLine.startsWith("# ")) return <div key={i} style={{ color: "#4ade80", fontWeight: 700, fontSize: 15, margin: "14px 0 6px" }}>{safeLine.replace(/^#\s*/, "")}</div>;
    if (safeLine.startsWith("```")) return null;
    const priorLines = displayedLines.slice(0, i).map((l) => (typeof l === "string" ? l : String(l ?? "")));
    const reversed = priorLines.reverse();
    const idxFenceAny = reversed.findIndex((l) => l.startsWith("```"));
    const idxFenceSql = reversed.findIndex((l) => l.startsWith("```sql"));
    const idxFenceClose = reversed.findIndex((l) => l === "```");
    const isSql = idxFenceAny !== -1 && idxFenceSql !== -1 && (idxFenceClose === -1 || idxFenceSql < idxFenceClose);
    const prevLine = i > 0 ? displayedLines[i - 1] : "";
    if (isSql || String(prevLine ?? "").startsWith("```sql")) {
      return <div key={i} style={{ color: "#67e8f9", borderLeft: "2px solid #67e8f9", paddingLeft: 10, marginLeft: 4, fontFamily: "monospace", fontSize: 12 }}>{safeLine}</div>;
    }
    const boldReplaced = safeLine.replace(/\*\*([^*]+)\*\*/g, "___BOLD_START___$1___BOLD_END___");
    const parts = boldReplaced.split(/(___BOLD_START___|___BOLD_END___)/);
    let inBold = false;
    const spans = [];
    parts.forEach((part, j) => {
      if (part === "___BOLD_START___") { inBold = true; return; }
      if (part === "___BOLD_END___") { inBold = false; return; }
      if (part) spans.push(<span key={j} style={inBold ? { color: "#f1f5f9", fontWeight: 600 } : {}}>{part}</span>);
    });
    return <div key={i} style={{ color: "#cbd5e1", lineHeight: 1.7 }}>{spans}</div>;
  };

  return (
    <div style={{ marginTop: 20, borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
      <div style={{ background: "#0f172a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>AI REMEDIATION REPORT</span>
          <span style={{ fontSize: 10, color: "#16a34a", background: "#052e16", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>PRO</span>
        </div>
        {onClose && <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>_</button>}
      </div>
      <div ref={contentRef} style={{ background: "#1e293b", padding: 16, fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace", fontSize: 13, maxHeight: 500, overflowY: "auto", minHeight: 100 }}>
        {status === "loading" && (
          <div style={{ color: "#94a3b8" }}>
            <div>Analyzing scan results...</div>
            <div style={{ marginTop: 4 }}>Generating remediation policies...</div>
            <span style={{ display: "inline-block", width: 8, height: 14, background: "#4ade80", animation: "pulse 1s ease-in-out infinite", marginLeft: 2, verticalAlign: "middle" }} />
          </div>
        )}
        {status === "error" && <div style={{ color: "#ef4444" }}>{errorMsg || "Failed to generate AI report."}</div>}
        {status === "done" && displayedLines.map((line, i) => renderLine(line, i))}
        {status === "done" && isTyping && (
          <span style={{ display: "inline-block", width: 8, height: 14, background: "#4ade80", animation: "pulse 1s ease-in-out infinite", marginLeft: 2, verticalAlign: "middle" }} />
        )}
      </div>
    </div>
  );
}

function HistoryTableResultCard({ result }) {
  const [showPreview, setShowPreview] = useState(false);
  const hasPreview =
    result &&
    result.preview_data &&
    typeof result.preview_data === "object" &&
    !Array.isArray(result.preview_data) &&
    Object.keys(result.preview_data).length > 0;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{result.table_name}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{result.severity}</div>
      </div>
      <div style={{ fontSize: 13, color: result.is_vulnerable ? "#ea580c" : "#0f172a", marginTop: 6 }}>
        {result.is_vulnerable ? "Vulnerable" : "Protected"}
        {typeof result.row_count === "number" ? ` · Rows: ${result.row_count}` : ""}
      </div>
      {Array.isArray(result.sensitive_columns) && result.sensitive_columns.length > 0 && (
        <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
          Sensitive: {result.sensitive_columns.join(", ")}
        </div>
      )}
      {hasPreview && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setShowPreview((v) => !v)}
            style={{
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showPreview ? "Hide Sample Row" : "View Sample Row"}
          </button>
          {showPreview && (
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: 11,
                overflowX: "auto",
                border: "1px solid #1e293b",
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(result.preview_data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage({
  user,
  authToken,
  plan = "free",
  onGoToScan,
  onGoToDashboard,
  onGoToProfile,
  onSignOut,
}) {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [authChecks, setAuthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [aiState, setAiState] = useState("idle");
  const [aiReport, setAiReport] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiPdfLoading, setAiPdfLoading] = useState(false);
  const [aiPdfError, setAiPdfError] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadScans() {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("scans").select("id, scan_mode, target_url, supabase_url, status, started_at, completed_at, error_message, total_tables, vulnerable_tables, critical_findings, risk_level, auth_exposed_count, ai_report").order("started_at", { ascending: false });
      if (!isMounted) return;
      if (loadError) { setError(loadError.message); setScans([]); }
      else { setScans(data || []); if (data?.length > 0) setSelectedScan(data[0]); }
      setLoading(false);
    }
    if (user?.id) loadScans();
    return () => { isMounted = false; };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails(scanId) {
      if (!scanId || plan !== "pro") { setScanResults([]); setAuthChecks([]); setDetailLoading(false); return; }
      setDetailLoading(true);
      let { data: resultsData, error: resultsError } = await supabase
        .from("scan_results")
        .select("id, table_name, is_vulnerable, row_count, severity, sensitive_columns, preview_data")
        .eq("scan_id", scanId)
        .order("severity", { ascending: false });
      if (resultsError && /preview_data|column/i.test(resultsError.message || "")) {
        const fallback = await supabase
          .from("scan_results")
          .select("id, table_name, is_vulnerable, row_count, severity, sensitive_columns")
          .eq("scan_id", scanId)
          .order("severity", { ascending: false });
        resultsData = (fallback.data || []).map((row) => ({ ...row, preview_data: null }));
      }
      const { data: checksData } = await supabase.from("admin_endpoint_checks").select("id, endpoint, is_exposed, status_code").eq("scan_id", scanId);
      if (!isMounted) return;
      setScanResults(resultsData || []);
      setAuthChecks(checksData || []);
      setDetailLoading(false);
    }
    setAiState("idle"); setAiReport(null); setAiError(null); setShowTerminal(false);
    if (selectedScan?.id) loadDetails(selectedScan.id);
    else { setScanResults([]); setAuthChecks([]); }
    return () => { isMounted = false; };
  }, [selectedScan?.id, plan]);

  const trendByScanId = useMemo(() => buildTrendSeriesByScanId(scans, 8), [scans]);

  async function handleExport(format) {
    if (!authToken) {
      setExportError("Sign in required to export scan data.");
      return;
    }

    setExportLoading(format);
    setExportError(null);

    try {
      const res = await fetch(`${API_BASE}/exports/scans.${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to export ${format.toUpperCase()}.`);
      }

      const disposition = res.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
      const fileName = filenameMatch?.[1] || `scans-export.${format}`;
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setExportError(err.message || "Export failed.");
    } finally {
      setExportLoading(null);
    }
  }

  function triggerFileDownloadFromResponse(res, blob, fallbackName) {
    const disposition = res.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
    const fileName = filenameMatch?.[1] || fallbackName;
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  }

  async function ensureAiReport({ openTerminal = true } = {}) {
    if (plan !== "pro" || !selectedScan) {
      throw new Error("Pro plan and scan selection required.");
    }

    if (selectedScan.ai_report) {
      setAiReport(selectedScan.ai_report);
      if (openTerminal) setShowTerminal(true);
      setAiState("done");
      return selectedScan.ai_report;
    }

    if (aiReport) {
      if (openTerminal) setShowTerminal(true);
      setAiState("done");
      return aiReport;
    }

    if (openTerminal) setShowTerminal(true);
    setAiState("loading");
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/scan/${selectedScan.id}/ai-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report.");
      setAiReport(data.aiReport);
      setAiState("done");
      setScans((prev) =>
        prev.map((scan) => (scan.id === selectedScan.id ? { ...scan, ai_report: data.aiReport } : scan))
      );
      setSelectedScan((prev) =>
        prev && prev.id === selectedScan.id ? { ...prev, ai_report: data.aiReport } : prev
      );
      return data.aiReport;
    } catch (err) {
      setAiError(err.message);
      setAiState("error");
      throw err;
    }
  }

  async function handleGenerateReport() {
    try {
      await ensureAiReport({ openTerminal: true });
    } catch {
      // handled via state
    }
  }

  async function handleExportAiReportPdf() {
    if (plan !== "pro" || !selectedScan) return;
    if (!authToken) {
      setAiPdfError("Sign in required to export AI reports.");
      return;
    }

    setAiPdfLoading(true);
    setAiPdfError(null);
    try {
      await ensureAiReport({ openTerminal: false });
      const res = await fetch(`${API_BASE}/exports/ai-report.pdf?scanId=${encodeURIComponent(selectedScan.id)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export AI report PDF.");
      }
      const blob = await res.blob();
      triggerFileDownloadFromResponse(res, blob, `ai-report-${selectedScan.id}.pdf`);
    } catch (err) {
      setAiPdfError(err.message || "Failed to export AI report PDF.");
    } finally {
      setAiPdfLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>

      <AppNavbar
        userEmail={user?.email}
        plan={plan}
        activePage="history"
        onGoToScan={onGoToScan}
        onGoToDashboard={onGoToDashboard}
        onGoToProfile={onGoToProfile}
        onSignOut={onSignOut}
      />

      {plan !== "pro" && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "#e2e8f0" }}><strong style={{ color: "#f87171" }}>Free plan</strong> — See only vulnerability counts</span>
          <button style={{ background: "white", border: "none", color: "#0f172a", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Unlock Full Details</button>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Scan History</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleExport("csv")} disabled={exportLoading === "csv"} style={{ border: "1px solid #e2e8f0", background: "white", color: "#0f172a", padding: "8px 16px", borderRadius: 8, cursor: exportLoading === "csv" ? "not-allowed" : "pointer", fontWeight: 500, opacity: exportLoading === "csv" ? 0.65 : 1 }}>{exportLoading === "csv" ? "Exporting..." : "Export CSV"}</button>
            <button onClick={() => handleExport("pdf")} disabled={exportLoading === "pdf"} style={{ border: "1px solid #e2e8f0", background: "white", color: "#0f172a", padding: "8px 16px", borderRadius: 8, cursor: exportLoading === "pdf" ? "not-allowed" : "pointer", fontWeight: 500, opacity: exportLoading === "pdf" ? 0.65 : 1 }}>{exportLoading === "pdf" ? "Exporting..." : "Export PDF"}</button>
          </div>
        </div>
        {exportError ? <div style={{ marginBottom: 14, color: "#dc2626", fontSize: 13 }}>{exportError}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) 2fr", gap: 24 }}>
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, minHeight: 400, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16 }}>SCANS</div>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                    <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 12 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 12, width: "40%" }} />
                    </div>
                    <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6 }} />
                  </div>
                ))}
                <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 8 }}>
                  <div style={{ width: 18, height: 18, border: "2px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Loading scan history...
                </div>
              </motion.div>
            )}
            {!loading && error && <div style={{ color: "#dc2626" }}>{error}</div>}
            {!loading && !error && scans.length === 0 && <div style={{ color: "#64748b" }}>No scans yet.</div>}
            {!loading && scans.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scans.map((scan) => (
                  <button key={scan.id} type="button" onClick={() => setSelectedScan(scan)} style={{ textAlign: "left", padding: 14, borderRadius: 10, border: selectedScan?.id === scan.id ? "2px solid #0f172a" : "1px solid #e2e8f0", background: selectedScan?.id === scan.id ? "#f0fdf4" : "white", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.target_url || scan.supabase_url}</div>
                      <StatusBadge status={scan.status} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{scan.scan_mode?.toUpperCase()} · {formatDate(scan.started_at)}</div>
                    <MiniSparkline data={trendByScanId.get(scan.id) || []} color={scan.status === "failed" ? "#ea580c" : "#0f172a"} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, minHeight: 400, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16 }}>DETAILS</div>
            {!selectedScan && <div style={{ color: "#64748b" }}>Select a scan to see details.</div>}
            {selectedScan && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{selectedScan.target_url || selectedScan.supabase_url}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Mode: {selectedScan.scan_mode} · Status: {selectedScan.status}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Started: {formatDate(selectedScan.started_at)} · Completed: {formatDate(selectedScan.completed_at)}</div>
                  {selectedScan.error_message && <div style={{ marginTop: 8, color: "#dc2626", fontSize: 13 }}>{selectedScan.error_message}</div>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Tables", value: selectedScan.total_tables ?? "—", color: "#0f172a" },
                    { label: "Vulnerable", value: selectedScan.vulnerable_tables ?? "—", color: "#ea580c" },
                    { label: "Critical", value: selectedScan.critical_findings ?? "—", color: "#dc2626" },
                    { label: "Auth Exposed", value: selectedScan.auth_exposed_count ?? "—", color: "#0f172a" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {plan === "pro" && selectedScan.status === "completed" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <button
                        onClick={handleGenerateReport}
                        disabled={aiState === "loading"}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 18px", borderRadius: 10, border: "none",
                          background: "#0f172a", color: "white", fontWeight: 600, fontSize: 13,
                          cursor: aiState === "loading" ? "not-allowed" : "pointer",
                          opacity: aiState === "loading" ? 0.7 : 1,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>&#9889;</span>
                        {aiState === "loading" ? "Generating..." : (selectedScan.ai_report || aiReport) ? "View AI Report" : "Generate AI Report"}
                        {!(selectedScan.ai_report || aiReport) && (
                          <span style={{ fontSize: 10, background: "#16a34a", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>PRO</span>
                        )}
                      </button>
                      <button
                        onClick={handleExportAiReportPdf}
                        disabled={aiPdfLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          background: "white",
                          color: "#0f172a",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: aiPdfLoading ? "not-allowed" : "pointer",
                          opacity: aiPdfLoading ? 0.7 : 1,
                        }}
                      >
                        {aiPdfLoading ? "Preparing PDF..." : "Export AI PDF"}
                      </button>
                    </div>
                    {aiPdfError && <div style={{ marginTop: 8, color: "#dc2626", fontSize: 13 }}>{aiPdfError}</div>}
                    {showTerminal && (
                      <AIReportTerminal
                        reportText={aiReport}
                        status={aiState}
                        errorMsg={aiError}
                        onClose={() => setShowTerminal(false)}
                      />
                    )}
                  </div>
                )}

                {plan !== "pro" && (
                  <div style={{ marginBottom: 20, background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>See What's Actually Exposed</div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 16 }}>
                      Unlock Pro to see which tables are leaking, view sensitive columns, and get AI-powered fixes.
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 12, filter: "blur(2px)", opacity: 0.6 }}>
                      <div style={{ fontSize: 12, color: "#ea580c" }}>users_table</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>email, password_hash, api_key...</div>
                    </div>
                    <button style={{ background: "#0f172a", border: "none", color: "white", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", width: "100%" }}>Upgrade to Pro — $19/mo</button>
                  </div>
                )}

                {detailLoading && <div style={{ color: "#64748b" }}>Loading results...</div>}
                {!detailLoading && plan === "pro" && (
                  <>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 12 }}>TABLE FINDINGS</div>
                    {scanResults.length === 0 && <div style={{ color: "#94a3b8" }}>No results recorded.</div>}
                    {scanResults.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {scanResults.map((result) => (
                          <HistoryTableResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}

                    {authChecks.length > 0 && (
                      <>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 24, marginBottom: 12 }}>AUTH ENDPOINT CHECKS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {authChecks.map((check) => (
                            <div key={check.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, background: "#f8fafc" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{check.endpoint}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>HTTP {check.status_code ?? "—"}</div>
                              </div>
                              <div style={{ fontSize: 13, color: check.is_exposed ? "#dc2626" : "#0f172a", marginTop: 6 }}>
                                {check.is_exposed ? "Exposed" : "Protected"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
