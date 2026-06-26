import React, { useEffect, useState } from "react";
import { 
  Heart, ShieldCheck, Activity, Users, FileText, QrCode, Scan, ArrowRight, ShieldAlert,
  Menu, X, Lock, CheckCircle2, User as UserIcon, Calendar, Landmark
} from "lucide-react";
import Navbar from "./components/Navbar.js";
import AuthForm from "./components/AuthForm.js";
import ProfileForm from "./components/ProfileForm.js";
import QRGenerator from "./components/QRGenerator.js";
import QRScanner from "./components/QRScanner.js";
import EmergencyCard from "./components/EmergencyCard.js";
import AdminDashboard from "./components/AdminDashboard.js";
import PWAInstallPrompt from "./components/PWAInstallPrompt.js";
import { User, AuthState } from "./types.js";

export default function App() {
  const [route, setRoute] = useState("home");
  const [routeParams, setRouteParams] = useState<any>({});
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [alert, setAlert] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parse path on load to detect emergency scans or explicit page paths
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith("/emergency/")) {
        const parts = path.split("/emergency/");
        const id = parts[parts.length - 1];
        setRoute("emergency");
        setRouteParams({ id });
      } else if (path === "/scan") {
        setRoute("scan");
      } else if (path === "/dashboard" || path === "/profile") {
        setRoute("dashboard");
      } else if (path === "/qr") {
        setRoute("qr");
      } else if (path === "/admin") {
        setRoute("admin");
      } else {
        setRoute("home");
      }
    };

    handleUrlRouting();
    window.addEventListener("popstate", handleUrlRouting);
    return () => window.removeEventListener("popstate", handleUrlRouting);
  }, []);

  // Validate active sessions on boot
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("lifeline_token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token stale, flush
          localStorage.removeItem("lifeline_token");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      }
    };

    validateSession();
  }, []);

  const navigate = (newRoute: string, params: any = {}) => {
    setRoute(newRoute);
    setRouteParams(params);
    setMobileMenuOpen(false);

    let newPath = "/";
    if (newRoute === "emergency" && params.id) {
      newPath = `/emergency/${params.id}`;
    } else if (newRoute !== "home") {
      newPath = `/${newRoute}`;
    }

    window.history.pushState(null, "", newPath);
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    localStorage.setItem("lifeline_token", token);
    setUser(userData);
    navigate("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("lifeline_token");
    setUser(null);
    navigate("home");
    showNotification("Successfully logged out.", "success");
  };

  const showNotification = (text: string, type: "success" | "error") => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Render main content area
  const renderView = () => {
    switch (route) {
      case "emergency":
        return (
          <EmergencyCard
            userId={routeParams.id}
            onShowMessage={showNotification}
            onBack={() => navigate("home")}
          />
        );
      
      case "auth":
        return (
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            onShowMessage={showNotification}
          />
        );

      case "dashboard":
        if (!user) {
          return <AuthForm onAuthSuccess={handleAuthSuccess} onShowMessage={showNotification} />;
        }
        return (
          <ProfileForm
            user={user}
            onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
            onShowMessage={showNotification}
          />
        );

      case "qr":
        if (!user) {
          return <AuthForm onAuthSuccess={handleAuthSuccess} onShowMessage={showNotification} />;
        }
        return (
          <QRGenerator
            user={user}
            onShowMessage={showNotification}
          />
        );

      case "scan":
        return (
          <QRScanner
            onScanSuccess={(scannedUserId) => navigate("emergency", { id: scannedUserId })}
            onShowMessage={showNotification}
          />
        );

      case "admin":
        if (!user || user.role !== "admin") {
          return (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
              <Lock className="h-12 w-12 text-red-500 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-900 mt-4">Access Restricted</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Administrative privileges are required. Please log in using the bootstrapped credentials.
              </p>
              <button
                onClick={() => navigate("auth")}
                className="mt-6 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700"
              >
                Go to Sign In
              </button>
            </div>
          );
        }
        return <AdminDashboard onShowMessage={showNotification} />;

      case "home":
      default:
        return renderHome();
    }
  };

  const renderHome = () => {
    return (
      <div className="space-y-16 py-8">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-100">
            <ShieldCheck className="h-4 w-4" />
            Active Digital Health Initiative
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 leading-none">
            Your Medical Identity <br />
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              In A Single QR Scan
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
            Create a secure medical ID profile. Paramedics, emergency responders, and doctors scan your custom QR code to view allergies, conditions, and contacts instantly without needing account logins.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate("qr")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-red-150 hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all"
                  id="home-my-qr-btn"
                >
                  <QrCode className="h-4.5 w-4.5" />
                  View My QR ID Card
                </button>
                <button
                  onClick={() => navigate("dashboard")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                  id="home-edit-profile-btn"
                >
                  Edit Health Card
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("auth")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-red-150 hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all"
                  id="home-register-btn"
                >
                  Get Your LifelineID QR
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => navigate("scan")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                  id="home-scan-btn"
                >
                  <Scan className="h-4.5 w-4.5 text-red-600 animate-pulse" />
                  Scan Emergency QR Code
                </button>
              </>
            )}
          </div>
        </section>

        {/* PERSISTENT STATUS CARDS FOR LOGGED-IN USERS */}
        {user && (
          <section className="mx-auto max-w-4xl px-4">
            <div className="bento-card bg-gradient-to-br from-white to-rose-50/10 hover:shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 shrink-0">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-red-600 tracking-wider">Quick Access Details</span>
                  <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">
                    Blood: <span className="text-red-600 font-black">{user.bloodGroup || "O+"}</span> • Age: {user.age} yrs
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => navigate("qr")}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 transition-colors border border-red-100"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Show QR
                </button>
                <button
                  onClick={() => navigate("dashboard")}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-gray-700 text-xs font-bold py-2.5 px-4 transition-colors border border-gray-200 hover:bg-gray-50"
                >
                  Update Vitals
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FEATURES GRID */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Designed for Life-Saving Scenarios</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">
              Losing seconds can cost lives. Our system operates synchronously to solve extreme constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bento-card space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Downloadable Medical QR ID</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Download high-resolution sticker assets for your driver's license, helmet, motorcycle jacket, or wallet insert. Responders instantly decode with no delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bento-card space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Critical First Responder Brief</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Public profile bypasses log-ins entirely. Displays only severe allergies, conditions, and daily medications first, alongside immediate family click-to-dial links.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bento-card space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Gemini Clinical Advisor</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Leverages the cutting-edge Gemini model server-side to instantly construct responder advice, highlighting potential interaction hazards and first-aid protocols on load.
              </p>
            </div>
          </div>
        </section>

        {/* BOOTSTRAPPED ADMIN NOTICE */}
        <section className="mx-auto max-w-4xl px-4">
          <div className="bento-card bg-slate-50 border-slate-200/80 text-center space-y-2">
            <p className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
              Administrative Role Notice
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
              Preconfigured administrator email accounts are seeded securely in the backend. Signing in using an authorized administrator email elevates the account, granting full access to system metrics, recent scan logs, and patient registries.
            </p>
          </div>
        </section>

      </div>
    );
  };

  const isEmergencyView = route === "emergency";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
      
      {/* Conditionally hide navigation and layout padding during an active emergency profile view to ensure max-readability on small paramedic screens */}
      {!isEmergencyView && (
        <Navbar
          user={user}
          onNavigate={navigate}
          currentRoute={route}
          onLogout={handleLogout}
        />
      )}

      {/* ALERT NOTIFICATIONS */}
      {alert && (
        <div className="fixed top-20 right-4 z-[100] max-w-sm rounded-2xl p-4 shadow-xl border bg-white animate-bounce" id="global-alert-toast">
          <div className="flex gap-3">
            <CheckCircle2 className={`h-5 w-5 shrink-0 ${alert.type === "success" ? "text-green-600" : "text-red-600"}`} />
            <p className="text-xs font-bold text-gray-800 leading-normal">{alert.text}</p>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER TOGGLE (Only if not in emergency responder view) */}
      {!isEmergencyView && (
        <div className="md:hidden sticky top-16 z-40 bg-white/60 backdrop-blur-md px-4 py-2 border-b border-rose-50/50 flex justify-between items-center">
          <span className="text-[10px] uppercase font-black text-gray-400">Navigation Menu</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* MOBILE DRAWER ACCORDION */}
      {!isEmergencyView && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 py-4 space-y-2 animate-fadeIn z-35 relative">
          <button
            onClick={() => navigate("home")}
            className="block w-full text-left rounded-xl p-3 text-xs font-extrabold text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            Home / Landing
          </button>
          <button
            onClick={() => navigate("scan")}
            className="block w-full text-left rounded-xl p-3 text-xs font-extrabold text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            Scan QR
          </button>
          {user && (
            <>
              <button
                onClick={() => navigate("dashboard")}
                className="block w-full text-left rounded-xl p-3 text-xs font-extrabold text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                My Profile
              </button>
              <button
                onClick={() => navigate("qr")}
                className="block w-full text-left rounded-xl p-3 text-xs font-extrabold text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                My QR Code
              </button>
              {user.role === "admin" && (
                <button
                  onClick={() => navigate("admin")}
                  className="block w-full text-left rounded-xl p-3 text-xs font-extrabold text-rose-700 hover:bg-rose-50"
                >
                  Admin Panel
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className={`flex-1 ${isEmergencyView ? "p-0" : "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4"}`}>
        {renderView()}
      </main>

      {/* FOOTER */}
      {!isEmergencyView && (
        <footer className="border-t border-rose-100 bg-white py-6 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-2">
            <p className="text-xs font-extrabold text-gray-800">
              LifelineID Emergency QR System • Secure Medical Cards
            </p>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              Designed for paramedics, doctors, and first responders to access critical health profile data instantly during roadside emergencies. All medical cards are verified and compliant with secure digital storage specifications.
            </p>
          </div>
        </footer>
      )}

      {/* PWA INSTALLATION POPUP */}
      <PWAInstallPrompt onShowMessage={showNotification} />

    </div>
  );
}
