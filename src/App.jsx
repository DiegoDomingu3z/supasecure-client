import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import { applySeo } from "./lib/seo";
import LandingPage, { ConfigMissingPage } from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ScanPage from "./pages/ScanPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

function buildHomeSchema(origin) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "SupaSecure",
        url: origin,
        logo: `${origin}/Supasecured.jpg`,
      },
      {
        "@type": "WebSite",
        name: "SupaSecure",
        url: origin,
      },
      {
        "@type": "SoftwareApplication",
        name: "SupaSecure Supabase Security Scanner",
        applicationCategory: "SecurityApplication",
        operatingSystem: "Web",
        url: origin,
        description:
          "Automated Supabase RLS scanner that detects exposed tables, endpoints, and data previews.",
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "19",
            priceCurrency: "USD",
          },
        ],
      },
    ],
  };
}

function getSeoConfig(pathname) {
  const defaultKeywords =
    "supabase security scanner, row level security, rls audit, supabase vulnerability scanner, database exposure detection";

  if (pathname === "/") {
    return {
      title: "SupaSecure - Supabase RLS Security Scanner",
      description:
        "Scan Supabase projects for exposed tables, endpoint risks, and missing RLS. Get clear findings and remediation guidance.",
      canonicalPath: "/",
      robots: "index,follow",
      ogType: "website",
      keywords: defaultKeywords,
      schemaFactory: buildHomeSchema,
    };
  }

  if (pathname === "/privacy") {
    return {
      title: "Privacy Policy - SupaSecure",
      description:
        "Read how SupaSecure handles account data, scan metadata, retention, and third-party processing.",
      canonicalPath: "/privacy",
      robots: "index,follow",
      ogType: "article",
      keywords: "privacy policy, supasecure privacy, scan data policy",
    };
  }

  if (pathname === "/terms") {
    return {
      title: "Terms and Conditions - SupaSecure",
      description:
        "Review SupaSecure terms, service limitations, scanning scope, warranties, and liability terms.",
      canonicalPath: "/terms",
      robots: "index,follow",
      ogType: "article",
      keywords: "terms and conditions, supasecure terms, security scanning terms",
    };
  }

  if (pathname === "/auth") {
    return {
      title: "Sign In - SupaSecure",
      description: "Create your account or sign in to run Supabase security scans.",
      canonicalPath: "/auth",
      robots: "noindex,nofollow",
      ogType: "website",
      keywords: "supasecure login, supabase scanner sign in",
    };
  }

  if (pathname === "/app") {
    return {
      title: "Scanner - SupaSecure",
      description: "Run a Supabase exposure scan and review real-time findings.",
      canonicalPath: "/app",
      robots: "noindex,nofollow",
      ogType: "website",
      keywords: "supabase scanner app",
    };
  }

  if (pathname === "/app/history") {
    return {
      title: "Scan History - SupaSecure",
      description: "Review previous scan runs, findings, and reports.",
      canonicalPath: "/app/history",
      robots: "noindex,nofollow",
      ogType: "website",
      keywords: "scan history",
    };
  }

  if (pathname === "/app/dashboard") {
    return {
      title: "Dashboard - SupaSecure",
      description: "Track scan activity, risk levels, and security posture over time.",
      canonicalPath: "/app/dashboard",
      robots: "noindex,nofollow",
      ogType: "website",
      keywords: "security dashboard",
    };
  }

  if (pathname === "/app/profile") {
    return {
      title: "Profile - SupaSecure",
      description: "Manage your account profile, export data, and billing access.",
      canonicalPath: "/app/profile",
      robots: "noindex,nofollow",
      ogType: "website",
      keywords: "account profile",
    };
  }

  return {
    title: "SupaSecure",
    description: "Supabase security scanner for RLS and exposed data detection.",
    canonicalPath: pathname || "/",
    robots: "noindex,nofollow",
    ogType: "website",
    keywords: defaultKeywords,
  };
}

function SessionLoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
      <div style={{ color: "#64748b", fontSize: 14, fontWeight: 500, animation: "pulse 1.5s ease-in-out infinite" }}>Restoring session...</div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const [plan, setPlan] = useState("free");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      setAuthInitialized(true);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setAuthInitialized(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthInitialized(true);
    });

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadPlan() {
      if (!supabase || !session?.user?.id) {
        if (isMounted) setPlan("free");
        return;
      }
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan,status,current_period_end")
        .eq("user_id", session.user.id)
        .order("current_period_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;
      if (error || !data) {
        setPlan("free");
        return;
      }
      if (data.status === "active" && data.plan === "pro") {
        setPlan("pro");
      } else {
        setPlan("free");
      }
    }

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    const origin = window.location.origin;
    const config = getSeoConfig(location.pathname);
    applySeo({
      title: config.title,
      description: config.description,
      canonicalPath: config.canonicalPath,
      robots: config.robots,
      ogType: config.ogType,
      keywords: config.keywords,
      schema: config.schemaFactory ? config.schemaFactory(origin) : null,
    });
  }, [location.pathname]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!supabase) return;

    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { emailRedirectTo: window.location.origin },
        });

        if (error) throw error;
        setAuthNotice("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;
        navigate("/app");
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/");
  }

  if (!isSupabaseConfigured) {
    return <ConfigMissingPage />;
  }

  const user = session?.user || null;
  const accessToken = session?.access_token || null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            isLoggedIn={Boolean(user)}
            userEmail={user?.email}
            onGoToApp={() => navigate("/app")}
            onGoToAuth={() => navigate("/auth")}
            onGoToPrivacy={() => navigate("/privacy")}
            onGoToTerms={() => navigate("/terms")}
          />
        }
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            authMode={authMode}
            setAuthMode={setAuthMode}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authLoading={authLoading}
            authError={authError}
            authNotice={authNotice}
            onAuthSubmit={handleAuthSubmit}
            isLoggedIn={Boolean(user)}
            userEmail={user?.email}
            onGoToApp={() => navigate("/app")}
            onGoToLanding={() => navigate("/")}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/app"
        element={
          !authInitialized ? (
            <SessionLoadingScreen />
          ) : user ? (
            <ScanPage
              user={user}
              authToken={accessToken}
              plan={plan}
              onSignOut={handleSignOut}
              onGoToHistory={() => navigate("/app/history")}
              onGoToDashboard={() => navigate("/app/dashboard")}
              onGoToProfile={() => navigate("/app/profile")}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/app/history"
        element={
          !authInitialized ? (
            <SessionLoadingScreen />
          ) : user ? (
            <HistoryPage
              user={user}
              authToken={accessToken}
              plan={plan}
              onGoToScan={() => navigate("/app")}
              onGoToDashboard={() => navigate("/app/dashboard")}
              onGoToProfile={() => navigate("/app/profile")}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/app/dashboard"
        element={
          !authInitialized ? (
            <SessionLoadingScreen />
          ) : user ? (
            <DashboardPage
              user={user}
              plan={plan}
              onGoToScan={() => navigate("/app")}
              onGoToHistory={() => navigate("/app/history")}
              onGoToProfile={() => navigate("/app/profile")}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/app/profile"
        element={
          !authInitialized ? (
            <SessionLoadingScreen />
          ) : user ? (
            <ProfilePage
              user={user}
              authToken={accessToken}
              plan={plan}
              onGoToScan={() => navigate("/app")}
              onGoToHistory={() => navigate("/app/history")}
              onGoToDashboard={() => navigate("/app/dashboard")}
              onSignOut={handleSignOut}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/privacy" element={<PrivacyPage onGoHome={() => navigate("/")} />} />
      <Route path="/terms" element={<TermsPage onGoHome={() => navigate("/")} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
