import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/AppNavbar";

const API_BASE = "https://supasecure-production.up.railway.app/api";

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const SEVERITY = {
  critical: { color: "#dc2626", bg: "#fef2f2", label: "CRITICAL", icon: "☠" },
  high: { color: "#ea580c", bg: "#fff7ed", label: "HIGH", icon: "⚠" },
  safe: { color: "#16a34a", bg: "#f0fdf4", label: "SAFE", icon: "✓" },
  info: { color: "#0f172a", bg: "#eff6ff", label: "INFO", icon: "ℹ" },
  error: { color: "#6b7280", bg: "#f9fafb", label: "ERROR", icon: "✕" },
  unknown: { color: "#9ca3af", bg: "#f9fafb", label: "?", icon: "?" },
};

const SEVERITY_ORDER = ["critical", "high", "info", "safe", "error", "unknown"];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollJob(jobId, authToken, onUpdate) {
  while (true) {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetch(`${API_BASE}/scan/${jobId}`, { headers });
    const data = await res.json();
    if (!res.ok) {
      onUpdate({
        status: "failed",
        error: data?.error || "Failed to poll scan job.",
        errorCode: data?.errorCode || "POLL_FAILED",
      });
      break;
    }
    onUpdate(data);
    if (data.status === "complete" || data.status === "failed") break;
    await sleep(2500);
  }
}

function TerminalLog({ messages }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={ref}
      style={{
        background: "#1e293b",
        borderRadius: 12,
        padding: 16,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#e2e8f0",
        maxHeight: 200,
        overflowY: "auto",
        lineHeight: 1.8,
      }}
    >
      {messages.map((m, i) => (
        <div key={i} style={{ color: m.startsWith("[ERROR]") ? "#ef4444" : "#e2e8f0" }}>
          <span style={{ color: "#94a3b8", marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
          {m}
        </div>
      ))}
      {messages.length === 0 && <span style={{ color: "#94a3b8" }}>Awaiting scan...</span>}
    </div>
  );
}

function FindingCard({ finding, index = 0 }) {
  const sev = SEVERITY[finding.severity] || SEVERITY.unknown;
  const [showPreview, setShowPreview] = useState(false);
  const hasPreview =
    finding &&
    finding.previewRow &&
    typeof finding.previewRow === "object" &&
    !Array.isArray(finding.previewRow) &&
    Object.keys(finding.previewRow).length > 0;

  const previewJson = hasPreview ? JSON.stringify(finding.previewRow, null, 2) : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      style={{
        background: sev.bg,
        border: `1px solid ${sev.color}30`,
        borderLeft: `4px solid ${sev.color}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontSize: 14, color: "#0f172a", fontWeight: 600 }}>
          {finding.table || finding.endpoint}
        </span>
        <span
          style={{
            background: `${sev.color}20`,
            color: sev.color,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {sev.icon} {sev.label}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{finding.message}</div>
      {finding.columnsExposed?.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {finding.columnsExposed.map((col) => (
            <span
              key={col}
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                padding: "3px 8px",
                borderRadius: 6,
                background: finding.sensitiveColumns?.includes(col) ? "#fef2f2" : "#f1f5f9",
                color: finding.sensitiveColumns?.includes(col) ? "#dc2626" : "#475569",
                border: `1px solid ${finding.sensitiveColumns?.includes(col) ? "#fecaca" : "#e2e8f0"}`,
              }}
            >
              {col}
            </span>
          ))}
        </div>
      )}
      {hasPreview && (
        <div style={{ marginTop: 12 }}>
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
              {previewJson}
            </pre>
          )}
        </div>
      )}
    </motion.div>
  );
}

function RiskBadge({ level }) {
  const config = {
    CRITICAL: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "☠" },
    HIGH: { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", icon: "⚠" },
    SAFE: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓" },
  };
  const c = config[level] || config.SAFE;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 20px",
        background: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: 12,
        color: c.color,
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 1,
      }}
    >
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <span>{level}</span>
    </motion.div>
  );
}

function AIReportTerminal({ reportText, status, errorMsg }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
    setCollapsed(false);
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
    if (contentRef.current && !collapsed) contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [displayedLines, collapsed]);

  const renderLine = (line, i) => {
    const safeLine = typeof line === "string" ? line : String(line ?? "");
    if (safeLine.startsWith("## ")) {
      return <div key={i} style={{ color: "#4ade80", fontWeight: 700, fontSize: 14, margin: "12px 0 4px" }}>{safeLine.replace(/^##\s*/, "")}</div>;
    }
    if (safeLine.startsWith("### ")) {
      return <div key={i} style={{ color: "#4ade80", fontWeight: 600, fontSize: 13, margin: "8px 0 2px" }}>{safeLine.replace(/^###\s*/, "")}</div>;
    }
    if (safeLine.startsWith("# ")) {
      return <div key={i} style={{ color: "#4ade80", fontWeight: 700, fontSize: 15, margin: "14px 0 6px" }}>{safeLine.replace(/^#\s*/, "")}</div>;
    }
    if (safeLine.startsWith("```")) {
      return null;
    }
    const priorLines = displayedLines.slice(0, i).map((l) => (typeof l === "string" ? l : String(l ?? "")));
    const reversed = priorLines.reverse();
    const idxFenceAny = reversed.findIndex((l) => l.startsWith("```"));
    const idxFenceSql = reversed.findIndex((l) => l.startsWith("```sql"));
    const idxFenceClose = reversed.findIndex((l) => l === "```");
    const isSql = idxFenceAny !== -1 && idxFenceSql !== -1 && (idxFenceClose === -1 || idxFenceSql < idxFenceClose);
    const prevLine = i > 0 ? displayedLines[i - 1] : "";
    if (isSql || String(prevLine ?? "").startsWith("```sql")) {
      return (
        <div key={i} style={{ color: "#67e8f9", borderLeft: "2px solid #67e8f9", paddingLeft: 10, marginLeft: 4, fontFamily: "monospace", fontSize: 12 }}>
          {safeLine}
        </div>
      );
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
      <div
        onClick={() => status === "done" && !isTyping && setCollapsed((c) => !c)}
        style={{ background: "#0f172a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: status === "done" && !isTyping ? "pointer" : "default" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>AI REMEDIATION REPORT</span>
          <span style={{ fontSize: 10, color: "#16a34a", background: "#052e16", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>PRO</span>
        </div>
        <span style={{ color: "#64748b", fontSize: 14, fontFamily: "monospace", userSelect: "none" }}>
          {collapsed ? "+" : "_"}
        </span>
      </div>
      {!collapsed && (
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
      )}
    </div>
  );
}

function CollapsibleSection({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: open ? "12px 12px 0 0" : 12,
          padding: "12px 16px", cursor: "pointer", transition: "border-radius 0.15s",
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 0.5 }}>
          {title}
          {count != null && <span style={{ marginLeft: 8, background: "#e2e8f0", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{count}</span>}
        </span>
        <span style={{ color: "#94a3b8", fontSize: 14, transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          &#9660;
        </span>
      </button>
      {open && (
        <div style={{ border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 16, background: "white" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function sortBySeverity(items) {
  return [...items].sort((a, b) => {
    const aIndex = SEVERITY_ORDER.indexOf(a.severity?.toLowerCase() || "unknown");
    const bIndex = SEVERITY_ORDER.indexOf(b.severity?.toLowerCase() || "unknown");
    return aIndex - bIndex;
  });
}

function FilterBar({ searchQuery, setSearchQuery, severityFilter, setSeverityFilter, counts }) {
  const filters = [
    { key: "all", label: "All", color: "#0f172a" },
    { key: "critical", label: "Critical", color: "#dc2626" },
    { key: "high", label: "High", color: "#ea580c" },
    { key: "safe", label: "Safe", color: "#16a34a" },
    { key: "info", label: "Info", color: "#0f172a" },
  ];

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search tables or endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "12px 16px 12px 44px",
            color: "#0f172a",
            fontSize: 14,
            outline: "none",
          }}
        />
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>
          🔍
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e2e8f0",
              border: "none",
              borderRadius: 6,
              color: "#64748b",
              width: 24,
              height: 24,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const isActive = severityFilter === f.key;
          const count = f.key === "all" ? counts.total : counts[f.key] || 0;
          return (
            <button
              key={f.key}
              onClick={() => setSeverityFilter(f.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${isActive ? f.color : "#e2e8f0"}`,
                background: isActive ? `${f.color}10` : "white",
                color: isActive ? f.color : "#64748b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  background: isActive ? `${f.color}20` : "#f1f5f9",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultsView({ result, plan, authToken, scanId, onUpgrade }) {
  const { summary, findings, authChecks, supabaseUrl, durationMs, domain } = result;
  const durationLabel = Number.isFinite(durationMs) ? `${(durationMs / 1000).toFixed(1)}s` : "—";
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [aiState, setAiState] = useState("idle");
  const [aiReport, setAiReport] = useState(result.aiReport || null);
  const [aiError, setAiError] = useState(null);
  const [aiPdfLoading, setAiPdfLoading] = useState(false);
  const [aiPdfError, setAiPdfError] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const aiReportSectionRef = useRef(null);

  useEffect(() => {
    if (!showTerminal) return;
    const raf = window.requestAnimationFrame(() => {
      aiReportSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [showTerminal, aiState]);

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
    if (plan !== "pro") {
      onUpgrade?.();
      throw new Error("Pro plan required.");
    }
    if (aiReport) {
      if (openTerminal) {
        setShowTerminal(true);
        setAiState("done");
      }
      return aiReport;
    }

    if (openTerminal) setShowTerminal(true);
    setAiState("loading");
    setAiError(null);

    try {
      const res = await fetch(`${API_BASE}/scan/${scanId}/ai-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report.");
      setAiReport(data.aiReport);
      setAiState("done");
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
      // handled via aiError state
    }
  }

  async function handleExportAiPdf() {
    if (plan !== "pro") {
      onUpgrade?.();
      return;
    }
    if (!authToken || !scanId) {
      setAiPdfError("Sign in and run a scan before exporting.");
      return;
    }

    setAiPdfLoading(true);
    setAiPdfError(null);
    try {
      await ensureAiReport({ openTerminal: false });
      const res = await fetch(`${API_BASE}/exports/ai-report.pdf?scanId=${encodeURIComponent(scanId)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export AI report PDF.");
      }
      const blob = await res.blob();
      triggerFileDownloadFromResponse(res, blob, `ai-report-${scanId}.pdf`);
    } catch (err) {
      setAiPdfError(err.message || "Failed to export AI report PDF.");
    } finally {
      setAiPdfLoading(false);
    }
  }

  const allItems = [...(findings || []), ...(authChecks || [])];
  const counts = {
    total: allItems.length,
    critical: allItems.filter((f) => f.severity?.toLowerCase() === "critical").length,
    high: allItems.filter((f) => f.severity?.toLowerCase() === "high").length,
    safe: allItems.filter((f) => f.severity?.toLowerCase() === "safe").length,
    info: allItems.filter((f) => f.severity?.toLowerCase() === "info").length,
  };

  const sortedFindings = sortBySeverity(findings || []);
  const sortedAuthChecks = sortBySeverity(authChecks || []);

  const filterItem = (item) => {
    const matchesSearch =
      !searchQuery ||
      (item.table || item.endpoint || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.columnsExposed || []).some((col) => col.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSeverity = severityFilter === "all" || (item.severity?.toLowerCase() || "unknown") === severityFilter;
    return matchesSearch && matchesSeverity;
  };

  const filteredFindings = sortedFindings.filter(filterItem);
  const filteredAuthChecks = sortedAuthChecks.filter(filterItem);
  const totalFiltered = filteredFindings.length + filteredAuthChecks.length;

  return (
    <div>
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
            SCAN COMPLETE — {new Date(result.scannedAt).toLocaleString()}
          </div>
          <div style={{ fontSize: 20, color: "#0f172a", fontWeight: 700 }}>{domain}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {supabaseUrl} · {summary.totalTables} tables · {durationLabel}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <RiskBadge level={summary.riskLevel} />
          <button
            onClick={handleGenerateReport}
            disabled={aiState === "loading"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 20px", borderRadius: 12, border: "none",
              background: plan === "pro" ? "#0f172a" : "#1e293b",
              color: "white", fontWeight: 600, fontSize: 13,
              cursor: aiState === "loading" ? "not-allowed" : "pointer",
              opacity: aiState === "loading" ? 0.7 : 1,
            }}
          >
            {plan !== "pro" && <span style={{ fontSize: 14 }}>&#128274;</span>}
            {plan === "pro" && <span style={{ fontSize: 14 }}>&#9889;</span>}
            {aiState === "loading" ? "Generating..." : aiReport ? "View AI Report" : "Generate AI Report"}
            {plan === "pro" && !aiReport && (
              <span style={{ fontSize: 10, background: "#16a34a", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>PRO</span>
            )}
          </button>
          {plan === "pro" && (
            <button
              onClick={handleExportAiPdf}
              disabled={aiPdfLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                borderRadius: 12,
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
          )}
        </div>
      </div>
      {aiPdfError && <div style={{ marginTop: -8, marginBottom: 14, color: "#dc2626", fontSize: 13 }}>{aiPdfError}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Tables Found", value: summary.totalTables, color: "#0f172a" },
          { label: "Vulnerable", value: summary.vulnerableTables, color: summary.vulnerableTables > 0 ? "#ea580c" : "#16a34a" },
          { label: "Critical", value: summary.criticalFindings, color: summary.criticalFindings > 0 ? "#dc2626" : "#16a34a" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        counts={counts}
      />

      {totalFiltered === 0 && (searchQuery || severityFilter !== "all") && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No findings match your search or filter.
          <button
            onClick={() => { setSearchQuery(""); setSeverityFilter("all"); }}
            style={{ marginLeft: 8, background: "transparent", border: "none", color: "#0f172a", cursor: "pointer", textDecoration: "underline" }}
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredFindings.length > 0 && (
        <>
          <div style={{ marginBottom: 12, fontSize: 12, color: "#64748b", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
            <span>TABLE FINDINGS</span>
            <span>{filteredFindings.length} of {sortedFindings.length}</span>
          </div>
          {filteredFindings.map((f, i) => <FindingCard key={i} finding={f} index={i} />)}
        </>
      )}

      {filteredAuthChecks.length > 0 && (
        <>
          <div style={{ marginTop: 20, marginBottom: 12, fontSize: 12, color: "#64748b", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
            <span>AUTH ENDPOINT CHECKS</span>
            <span>{filteredAuthChecks.length} of {sortedAuthChecks.length}</span>
          </div>
          {filteredAuthChecks.map((f, i) => <FindingCard key={i} finding={f} index={i} />)}
        </>
      )}

      {showTerminal && (
        <div ref={aiReportSectionRef} style={{ marginTop: 20 }}>
          {plan === "pro" && (
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 0.5 }}>
                AI REPORT ACTIONS
              </div>
              <button
                onClick={handleExportAiPdf}
                disabled={aiPdfLoading || aiState === "loading"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: aiPdfLoading || aiState === "loading" ? "not-allowed" : "pointer",
                  opacity: aiPdfLoading || aiState === "loading" ? 0.7 : 1,
                }}
              >
                {aiPdfLoading ? "Preparing PDF..." : "Export AI PDF"}
              </button>
            </div>
          )}
          <AIReportTerminal
            reportText={aiReport}
            status={aiState}
            errorMsg={aiError}
            onClose={() => setShowTerminal(false)}
          />
        </div>
      )}

      {!showTerminal && summary.vulnerableTables > 0 && plan !== "pro" && (
        <div
          style={{
            marginTop: 24,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderLeft: "4px solid #ea580c",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ color: "#0f172a", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>HOW TO FIX</div>
          <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
            1. Go to your Supabase Dashboard &rarr; Authentication &rarr; Policies<br />
            2. For each vulnerable table, click "Enable RLS" and then "New Policy"<br />
            3. At minimum, add a policy that denies all anon access: <code style={{ background: "#fef3c7", padding: "2px 6px", borderRadius: 4 }}>using (false)</code><br />
            4. Then add back only the specific access patterns your app needs<br />
            5. Re-scan to confirm your fixes
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScanPage({ user, authToken, plan = "free", onSignOut, onGoToHistory, onGoToDashboard, onGoToProfile }) {
  const [domain, setDomain] = useState("");
  const [scanMode, setScanMode] = useState("website");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);
  const canSubmit = consent && ((scanMode === "website" && domain.trim()) || (scanMode === "manual" && supabaseUrl.trim() && anonKey.trim()));

  async function handleScan(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setPhase("submitting");
    setLogs([]);
    setResult(null);
    setError(null);
    setErrorCode(null);

    try {
      const targetLabel = scanMode === "website" ? domain.trim() : supabaseUrl.trim();
      addLog(`Submitting ${scanMode} scan for ${targetLabel}...`);

      const payload = scanMode === "website"
        ? { mode: "website", domain: domain.trim(), consent }
        : { mode: "manual", supabaseUrl: supabaseUrl.trim(), anonKey: anonKey.trim(), consent };

      const headers = { "Content-Type": "application/json" };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE}/scan`, { method: "POST", headers, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.errorCode === "SCAN_LIMIT_REACHED" ? "Daily scan limit reached." : data.error || "Failed to start scan";
        setErrorCode(data.errorCode);
        throw new Error(msg);
      }

      const { jobId } = data;
      addLog(`Scan job created: ${jobId}`);
      setPhase("polling");

      const logTimers = scanMode === "website"
        ? [
            setTimeout(() => addLog("Extracting JavaScript bundles..."), 2000),
            setTimeout(() => addLog("Searching for Supabase credentials..."), 5000),
            setTimeout(() => addLog("Credentials found. Fetching schema..."), 9000),
            setTimeout(() => addLog("Testing RLS on each table..."), 12000),
          ]
        : [
            setTimeout(() => addLog("Fetching PostgREST schema..."), 2000),
            setTimeout(() => addLog("Testing RLS on each table..."), 5000),
          ];

      await pollJob(jobId, authToken, (job) => {
        if (job.status === "complete") {
          logTimers.forEach(clearTimeout);
          const completedResult = job?.result && typeof job.result === "object" ? job.result : null;
          if (!completedResult) {
            const msg = "Scan finished but no result payload was returned. Please run the scan again.";
            addLog(`[ERROR] ${msg}`);
            setError(msg);
            setPhase("error");
            return;
          }
          const durationMs = Number(completedResult.durationMs);
          const durationText = Number.isFinite(durationMs) ? `${(durationMs / 1000).toFixed(1)}s` : "—";
          addLog(`Scan complete in ${durationText}`);
          setResult(completedResult);
          setScanId(job.scanId);
          setPhase("done");
        } else if (job.status === "failed") {
          logTimers.forEach(clearTimeout);
          addLog(`[ERROR] ${job.error || "Scan failed."}`);
          setError(job.error);
          setErrorCode(job.errorCode);
          setPhase("error");
        }
      });
    } catch (err) {
      addLog(`[ERROR] ${err.message}`);
      setError(err.message);
      setPhase("error");
    }
  }

  async function handleUpgrade() {
    if (!authToken) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #0f172a !important; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      <AppNavbar
        userEmail={user?.email}
        plan={plan}
        activePage="scan"
        onGoToHistory={onGoToHistory}
        onGoToDashboard={onGoToDashboard}
        onGoToProfile={onGoToProfile}
        onSignOut={onSignOut}
      />

      {plan !== "pro" && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "#e2e8f0" }}>
            You're on the <strong style={{ color: "#f87171" }}>Free plan</strong> — Limited to 1 scan per day
          </span>
          <button onClick={handleUpgrade} disabled={checkoutLoading} style={{ background: "#0f172a", border: "none", color: "white", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
            {checkoutLoading ? "..." : "Upgrade to Pro"}
          </button>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <motion.div style={{ marginBottom: 40 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
            Is your Supabase data <span style={{ color: "#dc2626" }}>publicly exposed?</span>
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, maxWidth: 600 }}>
            We scan your website, extract Supabase credentials from the JS bundle, and test each table — exactly like a bad actor would.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
        {(phase === "idle" || phase === "error") && (
          <motion.form onSubmit={handleScan} key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>SCAN MODE</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[{ id: "website", label: "Website Scan" }, { id: "manual", label: "Manual Scan" }].map((m) => (
                  <button key={m.id} type="button" onClick={() => setScanMode(m.id)} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${scanMode === m.id ? "#0f172a" : "#e2e8f0"}`, background: scanMode === m.id ? "#0f172a" : "white", color: scanMode === m.id ? "white" : "#64748b", fontWeight: 500, cursor: "pointer" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {scanMode === "website" ? (
                <>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>YOUR DOMAIN</label>
                  <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="myapp.com" style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", color: "#0f172a", fontSize: 16 }} />
                  <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>e.g. myapp.vercel.app — no https:// needed</div>
                </>
              ) : (
                <>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>SUPABASE URL</label>
                  <input type="text" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xxx.supabase.co" style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", color: "#0f172a", fontSize: 14, marginBottom: 12 }} />
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>ANON KEY</label>
                  <input type="password" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="eyJ..." style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", color: "#0f172a", fontSize: 14 }} />
                </>
              )}
            </div>

            <div onClick={() => setConsent(!consent)} style={{ background: consent ? "#f8fafc" : "white", border: `1px solid ${consent ? "#0f172a" : "#e2e8f0"}`, borderRadius: 12, padding: 16, marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 22, height: 22, minWidth: 22, border: `2px solid ${consent ? "#0f172a" : "#cbd5e1"}`, borderRadius: 6, background: consent ? "#0f172a" : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                {consent && "✓"}
              </div>
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                I confirm ownership of this domain and understand this scan makes real HTTP requests using publicly available credentials.
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
                ✕ {error}
                {errorCode && <div style={{ marginTop: 4, fontSize: 12, color: "#f87171" }}>Code: {errorCode}</div>}
              </div>
            )}

            <motion.button type="submit" disabled={!canSubmit} whileHover={canSubmit ? { scale: 1.01, boxShadow: "0 8px 20px rgba(15, 23, 42, 0.35)" } : {}} whileTap={canSubmit ? { scale: 0.98 } : {}} style={{ width: "100%", padding: 16, background: canSubmit ? "#0f172a" : "#e2e8f0", border: "none", borderRadius: 12, color: canSubmit ? "white" : "#94a3b8", fontSize: 15, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 4px 14px 0 rgba(15, 23, 42, 0.3)" : "none" }}>
              RUN SECURITY SCAN →
            </motion.button>
          </motion.form>
        )}

        {(phase === "submitting" || phase === "polling") && (
          <motion.div key="scanning" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #0f172a, transparent)", animation: "scanLine 2s linear infinite" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ animation: "pulse 1s ease-in-out infinite", color: "#0f172a", fontSize: 16 }}>●</div>
              <span style={{ fontSize: 14, color: "#64748b" }}>Scanning <strong style={{ color: "#0f172a" }}>{scanMode === "website" ? domain : supabaseUrl}</strong></span>
            </div>
            <TerminalLog messages={logs} />
            <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>This typically takes 20–60 seconds.</div>
          </motion.div>
        )}

        {phase === "done" && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <ResultsView result={result} plan={plan} authToken={authToken} scanId={scanId} onUpgrade={handleUpgrade} />
            {plan !== "pro" && (
              <div style={{ marginTop: 24, background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155", borderRadius: 16, padding: 24, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, right: 0, background: "white", color: "#0f172a", fontSize: 11, fontWeight: 700, padding: "6px 14px", borderBottomLeftRadius: 12 }}>PRO</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Unlock Full Details</div>
                <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 16 }}>
                  You found <strong>{result.summary?.vulnerableTables || 0} vulnerable tables</strong>. Upgrade to see table names, exposed columns, and AI-powered fixes.
                </div>
                <button onClick={handleUpgrade} disabled={checkoutLoading} style={{ background: "#0f172a", border: "none", color: "white", padding: "12px 24px", borderRadius: 10, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px 0 rgba(245, 158, 11, 0.3)" }}>
                  {checkoutLoading ? "..." : "Upgrade to Pro — $19/mo"}
                </button>
              </div>
            )}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button onClick={() => { setPhase("idle"); setResult(null); setScanId(null); setDomain(""); setSupabaseUrl(""); setAnonKey(""); setConsent(false); }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", padding: "10px 20px", cursor: "pointer", fontWeight: 500 }}>
                ← Scan another domain
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {phase === "idle" && (
          <motion.div style={{ marginTop: 48 }} initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 16 }}>HOW IT WORKS</motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { step: "01", title: "Crawl", desc: "Fetch your website and JS bundles.", icon: "🔍" },
                { step: "02", title: "Extract", desc: "Find Supabase credentials in code.", icon: "🔑" },
                { step: "03", title: "Enumerate", desc: "Discover all exposed tables.", icon: "📋" },
                { step: "04", title: "Test RLS", desc: "Try reading as anonymous user.", icon: "🛡" },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeInUp} whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{s.step}</span>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
