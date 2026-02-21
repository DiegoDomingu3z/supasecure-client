import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { key: "scan", label: "Scanner", color: "#0f172a" },
  { key: "history", label: "History", color: "#0f172a" },
  { key: "dashboard", label: "Dashboard", color: "#0f172a" },
  { key: "profile", label: "Profile", color: "#0f172a" },
];

function NavButton({ label, color, active, onClick }) {
  const isClickable = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      style={{
        border: `1px solid ${active ? color : "#dbe3ec"}`,
        background: active ? `${color}14` : "white",
        color: active ? color : "#475569",
        padding: "9px 14px",
        borderRadius: 10,
        cursor: isClickable ? "pointer" : "default",
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        lineHeight: 1.1,
        opacity: isClickable ? 1 : 0.7,
      }}
    >
      {label}
    </button>
  );
}

export default function AppNavbar({
  userEmail,
  plan = "free",
  activePage = "scan",
  onGoHome,
  onGoToScan,
  onGoToHistory,
  onGoToDashboard,
  onGoToProfile,
  onSignOut,
}) {
  const navigate = useNavigate();
  const handlers = {
    scan: onGoToScan,
    history: onGoToHistory,
    dashboard: onGoToDashboard,
    profile: onGoToProfile,
  };
  const handleGoHome = () => {
    if (typeof onGoHome === "function") {
      onGoHome();
      return;
    }
    navigate("/");
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(255, 255, 255, 0.92)",
        borderBottom: "1px solid #e2e8f0",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={handleGoHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src="/Supasecured.jpg"
              alt="SupaSecure logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid #dbe3ec",
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>SupaSecure</div>
              <div style={{ fontSize: 12, color: "#64748b", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail || "Authenticated user"}
              </div>
            </div>
          </button>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 999,
              background: plan === "pro" ? "#0f172a" : "#f1f5f9",
              color: plan === "pro" ? "white" : "#64748b",
              letterSpacing: 0.4,
            }}
          >
            {plan === "pro" ? "PRO" : "FREE"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.key}
              label={item.label}
              color={item.color}
              active={activePage === item.key}
              onClick={activePage === item.key ? undefined : handlers[item.key]}
            />
          ))}
          <button
            type="button"
            onClick={onSignOut}
            style={{
              border: "1px solid #dbe3ec",
              background: "white",
              color: "#64748b",
              padding: "9px 14px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
              lineHeight: 1.1,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
