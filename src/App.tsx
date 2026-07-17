import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { MobileSimulator } from "./components/MobileSimulator";
import { AdminCMS } from "./components/AdminCMS";
import { 
  ShieldCheck, HelpCircle, ArrowRight, Star, Layers, Laptop, 
  MapPin, CheckCircle, Wrench, RefreshCw, Sparkles, Server, CreditCard
} from "lucide-react";

function MainLayout() {
  const { config, currentUser, userRole, setCurrentUser, setUserRole } = useApp();
  const [pathname, setPathname] = useState(window.location.pathname);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Ecosystem Master Control Deck Header - Adaptive Based on Path */}
      {isAdmin ? (
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
              onClick={() => navigateTo("/")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm font-sans cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Go to Client App</span>
            </button>
          </div>
        </header>
      ) : (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/10">
              FH
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center">
                <span>FreelanceHub Africa</span>
                <span className="ml-2 px-2 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold uppercase tracking-widest">
                  Secure Escrow Marketplace
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateTo("/admin")}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm font-sans cursor-pointer"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Main Double-Pane Interactive Workspace Grid (Styled to act as standalone full width when routed) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        
        {/* Left Pane: Immersive Mobile App Simulator Container */}
        <div className={`bg-slate-100/60 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto max-h-screen ${isAdmin ? "hidden" : "xl:col-span-12 w-full"}`}>
          <div className="w-full max-w-sm mb-3 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono flex items-center space-x-1">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Client App</span>
            </span>
            {currentUser && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Vetted Session: {currentUser.firstName} ({currentUser.role})
              </span>
            )}
          </div>
          <MobileSimulator />
        </div>

        {/* Right Pane: Responsive Web Super Admin CMS Console Deck */}
        <div className={`overflow-y-auto max-h-screen bg-slate-50 ${!isAdmin ? "hidden" : "xl:col-span-12 w-full"}`}>
          <AdminCMS />
        </div>

      </div>

      {/* Sandbox Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-[10px] text-slate-400 font-mono shrink-0">
        FreelanceHub Africa © 2026 • Secure Escrow Contracts • Biometric KYC • Built for Mobile & Web
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
