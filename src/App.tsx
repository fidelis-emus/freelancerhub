import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { MobileSimulator } from "./components/MobileSimulator";
import { AdminCMS } from "./components/AdminCMS";
import { 
  ShieldCheck, HelpCircle, ArrowRight, Star, Layers, Laptop, 
  MapPin, CheckCircle, Wrench, RefreshCw, Sparkles, Server, CreditCard
} from "lucide-react";

function MainLayout() {
  const { config, currentUser, userRole, setCurrentUser, setUserRole } = useApp();
  const [showHowToTest, setShowHowToTest] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Ecosystem Master Control Deck Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/10">
            FH
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center">
              <span>FreelanceHub Africa</span>
              <span className="ml-2 px-2 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold uppercase tracking-widest">
                Ecosystem Sandbox
              </span>
            </h1>
            <p className="hidden text-[11px] text-slate-500 font-mono mt-0.5">
              Verified Escrows • Biometric KYC Scans • Gemini AI Agent Integrations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowHowToTest(!showHowToTest)}
            className="hidden px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Sandbox Guide</span>
          </button>
        </div>
      </header>

      {/* Dynamic Sandbox How To Test Banner */}
      {showHowToTest && (
        <div className="hidden bg-emerald-50/60 border-b border-emerald-100 px-6 py-4.5 text-xs text-slate-700 leading-relaxed flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <h4 className="font-extrabold text-emerald-800 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>How to verify the ecosystem mechanics:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <span className="font-bold text-emerald-700 block mb-0.5">1. Order Secure Escrow</span>
                Book Emeka the Plumber or Sarah the Dev inside the Phone Simulator. Your wallet locks funds immediately, preserving the contract.
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <span className="font-bold text-emerald-700 block mb-0.5">2. Track & Chat (Uber-style)</span>
                Switch to Freelancer role via Quick Login, accept the gig, advance steps (GPS moving simulation) and exchange real-time chats.
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                <span className="font-bold text-emerald-700 block mb-0.5">3. Super Admin CMS Sync</span>
                Add a category or verify KYC ID scans in the Web Admin desk. Changes immediately sync and reflect inside the Mobile phone preview!
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowHowToTest(false)}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 self-start lg:self-center shrink-0"
          >
            Dismiss Guide
          </button>
        </div>
      )}

      {/* Main Double-Pane Interactive Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        
        {/* Left Pane: Immersive Mobile App Simulator Container (xl:col-span-5) */}
        <div className="xl:col-span-5 bg-slate-100/60 flex flex-col items-center justify-center p-6 border-b xl:border-b-0 xl:border-r border-slate-200 overflow-y-auto max-h-screen">
          <div className="w-full max-w-sm mb-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-mono flex items-center space-x-1">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Device preview</span>
            </span>
            {currentUser && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Logged in: {currentUser.firstName} ({currentUser.role})
              </span>
            )}
          </div>
          <MobileSimulator />
        </div>

        {/* Right Pane: Responsive Web Super Admin CMS Console Deck (xl:col-span-7) */}
        <div className="xl:col-span-7 overflow-y-auto max-h-screen">
          <AdminCMS />
        </div>

      </div>

      {/* Sandbox Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-[10px] text-slate-400 font-mono shrink-0">
        FreelanceHub Africa Sandbox © 2026 • Secure Escrow Contracts • biometric verification logs • powered by Gemini-3.5-flash
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
