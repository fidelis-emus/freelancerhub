import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { MobileSimulator } from "./components/MobileSimulator";
import { AdminCMS } from "./components/AdminCMS";
import { WebsiteLandingPage } from "./components/WebsiteLandingPage";
import { 
  ShieldCheck, HelpCircle, ArrowRight, Star, Layers, Laptop, 
  MapPin, CheckCircle, Wrench, RefreshCw, Sparkles, Server, CreditCard, ArrowLeft
} from "lucide-react";

function MainLayout() {
  const { config, currentUser, setCurrentUser, setUserRole } = useApp();
  const [pathname, setPathname] = useState(window.location.pathname);
  const [viewMode, setViewMode] = useState<"website" | "app">("website");

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin");

  // If in admin mode, show the super admin CMS immediately
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        {/* Ecosystem Master Control Deck Header - Adaptive Based on Path */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/10">
              FH
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center">
                <span>FreelanceHub Admin Console</span>
                <span className="ml-2 px-2 py-0.5 text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 rounded-full font-bold uppercase tracking-widest">
                  SUPERUSER SYSTEM
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Escrow Routing • KYC Approvals • Platform Config
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { navigateTo("/"); setViewMode("website"); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm font-sans cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Client Landing Page</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto max-h-screen bg-slate-50">
          <AdminCMS />
        </div>

        <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-[10px] text-slate-400 font-mono shrink-0">
          FreelanceHub Africa © 2026 • Secure Escrow Contracts • Biometric KYC • Super Admin CMS Dashboard
        </footer>
      </div>
    );
  }

  // If we are in website view mode
  if (viewMode === "website") {
    return (
      <WebsiteLandingPage 
        onLaunchApp={(role) => {
          if (role) {
            setUserRole(role);
          }
          setViewMode("app");
        }} 
        onNavigateToAdmin={() => navigateTo("/admin")}
      />
    );
  }

  // Otherwise, render the high fidelity client mobile simulator app
  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans flex flex-col">
      {/* Dynamic top bar returning to the Marketplace landing page */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center text-xs shrink-0 shadow-sm">
        <button 
          onClick={() => setViewMode("website")}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-emerald-600 font-bold transition text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace Website</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
            <Server className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Interactive Simulator</span>
          </span>
          {currentUser && (
            <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {currentUser.firstName} ({currentUser.role})
            </span>
          )}
        </div>
      </div>

      {/* Embedded Simulator Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-48px)]">
        <MobileSimulator />
      </div>

      <footer className="bg-white border-t border-slate-200 py-2 text-center text-[9px] text-slate-400 font-mono shrink-0">
        Demo Mode Active • Escrow wallet operations use local state sandbox sandbox
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
