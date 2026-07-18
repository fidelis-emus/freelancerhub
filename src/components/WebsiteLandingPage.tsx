import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Smartphone, Download, Search, Star, CheckCircle, ShieldCheck, 
  HelpCircle, Phone, Mail, MapPin, Menu, X, ChevronRight, ArrowRight, 
  Shield, Laptop, Compass, Trash2, Mic, Briefcase, Sprout, DollarSign, 
  Check, Lock, Award, Users, AlertCircle, FileText, ExternalLink,
  ChevronDown, ChevronUp, ChevronLeft, Sliders, Play, Pause
} from "lucide-react";

interface WebsiteLandingPageProps {
  onLaunchApp: (role?: "customer" | "freelancer") => void;
  onNavigateToAdmin: () => void;
}

export function WebsiteLandingPage({ onLaunchApp, onNavigateToAdmin }: WebsiteLandingPageProps) {
  const { freelancers, categories, config } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [detectedDevice, setDetectedDevice] = useState("Android Device");
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<"android" | "ios" | "windows" | "mac" | "linux">("android");
  const [apkDownloadState, setApkDownloadState] = useState<"idle" | "downloading" | "completed">("idle");
  const [apkProgress, setApkProgress] = useState(0);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Slideshow, Mega Menu, and Marquee States
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [megaMenuSearch, setMegaMenuSearch] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [marqueeIsHovered, setMarqueeIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Simple Device Detection
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      setDetectedDevice("Android Phone");
      setSelectedDeviceTab("android");
    } else if (/iphone|ipad|ipod/.test(ua)) {
      setDetectedDevice("Apple iPhone/iPad");
      setSelectedDeviceTab("ios");
    } else if (/windows/.test(ua)) {
      setDetectedDevice("Windows PC");
      setSelectedDeviceTab("windows");
    } else if (/mac/.test(ua)) {
      setDetectedDevice("macOS Device");
      setSelectedDeviceTab("mac");
    } else {
      setDetectedDevice("Linux / Desktop");
      setSelectedDeviceTab("android");
    }
  }, []);

  // Dynamic Industry mapping helper for Mega Menu
  const getCategoryIndustry = (catName: string): string => {
    const name = catName.toLowerCase();
    if (name.includes("home") || name.includes("clean") || name.includes("fumigat") || name.includes("plumb") || name.includes("electric")) {
      return "Home Services";
    }
    if (name.includes("transport") || name.includes("ride") || name.includes("taxi") || name.includes("delivery") || name.includes("keke") || name.includes("dispatch")) {
      return "Transportation";
    }
    if (name.includes("tech") || name.includes("code") || name.includes("develop") || name.includes("design") || name.includes("website") || name.includes("app")) {
      return "Technology";
    }
    if (name.includes("beauty") || name.includes("well") || name.includes("hair") || name.includes("barber") || name.includes("spa") || name.includes("salon")) {
      return "Beauty & Wellness";
    }
    if (name.includes("build") || name.includes("construct") || name.includes("architect") || name.includes("tiler") || name.includes("mason") || name.includes("carpenter")) {
      return "Construction & Building";
    }
    if (name.includes("farm") || name.includes("agri") || name.includes("poultry") || name.includes("sprout")) {
      return "Agriculture";
    }
    return "Business & Creative Services";
  };

  const slides = config.heroSlides || [];
  const slideInterval = config.slideshowTransitionInterval || 5000;

  // Slideshow automatic rotation
  useEffect(() => {
    if (slides.length <= 1 || isSlidePaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, slideInterval);
    return () => clearInterval(interval);
  }, [slides.length, slideInterval, isSlidePaused]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) { // minimum distance for swipe
      if (diff > 0) {
        // Swipe left -> Next Slide
        setCurrentSlideIndex(prev => (prev + 1) % slides.length);
      } else {
        // Swipe right -> Prev Slide
        setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Handle Simulated APK download
  const startApkDownload = () => {
    setApkDownloadState("downloading");
    setApkProgress(0);
    const interval = setInterval(() => {
      setApkProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setApkDownloadState("completed");
          // Trigger actual mock file download
          const fileData = {
            appName: config.appName,
            version: config.apkVersion || "2.1.0",
            downloadTimestamp: new Date().toISOString(),
            status: "ready_to_install",
            installInstructions: "On your Android device, open Settings -> Security -> Install Unknown Apps, and allow your browser. Then open this file to install."
          };
          const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `FreelanceHub_Africa_v${config.apkVersion || "2.1.0"}.apk.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // Filter freelancers for searching
  const filteredFreelancers = freelancers.filter(f => {
    const matchesSearch = searchQuery === "" || 
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.businessName && f.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.servicesOffered?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCatFilter === "" || f.categories?.includes(selectedCatFilter);
    return matchesSearch && matchesCat;
  });

  // Category Icon Resolver
  const getCatIcon = (name: string) => {
    switch (name) {
      case "Wrench": return <WrenchIcon className="w-5 h-5 text-emerald-600" />;
      case "Car": return <Compass className="w-5 h-5 text-emerald-600" />;
      case "Building2": return <Award className="w-5 h-5 text-emerald-600" />;
      case "Sparkles": return <SparklesIcon className="w-5 h-5 text-emerald-600" />;
      case "Laptop": return <Laptop className="w-5 h-5 text-emerald-600" />;
      case "Trash2": return <Trash2 className="w-5 h-5 text-emerald-600" />;
      case "Mic": return <Mic className="w-5 h-5 text-emerald-600" />;
      case "Briefcase": return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case "Sprout": return <Sprout className="w-5 h-5 text-emerald-600" />;
      default: return <WrenchIcon className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900" id="landing-root">
      
      {/* 1. NAVIGATION BAR WITH MEGA MENU & RESPONSIVE MOBILE DRAWER */}
      <nav className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all" id="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} id="nav-logo">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/20">
                {config.headerLogo || "FH"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">{config.appName}</span>
                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest leading-none mt-1">Escrow Network</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600" id="nav-desktop-links">
              <a href="#hero" className="hover:text-emerald-600 transition font-bold">Home</a>
              
              {/* Category Mega Menu Hover Trigger */}
              <div 
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button 
                  className="flex items-center space-x-1 hover:text-emerald-600 transition py-2 font-bold focus:outline-none"
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180 text-emerald-600" : ""}`} />
                </button>

                {/* THE CARD-STYLE MEGA MENU dropdown panel */}
                {isMegaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-[420px] w-[880px] bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 grid grid-cols-12 gap-6 z-50 text-left mt-1 text-xs transform origin-top transition-all duration-200">
                    
                    {/* Header Area inside Mega Menu with Search box */}
                    <div className="col-span-12 flex justify-between items-center pb-3.5 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Service Category Directory</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Explore certified, background-checked African local professionals and technicians</p>
                      </div>
                      <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Search categories (e.g. plumber, lawyer)..."
                          value={megaMenuSearch}
                          onChange={(e) => setMegaMenuSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px] font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Columns: Grouped Categories */}
                    <div className="col-span-9 grid grid-cols-3 gap-5 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                      {["Home Services", "Transportation", "Technology", "Beauty & Wellness", "Construction & Building", "Agriculture", "Business & Creative Services"].map(industry => {
                        const filteredCats = categories.filter(c => 
                          getCategoryIndustry(c.name) === industry &&
                          (megaMenuSearch === "" || 
                           c.name.toLowerCase().includes(megaMenuSearch.toLowerCase()) || 
                           c.description.toLowerCase().includes(megaMenuSearch.toLowerCase()) ||
                           c.subcategories.some(s => s.toLowerCase().includes(megaMenuSearch.toLowerCase())))
                        );

                        if (filteredCats.length === 0) return null;

                        return (
                          <div key={industry} className="space-y-3">
                            <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 pb-1">{industry}</h5>
                            <div className="space-y-1.5">
                              {filteredCats.map(cat => {
                                const details = config.categoryDetails?.[cat.id] || { tagline: cat.description };
                                return (
                                  <a
                                    key={cat.id}
                                    href="#find-freelancers"
                                    onClick={() => {
                                      setSelectedCatFilter(cat.id);
                                      setIsMegaMenuOpen(false);
                                    }}
                                    className="group block p-2 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100/50 transition duration-150"
                                  >
                                    <div className="flex items-start space-x-2.5">
                                      <div className="p-1.5 bg-slate-50 group-hover:bg-emerald-50 rounded-lg transition shrink-0">
                                        {getCatIcon(cat.iconName)}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-extrabold text-slate-800 group-hover:text-emerald-700 block transition leading-none text-[11px]">{cat.name}</span>
                                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 block leading-tight mt-0.5 truncate">{details.tagline || cat.description}</span>
                                      </div>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right column promo inside Mega Menu */}
                    <div className="col-span-3 bg-slate-50/80 rounded-2xl p-4 flex flex-col justify-between border border-slate-100">
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/50 px-2.5 py-0.5 rounded-full inline-block">Security First</span>
                        <div className="h-24 rounded-xl overflow-hidden relative shadow-sm">
                          <img 
                            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&auto=format&fit=crop&q=80" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2.5 flex flex-col justify-end text-left">
                            <span className="text-white font-extrabold text-[10px] leading-tight">Escrow System Enabled</span>
                            <p className="text-white/80 text-[8px] leading-none mt-0.5">Funds are released only when you are happy</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Our Super Admin CMS controls active payments. No upfront cash leaks or project abandonment.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          onLaunchApp();
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition text-center shadow-sm"
                      >
                        Launch Simulator demo
                      </button>
                    </div>

                  </div>
                )}
              </div>

              <a href="#find-freelancers" className="hover:text-emerald-600 transition font-bold">Find Freelancers</a>
              <a href="#how-it-works" className="hover:text-emerald-600 transition font-bold">How It Works</a>
              <a href="#why-choose-us" className="hover:text-emerald-600 transition font-bold">Why Us</a>
              <a href="#faq" className="hover:text-emerald-600 transition font-bold">FAQ</a>
            </div>

            {/* Right Buttons: Call To Actions */}
            <div className="hidden md:flex items-center space-x-3" id="nav-desktop-ctas">
              <button 
                onClick={() => onLaunchApp("customer")}
                className="px-4 py-2 text-slate-700 hover:text-emerald-600 text-xs font-bold transition"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => onLaunchApp("freelancer")}
                className="px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold transition border border-emerald-100"
              >
                Become a Pro
              </button>

              {/* Download APK button */}
              <button 
                onClick={() => { setApkDownloadState("idle"); setDownloadModalOpen(true); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-slate-900/10 hover:bg-slate-800"
                id="nav-download-apk-btn"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download APK</span>
              </button>

              <button 
                onClick={() => onLaunchApp()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold tracking-wide transition shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20"
                id="nav-launch-app-btn"
              >
                Launch App Live Demo
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => { setApkDownloadState("idle"); setDownloadModalOpen(true); }}
                className="p-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px]">APK</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-950 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* 2. RESPONSIVE MOBILE CATEGORIES & NAVIGATION SLIDE-OUT DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex justify-end" id="nav-mobile-drawer">
            {/* Drawer Content */}
            <div className="w-[320px] max-w-full bg-white h-screen shadow-2xl flex flex-col animate-slide-in p-5 text-left relative overflow-hidden">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xs">
                    {config.headerLogo || "FH"}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{config.appName} Drawer</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-150 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Category Search box */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search categories..."
                    value={megaMenuSearch}
                    onChange={(e) => setMegaMenuSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Scrollable Categories touch-friendly grid and navigation */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-none">
                
                {/* Regular Navigation Links */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 pb-4 border-b border-slate-100">
                  <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition">Home</a>
                  <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition">How It Works</a>
                  <a href="#why-choose-us" onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition">Why Us</a>
                  <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition">FAQ</a>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Browse Industries</span>
                  
                  {/* Category touch targets - minimum 44px height */}
                  <div className="grid grid-cols-1 gap-2">
                    {categories
                      .filter(c => megaMenuSearch === "" || c.name.toLowerCase().includes(megaMenuSearch.toLowerCase()))
                      .map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCatFilter(cat.id);
                            setIsMobileMenuOpen(false);
                            // Scroll to freelancers
                            const element = document.getElementById("find-freelancers");
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="w-full flex items-center space-x-3 p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl border border-slate-100 hover:border-emerald-100 text-xs transition text-left min-h-[48px] select-none"
                        >
                          <div className="p-1.5 bg-white rounded-lg shrink-0">
                            {getCatIcon(cat.iconName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 hover:text-emerald-700 block text-xs truncate leading-none">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate leading-none mt-1">Explore all specialists</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))}
                  </div>
                </div>

              </div>

              {/* Drawer Actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2 mt-auto">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLaunchApp("customer"); }}
                    className="py-2.5 text-center bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold"
                  >
                    Client login
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLaunchApp("freelancer"); }}
                    className="py-2.5 text-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-100"
                  >
                    Become Pro
                  </button>
                </div>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onLaunchApp(); }}
                  className="w-full py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold tracking-wide shadow-md shadow-emerald-600/15 transition"
                >
                  Launch App Simulator
                </button>
              </div>

            </div>
          </div>
        )}
      </nav>

      {/* CSS STYLES FOR THE HORIZONTAL CONTINUOUS SCROLLING MARQUEE */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-continuous {
          display: flex;
          width: max-content;
          animation: marquee-scroll var(--speed, 35s) linear infinite;
        }
        .animate-marquee-continuous:hover {
          animation-play-state: paused;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 2. HERO SLIDESHOW SECTION */}
      <section 
        className="relative overflow-hidden bg-slate-950 text-white min-h-[500px] md:min-h-[580px] flex flex-col justify-center" 
        id="hero"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Slides list */}
        {slides.length > 0 ? (
          slides.map((slide, idx) => {
            if (!slide.active) return null;
            const isCurrent = idx === currentSlideIndex;
            
            // Handle Transition Effects
            const effect = config.slideshowTransitionEffect || "fade";
            let transitionClass = "opacity-0 pointer-events-none";
            if (isCurrent) {
              transitionClass = "opacity-100 z-10";
            }

            return (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-all duration-[800ms] ease-in-out ${transitionClass}`}
              >
                {/* Backing Image with dynamic zoom effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                      isCurrent && effect === "zoom" ? "scale-110" : "scale-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-20 flex items-center text-left py-12">
                  <div className="max-w-2xl space-y-5">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1 text-[11px] font-bold tracking-tight backdrop-blur-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified African Escrow Labor Network</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                      {slide.title}
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                      {slide.subtitle}
                    </p>

                    {/* Integrated Slideshow Search Controls */}
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                      <div className="flex-1 w-full flex items-center space-x-2 px-3">
                        <Search className="w-5 h-5 text-slate-300 shrink-0" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search plumbers, software devs, AC technicians..."
                          className="w-full py-2 bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-300 text-left"
                        />
                      </div>
                      
                      <div className="w-full sm:w-auto flex space-x-2 shrink-0">
                        <select 
                          value={selectedCatFilter}
                          onChange={(e) => setSelectedCatFilter(e.target.value)}
                          className="px-2.5 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-slate-200 font-bold focus:outline-none"
                        >
                          <option value="" className="bg-slate-950 text-white">All Industries</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id} className="bg-slate-950 text-white">{c.name}</option>
                          ))}
                        </select>
                        
                        <a 
                          href="#find-freelancers"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-md justify-center w-full sm:w-auto"
                        >
                          <span>Discover</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Quick Stats inside Slide overlay */}
                    <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 max-w-lg text-left">
                      <div>
                        <span className="block text-xl font-black text-white leading-none">100% Secure</span>
                        <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">Biometric Vetted</span>
                      </div>
                      <div>
                        <span className="block text-xl font-black text-white leading-none">₦0 Upfront</span>
                        <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">Escrow Protection</span>
                      </div>
                      <div>
                        <span className="block text-xl font-black text-white leading-none">24/7 Live</span>
                        <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">GPS Tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-400">
            No active slideshow banners configured.
          </div>
        )}

        {/* Previous / Next Manual Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-900/40 hover:bg-emerald-600/80 text-white border border-white/10 hover:border-emerald-500 rounded-full flex items-center justify-center transition backdrop-blur-sm"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex(prev => (prev + 1) % slides.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-900/40 hover:bg-emerald-600/80 text-white border border-white/10 hover:border-emerald-500 rounded-full flex items-center justify-center transition backdrop-blur-sm"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex ? "w-6 bg-emerald-500" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. CONTINUOUS CATEGORY MARQUEE SHOWCASE */}
      <section className="bg-slate-900 border-y border-slate-800 py-6 overflow-hidden select-none relative" id="categories-marquee">
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
        
        <div 
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setMarqueeIsHovered(true)}
          onMouseLeave={() => setMarqueeIsHovered(false)}
          onTouchStart={() => setMarqueeIsHovered(true)}
          onTouchEnd={() => setMarqueeIsHovered(false)}
        >
          {/* Continuous scrolling marquee tape */}
          <div 
            className="animate-marquee-continuous" 
            style={{ 
              "--speed": `${config.scrollingMarqueeSpeed || 35}s`,
              "animationPlayState": marqueeIsHovered ? "paused" : "running"
            } as React.CSSProperties}
          >
            {/* Duplicate list to build standard seamless looping */}
            {[
              ...categories.filter(c => c.active), 
              ...categories.filter(c => c.active), 
              ...categories.filter(c => c.active)
            ].map((cat, index) => {
              const details = config.categoryDetails?.[cat.id] || { 
                imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&auto=format&fit=crop&q=80",
                tagline: cat.description
              };
              const count = freelancers.filter(f => f.categories?.includes(cat.id)).length;
              
              return (
                <div 
                  key={`${cat.id}-marquee-${index}`}
                  onClick={() => {
                    setSelectedCatFilter(cat.id);
                    // Scroll to freelancers grid
                    const el = document.getElementById("find-freelancers");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-[240px] shrink-0 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 mx-2.5 transition duration-300 cursor-pointer text-left flex flex-col justify-between h-40 group shadow-lg"
                >
                  <div className="relative h-20 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={details.imageUrl} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                    
                    {/* Icon tag */}
                    <div className="absolute top-2 left-2 p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-emerald-400">
                      {getCatIcon(cat.iconName)}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white text-xs block group-hover:text-emerald-400 transition leading-none truncate w-40">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate leading-none mt-1">
                      {details.tagline || cat.description}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mt-1">
                      {count * 31 + 42} Professionals Online
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED INDUSTRIES GRID SECTION */}
      <section className="py-16 bg-white" id="categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-2 mb-10 text-center">
            <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-full">
              Featured Sectors
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mt-2">
              Our Core Handymen & Digital Agencies
            </h2>
            <p className="text-xs text-slate-400">
              Zero-risk recruitment. Every specialized sector is fully integrated with smart contracts and live dispute arbitration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="categories-grid">
            {categories
              .filter(c => c.active)
              .slice(0, config.featuredCategoriesCount || 6)
              .map(cat => {
                const count = freelancers.filter(f => f.categories?.includes(cat.id)).length;
                const details = config.categoryDetails?.[cat.id] || {
                  imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop&q=80",
                  tagline: cat.description
                };

                return (
                  <div
                    key={cat.id}
                    className="group bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-2.5 transition duration-300 flex flex-col h-[320px] text-left"
                  >
                    {/* Hover zoom image container */}
                    <div className="relative h-44 overflow-hidden shrink-0">
                      <img 
                        src={details.imageUrl} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                      
                      {/* Floating Sector Badge */}
                      <div className="absolute top-4 left-4 p-2 bg-white rounded-xl border border-slate-100 shadow-md text-emerald-600">
                        {getCatIcon(cat.iconName)}
                      </div>
                    </div>

                    {/* Meta section */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            {count} Active Pros
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {details.tagline || cat.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCatFilter(cat.id);
                          const el = document.getElementById("find-freelancers");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow-emerald-600/10 text-center block select-none"
                      >
                        Explore Category
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      </section>

      {/* 4. FIND FREELANCERS (THE DECK) */}
      <section className="py-16 bg-slate-50" id="find-freelancers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="text-left space-y-1">
              <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Active Handymen & Experts</h2>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Hire Verified Vetted Specialists</h3>
              <p className="text-xs text-slate-400">All prices shown are fixed and contract-bound inside our escrow wallet protection framework.</p>
            </div>
            
            {/* Quick search input */}
            <div className="w-full md:w-80 relative">
              <input 
                type="text"
                placeholder="Quick name or skill filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {filteredFreelancers.length === 0 ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto text-xs">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">No Specialists Found</p>
              <p className="mt-1">Try resetting category filters or searching broader words.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCatFilter(""); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="freelancers-grid">
              {filteredFreelancers.map(f => {
                const primaryCat = categories.find(c => f.categories?.includes(c.id))?.name || "Services";
                return (
                  <div 
                    key={f.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-emerald-300 transition flex flex-col justify-between space-y-4 shadow-sm group"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-3 items-center">
                        <img src={f.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0" />
                        <div className="text-left">
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition flex items-center">
                            <span>{f.firstName} {f.lastName}</span>
                            {f.kycStatus === "verified" && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-current ml-1" />
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold block">{f.businessName || "Private Specialist"}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5 text-xs text-amber-500 font-bold shrink-0 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{f.rating.toFixed(1)}</span>
                        <span className="text-[9px] text-slate-400 font-normal">({f.ratingCount})</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left line-clamp-3">
                      {f.bio}
                    </p>

                    {/* Specialties / Services Packages list */}
                    <div className="space-y-1.5 text-left border-t border-slate-100 pt-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pricing &amp; Services</span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {f.servicesList && f.servicesList.length > 0 ? (
                          f.servicesList.map(srv => (
                            <div key={srv.id} className="flex justify-between items-center text-[10px] bg-slate-50 px-2 py-1 rounded-lg">
                              <span className="text-slate-600 truncate max-w-36 font-medium">{srv.name}</span>
                              <span className="font-bold text-emerald-600">₦{srv.price.toLocaleString()}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] bg-slate-50 px-2 py-1.5 rounded-lg text-slate-400">
                            Custom quoted services on request.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Vetted Level</span>
                        <span className="text-[10px] font-extrabold text-slate-800">{f.yearsOfExperience} Years Certified</span>
                      </div>
                      
                      <button 
                        onClick={() => onLaunchApp()}
                        className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 hover:text-white text-white rounded-xl text-[10px] font-bold transition flex items-center space-x-1"
                      >
                        <span>Request Service</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 5. RECENTLY COMPLETED JOBS (SECURED ON PLATFORM) */}
      <section className="py-16 bg-white" id="recently-completed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold font-mono">Proof of Escrow</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">Recent Escrow Success Stories</p>
            <p className="text-xs text-slate-400">See live completed jobs where contract-locked funds were released safely to providers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left" id="recent-jobs">
            
            {/* Story 1 */}
            <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Escrow Released</span>
                <span className="text-[10px] text-slate-400 font-mono">Transaction Hash #ESC-903820</span>
              </div>
              
              <div className="flex space-x-3 items-center">
                <img src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop&q=80" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Emeka Okonkwo</h4>
                  <span className="text-[9px] text-slate-400 font-mono">Master Plumber • Lagos</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="text-xs font-black text-slate-800">Kitchen Pipe Burst Repair</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  "Water was spraying behind the kitchen drawer causing severe POP ceiling leakage. Emeka arrived in 20 minutes, isolated the copper mains, and welded a permanent fix. Superb speed!"
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl flex justify-between items-center border border-slate-150">
                <div className="flex space-x-2 items-center">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Escrow locked</span>
                  <span className="text-xs font-black text-emerald-600">₦9,000</span>
                </div>
                <div className="flex items-center space-x-0.5 text-xs text-amber-500 font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>5.0 rating review</span>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Escrow Released</span>
                <span className="text-[10px] text-slate-400 font-mono">Transaction Hash #ESC-402930</span>
              </div>
              
              <div className="flex space-x-3 items-center">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sarah Wanjiku</h4>
                  <span className="text-[9px] text-slate-400 font-mono">Senior Full Stack Developer • Nairobi</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="text-xs font-black text-slate-800">E-Commerce Checkout System</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  "Needed to integrate a local Paystack / M-Pesa automated split webhook checkout into our custom storefront. Sarah delivered the code with complete test coverages ahead of timeline."
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl flex justify-between items-center border border-slate-150">
                <div className="flex space-x-2 items-center">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Escrow locked</span>
                  <span className="text-xs font-black text-emerald-600">₦350,000</span>
                </div>
                <div className="flex items-center space-x-0.5 text-xs text-amber-500 font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>5.0 rating review</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-16 bg-slate-900 text-white relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-2 mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">Operating Blueprint</h2>
            <p className="text-3xl font-black text-white tracking-tight">How Escrow Protection Works</p>
            <p className="text-xs text-slate-400">Four simple steps protecting both hiring clients and service providers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-3 text-left relative z-10 p-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-600/20">
                01
              </div>
              <h4 className="text-sm font-extrabold text-white">Find &amp; Book Professional</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Browse our verified database of biometric KYC-checked experts. Instantly select their defined fixed-price packages or ask for a custom quote.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 text-left relative z-10 p-4">
              <div className="w-12 h-12 bg-emerald-600/30 border border-emerald-500 rounded-2xl flex items-center justify-center font-black text-lg text-emerald-400">
                02
              </div>
              <h4 className="text-sm font-extrabold text-white">Lock Funds in Secure Escrow</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Approve booking by loading funds. Payments lock inside the platform's multi-vetted escrow bank accounts. Money never reaches the provider upfront.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 text-left relative z-10 p-4">
              <div className="w-12 h-12 bg-emerald-600/30 border border-emerald-500 rounded-2xl flex items-center justify-center font-black text-lg text-emerald-400">
                03
              </div>
              <h4 className="text-sm font-extrabold text-white">Track Progress Live (GPS)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Track en-route handymen with live GPS telemetry. Use our secure encrypted chat to send pictures, voice notes, and discuss delivery metrics.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 text-left relative z-10 p-4">
              <div className="w-12 h-12 bg-emerald-600/30 border border-emerald-500 rounded-2xl flex items-center justify-center font-black text-lg text-emerald-400">
                04
              </div>
              <h4 className="text-sm font-extrabold text-white">Verify Work &amp; Release Payout</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Once satisfied with the completed physical/digital work, tap "Release Escrow" to instantly dispatch funds to the specialist's wallet securely.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="py-16 bg-white" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Unmatched Safety Standards</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">Marketplace Core Shields</p>
            <p className="text-xs text-slate-400">We solve African local service discovery trust challenges through bulletproof mechanisms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left" id="why-grids">
            
            {/* Card 1 */}
            <div className="p-6 border border-slate-150 bg-slate-50/50 rounded-3xl space-y-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Biometric KYC Audits</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every specialist undergoes government passport verification paired with mandatory real-time biometric selfie matching to eliminate fraud entirely.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 border border-slate-150 bg-slate-50/50 rounded-3xl space-y-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Secure Escrow Protection</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We act as a licensed trust intermediary. Money stays isolated in regulated escrow accounts, releasing only when clients validate physical deliverables.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 border border-slate-150 bg-slate-50/50 rounded-3xl space-y-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Active Dispute Arbitration</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Our dedicated Super Admin team mediates transparently in case of discrepancies, reviewing live chats, GPS logs, and uploaded task evidence.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section className="py-16 bg-slate-50" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Client Voices</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">Vetted and Trusted by Thousands</p>
            <p className="text-xs text-slate-400">See how African hirers secure high-quality on-demand contractors risk-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left" id="testimonials-grid">
            
            {/* T1 */}
            <div className="bg-white p-5 border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                "Finding a plumber in Lagos mainland used to be a gamble. On FreelanceHub, I booked Emeka. Knowing my ₦9,000 was held in escrow made me feel totally secure. He arrived on time, was extremely skilled, and the escrow release was seamless!"
              </p>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">FE</div>
                <div>
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">Fidelis Emus</span>
                  <span className="text-[8px] text-slate-400 leading-none">Property Owner • Lagos</span>
                </div>
              </div>
            </div>

            {/* T2 */}
            <div className="bg-white p-5 border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                "I hired a front-end React contractor from Westlands to complete our company's onboarding screens. The project was split into three escrow milestones. Each milestone was inspected and released beautifully. It solved all developer trust barriers."
              </p>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">CK</div>
                <div>
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">Charles Kamau</span>
                  <span className="text-[8px] text-slate-400 leading-none">Tech Lead • Nairobi</span>
                </div>
              </div>
            </div>

            {/* T3 */}
            <div className="bg-white p-5 border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current shrink-0" />)}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                "We had a major electrical breaker trip at our processing plant on a Saturday. We booked Kwesi instantly. The platform automatically calculated the 50% Emergency levy. The total break-down was fully transparent. Solved in 2 hours!"
              </p>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">AA</div>
                <div>
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">Alhaji Aminu</span>
                  <span className="text-[8px] text-slate-400 leading-none">Factory Manager • Accra</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. DOWNLOAD MOBILE APP SECTION */}
      <section className="py-16 bg-gradient-to-tr from-emerald-950 to-slate-950 text-white relative overflow-hidden" id="download-app">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-emerald-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">Go Mobile</h2>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">Get the FreelanceHub Africa App</h3>
              <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-xl">
                Gain lightning-fast, native device access on your Android or Apple phone. Built with low data consumption optimization, offline capabilities, real-time push notification alarms, and biometric secure fingerprint lockups.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {/* Simulated APK download trigger */}
                <button
                  onClick={() => { setApkDownloadState("idle"); setDownloadModalOpen(true); }}
                  className="px-6 py-3.5 bg-white text-slate-950 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-white/5 border border-white hover:bg-slate-100"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">Direct Download</span>
                    <span className="text-[11px] font-black text-slate-900">Android APK v{config.apkVersion || "2.1.0"}</span>
                  </div>
                </button>

                <button
                  onClick={() => { setApkDownloadState("idle"); setDownloadModalOpen(true); }}
                  className="px-6 py-3.5 bg-slate-900/60 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-2 border border-slate-800 hover:bg-slate-900"
                >
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">Download on the</span>
                    <span className="text-[11px] font-black text-white">Apple App Store</span>
                  </div>
                </button>
              </div>

              {/* Version indicator details */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl max-w-md">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5 font-mono">
                  <span>RELEASE VERSION: {config.apkVersion || "2.1.0"}</span>
                  <span>SIZE: {config.apkSize || "18.4 MB"}</span>
                </div>
                <p className="text-[9px] text-emerald-300 leading-relaxed font-mono">
                  {config.apkReleaseNotes || "Includes fully compliant Escrow Wallet synchronization, push notification alerts, and automated biometric selfie verification checks."}
                </p>
              </div>

            </div>

            {/* Simulated app features checklist */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 max-w-lg">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">App Exclusive Benefits</span>
              
              <div className="space-y-3">
                <div className="flex space-x-3 items-start text-xs">
                  <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Biometric Fingerprint Passkey</span>
                    <span className="text-[10px] text-slate-400">Lock your escrow wallet & credentials behind high-security biometrics on your phone.</span>
                  </div>
                </div>

                <div className="flex space-x-3 items-start text-xs">
                  <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Regulated Offline Contracts</span>
                    <span className="text-[10px] text-slate-400">Review assigned job instructions, milestones and offline maps even when cellular data is cut off.</span>
                  </div>
                </div>

                <div className="flex space-x-3 items-start text-xs">
                  <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Active Geofencing Alarms</span>
                    <span className="text-[10px] text-slate-400">Receive micro-notifications the second your technician enters or exits your home's GPS bubble.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="py-16 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-2 mb-12">
            <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Knowledge Center</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</p>
            <p className="text-xs text-slate-400">Find answers regarding Escrow safety, KYC Vetting, and Fee calculation dynamics.</p>
          </div>

          <div className="space-y-3 text-left">
            {config.faqs.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full p-5 flex justify-between items-center text-xs font-bold text-slate-800 hover:bg-slate-100/50 focus:outline-none transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-emerald-600 font-bold font-mono">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. CONTACT SECTION */}
      <section className="py-16 bg-slate-50" id="contact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Contact Details Left */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between text-left space-y-8">
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white">Contact Our Escrow Operations</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Have questions about our commission rates, integrating our API backend, or partnership opportunities? Reach out anytime.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">Operations Hotline</span>
                    <span className="font-bold text-white">{config.contactPhone || "+234 812 345 6789"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">Operations Email</span>
                    <span className="font-bold text-white">{config.contactEmail || "support@freelancehub.africa"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">Escrow Head Office</span>
                    <span className="font-bold text-white">Admiralty Way, Lekki Phase 1, Lagos, Nigeria</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[9px] text-slate-400 leading-relaxed font-mono">
                Approved Intermediary Escrow Operations Board • Licensed in compliance with local transaction guidelines.
              </div>
            </div>

            {/* Inquiry Form Right */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-600">Operations Desk</h3>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Send Us an Inquiry</h4>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Simulated message sent! Our Escrow support team will review this instantly."); }} className="space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                      placeholder="e.g. Fidelis Emus" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                      placeholder="e.g. fidelis@gmail.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Subject Topic</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                    placeholder="e.g. Escrow Dispute / Partnership proposal" 
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Detailed Message Description</label>
                  <textarea 
                    required 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 h-24 resize-none" 
                    placeholder="How can our compliance operations desk assist you today?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10"
                >
                  Send Compliance Message
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white px-6 py-12 text-left" id="footer-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
                {config.headerLogo || "FH"}
              </div>
              <span className="text-base font-extrabold text-white">{config.appName}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
              Ecosystem holding trust escrow accounts to solve African services discoverability, low-quality labor delivery, and upfront payment risks.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Resource Directory</h4>
            <ul className="space-y-2 text-slate-300 text-[10px]">
              <li><a href="#hero" className="hover:text-emerald-400 transition">Marketplace Home</a></li>
              <li><a href="#categories" className="hover:text-emerald-400 transition">Skill Categories</a></li>
              <li><a href="#find-freelancers" className="hover:text-emerald-400 transition">Vetted Contractors</a></li>
              <li><a href="#recently-completed" className="hover:text-emerald-400 transition">Proof of Escrow</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Superuser Administration</h4>
            <ul className="space-y-2 text-slate-300 text-[10px]">
              <li><button onClick={onNavigateToAdmin} className="hover:text-emerald-400 transition text-left cursor-pointer font-bold">Admin CMS Console →</button></li>
              <li><span className="text-slate-500 block">Biometric Audits</span></li>
              <li><span className="text-slate-500 block">Bank Settlement Routes</span></li>
              <li><span className="text-slate-500 block">Dispute Resolution Desk</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-[9px]">Legal Regulations</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Escrow system operations are isolated under fully compliant financial regulations. Standard split platform fees and local taxation charges apply dynamically.
            </p>
            <div className="flex space-x-2 text-[10px] text-slate-500">
              <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 text-center text-[10px] text-slate-500 font-mono">
          {config.appName} © 2026 • Secure Escrow Platform • Biometric KYC • Built for Mobile &amp; Web • Designed with Desktop-First Precision
        </div>
      </footer>

      {/* 13. SMART DEVICE DETECTION DOWNLOAD MODAL */}
      {downloadModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="apk-download-modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative space-y-4 text-left border border-slate-100 shadow-2xl">
            
            <button 
              onClick={() => { setDownloadModalOpen(false); setApkDownloadState("idle"); }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Download Mobile Application</h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Smart Detection</span>
                  <span className="text-[9px] text-slate-400">Detected Device: <strong>{detectedDevice}</strong></span>
                </div>
              </div>
            </div>

            {/* Smart device recommendation alert */}
            <div className="bg-emerald-50/50 border border-emerald-100/40 p-3.5 rounded-2xl text-[11px] text-emerald-800 leading-relaxed flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                {selectedDeviceTab === "android" && "Android detected! Direct APK download is fully available. This lightweight package installs natively with absolute secure wallet integration."}
                {selectedDeviceTab === "ios" && "Apple iPhone detected! The client PWA is ready. Add to Home Screen directly from Safari or launch our App Simulator."}
                {selectedDeviceTab === "windows" && "Windows detected! Use the simulated Android emulator setup or load as a standalone Desktop Progressive Web App (PWA)."}
                {selectedDeviceTab === "mac" && "macOS detected! Load directly in Safari as a PWA, or scan the QR Code on your Android phone to transfer the APK installer."}
              </p>
            </div>

            {/* Selector tabs */}
            <div className="grid grid-cols-5 gap-1 border-b border-slate-100 pb-1 text-[9px] font-bold text-slate-400 uppercase">
              {(["android", "ios", "windows", "mac"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setSelectedDeviceTab(tab); setApkDownloadState("idle"); }}
                  className={`py-1.5 text-center transition border-b-2 ${
                    selectedDeviceTab === tab 
                      ? "text-emerald-600 border-emerald-500" 
                      : "border-transparent hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <span className="py-1.5 text-slate-300 text-center select-none">Others</span>
            </div>

            {/* Dynamic tabs layouts */}
            {selectedDeviceTab === "android" && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-150 font-mono text-slate-500">
                  <span>FILE: FreelanceHub_v{config.apkVersion || "2.1.0"}.apk</span>
                  <span>SIZE: {config.apkSize || "18.4 MB"}</span>
                </div>
                
                {apkDownloadState === "idle" && (
                  <button
                    onClick={startApkDownload}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-extrabold rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Native Android APK</span>
                  </button>
                )}

                {apkDownloadState === "downloading" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 font-mono">
                      <span>Simulating APK Compilation &amp; Fetch...</span>
                      <span>{apkProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border">
                      <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${apkProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {apkDownloadState === "completed" && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left space-y-2">
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">✓ APK Download Complete!</span>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      For demonstration, our system downloaded a <strong>secure APK config (.json)</strong> installer package to your computer.
                    </p>
                    <div className="text-[9px] text-emerald-900 leading-relaxed bg-white/70 border border-emerald-100/50 p-2.5 rounded-xl font-mono space-y-1">
                      <span className="font-bold block uppercase text-[8px] text-emerald-800">To Install on Android Phone:</span>
                      <span>1. Move the downloaded installer file to your phone storage.</span>
                      <span>2. Enable 'Install Unknown Sources' in device security settings.</span>
                      <span>3. Open the installer to register biometric credentials instantly.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedDeviceTab === "ios" && (
              <div className="space-y-3 pt-2 text-xs">
                <span className="font-bold text-slate-800 block">Safari PWA Installation</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Apple iOS doesn't support uncompiled APK files. Instead, use our high-fidelity <strong>PWA (Progressive Web App)</strong>:
                </p>
                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1.5 text-[10px] text-slate-600">
                  <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>Open Safari and go to this website.</span></div>
                  <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>Tap the <strong>Share</strong> button (box with up arrow).</span></div>
                  <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span></div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Or test our live mockup sandbox:</span>
                  <button 
                    onClick={() => { setDownloadModalOpen(false); onLaunchApp(); }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Open Simulator
                  </button>
                </div>
              </div>
            )}

            {(selectedDeviceTab === "windows" || selectedDeviceTab === "mac") && (
              <div className="space-y-3 pt-2 text-xs">
                <span className="font-bold text-slate-800 block">Desktop App Simulation</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Run the {selectedDeviceTab === "windows" ? "Windows" : "macOS"} standalone application directly inside your browser container.
                </p>
                
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3">
                  <div className="w-14 h-14 bg-white border p-1 rounded-xl shrink-0 flex items-center justify-center">
                    {/* Simulated QR Code */}
                    <div className="grid grid-cols-4 gap-0.5 w-10 h-10 opacity-70">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 5 === 0 ? "bg-slate-900" : "bg-white"}`}></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 block leading-tight">Scan QR Code to Transfer APK</span>
                    <span className="text-[9px] text-slate-400">Scan this on your Android phone camera to download the APK installer directly to your mobile storage.</span>
                  </div>
                </div>

                <button
                  onClick={() => { setDownloadModalOpen(false); onLaunchApp(); }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>Launch Standalone Simulator Session</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Minimal placeholder icons
function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.5" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.5" />
    </svg>
  );
}
