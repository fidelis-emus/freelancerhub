import React, { useState, useEffect, useRef } from "react";
import { useApp, INITIAL_CUSTOMERS, INITIAL_FREELANCERS } from "../context/AppContext";
import { User, Booking, ChatMessage, Category } from "../types";
import { 
  Phone, Smartphone, Shield, MapPin, Search, Star, MessageSquare, 
  Send, Compass, Wrench, Wallet, UserCircle, CheckCircle, Clock, 
  X, Image as ImageIcon, Mic, PhoneCall, Video, Check, Play, Eye, AlertTriangle, ArrowLeft, ArrowRight,
  Car, Building2, Sparkles, Laptop, Trash2, Briefcase, Sprout, Fingerprint, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const MobileSimulator: React.FC = () => {
  const { 
    currentUser, setCurrentUser, freelancers, categories, bookings, createBooking, 
    updateBookingStatus, advanceBookingStep, addChatMessage, releaseEscrow, 
    addRating, depositFunds, withdrawFunds, config, userRole, setUserRole, registerUser,
    language, setLanguage, updateFreelancerKYC
  } = useApp();

  const [activeTab, setActiveTab] = useState<"explore" | "bookings" | "wallet" | "profile">("explore");
  const [selectedFreelancer, setSelectedFreelancer] = useState<User | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "generating" | "downloading" | "installed">("idle");

  // Biometric States
  const [showBiometricDialog, setShowBiometricDialog] = useState<boolean>(false);
  const [biometricTargetUser, setBiometricTargetUser] = useState<User | null>(null);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  const handleStartBiometricFlow = (user: User) => {
    setBiometricTargetUser(user);
    setShowBiometricDialog(true);
    setBiometricScanning(false);
    setBiometricSuccess(false);
  };

  const handleSimulateBiometricScan = () => {
    if (!biometricTargetUser) return;
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        setShowBiometricDialog(false);
        handleQuickLogin(biometricTargetUser);
      }, 1000);
    }, 1500);
  };

  // Translations dictionary
  const translations: Record<string, Record<string, string>> = {
    en: {
      explore: "Explore",
      gigs: "Gigs",
      wallet: "Wallet",
      profile: "Profile",
      categories: "Massive Categories",
      recommended: "Recommended Freelancers",
      escrowProtected: "Verified Escrow Protection",
      searchPlaceholder: "Search Plumbers, Devs, Barbers...",
      activeGigBoard: "Active Gig Board",
      biometricTitle: "Biometric Passkey Login",
      biometricSubtitle: "One-tap Fingerprint / FaceID secure sign-in",
      verifiedContractor: "Verified Contractor",
      hireInstantly: "Hire Instantly (Secure Escrow)",
      logout: "Log Out / Switch User"
    },
    fr: {
      explore: "Explorer",
      gigs: "Gigs",
      wallet: "Portefeuille",
      profile: "Profil",
      categories: "Catégories Massives",
      recommended: "Freelances Recommandés",
      escrowProtected: "Protection d'Escrow Vérifiée",
      searchPlaceholder: "Rechercher des plombiers, dévs, coiffeurs...",
      activeGigBoard: "Tableau des Gigs Actifs",
      biometricTitle: "Connexion Biométrique",
      biometricSubtitle: "Connexion sécurisée Empreinte / FaceID",
      verifiedContractor: "Prestataire Vérifié",
      hireInstantly: "Recruter Instantanément (Escrow)",
      logout: "Se Déconnecter"
    },
    yo: {
      explore: "Ṣawari",
      gigs: "Awọn iṣẹ",
      wallet: "Apo Owo",
      profile: "Profaili",
      categories: "Awọn Ẹka nla",
      recommended: "Awọn amoye ti a ṣe iṣeduro",
      escrowProtected: "Idaabobo Escrow ti o daju",
      searchPlaceholder: "Wa Awọn Alagbẹdẹ, Awọn Alagbata...",
      activeGigBoard: "Igbimọ Iṣẹ Ti nṣiṣẹ",
      biometricTitle: "Wọle pẹlu Biometiki",
      biometricSubtitle: "Wọle ni aabo pẹlu Ika rẹ",
      verifiedContractor: "Oṣiṣẹ ti a fọwọsi",
      hireInstantly: "Gbaṣẹ lẹsẹkẹsẹ (Escrow)",
      logout: "Jade kuro"
    },
    ha: {
      explore: "Bincika",
      gigs: "Ayyuka",
      wallet: "Asusun",
      profile: "Fayil",
      categories: "Manyan Rukunoni",
      recommended: "Masu zaman kansu da aka ba da shawarar",
      escrowProtected: "Kariyar Escrow Tabbatacciya",
      searchPlaceholder: "Nemi Masu gyara, Injiniyoyi...",
      activeGigBoard: "Hukumar Gigs Masu Aiki",
      biometricTitle: "Shiga da Biometiki",
      biometricSubtitle: "Shiga lafiya tare da hoton yatsa",
      verifiedContractor: "Ma'aikaci Tabbatacce",
      hireInstantly: "Haya nan take (Escrow)",
      logout: "Fita"
    },
    ig: {
      explore: "Chọpụta",
      gigs: "Ọrụ",
      wallet: "Akpa Ego",
      profile: "Profaịlụ",
      categories: "Nnukwu Ụdị Ọrụ",
      recommended: "Ndị Ọkachamara Akwadoro",
      escrowProtected: "Nchedo Escrow Ekwetara",
      searchPlaceholder: "Chọọ Ndị Ọrụ Pọmpụ, Ndị Mmepụta...",
      activeGigBoard: "Gigs Na-arụ Ọrụ",
      biometricTitle: "Nbanye Biometiki",
      biometricSubtitle: "Nbanye echekwara site na mkpịsị aka",
      verifiedContractor: "Onye Ọrụ Ekwetara",
      hireInstantly: "Rụọ Ọrụ Ozugbo (Escrow)",
      logout: "Pụọ"
    },
    sw: {
      explore: "Gundua",
      gigs: "Kazi",
      wallet: "Mkoba",
      profile: "Wasifu",
      categories: "Kategoria Kubwa",
      recommended: "Wafanyikazi Huru Waliopendekezwa",
      escrowProtected: "Ulinzi wa Escrow Aliyeidhinishwa",
      searchPlaceholder: "Tafuta Mafundi, Wasanidi Programu...",
      activeGigBoard: "Bodi ya Kazi Inayofanya Kazi",
      biometricTitle: "Ingia kwa Biometria",
      biometricSubtitle: "Ingia salama kwa Alama ya Vidole",
      verifiedContractor: "Mteja Aliyethibitishwa",
      hireInstantly: "Ajiri Papo Hapo (Escrow Salama)",
      logout: "Ondoka"
    }
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Wrench": return <Wrench className="w-5 h-5" />;
      case "Car": return <Car className="w-5 h-5" />;
      case "Building2": return <Building2 className="w-5 h-5" />;
      case "Sparkles": return <Sparkles className="w-5 h-5" />;
      case "Laptop": return <Laptop className="w-5 h-5" />;
      case "Trash2": return <Trash2 className="w-5 h-5" />;
      case "Mic": return <Mic className="w-5 h-5" />;
      case "Briefcase": return <Briefcase className="w-5 h-5" />;
      case "Sprout": return <Sprout className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };
  
  // Dialog States
  const [showCallScreen, setShowCallScreen] = useState<{ active: boolean; type: "voice" | "video"; partnerName: string } | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [aiRequirementsPrompt, setAiRequirementsPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResults, setAiResults] = useState<{ recommendations: any[]; summary: string } | null>(null);

  // AI Chatbot Assistant States
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [chatbotMessages, setChatbotMessages] = useState<Array<{ id: string; sender: "user" | "bot"; text: string; timestamp: string }>>([
    {
      id: "bot-welcome",
      sender: "bot",
      text: "Hello! I am **FH Africa Assistant**, your automated guide. Ask me about hiring elite handymen, securing contract escrow payments, or processing payouts. How can I support your project today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatbotInput, setChatbotInput] = useState<string>("");
  const [chatbotLoading, setChatbotLoading] = useState<boolean>(false);
  const chatbotEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatbotEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatbotMessages, showChatbot]);

  const handleSendChatbotMessage = async () => {
    if (!chatbotInput.trim()) return;
    const userMsgText = chatbotInput.trim();
    setChatbotInput("");

    const newUserMsg = {
      id: `chat-usr-${Date.now()}`,
      sender: "user" as const,
      text: userMsgText,
      timestamp: new Date().toISOString()
    };

    setChatbotMessages(prev => [...prev, newUserMsg]);
    setChatbotLoading(true);

    try {
      const chatHistory = chatbotMessages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text
      }));
      chatHistory.push({ role: "user", content: userMsgText });

      const response = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          userRole: currentUser?.role || "guest",
          username: currentUser?.firstName || "Guest"
        })
      });

      const data = await response.json();
      const botReply = {
        id: `chat-bot-${Date.now()}`,
        sender: "bot" as const,
        text: data.reply || "I apologize, I encountered a communication hiccup. How else can I assist you?",
        timestamp: new Date().toISOString()
      };
      setChatbotMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMsg = {
        id: `chat-err-${Date.now()}`,
        sender: "bot" as const,
        text: "I'm having a little trouble connecting to the network. Please make sure the dev server is active!",
        timestamp: new Date().toISOString()
      };
      setChatbotMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatbotLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      // Replace **bold** with <strong> elements
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      const lineContent = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="font-extrabold text-slate-900">{part}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={lineIdx} className="ml-3 list-disc mt-0.5">
            {lineContent.slice(1)}
          </li>
        );
      }
      return (
        <p key={lineIdx} className="min-h-[0.5rem] mt-0.5">
          {lineContent}
        </p>
      );
    });
  };

  // Chat/Input states
  const [chatInput, setChatInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [bookingType, setBookingType] = useState<"instant" | "scheduled" | "emergency">("instant");
  const [bookingDesc, setBookingDesc] = useState<string>("");
  const [bookingTitle, setBookingTitle] = useState<string>("");

  // Top Up & Withdraw states
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawBank, setWithdrawBank] = useState<string>("");
  const [withdrawAccount, setWithdrawAccount] = useState<string>("");
  const [walletMessage, setWalletMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Edit / KYC submission states
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    state: "Lagos",
    city: "Ikeja",
    address: "",
    bio: "",
    price: "3500",
    servicesOffered: "",
    selectedCategories: [] as string[],
    avatarUrl: "",
    govtIdUrl: ""
  });

  // Review states
  const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Profile editing fields for logged-in freelancer
  const [profileBio, setProfileBio] = useState<string>("");
  const [profilePrice, setProfilePrice] = useState<string>("");
  const [profileServices, setProfileServices] = useState<string>("");
  const [profileBusiness, setProfileBusiness] = useState<string>("");

  useEffect(() => {
    if (currentUser && currentUser.role === "freelancer") {
      setProfileBio(currentUser.bio || "");
      setProfilePrice(currentUser.price?.toString() || "3500");
      setProfileServices(currentUser.services?.join(", ") || "");
      setProfileBusiness(currentUser.businessName || "");
    }
  }, [currentUser]);

  // Map travel simulation
  const [isTraveling, setIsTraveling] = useState<boolean>(false);

  // Auto scroll for chats
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeBooking?.chatHistory]);

  // Sync active booking in detailed views
  const currentOpenBooking = bookings.find(b => b.id === activeBooking?.id) || null;

  // Search/Filter freelancers
  const filteredFreelancers = freelancers.filter(f => {
    if (f.kycStatus === "suspended") return false;
    const matchesCategory = selectedCategory ? f.categories?.includes(selectedCategory) : true;
    const matchesSearch = searchTerm ? (
      f.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.servicesOffered?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : true;
    return matchesCategory && matchesSearch;
  });

  // Handle instant AI posting/autocomplete
  const handleAIAutocomplete = async () => {
    if (!aiRequirementsPrompt) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/autocomplete-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: aiRequirementsPrompt, category: selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "General Services" }),
      });
      const data = await response.json();
      setBookingTitle(data.jobTitle || "Vetted Service Gig");
      setBookingDesc(data.formattedDescriptionMarkdown || data.scopeOfWork?.join(". ") || "");
      setWalletMessage({ type: "success", text: "AI instantly structured your request!" });
    } catch (e) {
      setBookingTitle("Urgent Repair Request");
      setBookingDesc(`I need support with: ${aiRequirementsPrompt}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit secure booking
  const handleConfirmBooking = () => {
    if (!selectedFreelancer) return;
    
    const priceCalculated = selectedFreelancer.price * (bookingType === "emergency" ? 1.5 : 1);
    
    // Check wallet balance
    if (currentUser && currentUser.walletBalance < priceCalculated) {
      setWalletMessage({ type: "error", text: "Insufficient Escrow balance. Top up in your wallet tab." });
      return;
    }

    const created = createBooking({
      freelancerId: selectedFreelancer.id,
      freelancerName: `${selectedFreelancer.firstName} ${selectedFreelancer.lastName}`,
      freelancerAvatar: selectedFreelancer.avatarUrl,
      category: categories.find(c => c.id === selectedFreelancer.categories?.[0])?.name || "General",
      subcategory: selectedFreelancer.servicesOffered?.[0] || "General Task",
      title: bookingTitle || `Booking for ${selectedFreelancer.servicesOffered?.[0] || "Services"}`,
      description: bookingDesc || "Standard on-demand service requested.",
      price: priceCalculated,
      bookingType,
      scheduledTime: bookingTime || undefined,
      paymentMethod: "wallet"
    });

    setActiveBooking(created);
    setShowBookingDialog(false);
    setSelectedFreelancer(null);
    setActiveTab("bookings");
    setBookingTitle("");
    setBookingDesc("");
  };

  // Simulate freelancer en route progress
  const handleTravelSimulation = () => {
    if (!activeBooking) return;
    setIsTraveling(true);
    let step = activeBooking.currentStep;
    
    const interval = setInterval(() => {
      if (step < 3) {
        advanceBookingStep(activeBooking.id);
        step += 1;
      } else {
        clearInterval(interval);
        setIsTraveling(false);
      }
    }, 4000);
  };

  // Chat message send
  const handleSendChat = () => {
    if (!chatInput || !activeBooking) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || "c-1",
      text: chatInput,
      timestamp: new Date().toISOString()
    };
    addChatMessage(activeBooking.id, msg);
    setChatInput("");
  };

  // Send simulated media file
  const handleSendSimulatedMedia = (type: "image" | "voice" | "document") => {
    if (!activeBooking) return;
    const mediaMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || "c-1",
      text: type === "image" ? "📷 Attached Job Site Image.png" : type === "voice" ? "🎤 Simulated Voice Note (0:12)" : "📄 Contract_Requirements.pdf",
      timestamp: new Date().toISOString(),
      isVoice: type === "voice",
    };
    addChatMessage(activeBooking.id, mediaMsg);
  };

  // Escrow Payout Approval
  const handleApproveRelease = () => {
    if (!activeBooking) return;
    releaseEscrow(activeBooking.id);
    setShowReviewDialog(true);
  };

  // Submit Review
  const handleSubmitReview = () => {
    if (!activeBooking) return;
    addRating(activeBooking.id, reviewStars, reviewComment);
    setShowReviewDialog(false);
    setReviewComment("");
    setReviewStars(5);
    setActiveBooking(null);
  };

  // Deposit funds simulated
  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    depositFunds(currentUser?.id || "c-1", amt, `DEP-${Date.now().toString().slice(-6)}`);
    setDepositAmount("");
    setWalletMessage({ type: "success", text: "Deposit processed and cleared immediately!" });
  };

  // Withdrawal simulated
  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || !withdrawBank || !withdrawAccount) {
      setWalletMessage({ type: "error", text: "Please enter a valid amount, bank, and account number." });
      return;
    }
    const res = withdrawFunds(currentUser?.id || "c-1", amt, withdrawBank, withdrawAccount);
    if (res.success) {
      setWithdrawAmount("");
      setWalletMessage({ type: "success", text: "Withdrawal completed successfully." });
    } else {
      setWalletMessage({ type: "error", text: res.error || "Withdrawal failed." });
    }
  };

  // Customer/Freelancer quick login switch
  const handleQuickLogin = (userObj: User) => {
    setCurrentUser(userObj);
    setUserRole(userObj.role);
    setIsRegistering(false);
    setActiveTab("explore");
    setSelectedFreelancer(null);
    setActiveBooking(null);
    setWalletMessage(null);
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const role = userRole === "admin" ? "customer" : userRole; // default fallback
    try {
      const registered = await registerUser({
        ...registerForm,
        categories: registerForm.selectedCategories,
        price: parseFloat(registerForm.price)
      }, role as "customer" | "freelancer");
      
      setIsRegistering(false);
      setActiveTab("explore");
      setWalletMessage({ type: "success", text: `Welcome to FreelanceHub Africa, ${registered.firstName}!` });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer Shell Phone Mockup */}
      <div className="relative w-full max-w-[420px] aspect-[9/19] bg-slate-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] border-[12px] border-slate-700 p-3 overflow-hidden flex flex-col">
        
        {/* Notch Speaker and Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-800 rounded-b-3xl z-50 flex items-center justify-center space-x-2">
          <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
          <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-700"></div>
        </div>

        {/* Smartphone Screen Canvas */}
        <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col text-slate-800 font-sans relative">
          
          {/* Status Bar */}
          <div className="h-9 px-6 flex justify-between items-center text-xs font-semibold bg-slate-100/80 text-slate-500 select-none pt-2 shrink-0">
            <span>12:35</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] tracking-widest text-emerald-600 font-bold">5G</span>
              <div className="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-500 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Persistent Navigation Header with Language selection dropdown */}
          <div className="h-12 px-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 z-30 select-none">
            <span className="text-xs font-black tracking-wider text-slate-800 uppercase flex items-center space-x-1">
              <span className="text-emerald-600 font-extrabold">FH</span>
              <span>Africa</span>
            </span>
            
            {/* Language Selection Dropdown */}
            <div className="relative">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none relative"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="yo">🇳🇬 YO</option>
                <option value="ha">🇳🇬 HA</option>
                <option value="ig">🇳🇬 IG</option>
                <option value="sw">🇰🇪 SW</option>
              </select>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative pb-16">
            
            {/* Wallet message toasts */}
            {walletMessage && (
              <div className={`p-3 mx-4 mt-3 rounded-xl text-xs font-medium flex items-center justify-between border ${
                walletMessage.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{walletMessage.text}</span>
                </div>
                <button onClick={() => setWalletMessage(null)} className="p-0.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If NO USER active, show onboarding / Auth screens */}
            {!currentUser && !isRegistering ? (
              <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                <div className="text-center my-auto space-y-6">
                  {/* Brand Branding */}
                  <div>
                    <div className="w-16 h-16 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-md mb-4 font-bold text-2xl">
                      FH
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">FreelanceHub Africa</h2>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                      Secure on-demand vetted freelancers and elite labor for any home, business or digital project.
                    </p>
                  </div>

                  {/* Primary Registration Section - Highly Prominent! */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setUserRole("freelancer"); setIsRegistering(true); }}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2.5 shadow-md shadow-emerald-600/10"
                    >
                      <UserCircle className="w-4 h-4 text-emerald-100" />
                      <span>Join as Freelancer (Provide KYC)</span>
                    </button>
                    
                    <button 
                      onClick={() => { setUserRole("customer"); setIsRegistering(true); }}
                      className="w-full py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-100/80 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2.5"
                    >
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>Join as Customer (Hirer Account)</span>
                    </button>
                  </div>

                  {/* Visual Divider */}
                  <div className="hidden relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <span className="relative px-3 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Or Demo with Active Accounts
                    </span>
                  </div>

                  {/* Biometric Quick Login Area */}
                  <div className="hidden space-y-2.5 text-left">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
                      <span>Passkey & Fingerprint</span>
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    </div>
                    
                    {/* Customer Login Row with Biometrics */}
                    <div className="relative">
                      <button 
                        onClick={() => handleQuickLogin(INITIAL_CUSTOMERS[0])}
                        className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 rounded-xl flex items-center space-x-2.5 pr-12 transition text-left"
                      >
                        <img src={INITIAL_CUSTOMERS[0].avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-700">Fidelis Emus (Customer)</div>
                          <div className="text-[9px] text-slate-400">Hirer • Balance: 75,000 NGN</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => handleStartBiometricFlow(INITIAL_CUSTOMERS[0])}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        title="Biometric login for Hirer"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Freelancer Emeka Login Row with Biometrics */}
                    <div className="relative">
                      <button 
                        onClick={() => handleQuickLogin(INITIAL_FREELANCERS[0])}
                        className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 rounded-xl flex items-center space-x-2.5 pr-12 transition text-left"
                      >
                        <img src={INITIAL_FREELANCERS[0].avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-700">Emeka Okonkwo (Plumber)</div>
                          <div className="text-[9px] text-slate-400">Freelancer • 4.9 ★ 37 reviews</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => handleStartBiometricFlow(INITIAL_FREELANCERS[0])}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        title="Biometric login for Freelancer"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Freelancer Sarah Login Row with Biometrics */}
                    <div className="relative">
                      <button 
                        onClick={() => handleQuickLogin(INITIAL_FREELANCERS[1])}
                        className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 rounded-xl flex items-center space-x-2.5 pr-12 transition text-left"
                      >
                        <img src={INITIAL_FREELANCERS[1].avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-700">Sarah Wanjiku (App Dev)</div>
                          <div className="text-[9px] text-slate-400">Freelancer • 4.8 ★ 52 reviews</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => handleStartBiometricFlow(INITIAL_FREELANCERS[1])}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                        title="Biometric login for Freelancer"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !currentUser && isRegistering ? (
              /* Registration Form Screen */
              <div className="flex-1 p-6 bg-white">
                <div className="flex items-center space-x-2 mb-6">
                  <button onClick={() => setIsRegistering(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold">Register as {userRole === "freelancer" ? "Freelancer" : "Customer"}</h3>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 text-xs">
                  {/* System Profile Picture Upload */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Upload Profile Picture</label>
                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-100 shrink-0">
                        {registerForm.avatarUrl ? (
                          <img src={registerForm.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-full h-full text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          id="register-avatar-upload"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRegisterForm({
                                  ...registerForm,
                                  avatarUrl: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="register-avatar-upload"
                          className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition shadow-sm"
                        >
                          Choose Photo
                        </label>
                        <p className="text-[9px] text-slate-400 mt-1">Upload JPG/PNG from system</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">First Name</label>
                      <input 
                        type="text" required
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="Emeka"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Last Name</label>
                      <input 
                        type="text" required
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="Okonkwo"
                      />
                    </div>
                  </div>

                  {userRole === "freelancer" && (
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Business Name (Optional)</label>
                      <input 
                        type="text"
                        value={registerForm.businessName}
                        onChange={(e) => setRegisterForm({...registerForm, businessName: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="Emeka Plumbing Hub"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                    <input 
                      type="email" required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                      placeholder="emeka@mail.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Phone Number</label>
                      <input 
                        type="tel" required
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="+234 80"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">State / Region</label>
                      <input 
                        type="text" required
                        value={registerForm.state}
                        onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="Lagos"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Street Address</label>
                    <input 
                      type="text" required
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({...registerForm, address: e.target.value})}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                      placeholder="12 Allen Avenue, Ikeja"
                    />
                  </div>

                  {userRole === "freelancer" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Base rate (NGN/hr)</label>
                          <input 
                            type="number" required
                            value={registerForm.price}
                            onChange={(e) => setRegisterForm({...registerForm, price: e.target.value})}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Services Offered (Comma Separated)</label>
                          <input 
                            type="text" required
                            value={registerForm.servicesOffered}
                            onChange={(e) => setRegisterForm({...registerForm, servicesOffered: e.target.value})}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                            placeholder="Plumbing, Drain Fixing"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Select Main Category</label>
                        <select 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                          onChange={(e) => setRegisterForm({...registerForm, selectedCategories: [e.target.value]})}
                        >
                          <option value="">-- Choose Category --</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1">Professional Bio / Short Description</label>
                        <textarea 
                          value={registerForm.bio}
                          onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                          className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 h-16"
                          placeholder="Tell customers about your experience..."
                          required
                        />
                      </div>

                      {/* Required KYC Document Upload Field */}
                      <div className="bg-slate-50 border border-dashed border-slate-200 p-3.5 rounded-2xl space-y-2 text-left">
                        <label className="block text-slate-600 font-bold text-[10px]">Upload KYC Verification Document (National ID / Passport)</label>
                        <p className="text-[9px] text-slate-400">Upload a clear photo scan of your government identity document to enable premium secure escrow. This will show on your profile.</p>
                        <div className="flex items-center space-x-2.5">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            id="register-kyc-upload"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setRegisterForm({
                                    ...registerForm,
                                    govtIdUrl: reader.result as string
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            required
                          />
                          <label 
                            htmlFor="register-kyc-upload"
                            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[9px] rounded-lg cursor-pointer transition shadow-sm shrink-0"
                          >
                            <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            <span>{registerForm.govtIdUrl ? "Change ID" : "Select ID File"}</span>
                          </label>
                          {registerForm.govtIdUrl ? (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              <span>✓ ID Document Loaded</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-rose-500 font-bold flex items-center space-x-1 animate-pulse">
                              <span>⚠ Required for Vetting</span>
                            </span>
                          )}
                        </div>
                        {registerForm.govtIdUrl && (
                          <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="text-[8px] text-slate-400 truncate max-w-[150px]">Govt_Identity_Scan.png</span>
                            <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Encrypted</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-800">
                          <Shield className="w-3.5 h-3.5" />
                          <span>MOCK BIOMETRICS INTEGRATION</span>
                        </div>
                        <p className="text-[9px] text-amber-600 mt-1">
                          Our simulator will auto-generate verified mock Gov Passport scans & selfie biometric matching logs for Super Admin review.
                        </p>
                      </div>
                    </>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-4 shadow-sm"
                  >
                    Create Vetted Account
                  </button>
                </form>
              </div>
            ) : (
              /* LOGGED IN VIEWS (Double sided based on logged in user role) */
              <>
                {currentUser.role === "customer" ? (
                  /* ================= CUSTOMER PERSPECTIVE ================= */
                  <>
                    {/* CUSTOMER TAB 1: EXPLORE MARKETPLACE */}
                    {activeTab === "explore" && (
                      <div className="flex flex-col space-y-4">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-tr from-emerald-600 to-teal-800 text-white p-5 rounded-b-3xl relative overflow-hidden shrink-0">
                          <div className="relative z-10">
                            <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                              Verified Escrow Protection
                            </span>
                            <h1 className="text-lg font-black tracking-tight leading-tight mt-2.5">
                              {config.homepageBanner}
                            </h1>
                            <div className="mt-4 flex bg-white/12 rounded-full border border-white/15 p-1">
                              <Search className="w-4 h-4 text-emerald-100 ml-2.5 my-auto" />
                              <input 
                                type="text" 
                                placeholder="Search Plumbers, Devs, Barbers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-xs bg-transparent border-none text-white placeholder-emerald-100 focus:outline-none px-2 py-1"
                              />
                              {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="text-emerald-100 hover:text-white mr-2.5">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category circles */}
                        <div className="px-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("categories")}</h3>
                            {selectedCategory && (
                              <button onClick={() => setSelectedCategory("")} className="text-[10px] text-emerald-600 font-bold hover:underline">
                                Clear
                              </button>
                            )}
                          </div>
                          
                          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                            {categories.filter(c => c.active).map(c => {
                              const isSel = selectedCategory === c.id;
                              return (
                                <button 
                                  key={c.id}
                                  onClick={() => setSelectedCategory(isSel ? "" : c.id)}
                                  className={`flex flex-col items-center space-y-1.5 shrink-0 transition ${isSel ? "scale-105" : "hover:scale-102"}`}
                                >
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition ${
                                    isSel 
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" 
                                      : "bg-white border-slate-100 text-slate-600 hover:border-emerald-100"
                                  }`}>
                                    {getCategoryIcon(c.iconName)}
                                  </div>
                                  <span className="text-[9px] font-bold tracking-tight text-slate-600 w-14 text-center truncate">
                                    {c.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Simulated GIS map for interactive discovery */}
                        <div className="mx-4 bg-slate-100 border border-slate-200 rounded-2xl p-3 relative h-40 overflow-hidden flex flex-col justify-between">
                          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
                          
                          {/* Simulated markers */}
                          {filteredFreelancers.slice(0, 4).map((f, i) => (
                            <button
                              key={f.id}
                              onClick={() => setSelectedFreelancer(f)}
                              style={{ top: `${20 + i * 22}%`, left: `${25 + i * 16}%` }}
                              className="absolute bg-white border-2 border-emerald-600 p-1 rounded-full shadow-md group hover:scale-110 transition z-20 flex items-center space-x-1"
                            >
                              <img src={f.avatarUrl} className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-[8px] font-bold max-w-16 truncate pr-1 hidden group-hover:block text-slate-800">
                                {f.firstName}
                              </span>
                            </button>
                          ))}

                          <div className="relative z-10 flex justify-between items-start">
                            <span className="text-[10px] bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Lekki Phase 1, Lagos</span>
                            </span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded-full font-bold">
                              ● Vetted Only
                            </span>
                          </div>

                          <div className="relative z-10 text-[10px] text-slate-400 font-medium">
                            4 professionals nearby your GPS coordinates
                          </div>
                        </div>

                        {/* AI Post Helper */}
                        <div className="mx-4 bg-emerald-50/30 border border-emerald-100/60 p-4 rounded-2xl">
                          <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs mb-1">
                            <Star className="w-4 h-4 fill-current" />
                            <span>Post AI-Powered Job Description</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-3">
                            Type a rough sentence about your issue. Gemini will instantly compile a professional scope, titles, deliverables and match nearby experts.
                          </p>
                          <div className="flex space-x-1">
                            <input 
                              type="text"
                              value={aiRequirementsPrompt}
                              onChange={(e) => setAiRequirementsPrompt(e.target.value)}
                              placeholder="e.g. kitchen sink pipe dripping urgently"
                              className="flex-1 p-2 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button 
                              onClick={handleAIAutocomplete}
                              disabled={aiLoading}
                              className="px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                            >
                              {aiLoading ? "Thinking..." : "AI Build"}
                            </button>
                          </div>
                          {bookingTitle && (
                            <div className="mt-3 p-2.5 bg-white border border-slate-100 rounded-xl space-y-1.5">
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Generated Post</div>
                              <div className="text-xs font-bold text-slate-800">{bookingTitle}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-2">{bookingDesc}</div>
                              <div className="flex justify-end pt-1">
                                <button 
                                  onClick={() => {
                                    // Match category and open booking with the best freelancer
                                    const provider = filteredFreelancers[0] || freelancers[0];
                                    setSelectedFreelancer(provider);
                                    setShowBookingDialog(true);
                                  }}
                                  className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg"
                                >
                                  Deploy & Book Instantly
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Freelancers List */}
                        <div className="px-4 space-y-3">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Pros` : "Recommended Freelancers"}
                          </h3>

                          {filteredFreelancers.length === 0 ? (
                            <div className="text-center py-6 text-neutral-400 text-xs">
                              No service providers found in this category or search filters.
                            </div>
                          ) : (
                            filteredFreelancers.map(f => (
                              <div 
                                key={f.id}
                                className="bg-white border border-slate-100 p-3.5 rounded-2xl hover:border-emerald-100 transition flex space-x-3 cursor-pointer"
                                onClick={() => setSelectedFreelancer(f)}
                              >
                                <img src={f.avatarUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-800 truncate">
                                        {f.firstName} {f.lastName}
                                      </h4>
                                      <div className="text-[10px] text-slate-400 truncate">{f.businessName || "Private Specialist"}</div>
                                    </div>
                                    <div className="flex items-center space-x-0.5 text-xs text-amber-500 font-bold shrink-0">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span>{f.rating.toFixed(1)}</span>
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                                    {f.bio}
                                  </p>

                                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-700">
                                      {f.price.toLocaleString()} NGN <span className="font-medium text-slate-400">/ hr</span>
                                    </span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                      f.kycStatus === "verified" 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                                    }`}>
                                      {f.kycStatus === "verified" ? "Vetted Pro" : "KYC Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* CUSTOMER TAB 2: ACTIVE BOOKINGS & LIVE TRACKING */}
                    {activeTab === "bookings" && (
                      <div className="p-4 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">My Gigs & Trackers</h3>
                        
                        {bookings.filter(b => b.customerId === currentUser.id).length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs bg-white border border-slate-100 rounded-2xl">
                            <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p>No current or historic bookings found.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {bookings.filter(b => b.customerId === currentUser.id).map(b => {
                              const isOpen = activeBooking?.id === b.id;
                              return (
                                <div 
                                  key={b.id}
                                  className={`bg-white border border-slate-100 rounded-2xl overflow-hidden transition ${
                                    isOpen ? "ring-1 ring-emerald-500" : "hover:border-slate-200"
                                  }`}
                                >
                                  <div 
                                    onClick={() => setActiveBooking(isOpen ? null : b)}
                                    className="p-4 flex justify-between items-center cursor-pointer select-none"
                                  >
                                    <div className="flex items-center space-x-3 min-w-0">
                                      <img src={b.freelancerAvatar} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate">{b.title}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{b.freelancerName} • {b.subcategory}</div>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <div className="text-xs font-bold text-emerald-600">{b.price.toLocaleString()} NGN</div>
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                                        b.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                                        b.status === "started" ? "bg-emerald-100 text-emerald-800 animate-pulse" :
                                        b.status === "disputed" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
                                      }`}>
                                        {b.status}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dynamic Accordion View (Active Tracking + Realtime Messaging Console) */}
                                  {isOpen && (
                                    <div className="border-t border-slate-50 p-4 bg-slate-50/50 space-y-4">
                                      
                                      {/* Tracking Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                          <span>Step Tracking (Uber-style)</span>
                                          <span className="text-emerald-600">ETA: {b.eta || "Arrived"}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 pt-1">
                                          {[0, 1, 2, 3, 4].map((step) => {
                                            const isActive = b.currentStep >= step;
                                            return (
                                              <div 
                                                key={step} 
                                                className={`flex-1 h-1.5 rounded-full transition-all ${
                                                  isActive ? "bg-emerald-600" : "bg-slate-200"
                                                }`}
                                              />
                                            );
                                          })}
                                        </div>
                                        <p className="text-[10px] text-slate-600 italic pt-1 text-center font-medium">
                                          {b.currentStep === 0 && "Gig Requested & Verified"}
                                          {b.currentStep === 1 && "Freelancer traveling to your site (En Route)"}
                                          {b.currentStep === 2 && "Freelancer arrived at your location!"}
                                          {b.currentStep === 3 && "Work in progress (WIP) on-site"}
                                          {b.currentStep === 4 && "Work Completed. Please release escrow holding!"}
                                        </p>
                                      </div>

                                      {/* Travel Simulator Trigger */}
                                      {b.status === "started" && (
                                        <button 
                                          onClick={handleTravelSimulation}
                                          disabled={isTraveling}
                                          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                                        >
                                          <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                          <span>{isTraveling ? "Simulating GPS Progress..." : "Simulate Freelancer Transit (GPS Map Move)"}</span>
                                        </button>
                                      )}

                                      {/* Call Consultation Buttons */}
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => setShowCallScreen({ active: true, type: "voice", partnerName: b.freelancerName })}
                                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                          <span>Voice Call</span>
                                        </button>
                                        <button 
                                          onClick={() => setShowCallScreen({ active: true, type: "video", partnerName: b.freelancerName })}
                                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                                        >
                                          <Video className="w-3.5 h-3.5" />
                                          <span>Video Consultation</span>
                                        </button>
                                      </div>

                                      {/* Escrow payout / Dispute Actions */}
                                      {b.paymentStatus === "escrow" && (
                                        <div className="space-y-2">
                                          {b.currentStep >= 4 ? (
                                            <button 
                                              onClick={handleApproveRelease}
                                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/15"
                                            >
                                              Approve & Release Escrow Payout
                                            </button>
                                          ) : (
                                            <div className="text-center text-[10px] text-slate-400 font-semibold p-2 border border-dashed border-slate-200 rounded-xl">
                                              🔐 Funds safely locked in escrow holding
                                            </div>
                                          )}
                                          
                                          <button 
                                            onClick={() => updateBookingStatus(b.id, "disputed")}
                                            className="w-full py-2 border border-rose-100 hover:bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl transition"
                                          >
                                            File Dispute / Lock Payment
                                          </button>
                                        </div>
                                      )}

                                      {/* Real-time Messenger Terminal */}
                                      <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden flex flex-col h-56">
                                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                                          <span className="text-[9px] font-bold text-slate-500 uppercase">Live Project Chat</span>
                                          <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Active Escrow</span>
                                        </div>

                                        {/* Messages Log */}
                                        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                                          {b.chatHistory.map((m) => {
                                            const isMe = m.senderId === currentUser.id;
                                            const isSys = m.senderId === "system";
                                            if (isSys) {
                                              return (
                                                <div key={m.id} className="text-center text-[8px] text-slate-400 bg-slate-50 py-1 px-2.5 rounded-lg max-w-[80%] mx-auto font-medium">
                                                  {m.text}
                                                </div>
                                              );
                                            }
                                            return (
                                              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                                                  isMe 
                                                    ? "bg-emerald-600 text-white rounded-tr-none" 
                                                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                                                }`}>
                                                  {m.text}
                                                </div>
                                                <span className="text-[7px] text-slate-400 mt-0.5 px-1">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                              </div>
                                            );
                                          })}
                                          <div ref={chatEndRef} />
                                        </div>

                                        {/* Input Box */}
                                        <div className="p-2 border-t border-slate-100 flex space-x-1.5 shrink-0 bg-white">
                                          <input 
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                                            placeholder="Type message, emojis..."
                                            className="flex-1 text-xs px-2.5 py-2 rounded-xl bg-slate-50 border-none focus:outline-none"
                                          />
                                          <button 
                                            onClick={handleSendChat}
                                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shrink-0"
                                          >
                                            <Send className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CUSTOMER TAB 3: WALLET */}
                    {activeTab === "wallet" && (
                      <div className="p-5 space-y-5">
                        
                        {/* Escrow Card balance */}
                        <div className="bg-slate-900 text-white p-5 rounded-3xl relative overflow-hidden border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">My Wallet Balance</span>
                          <div className="text-2xl font-bold tracking-tight mt-1">
                            {currentUser.walletBalance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">NGN</span>
                          </div>
                          
                          <div className="mt-4 flex space-x-2">
                            <input 
                              type="number"
                              placeholder="Amount to top up..."
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="flex-1 bg-slate-800 border-none px-3 py-2 text-xs rounded-xl focus:outline-none"
                            />
                            <button 
                              onClick={handleDeposit}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                            >
                              Top Up Wallet
                            </button>
                          </div>
                        </div>

                        {/* Payment Verification Bank Transfer alert */}
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs space-y-2">
                          <h4 className="font-bold text-emerald-900 flex items-center space-x-1">
                            <Wallet className="w-4 h-4" />
                            <span>Unique Dedicated Escrow Account</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            For each checkout order, you can make a direct bank transfer to our secure automated clearing desk. Incoming funds are auto-verified in under 5 seconds!
                          </p>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1 text-[10px]">
                            <div className="flex justify-between"><span className="text-slate-400">Escrow Bank:</span> <span className="font-bold">{config.bankDetails.bankName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Account No:</span> <span className="font-bold text-emerald-600 select-all">{config.bankDetails.accountNumber}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Account Name:</span> <span className="font-bold">{config.bankDetails.accountName}</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CUSTOMER TAB 4: PROFILE */}
                    {activeTab === "profile" && (
                      <div className="p-5 space-y-4 text-center">
                        <div className="relative inline-block group">
                          <img src={currentUser.avatarUrl} className="w-20 h-20 rounded-full mx-auto border-2 border-emerald-600 object-cover" />
                          <input 
                            type="file" 
                            accept="image/*"
                            id="customer-profile-avatar-upload"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateFreelancerKYC(currentUser.id, { avatarUrl: reader.result as string });
                                  setWalletMessage({ type: "success", text: "Profile picture updated!" });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="customer-profile-avatar-upload"
                            className="absolute bottom-0 right-0 w-6 h-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-full border-2 border-white flex items-center justify-center cursor-pointer transition shadow-md"
                            title="Upload picture"
                          >
                            <span className="text-xs font-bold font-mono">+</span>
                          </label>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            {currentUser.firstName} {currentUser.lastName}
                          </h3>
                          <p className="text-xs text-slate-400">{currentUser.email}</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-1">{currentUser.city}, {currentUser.state}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-4 text-left text-xs space-y-3">
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="text-slate-400">Phone</span>
                            <span className="font-semibold">{currentUser.phone}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="text-slate-400">KYC Status</span>
                            <span className="font-bold text-emerald-500 uppercase">{currentUser.kycStatus}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-slate-400">Role Perspective</span>
                            <span className="font-bold text-emerald-600">CUSTOMER</span>
                          </div>
                        </div>

                        {/* PWA/APK Mobile Download Card */}
                        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800 rounded-2xl p-4 text-left text-white space-y-3 relative overflow-hidden mt-2">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-15 blur-2xl rounded-full"></div>
                          
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                            <div>
                              <h4 className="text-xs font-bold tracking-tight text-white">Download Mobile PWA App</h4>
                              <p className="text-[9px] text-emerald-300 font-mono">Compatible with Android (APK) & iOS</p>
                            </div>
                          </div>

                          <p className="text-[9px] text-slate-300 leading-relaxed">
                            Install FreelanceHub Africa directly on your phone as a lightweight, lightning-fast app! It works offline, supports push notifications, bypasses browser bars, and launches natively.
                          </p>

                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setDownloadState("generating");
                                setTimeout(() => {
                                  setDownloadState("downloading");
                                  setTimeout(() => {
                                    setDownloadState("installed");
                                    const element = document.createElement("a");
                                    const file = new Blob([JSON.stringify({
                                      appName: "FreelanceHub Africa",
                                      developer: "FreelanceHub Tech",
                                      version: "1.0.0",
                                      installType: "PWA-WebAPK",
                                      status: "verified"
                                    }, null, 2)], {type: 'application/json'});
                                    element.href = URL.createObjectURL(file);
                                    element.download = "freelancehub-install-config.json";
                                    document.body.appendChild(element);
                                    element.click();
                                    document.body.removeChild(element);
                                  }, 1500);
                                }, 1500);
                              }}
                              disabled={downloadState === "generating" || downloadState === "downloading"}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-900/40 cursor-pointer"
                            >
                              {downloadState === "idle" && (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Download & Install Mobile App (APK)</span>
                                </>
                              )}
                              {downloadState === "generating" && (
                                <span className="animate-pulse">Building Android WebAPK Package...</span>
                              )}
                              {downloadState === "downloading" && (
                                <span className="animate-bounce">Downloading Installer File...</span>
                              )}
                              {downloadState === "installed" && (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  <span>Download Complete! Open File to Install</span>
                                </>
                              )}
                            </button>

                            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-[9px] text-slate-300 space-y-1">
                              <span className="font-bold text-emerald-400 block uppercase tracking-wide text-[8px]">💡 Manual Install Instructions:</span>
                              <div className="flex items-start space-x-1.5">
                                <span className="text-emerald-400 font-bold font-mono">Android:</span>
                                <span>Click the three dots <span className="font-extrabold text-white">⋮</span> in Chrome and tap <span className="text-white font-semibold">"Install App"</span> or <span className="text-white font-semibold">"Add to Home Screen"</span>.</span>
                              </div>
                              <div className="flex items-start space-x-1.5 pt-1 border-t border-slate-700/60">
                                <span className="text-emerald-400 font-bold font-mono">iOS / Safari:</span>
                                <span>Tap the <span className="text-white font-semibold">Share</span> icon (square with arrow) and select <span className="text-white font-semibold">"Add to Home Screen"</span>.</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setCurrentUser(null)}
                          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition mt-6 flex items-center justify-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out / Switch Account</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* ================= FREELANCER PERSPECTIVE ================= */
                  <>
                    {/* FREELANCER TAB 1: GIG REQUESTS DASHBOARD */}
                    {activeTab === "explore" && (
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Active Gig Board</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                            Availability: {currentUser.availability}
                          </span>
                        </div>

                        {/* Incoming Jobs list */}
                        {bookings.filter(b => b.freelancerId === currentUser.id).length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs bg-white border border-slate-100 rounded-2xl">
                            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-bounce" />
                            <p>Waiting for new incoming client calls...</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {bookings.filter(b => b.freelancerId === currentUser.id).map(b => {
                              const isOpen = activeBooking?.id === b.id;
                              return (
                                <div 
                                  key={b.id}
                                  className={`bg-white border border-slate-100 rounded-2xl overflow-hidden transition ${
                                    isOpen ? "ring-1 ring-emerald-500" : "hover:border-slate-200"
                                  }`}
                                >
                                  <div 
                                    onClick={() => setActiveBooking(isOpen ? null : b)}
                                    className="p-4 flex justify-between items-center cursor-pointer select-none"
                                  >
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-800">{b.title}</h4>
                                      <div className="text-[10px] text-slate-400 mt-1">{b.customerName} • {b.location}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs font-bold text-emerald-600">{b.price.toLocaleString()} NGN</div>
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                                        b.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                                        b.status === "started" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                                      }`}>
                                        {b.status}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Freelancer Step Progress Panel */}
                                  {isOpen && (
                                    <div className="border-t border-slate-50 p-4 bg-slate-50/50 space-y-4">
                                      <p className="text-[10px] text-slate-600 leading-relaxed">{b.description}</p>
                                      
                                      {/* Accept / Decline actions if pending */}
                                      {b.status === "pending" && (
                                        <div className="flex space-x-2">
                                          <button 
                                            onClick={() => updateBookingStatus(b.id, "rejected")}
                                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                                          >
                                            Decline
                                          </button>
                                          <button 
                                            onClick={() => updateBookingStatus(b.id, "accepted")}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/10"
                                          >
                                            Accept Job
                                          </button>
                                        </div>
                                      )}

                                      {/* Travel / Service Steps if accepted/started */}
                                      {(b.status === "accepted" || b.status === "started") && b.currentStep < 4 && (
                                        <div className="space-y-2">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Advancement Checklist</div>
                                          <button 
                                            onClick={() => advanceBookingStep(b.id)}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/15"
                                          >
                                            {b.currentStep === 0 && "Lock In & Accept Contract"}
                                            {b.currentStep === 1 && "Mark En Route / Start Traveling"}
                                            {b.currentStep === 2 && "Mark Arrived at Job Site"}
                                            {b.currentStep === 3 && "Complete Work (Mark Completed)"}
                                          </button>
                                        </div>
                                      )}

                                      {/* Escalrow locked status */}
                                      {b.paymentStatus === "escrow" && (
                                        <div className="text-center text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 p-2.5 rounded-xl font-bold">
                                          🔒 Funds held in Secure Platform Escrow. Payout auto-releases when customer approves completion.
                                        </div>
                                      )}

                                      {/* Inline Messenger link */}
                                      <div className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center">
                                        <div className="text-[10px] text-slate-400 font-semibold">Communicate with Client:</div>
                                        <button 
                                          onClick={() => setActiveTab("bookings")}
                                          className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Open Chat</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FREELANCER TAB 2: ACTIVE CHATS ONLY */}
                    {activeTab === "bookings" && (
                      <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
                        {activeBooking && activeBooking.freelancerId === currentUser.id ? (
                          <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 h-[430px]">
                            {/* Chat Header */}
                            <div className="bg-white px-3 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                              <div className="flex items-center space-x-2 min-w-0">
                                <button 
                                  onClick={() => setActiveBooking(null)}
                                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-700 text-xs shrink-0">
                                  {activeBooking.customerName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-slate-800 truncate">{activeBooking.customerName}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{activeBooking.title}</div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => setActiveTab("explore")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[9px] rounded-lg transition"
                                title="Manage contract steps"
                              >
                                Manage Job
                              </button>
                            </div>

                            {/* Chat Message Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                              {activeBooking.chatHistory.map((m) => {
                                const isMe = m.senderId === currentUser.id;
                                const isSys = m.senderId === "system";
                                if (isSys) {
                                  return (
                                    <div key={m.id} className="text-center text-[8px] text-slate-400 bg-slate-100/80 py-1 px-2 rounded-lg max-w-[85%] mx-auto">
                                      {m.text}
                                    </div>
                                  );
                                }
                                return (
                                  <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                                      isMe 
                                        ? "bg-emerald-600 text-white rounded-tr-none" 
                                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                    }`}>
                                      {m.text}
                                    </div>
                                    <span className="text-[7px] text-slate-400 mt-0.5 px-1">
                                      {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                );
                              })}
                              <div ref={chatEndRef} />
                            </div>

                            {/* Simulated Quick Media Actions for Freelancer */}
                            <div className="bg-slate-100 border-t border-b border-slate-200/40 px-3 py-1 flex items-center justify-around text-slate-400 shrink-0">
                              <button onClick={() => handleSendSimulatedMedia("image")} className="hover:text-emerald-600 p-1 rounded text-[10px] flex items-center space-x-1 transition">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-medium">Send Photo</span>
                              </button>
                              <button onClick={() => handleSendSimulatedMedia("voice")} className="hover:text-emerald-600 p-1 rounded text-[10px] flex items-center space-x-1 transition">
                                <Mic className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-medium">Send Audio</span>
                              </button>
                              <button onClick={() => handleSendSimulatedMedia("document")} className="hover:text-emerald-600 p-1 rounded text-[10px] flex items-center space-x-1 transition">
                                <Send className="w-3.5 h-3.5 rotate-45" />
                                <span className="text-[8px] font-medium">Send Doc</span>
                              </button>
                            </div>

                            {/* Chat Message Input */}
                            <div className="p-2 border-t border-slate-100 flex space-x-1.5 bg-white shrink-0">
                              <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                                placeholder="Write message back..."
                                className="flex-1 text-xs px-2.5 py-2 rounded-xl bg-slate-50 border-none focus:outline-none"
                              />
                              <button 
                                onClick={handleSendChat}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shrink-0"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Active Client Chats</h3>
                            
                            {bookings.filter(b => b.freelancerId === currentUser.id).length === 0 ? (
                              <div className="text-center py-12 text-slate-400 text-xs bg-white border border-slate-100 rounded-2xl">
                                No active chats. Give hirers high-quality service to start conversing!
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {bookings.filter(b => b.freelancerId === currentUser.id).map(b => (
                                  <div 
                                    key={b.id}
                                    className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:border-emerald-100 transition"
                                    onClick={() => setActiveBooking(b)}
                                  >
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center rounded-full shrink-0 text-emerald-600 font-bold text-sm">
                                        {b.customerName.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate">{b.customerName}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{b.title}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-emerald-600 shrink-0">
                                      <span className="text-[10px] font-bold">Open Chat</span>
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* FREELANCER TAB 3: WALLET & EARNINGS HUB */}
                    {activeTab === "wallet" && (
                      <div className="p-5 space-y-5">
                        
                        {/* Escrow Wallet balances */}
                        <div className="bg-slate-900 text-white p-5 rounded-3xl relative overflow-hidden border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">My Available Balance</span>
                          <div className="text-2xl font-bold tracking-tight mt-1">
                            {currentUser.walletBalance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">NGN</span>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                            <span>Pending / Escrow locked:</span>
                            <span className="font-bold text-amber-400">{(currentUser.pendingBalance || 0).toLocaleString()} NGN</span>
                          </div>
                        </div>

                        {/* Completed & Satisfied Gigs List */}
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-800">Satisfied Gigs (Ready for Payout)</h4>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Escrow Released</span>
                          </div>
                          
                          {bookings.filter(b => b.freelancerId === currentUser.id && b.status === "completed" && b.paymentStatus === "released").length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-[10px] border border-dashed border-slate-100 rounded-xl leading-normal">
                              No completed jobs with released escrow yet. Complete jobs and get client approval to activate payouts!
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {bookings.filter(b => b.freelancerId === currentUser.id && b.status === "completed" && b.paymentStatus === "released").map(b => {
                                const fee = Math.floor(b.price * (config.platformCommission / 100));
                                const withdrawableAmt = b.price - fee;
                                return (
                                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-bold text-slate-700 text-[11px] leading-tight">{b.title}</div>
                                        <div className="text-[9px] text-slate-400 mt-0.5">Client: {b.customerName}</div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="font-bold text-emerald-600 text-[11px]">{withdrawableAmt.toLocaleString()} NGN</div>
                                        <span className="text-[8px] text-slate-400">Net payout</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100/60">
                                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center space-x-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                                        <span>Hirer Satisfied & Approved</span>
                                      </span>
                                      <button 
                                        onClick={() => {
                                          setWithdrawAmount(withdrawableAmt.toString());
                                          setWalletMessage({ type: "success", text: `Selected payout of ${withdrawableAmt.toLocaleString()} NGN from job: "${b.title}". Please select bank and enter account number below to complete withdrawal.` });
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-lg transition shadow-sm shrink-0"
                                      >
                                        Select for Withdrawal
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Withdraw Earnings box */}
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-3.5 text-xs">
                          <h4 className="font-bold text-slate-800">Withdraw Earnings</h4>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Supported Banks</label>
                              <select 
                                value={withdrawBank}
                                onChange={(e) => setWithdrawBank(e.target.value)}
                                className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-xs focus:outline-none text-slate-800"
                              >
                                <option value="">-- Choose Bank --</option>
                                {config.supportedBanks.map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">Account Number</label>
                                <input 
                                  type="text"
                                  placeholder="0123456789"
                                  value={withdrawAccount}
                                  onChange={(e) => setWithdrawAccount(e.target.value)}
                                  className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-xs focus:outline-none text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1 font-bold">Amount (NGN)</label>
                                <input 
                                  type="number"
                                  placeholder="10000"
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-xs focus:outline-none text-slate-800"
                                />
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={handleWithdraw}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/10"
                          >
                            Withdraw to Bank
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FREELANCER TAB 4: PROFILE & KYC STATUS */}
                    {activeTab === "profile" && (
                      <div className="p-5 space-y-4 overflow-y-auto max-h-[460px]">
                        {/* Avatar Block */}
                        <div className="text-center space-y-2">
                          <div className="relative inline-block group">
                            <img src={currentUser.avatarUrl} className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-600 object-cover" />
                            <input 
                              type="file" 
                              accept="image/*"
                              id="freelancer-profile-avatar-upload"
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    updateFreelancerKYC(currentUser.id, { avatarUrl: reader.result as string });
                                    setWalletMessage({ type: "success", text: "Profile picture updated!" });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <label 
                              htmlFor="freelancer-profile-avatar-upload"
                              className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-full border-2 border-white flex items-center justify-center cursor-pointer transition shadow-md"
                              title="Upload picture"
                            >
                              <span className="text-[10px] font-bold font-mono text-center leading-none">+</span>
                            </label>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              {currentUser.firstName} {currentUser.lastName}
                            </h3>
                            <p className="text-[10px] text-slate-400">Manage your Africa Freelance ID & Credentials</p>
                          </div>
                        </div>

                        {/* KYC verification alerts */}
                        <div className={`p-3.5 rounded-2xl border text-left text-xs ${
                          currentUser.kycStatus === "verified" 
                            ? "bg-emerald-50/50 border-emerald-100" 
                            : "bg-amber-50 border-amber-100"
                        }`}>
                          <h4 className="font-bold flex items-center space-x-1.5 text-slate-800 text-[11px]">
                            <Shield className={`w-4 h-4 ${currentUser.kycStatus === "verified" ? "text-emerald-600" : "text-amber-600"}`} />
                            <span>Identity Vetting (KYC Status)</span>
                            {currentUser.kycStatus === "verified" && (
                              <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase font-extrabold tracking-wider shrink-0">Verified</span>
                            )}
                          </h4>
                          <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                            {currentUser.kycStatus === "verified" 
                              ? "Excellent! Your government-issued identity documents have been approved. You are listed as a verified certified expert on the hirer platform." 
                              : "Under security desk review. Upload your national identity card below to activate secure escrow payouts."}
                          </p>
                        </div>

                        {/* Editable Profile Information Form */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-left space-y-3.5">
                          <h4 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center space-x-1">
                            <UserCircle className="w-4 h-4 text-emerald-600" />
                            <span>Edit Expert Profile Details</span>
                          </h4>

                          <div className="space-y-2.5 text-xs">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Business or Trade Name</label>
                              <input 
                                type="text"
                                value={profileBusiness}
                                onChange={(e) => setProfileBusiness(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="e.g. Lagos Elite Plumbing Inc."
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Hourly Service Rate (NGN)</label>
                              <input 
                                type="number"
                                value={profilePrice}
                                onChange={(e) => setProfilePrice(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="3500"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Services Offered (Comma Separated)</label>
                              <input 
                                type="text"
                                value={profileServices}
                                onChange={(e) => setProfileServices(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="e.g. Pipe leak repair, Drain cleaning, Boiler install"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Short Bio / Professional Description</label>
                              <textarea 
                                value={profileBio}
                                onChange={(e) => setProfileBio(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16 resize-none"
                                placeholder="Describe your expertise and qualifications..."
                              />
                            </div>

                            {/* KYC Document Management inside Profile */}
                            <div className="pt-2 border-t border-slate-50">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Government ID Card Scan</label>
                              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  id="profile-kyc-upload"
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        updateFreelancerKYC(currentUser.id, { 
                                          govtIdUrl: reader.result as string,
                                          kycStatus: "verified" 
                                        });
                                        setWalletMessage({ type: "success", text: "Identity Document uploaded & Verified successfully!" });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor="profile-kyc-upload"
                                  className="px-2.5 py-1.5 bg-slate-800 text-white hover:bg-slate-900 text-[9px] font-bold rounded-lg cursor-pointer transition shrink-0"
                                >
                                  Upload ID Scan
                                </label>
                                <span className="text-[9px] text-slate-500 truncate">
                                  {currentUser.govtIdUrl ? "✓ Govt_Identity_Scan.png uploaded" : "No document loaded"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              updateFreelancerKYC(currentUser.id, {
                                bio: profileBio,
                                price: Number(profilePrice),
                                services: profileServices.split(",").map(s => s.trim()),
                                businessName: profileBusiness,
                                kycStatus: currentUser.govtIdUrl || profileBio ? "verified" : "pending"
                              });
                              setWalletMessage({ type: "success", text: "Profile settings saved successfully! Your updated credentials are now live on the platform." });
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/10"
                          >
                            Save Profile Changes
                          </button>
                        </div>

                        {/* PWA/APK Mobile Download Card */}
                        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800 rounded-2xl p-4 text-left text-white space-y-3 relative overflow-hidden mt-2">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-15 blur-2xl rounded-full"></div>
                          
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                            <div>
                              <h4 className="text-xs font-bold tracking-tight text-white">Download Mobile PWA App</h4>
                              <p className="text-[9px] text-emerald-300 font-mono">Compatible with Android (APK) & iOS</p>
                            </div>
                          </div>

                          <p className="text-[9px] text-slate-300 leading-relaxed">
                            Install FreelanceHub Africa directly on your phone as a lightweight, lightning-fast app! It works offline, supports push notifications, bypasses browser bars, and launches natively.
                          </p>

                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setDownloadState("generating");
                                setTimeout(() => {
                                  setDownloadState("downloading");
                                  setTimeout(() => {
                                    setDownloadState("installed");
                                    const element = document.createElement("a");
                                    const file = new Blob([JSON.stringify({
                                      appName: "FreelanceHub Africa",
                                      developer: "FreelanceHub Tech",
                                      version: "1.0.0",
                                      installType: "PWA-WebAPK",
                                      status: "verified"
                                    }, null, 2)], {type: 'application/json'});
                                    element.href = URL.createObjectURL(file);
                                    element.download = "freelancehub-install-config.json";
                                    document.body.appendChild(element);
                                    element.click();
                                    document.body.removeChild(element);
                                  }, 1500);
                                }, 1500);
                              }}
                              disabled={downloadState === "generating" || downloadState === "downloading"}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-900/40 cursor-pointer"
                            >
                              {downloadState === "idle" && (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Download & Install Mobile App (APK)</span>
                                </>
                              )}
                              {downloadState === "generating" && (
                                <span className="animate-pulse">Building Android WebAPK Package...</span>
                              )}
                              {downloadState === "downloading" && (
                                <span className="animate-bounce">Downloading Installer File...</span>
                              )}
                              {downloadState === "installed" && (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  <span>Download Complete! Open File to Install</span>
                                </>
                              )}
                            </button>

                            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-[9px] text-slate-300 space-y-1">
                              <span className="font-bold text-emerald-400 block uppercase tracking-wide text-[8px]">💡 Manual Install Instructions:</span>
                              <div className="flex items-start space-x-1.5">
                                <span className="text-emerald-400 font-bold font-mono">Android:</span>
                                <span>Click the three dots <span className="font-extrabold text-white">⋮</span> in Chrome and tap <span className="text-white font-semibold">"Install App"</span> or <span className="text-white font-semibold">"Add to Home Screen"</span>.</span>
                              </div>
                              <div className="flex items-start space-x-1.5 pt-1 border-t border-slate-700/60">
                                <span className="text-emerald-400 font-bold font-mono">iOS / Safari:</span>
                                <span>Tap the <span className="text-white font-semibold">Share</span> icon (square with arrow) and select <span className="text-white font-semibold">"Add to Home Screen"</span>.</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Switch Account / Logout */}
                        <button 
                          onClick={() => setCurrentUser(null)}
                          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 shrink-0 animate-pulse hover:animate-none"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out / Switch Account</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Bottom Operating System Navigation tab bar */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-100 px-6 flex justify-between items-center z-40 shrink-0 select-none">
                  <button 
                    onClick={() => { setActiveTab("explore"); setSelectedFreelancer(null); }}
                    className={`flex flex-col items-center space-y-1 transition ${activeTab === "explore" ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <Compass className="w-5 h-5" />
                    <span className="text-[9px]">{t("explore")}</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("bookings")}
                    className={`flex flex-col items-center space-y-1 transition ${activeTab === "bookings" ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[9px]">{t("gigs")}</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("wallet")}
                    className={`flex flex-col items-center space-y-1 transition ${activeTab === "wallet" ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[9px]">{t("wallet")}</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex flex-col items-center space-y-1 transition ${activeTab === "profile" ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="text-[9px]">{t("profile")}</span>
                  </button>
                </div>

                {/* Floating AI Assistant Trigger Button */}
                {currentUser && !showChatbot && (
                  <button 
                    onClick={() => setShowChatbot(true)}
                    className="absolute bottom-20 right-4 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center space-x-1.5 animate-bounce"
                    style={{ animationDuration: '3s' }}
                    id="floating-ai-chatbot-btn"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                    <span className="text-[9px] font-bold tracking-wider">AI Assistant</span>
                  </button>
                )}

                {/* sliding full height chatbot panel */}
                <AnimatePresence>
                  {currentUser && showChatbot && (
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      className="absolute inset-0 bg-slate-900 text-white z-50 flex flex-col justify-between rounded-[38px] overflow-hidden border border-slate-800"
                      id="ai-chatbot-panel"
                    >
                      {/* Chatbot Header */}
                      <div className="bg-slate-950/80 p-4 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center shadow-md border border-emerald-500/30">
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                          </div>
                          <div>
                            <div className="text-xs font-bold flex items-center space-x-1">
                              <span>FH AI Copilot</span>
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            </div>
                            <div className="text-[8px] text-slate-400 font-medium">Virtual Escrow & Gig Guide</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowChatbot(false)}
                          className="p-1.5 bg-slate-800/80 text-slate-300 hover:text-white rounded-full transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Chatbot Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 text-left">
                        {chatbotMessages.map((m) => {
                          const isMe = m.sender === "user";
                          return (
                            <div 
                              key={m.id} 
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed shadow-sm ${
                                isMe 
                                  ? "bg-emerald-600 text-white rounded-tr-none" 
                                  : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50"
                              }`}>
                                <div className="space-y-1">
                                  {renderFormattedText(m.text)}
                                </div>
                                <div className="text-[7px] text-slate-400 mt-1 text-right">
                                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {chatbotLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 text-[11px] border border-slate-700/50 flex items-center space-x-2 shadow-sm">
                              <span className="flex space-x-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                              </span>
                              <span>Copilot is typing...</span>
                            </div>
                          </div>
                        )}
                        <div ref={chatbotEndRef} />
                      </div>

                      {/* Chatbot Input Panel */}
                      <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 shrink-0">
                        <div className="flex space-x-2">
                          <input 
                            type="text"
                            value={chatbotInput}
                            onChange={(e) => setChatbotInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendChatbotMessage()}
                            placeholder="Ask about payments, milestones, escrow..."
                            className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-700"
                            disabled={chatbotLoading}
                          />
                          <button 
                            onClick={handleSendChatbotMessage}
                            disabled={chatbotLoading || !chatbotInput.trim()}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl transition flex items-center justify-center"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

          </div>

          {/* iOS Bottom bar */}
          <div className="h-5 bg-white flex justify-center items-center pb-2 shrink-0 select-none">
            <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
          </div>

        </div>
      </div>

      {/* ================= SIMULATOR FLOATING DETAILED DIALOGS ================= */}
      
      {/* 1. FREELANCER DETAILED PROFILE SHEET */}
      {selectedFreelancer && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end p-3 rounded-[38px] overflow-hidden">
          <div className="bg-white rounded-3xl p-5 space-y-4 max-h-[92%] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex space-x-3 items-center">
                <img src={selectedFreelancer.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center">
                    <span>{selectedFreelancer.firstName} {selectedFreelancer.lastName}</span>
                    {selectedFreelancer.kycStatus === "verified" && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-current ml-1" />
                    )}
                  </h4>
                  <div className="text-[10px] text-slate-400">{selectedFreelancer.businessName || "Verified Contractor"}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFreelancer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
              <span className="font-bold uppercase text-[9px] text-slate-400 block mb-1">Expert Bio</span>
              <p className="leading-relaxed text-[11px]">{selectedFreelancer.bio}</p>
            </div>

            {/* KYC Vetting Security Seal */}
            <div className={`p-3.5 rounded-2xl border text-left text-xs ${
              selectedFreelancer.kycStatus === "verified" 
                ? "bg-emerald-50/40 border-emerald-100" 
                : "bg-amber-50/40 border-amber-100"
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase text-[9px] text-slate-400">Security & KYC Vetting Seal</span>
                <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${
                  selectedFreelancer.kycStatus === "verified" 
                    ? "bg-emerald-600 text-white animate-pulse" 
                    : "bg-amber-500 text-white"
                }`}>
                  {selectedFreelancer.kycStatus === "verified" ? "Vetted Check ✓" : "Pending Vetting ⚠"}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                {selectedFreelancer.kycStatus === "verified" 
                  ? "Identity vetted through active biometric scanning & government national database registries matching." 
                  : "Vetting document under desk review. Safety escrow automatically locks funds securely."}
              </p>
              {selectedFreelancer.govtIdUrl && (
                <div className="mt-2 flex items-center space-x-2 p-1.5 bg-white border border-slate-100 rounded-lg">
                  <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                    <img src={selectedFreelancer.govtIdUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-slate-700 block truncate">Vetting_Document_Scan.png</span>
                    <span className="text-[7px] text-slate-400">Secure Cryptographic Storage Hash Verified</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block">Pricing Rate</span>
                <span className="font-bold text-emerald-600 text-xs">{selectedFreelancer.price.toLocaleString()} NGN / hr</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block">Experience Level</span>
                <span className="font-bold text-xs text-slate-800">{selectedFreelancer.yearsOfExperience} Years Vetted</span>
              </div>
            </div>

            {/* Certifications and credentials list */}
            {selectedFreelancer.certificates && selectedFreelancer.certificates.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold uppercase text-[9px] text-slate-400 block">Credentials verified</span>
                <div className="space-y-1">
                  {selectedFreelancer.certificates.map(c => (
                    <div key={c} className="text-[10px] text-slate-700 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Slider */}
            {selectedFreelancer.portfolio && selectedFreelancer.portfolio.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold uppercase text-[9px] text-slate-400 block">Featured Portfolio Gallery</span>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {selectedFreelancer.portfolio.map(p => (
                    <div key={p.id} className="w-28 shrink-0 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                      <img src={p.imageUrl} className="w-full h-16 rounded-lg object-cover" />
                      <span className="text-[9px] font-bold block mt-1 truncate text-slate-700">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action panel */}
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => {
                  // Pre-fill
                  setBookingTitle(`Urgent ${selectedFreelancer.servicesOffered?.[0] || "Services"}`);
                  setBookingDesc(`General task request for ${selectedFreelancer.servicesOffered?.[0]}.`);
                  setShowBookingDialog(true);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/10 transition"
              >
                Hire Instantly (Secure Escrow)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHOOSE GIG BOOKING TYPE SHEET */}
      {showBookingDialog && selectedFreelancer && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end p-3 rounded-[38px] overflow-hidden">
          <div className="bg-white rounded-3xl p-5 space-y-4 max-h-[92%] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Gig Order Setup</h4>
              <button 
                onClick={() => setShowBookingDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[9px]">Select Booking Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["instant", "scheduled", "emergency"] as const).map(type => (
                    <button
                       key={type}
                       onClick={() => setBookingType(type)}
                       className={`p-2 rounded-xl border text-[10px] font-bold uppercase transition ${
                        bookingType === type 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {bookingType === "scheduled" && (
                <div>
                  <label className="block text-slate-400 mb-1 font-bold uppercase text-[9px]">Schedule Date & Time</label>
                  <input 
                    type="datetime-local"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[9px]">Job Title</label>
                <input 
                  type="text"
                  placeholder="Kitchen pipe leak / Website fix"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[9px]">Scope / Requirements</label>
                <textarea 
                  placeholder="Briefly explain the issue for the provider..."
                  value={bookingDesc}
                  onChange={(e) => setBookingDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 h-20 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50/60 p-3 rounded-2xl space-y-1 font-medium text-slate-700">
                <div className="flex justify-between"><span>Base Rate:</span> <span className="font-bold">{selectedFreelancer.price.toLocaleString()} NGN</span></div>
                {bookingType === "emergency" && (
                  <div className="flex justify-between text-rose-600"><span>Emergency Levy (+50%):</span> <span className="font-bold">+{(selectedFreelancer.price * 0.5).toLocaleString()} NGN</span></div>
                )}
                <div className="flex justify-between border-t border-emerald-100 pt-1.5 font-bold text-emerald-800 text-xs">
                  <span>Secure Escrow Total:</span> 
                  <span>{(selectedFreelancer.price * (bookingType === "emergency" ? 1.5 : 1)).toLocaleString()} NGN</span>
                </div>
              </div>

              <button 
                onClick={handleConfirmBooking}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/15 transition"
              >
                Approve Payment & Lock Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIMULATED ACTIVE VOICE/VIDEO CALL CONSOLE */}
      {showCallScreen && (
        <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col justify-between p-8 rounded-[38px] text-white">
          <div className="text-center pt-8 space-y-2">
            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-emerald-300">
              {showCallScreen.type === "video" ? "VIDEO CONSULTATION" : "SECURE IN-APP CALL"}
            </span>
            <h3 className="text-lg font-bold">{showCallScreen.partnerName}</h3>
            <p className="text-xs text-slate-400 animate-pulse">Ringing via FreelanceHub Africa...</p>
          </div>

          {/* If video call, show mock camera frames */}
          {showCallScreen.type === "video" ? (
            <div className="w-full aspect-[3/4] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-slate-950/10"></div>
              <CameraMockup partnerName={showCallScreen.partnerName} />
              
              {/* User self camera box overlay */}
              <div className="absolute bottom-4 right-4 w-20 h-28 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-slate-700 flex items-center justify-center text-[10px]">Me</div>
              </div>
            </div>
          ) : (
            <div className="w-28 h-28 bg-emerald-600/20 border border-emerald-500/30 rounded-full mx-auto flex items-center justify-center animate-pulse">
              <PhoneCall className="w-10 h-10 text-emerald-400" />
            </div>
          )}

          <div className="space-y-6 pb-6">
            <p className="text-[10px] text-slate-500 text-center max-w-xs mx-auto">
              This is an encrypted WebRTC voice/video sandbox. Audio feeds are securely routed bypassing public grids.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowCallScreen(null)}
                className="w-14 h-14 bg-rose-600 hover:bg-rose-700 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBMIT REVIEW DIALOG SHEET */}
      {showReviewDialog && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end p-3 rounded-[38px] overflow-hidden">
          <div className="bg-white rounded-3xl p-5 space-y-4 max-h-[92%] overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-800 text-center">Rate and Review Freelancer</h4>
            
            <div className="flex justify-center space-x-1.5 py-2">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button 
                  key={stars} 
                  onClick={() => setReviewStars(stars)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star className={`w-8 h-8 ${stars <= reviewStars ? "text-amber-400 fill-current" : "text-slate-200"}`} />
                </button>
              ))}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase text-[9px]">Feedback Comment</label>
                <textarea 
                  placeholder="Share details of your experience with Emeka..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 h-24 focus:outline-none text-slate-800"
                />
              </div>

              <button 
                onClick={handleSubmitReview}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
              >
                Submit Verified Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. BIOMETRIC LOGIN SIMULATOR SHEET */}
      {showBiometricDialog && biometricTargetUser && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end p-3 rounded-[38px] overflow-hidden">
          <div className="bg-white rounded-3xl p-6 space-y-5 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Biometric Passkey Validation</h4>
              <button 
                onClick={() => setShowBiometricDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-500">
                Verifying secure credentials for <span className="font-bold text-slate-800">{biometricTargetUser.firstName} {biometricTargetUser.lastName}</span>
              </p>

              {/* Scan Animation Container */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Pulse waves */}
                <div className={`absolute inset-0 rounded-full border border-emerald-500/20 ${biometricScanning ? "animate-ping scale-110" : ""}`}></div>
                <div className={`absolute inset-4 rounded-full border border-emerald-500/40 ${biometricScanning ? "animate-pulse" : ""}`}></div>
                
                <button 
                  onClick={handleSimulateBiometricScan}
                  disabled={biometricScanning || biometricSuccess}
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-lg transition duration-300 ${
                    biometricSuccess 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : biometricScanning 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  {biometricSuccess ? (
                    <Check className="w-10 h-10 animate-bounce" />
                  ) : (
                    <Fingerprint className={`w-10 h-10 ${biometricScanning ? "animate-pulse" : ""}`} />
                  )}
                </button>
              </div>

              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  biometricSuccess ? "text-emerald-600" : biometricScanning ? "text-amber-500 animate-pulse" : "text-slate-400"
                }`}>
                  {biometricSuccess ? "AUM-PASSKEY APPROVED" : biometricScanning ? "SCANNING TOUCHPAD / FACIAL MAPPING..." : "TAP FINGERPRINT SENSOR TO START"}
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Using local sandboxed WebAuthn secure enclave
                </span>
              </div>
            </div>

            <button 
              onClick={handleSimulateBiometricScan}
              disabled={biometricScanning || biometricSuccess}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition hover:bg-slate-800"
            >
              {biometricSuccess ? "Authorized ✓" : biometricScanning ? "Reading biometric signature..." : "Authorize with Touch ID / Face ID"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Simulated SVG video feed generator
const CameraMockup: React.FC<{ partnerName: string }> = ({ partnerName }) => {
  return (
    <div className="text-center space-y-2 p-4 text-slate-400 text-xs">
      <div className="w-12 h-12 rounded-full bg-emerald-600/20 mx-auto flex items-center justify-center border border-emerald-500/30">
        <Video className="w-5 h-5 text-emerald-400" />
      </div>
      <p className="font-semibold text-white">Live Camera feed for {partnerName}</p>
      <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto text-slate-500">
        (Simulating WebRTC handshakes... camera permissions are enabled in application frame)
      </p>
    </div>
  );
};
