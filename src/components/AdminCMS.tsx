import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { User, Category, Dispute, AppConfig, Transaction } from "../types";
import { 
  Users, Briefcase, CheckCircle2, XCircle, AlertTriangle, Settings, 
  Layers, Hammer, Landmark, DollarSign, FileText, Info, BarChart3, 
  Sparkles, RefreshCw, Eye, ThumbsUp, Trash, Plus, ShieldCheck, ShieldAlert, BookOpen,
  Smartphone, Download, Cloud, Server, Copy, ExternalLink, HardDrive, Fingerprint, Activity, Cpu
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from "recharts";

export const AdminCMS: React.FC = () => {
  const { 
    freelancers, customers, categories, bookings, disputes, transactions, 
    updateUserStatus, resolveDispute, addCategory, updateCategory, deleteCategory,
    config, updateConfig, resetConfig, getAIProfileAudit, getAIPricingSuggestion,
    clearDemoData
  } = useApp();

  const [currentTab, setCurrentTab] = useState<"dashboard" | "users" | "categories" | "disputes" | "financials" | "cms" | "ai_sandbox" | "mobile_app">("dashboard");
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<User | null>(null);
  
  // Save Feedback states
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  // AI Sandbox Playground States
  const [sandboxProfile, setSandboxProfile] = useState<any>({
    firstName: "Amara",
    lastName: "Chukwu",
    bio: "Web developer with 10 years experience. Certified by Google and Microsoft.",
    services: "Web design, SEO, Code audits",
    experience: "10",
    price: "8500"
  });
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  const [sandboxPricing, setSandboxPricing] = useState({
    category: "Home Services",
    subcategory: "Solar Installers",
    complexity: "High Complexity",
    location: "Lagos, Nigeria"
  });
  const [aiPricingLoading, setAiPricingLoading] = useState(false);
  const [aiPricingResult, setAiPricingResult] = useState<any>(null);

  // Mobile App Manager States
  const [mobileReleases, setMobileReleases] = useState<any[]>([]);
  const [mobileStats, setMobileStats] = useState<any>(null);
  const [mobileLoading, setMobileLoading] = useState<boolean>(true);
  
  // Upload and form states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingApk, setIsUploadingApk] = useState<boolean>(false);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState<string>("2.2.0");
  const [uploadBuild, setUploadBuild] = useState<string>("220");
  const [uploadReleaseNotes, setUploadReleaseNotes] = useState<string>("• Added dynamic biometric credentials sync\n• Integrated secure escrow payment gateway\n• Enhanced offline-first chat stability");
  const [uploadMinAndroid, setUploadMinAndroid] = useState<string>("Android 8.0 (Oreo, API 26)");
  const [uploadStatus, setUploadStatus] = useState<string>("Production"); // Draft, Beta, Production
  const [storageProvider, setStorageProvider] = useState<string>("local");
  const [dragging, setDragging] = useState<boolean>(false);

  const fetchMobileManagementData = async () => {
    setMobileLoading(true);
    try {
      const response = await fetch("/api/mobile/management");
      if (response.ok) {
        const data = await response.json();
        setMobileReleases(data.releases);
        setMobileStats(data.stats);
        if (data.stats?.storageProvider) {
          setStorageProvider(data.stats.storageProvider);
        }
      }
    } catch (err) {
      console.error("Error loading mobile release metadata:", err);
    } finally {
      setMobileLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === "mobile_app") {
      fetchMobileManagementData();
    }
  }, [currentTab]);

  const handlePublishStatus = async (version: string, status: string) => {
    try {
      const res = await fetch("/api/mobile/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, status })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setSaveMessage(`Release status updated to ${status}!`);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchMobileManagementData();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteRelease = async (version: string) => {
    if (!window.confirm(`Are you sure you want to delete APK version ${version}?`)) return;
    try {
      const res = await fetch("/api/mobile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setSaveMessage(`Version ${version} has been removed from distribution.`);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchMobileManagementData();
      }
    } catch (err) {
      console.error("Error deleting release:", err);
    }
  };

  const handleStorageProviderChange = async (provider: string) => {
    try {
      setStorageProvider(provider);
      const res = await fetch("/api/mobile/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setSaveMessage(`Distribution storage provider swapped to ${provider.toUpperCase()}!`);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error updating storage provider:", err);
    }
  };

  const handleApkUploadSubmit = async () => {
    if (!apkFile) return;
    setIsUploadingApk(true);
    setUploadProgress(10);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setUploadProgress(40);
        const base64Data = (e.target?.result as string).split(",")[1];
        setUploadProgress(60);

        const payload = {
          filename: apkFile.name,
          fileContentBase64: base64Data,
          version: uploadVersion,
          build: uploadBuild,
          releaseNotes: uploadReleaseNotes,
          minAndroidVersion: uploadMinAndroid,
          status: uploadStatus,
          storageProvider: storageProvider
        };

        setUploadProgress(85);
        const res = await fetch("/api/mobile/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setUploadProgress(100);
          setSaveSuccess(true);
          setSaveMessage(`APK v${uploadVersion} successfully compiled, signed & deployed!`);
          setTimeout(() => setSaveSuccess(false), 3000);
          setApkFile(null);
          fetchMobileManagementData();
        } else {
          const errData = await res.json();
          alert("Upload failed: " + (errData.error || "Unknown server error"));
        }
        setIsUploadingApk(false);
      };
      reader.readAsDataURL(apkFile);
    } catch (err) {
      console.error(err);
      setIsUploadingApk(false);
    }
  };

  // Category CRUD States
  const [showAddCatDialog, setShowAddCatDialog] = useState(false);
  const [newCat, setNewCat] = useState({
    name: "",
    description: "",
    iconName: "Wrench",
    subcategories: ""
  });

  // Financial CMS States
  const [commission, setCommission] = useState(config.platformCommission);
  const [charge, setCharge] = useState(config.withdrawalCharge);
  const [bankName, setBankName] = useState(config.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(config.bankDetails.accountNumber);
  const [accountName, setAccountName] = useState(config.bankDetails.accountName);

  // Advanced Financial CMS States
  const [feeType, setFeeType] = useState<"fixed" | "percentage" | "hybrid">(config.platformFeeType || "percentage");
  const [feeFixedValue, setFeeFixedValue] = useState<number>(config.platformFeeFixedValue !== undefined ? config.platformFeeFixedValue : 500);
  const [feePercentValue, setFeePercentValue] = useState<number>(config.platformFeePercentValue !== undefined ? config.platformFeePercentValue : 15);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(config.taxEnabled || false);
  const [taxType, setTaxType] = useState<"percentage" | "fixed">(config.taxType || "percentage");
  const [taxValue, setTaxValue] = useState<number>(config.taxValue !== undefined ? config.taxValue : 7.5);

  // Slideshow States
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideSubtitle, setNewSlideSubtitle] = useState("");
  const [newSlideImage, setNewSlideImage] = useState("");
  
  // App Config Settings form
  const [appName, setAppName] = useState(config.appName);
  const [banner, setBanner] = useState(config.homepageBanner);
  const [about, setAbout] = useState(config.aboutUs);
  const [email, setEmail] = useState(config.contactEmail);
  const [phone, setPhone] = useState(config.contactPhone);

  // Synchronize component state when config is reloaded or updated
  useEffect(() => {
    setCommission(config.platformCommission);
    setCharge(config.withdrawalCharge);
    setBankName(config.bankDetails.bankName);
    setAccountNumber(config.bankDetails.accountNumber);
    setAccountName(config.bankDetails.accountName);
    setAppName(config.appName);
    setBanner(config.homepageBanner);
    setAbout(config.aboutUs);
    setEmail(config.contactEmail);
    setPhone(config.contactPhone);
    setFeeType(config.platformFeeType || "percentage");
    setFeeFixedValue(config.platformFeeFixedValue !== undefined ? config.platformFeeFixedValue : 500);
    setFeePercentValue(config.platformFeePercentValue !== undefined ? config.platformFeePercentValue : 15);
    setTaxEnabled(config.taxEnabled || false);
    setTaxType(config.taxType || "percentage");
    setTaxValue(config.taxValue !== undefined ? config.taxValue : 7.5);
  }, [config]);

  // Summary Metrics
  const totalUsers = freelancers.length + customers.length;
  const pendingKYC = freelancers.filter(f => f.kycStatus === "pending").length;
  const activeJobs = bookings.filter(b => b.status === "started" || b.status === "accepted").length;
  const totalRevenue = transactions
    .filter(t => t.type === "payout")
    .reduce((sum, t) => sum + Math.floor(t.amount * (config.platformCommission / 100)), 0);
  const pendingEscrow = bookings
    .filter(b => b.paymentStatus === "escrow")
    .reduce((sum, b) => sum + b.price, 0);

  // Chart Data preparation
  const revenueChartData = [
    { name: "Mon", Revenue: 14500, Escrow: 22000 },
    { name: "Tue", Revenue: 19800, Escrow: 34000 },
    { name: "Wed", Revenue: 21200, Escrow: 41000 },
    { name: "Thu", Revenue: 31000, Escrow: 52000 },
    { name: "Fri", Revenue: 38500, Escrow: 64000 },
    { name: "Sat", Revenue: 44000, Escrow: 75000 },
    { name: "Sun", Revenue: totalRevenue, Escrow: pendingEscrow }
  ];

  const categoryPieData = categories.map(cat => {
    const count = freelancers.filter(f => f.categories?.includes(cat.id)).length;
    return { name: cat.name, value: count || 1 };
  });

  const COLORS = ["#059669", "#0d9488", "#0284c7", "#4f46e5", "#7c3aed", "#ea580c", "#e11d48", "#1e293b"];

  // AI Profile Verification Trigger
  const handleAISandboxAudit = async () => {
    setAiAuditLoading(true);
    setAiAuditResult(null);
    try {
      const result = await getAIProfileAudit(sandboxProfile);
      setAiAuditResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiAuditLoading(false);
    }
  };

  // AI Pricing Estimation Trigger
  const handleAISandboxPricing = async () => {
    setAiPricingLoading(true);
    setAiPricingResult(null);
    try {
      const result = await getAIPricingSuggestion(
        sandboxPricing.category,
        sandboxPricing.subcategory,
        sandboxPricing.complexity,
        sandboxPricing.location
      );
      setAiPricingResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiPricingLoading(false);
    }
  };

  // Submit category Addition
  const handleAddCategory = () => {
    if (!newCat.name || !newCat.subcategories) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCat.name,
      description: newCat.description,
      iconName: newCat.iconName,
      subcategories: newCat.subcategories.split(",").map(s => s.trim()),
      active: true
    });
    setNewCat({ name: "", description: "", iconName: "Wrench", subcategories: "" });
    setShowAddCatDialog(false);
  };

  // Save financial configurations
  const handleSaveFinancials = () => {
    updateConfig(prev => ({
      ...prev,
      platformCommission: commission,
      withdrawalCharge: charge,
      bankDetails: {
        bankName,
        accountNumber,
        accountName
      },
      platformFeeType: feeType,
      platformFeeFixedValue: feeFixedValue,
      platformFeePercentValue: feeType === "percentage" || feeType === "hybrid" ? commission : feePercentValue,
      taxEnabled,
      taxType,
      taxValue
    }));
    setSaveSuccess(true);
    setSaveMessage("Escrow routing and platform commission fees updated successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Save general CMS content
  const handleSaveCMS = () => {
    updateConfig(prev => ({
      ...prev,
      appName,
      homepageBanner: banner,
      aboutUs: about,
      contactEmail: email,
      contactPhone: phone
    }));
    setSaveSuccess(true);
    setSaveMessage("Branding and general contact configuration published successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSlide = () => {
    if (!newSlideTitle.trim() || !newSlideImage) {
      setSaveSuccess(true);
      setSaveMessage("Slide title and image are required!");
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }
    const newSlide = {
      id: `slide-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newSlideTitle,
      subtitle: newSlideSubtitle,
      imageUrl: newSlideImage,
      active: true,
      displayOrder: (config.heroSlides || []).length + 1
    };
    updateConfig(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
    setNewSlideTitle("");
    setNewSlideSubtitle("");
    setNewSlideImage("");
    setSaveSuccess(true);
    setSaveMessage("New slide added successfully!");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col p-6 min-h-[500px] border-l border-slate-200">
      
      {/* CMS Top Admin Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 mb-6 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Super Admin CMS Console</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">
            {config.appName} Operations Panel
          </h2>
        </div>
        
        {/* Navigation Admin Controls Tab-bar */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200/85 shadow-sm">
          {(["dashboard", "users", "categories", "disputes", "financials", "cms", "ai_sandbox", "mobile_app"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                currentTab === tab 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ADMIN TAB CONTENT SWITCHER ================= */}
      
      {saveSuccess && (
        <div id="cms-save-notification" className="mb-6 p-4 bg-emerald-600 border border-emerald-700 text-white font-bold rounded-2xl flex items-center space-x-2.5 shadow-md shadow-emerald-600/10 text-xs transition duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          <span>{saveMessage || "Changes applied successfully!"}</span>
        </div>
      )}
      
      {/* TAB 1: EXECUTIVE ANALYTICAL DASHBOARD */}
      {currentTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Executive Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Platform Users</span>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-800 mt-1.5">{totalUsers}</div>
              <span className="text-[10px] text-emerald-600 font-medium">✓ Vetted and Registered</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Escrow Balance</span>
                <Landmark className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-800 mt-1.5">
                {pendingEscrow.toLocaleString()} <span className="text-xs text-slate-400">NGN</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">🔐 Safeguarded in holding</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform Commission</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-800 mt-1.5">
                {totalRevenue.toLocaleString()} <span className="text-xs text-slate-400">NGN</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">📈 Accumulated profits</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending KYC Audits</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-800 mt-1.5">{pendingKYC}</div>
              <span className="text-[10px] text-amber-600 font-medium">⚠️ Biometrics awaiting approval</span>
            </div>
          </div>

          {/* Graphical Analytics Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart A: Platform Revenue Trends */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Financial Transactions & Escrow Pipeline</span>
                </h4>
              </div>
              
              <div className="h-60 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#059669" fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="Escrow" stroke="#10B981" fillOpacity={0.1} fill="#10B981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Category Market Demands */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Category Market Share
              </h4>
              <div className="h-44 w-full flex items-center justify-center text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-500">
                {categories.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & BIOMETRIC KYC AUDITS */}
      {currentTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Users Auditing and Identity Verification Desk
            </h3>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Name / Business</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">KYC Status</th>
                    <th className="p-4 text-right">Actions / Auditing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...freelancers, ...customers].map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatarUrl} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-800">{u.firstName} {u.lastName}</div>
                            <div className="text-[10px] text-slate-500">{u.businessName || u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-500 uppercase tracking-wide text-[10px]">
                        {u.role}
                      </td>
                      <td className="p-4 text-slate-600">
                        {u.city}, {u.state}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          u.kycStatus === "verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                          u.kycStatus === "suspended" ? "bg-rose-50 text-rose-700 border border-rose-200/60" :
                          "bg-amber-50 text-amber-700 border border-amber-200/60"
                        }`}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button 
                          onClick={() => setSelectedUserForAudit(u)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-bold rounded-lg transition border border-emerald-100"
                        >
                          Audit KYC Documents
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive KYC Biometric Auditing Overlay Modal */}
          {selectedUserForAudit && (
            <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 relative shadow-2xl">
                <button 
                  onClick={() => setSelectedUserForAudit(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>

                <div>
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-widest">
                    Identity Biometric Matching Audit
                  </h3>
                  <h2 className="text-lg font-bold text-slate-800 mt-0.5">
                    {selectedUserForAudit.firstName} {selectedUserForAudit.lastName} ({selectedUserForAudit.role})
                  </h2>
                </div>

                {/* Biometric verification panel mock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">1. Government Passport Scan</span>
                    <img src={selectedUserForAudit.govtIdUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500&fit=crop&q=80"} className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                    <div className="text-[10px] text-slate-400">Document class: INTL_PASSPORT • OCR extraction verified</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">2. Facial Recognition Mapping (Selfie)</span>
                    <img src={selectedUserForAudit.selfieUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80"} className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span>✓ 97.4% Match with Passport Biometrics</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-150 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Current KYC Status:</span>
                    <span className="font-bold text-slate-700 uppercase">{selectedUserForAudit.kycStatus}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => { updateUserStatus(selectedUserForAudit.id, "suspended"); setSelectedUserForAudit(null); }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold rounded-xl transition border border-rose-100"
                    >
                      Ban Account
                    </button>
                    <button 
                      onClick={() => { updateUserStatus(selectedUserForAudit.id, "flagged"); setSelectedUserForAudit(null); }}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-bold rounded-xl transition border border-amber-100"
                    >
                      Flag for fraud
                    </button>
                    <button 
                      onClick={() => { updateUserStatus(selectedUserForAudit.id, "verified"); setSelectedUserForAudit(null); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10"
                    >
                      Approve and Verify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DYNAMIC CATEGORIES CUSTOMIZER */}
      {currentTab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform Category Taxonomy Management
            </h3>
            <button 
              onClick={() => setShowAddCatDialog(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      cat.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {cat.active ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-3">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.subcategories.map(s => (
                      <span key={s} className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[9px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100 text-[10px]">
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button 
                    onClick={() => updateCategory({ ...cat, active: !cat.active })}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Toggle Active
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal dialog */}
          {showAddCatDialog && (
            <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Custom Category</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Category Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Legal Services"
                      value={newCat.name}
                      onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Description</label>
                    <input 
                      type="text"
                      placeholder="Verified Attorneys, Solicitors and Registrars..."
                      value={newCat.description}
                      onChange={(e) => setNewCat({...newCat, description: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Subcategories (Comma separated)</label>
                    <input 
                      type="text"
                      placeholder="Attorneys, Company Registration, Tax Legal"
                      value={newCat.subcategories}
                      onChange={(e) => setNewCat({...newCat, subcategories: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-3">
                  <button 
                    onClick={() => setShowAddCatDialog(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCategory}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10"
                  >
                    Deploy Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISPUTE ARBITRATION RESOLUTION DESK */}
      {currentTab === "disputes" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Escrow Dispute Resolution Desk
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {disputes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-white border border-slate-200/85 rounded-2xl shadow-sm">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No open customer disputes logged in the system.</p>
              </div>
            ) : (
              disputes.map(d => (
                <div key={d.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Disputed Gig # {d.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{d.bookingTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1">Reason: "{d.reason}"</p>
                    </div>

                    <span className="text-xs font-bold text-rose-600">Claim: {d.claimAmount.toLocaleString()} NGN</span>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 text-xs text-slate-500">
                    <div>
                      <div className="flex items-center space-x-1.5"><span className="text-slate-400">Customer:</span> <span className="font-bold text-slate-700">{d.customerName}</span></div>
                      <div className="flex items-center space-x-1.5 mt-0.5"><span className="text-slate-400">Freelancer:</span> <span className="font-bold text-slate-700">{d.freelancerName}</span></div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => resolveDispute(d.id, "refund")}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold rounded-xl transition border border-rose-100 text-xs"
                      >
                        Refund Customer Entirely
                      </button>
                      <button 
                        onClick={() => resolveDispute(d.id, "payout")}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-xl transition border border-emerald-100 text-xs"
                      >
                        Release Payout to Freelancer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL COMMISSIONS & CHARGES CONFIGS */}
      {currentTab === "financials" && (
        <div className="max-w-2xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Escrow Settings and Bank Routing
          </h3>

          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 text-xs shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Platform Commission Fee (%)</label>
                <input 
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Withdrawal charge (NGN)</label>
                <input 
                  type="number"
                  value={charge}
                  onChange={(e) => setCharge(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            {/* Advanced Fee Rules */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Advanced Platform Fee Logic</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Fee Model</label>
                  <select 
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as "fixed" | "percentage" | "hybrid")}
                    className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="percentage">Percentage Commission Only</option>
                    <option value="fixed">Fixed Flat Booking Fee Only</option>
                    <option value="hybrid">Hybrid (Fixed + Percentage)</option>
                  </select>
                </div>

                {feeType !== "percentage" && (
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Fixed Fee (NGN)</label>
                    <input 
                      type="number"
                      value={feeFixedValue}
                      onChange={(e) => setFeeFixedValue(parseInt(e.target.value))}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tax Configurations */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Dynamic Tax/VAT Configurations</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={taxEnabled} 
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-[10px] text-slate-500 font-semibold">Enabled</span>
                </label>
              </div>

              {taxEnabled && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Tax Type</label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value as "percentage" | "fixed")}
                      className="w-full p-2 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none text-xs"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (NGN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Tax Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxValue}
                      onChange={(e) => setTaxValue(parseFloat(e.target.value))}
                      className="w-full p-2 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bank routing */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Escrow Bank Routing Account Details</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Bank Name</label>
                  <input 
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2.5 border border-slate-250 bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="e.g. GTBank"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Account Number</label>
                  <input 
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 border border-slate-250 bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                    placeholder="e.g. 0123456789"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Account Name</label>
                  <input 
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2.5 border border-slate-250 bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="e.g. FreelanceHub Ltd"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveFinancials}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              Apply Financial Rules
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: HOMEPAGE CMS TEXT CONTROL */}
      {currentTab === "cms" && (
        <div className="max-w-2xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Marketplace CMS Homepage Editor
          </h3>

          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 text-xs shadow-sm">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Application Branding Name</label>
              <input 
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Homepage Header Marketing Message</label>
              <input 
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">About Us Description</label>
              <textarea 
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl h-24 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Support Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Support Hotline</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveCMS}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              Publish and Sync to App
            </button>
          </div>

          {/* App Homepage Slideshow Manager */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 text-xs shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <Layers className="w-4 h-4 text-emerald-600 mr-2" />
              <span>App Homepage Slideshow Manager</span>
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Configure sliding hero banners on the mobile homepage. You can upload custom slide images directly from your system.
            </p>

            {/* Quick action buttons */}
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  updateConfig(prev => ({
                    ...prev,
                    heroSlides: (prev.heroSlides || []).map(s => ({ ...s, active: false }))
                  }));
                  setSaveSuccess(true);
                  setSaveMessage("All slides deactivated successfully.");
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-3 py-1.5 bg-rose-55 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition text-[10px] uppercase cursor-pointer"
              >
                🚫 Deactivate All Slides
              </button>
              <button
                type="button"
                onClick={() => {
                  updateConfig(prev => ({
                    ...prev,
                    heroSlides: (prev.heroSlides || []).map(s => ({ ...s, active: true }))
                  }));
                  setSaveSuccess(true);
                  setSaveMessage("All slides activated successfully.");
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-3 py-1.5 bg-emerald-55 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition text-[10px] uppercase cursor-pointer"
              >
                ✅ Activate All Slides
              </button>
            </div>

            {/* Upload form for a new slide */}
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
              <span className="font-bold text-slate-700 text-[11px] block">Upload & Add Custom Slide</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Slide Main Title</label>
                  <input
                    type="text"
                    value={newSlideTitle}
                    onChange={(e) => setNewSlideTitle(e.target.value)}
                    placeholder="e.g. Vetted Plumbers & AC Repairs"
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Slide Subtitle / Subtext</label>
                  <input
                    type="text"
                    value={newSlideSubtitle}
                    onChange={(e) => setNewSlideSubtitle(e.target.value)}
                    placeholder="e.g. On-demand emergency home care"
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Or Paste Slide Image URL (Optional - paste link instead to bypass local storage limits)</label>
                <input
                  type="text"
                  value={newSlideImage}
                  onChange={(e) => setNewSlideImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                  className="w-full p-2.5 border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1 text-[10px]">Slide Image File (Upload from System)</label>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-250">
                  <div className="relative w-16 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                    {newSlideImage ? (
                      <img src={newSlideImage} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="cms-slide-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 1000;
                              const MAX_HEIGHT = 600;
                              let width = img.width;
                              let height = img.height;

                              if (width > height) {
                                if (width > MAX_WIDTH) {
                                  height *= MAX_WIDTH / width;
                                  width = MAX_WIDTH;
                                }
                              } else {
                                if (height > MAX_HEIGHT) {
                                  width *= MAX_HEIGHT / height;
                                  height = MAX_HEIGHT;
                                }
                              }

                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG is extremely light and looks great
                                setNewSlideImage(compressedDataUrl);
                              } else {
                                setNewSlideImage(event.target?.result as string);
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="cms-slide-upload"
                      className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer transition shadow-sm uppercase tracking-wider"
                    >
                      Choose Local Image
                    </label>
                    <span className="text-[9px] text-slate-400 block mt-1">Accepts PNG, JPG, WebP. Converted to secure base64.</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-[10px] uppercase shadow-sm mt-1 cursor-pointer"
              >
                Add Slide To Homepage
              </button>
            </div>

            {/* List of current slides */}
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
              <span className="font-bold text-slate-700 text-[11px] block mb-2">Current Slide Inventory (Total: {(config.heroSlides || []).length})</span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {(config.heroSlides || []).map((slide) => (
                  <div key={slide.id} className="p-3 bg-slate-50 border border-slate-200/85 rounded-2xl flex items-center justify-between space-x-3 hover:bg-slate-100/55 transition text-xs">
                    <img src={slide.imageUrl} alt={slide.title} className="w-14 h-10 object-cover rounded-lg border border-slate-250 shadow-sm bg-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-[11px] truncate">{slide.title}</p>
                      <p className="text-[9px] text-slate-400 truncate leading-snug">{slide.subtitle}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig(prev => ({
                            ...prev,
                            heroSlides: (prev.heroSlides || []).map(s => s.id === slide.id ? { ...s, active: !s.active } : s)
                          }));
                        }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border transition cursor-pointer ${
                          slide.active
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-200 border-slate-350 text-slate-500"
                        }`}
                      >
                        {slide.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig(prev => ({
                            ...prev,
                            heroSlides: (prev.heroSlides || []).filter(s => s.id !== slide.id)
                          }));
                          setSaveSuccess(true);
                          setSaveMessage("Slide deleted successfully.");
                          setTimeout(() => setSaveSuccess(false), 3000);
                        }}
                        className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-lg transition cursor-pointer"
                        title="Delete slide"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Marketplace Reset & Production Ready Purge */}
          <div className="bg-rose-50 border border-rose-200/60 p-5 rounded-3xl space-y-4 text-xs shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center">
              <ShieldAlert className="w-4 h-4 text-rose-700 mr-2 animate-pulse" />
              <span>Marketplace Clean Production Setup</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Wipe out all standard preloaded demo accounts, test gigs, simulated booking transactions, and dispute trials. This sets the database to an empty, production-ready environment so real users can register and transact.
            </p>

            <div className="bg-white p-3.5 border border-rose-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 block text-[11px]">Enforce Production Mode</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Hides automated demo login options from the app onboarding screen.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.productionMode || false} 
                    onChange={(e) => {
                      updateConfig(prev => ({ ...prev, productionMode: e.target.checked }));
                      setSaveSuccess(true);
                      setSaveMessage(e.target.checked ? "Production mode enabled! Demo accounts hidden." : "Production mode disabled. Demo shortcuts enabled.");
                      setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
            </div>

            <div className="flex space-x-2.5">
              <button 
                type="button"
                onClick={() => {
                  if (window.confirm("Are you absolutely sure you want to permanently delete all mock users, transactions, and bookings from local storage? This action cannot be undone.")) {
                    clearDemoData();
                    setSaveSuccess(true);
                    setSaveMessage("Database successfully cleared! All demo profiles purged.");
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/10 flex items-center space-x-1 cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Wipe All Demo Database Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SERVER-SIDE GEMINI API INTEL PLAYGROUND */}
      {currentTab === "ai_sandbox" && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 p-4.5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest flex items-center">
              <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
              <span>Gemini Server-Side Intelligence Sandbox</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Interact directly with the server-side `@google/genai` models. This playground tests profile authenticities for spam, prevents fraud, auto-completes complex briefs, and estimates dynamic pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Play A: Biometric & Profile Verification */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Play A: Authenticity & Plagiarism Audit</span>
              
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">First Name</label>
                    <input 
                      type="text"
                      value={sandboxProfile.firstName}
                      onChange={(e) => setSandboxProfile({...sandboxProfile, firstName: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Years Exp.</label>
                    <input 
                      type="number"
                      value={sandboxProfile.experience}
                      onChange={(e) => setSandboxProfile({...sandboxProfile, experience: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Professional Profile Bio Description</label>
                  <textarea 
                    value={sandboxProfile.bio}
                    onChange={(e) => setSandboxProfile({...sandboxProfile, bio: e.target.value})}
                    className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button 
                  onClick={handleAISandboxAudit}
                  disabled={aiAuditLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/10"
                >
                  {aiAuditLoading ? "Auditing Bio via Gemini..." : "Audit Profile Authenticity"}
                </button>
              </div>

              {aiAuditResult && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Authenticity Score:</span> 
                    <span className={aiAuditResult.riskScore > 40 ? "text-rose-600" : "text-emerald-700"}>
                      {100 - aiAuditResult.riskScore}% Match
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Verdict:</span> 
                    <span className="uppercase text-emerald-700">{aiAuditResult.verdict}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-200/60 mt-1">{aiAuditResult.analysisSummary}</p>
                </div>
              )}
            </div>

            {/* Play B: Regional Labors Pricing Suggestion */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Play B: Regional Labor Price Estimation</span>
              
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">City, Country</label>
                    <input 
                      type="text"
                      value={sandboxPricing.location}
                      onChange={(e) => setSandboxPricing({...sandboxPricing, location: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Technical Specialty</label>
                    <input 
                      type="text"
                      value={sandboxPricing.subcategory}
                      onChange={(e) => setSandboxPricing({...sandboxPricing, subcategory: e.target.value})}
                      className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAISandboxPricing}
                  disabled={aiPricingLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/10"
                >
                  {aiPricingLoading ? "Calculating Rates..." : "Estimate Regional Pricing Guidelines"}
                </button>
              </div>

              {aiPricingResult && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Currency Determined:</span> 
                    <span className="text-emerald-700">{aiPricingResult.currency}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl text-[10px] shadow-sm">
                      <span className="text-slate-400 block">Est. Hourly Range</span>
                      <span className="font-bold text-slate-800">
                        {aiPricingResult.hourly?.low?.toLocaleString()} - {aiPricingResult.hourly?.high?.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl text-[10px] shadow-sm">
                      <span className="text-slate-400 block">Est. Project Flat</span>
                      <span className="font-bold text-slate-800">
                        {aiPricingResult.flat?.low?.toLocaleString()} - {aiPricingResult.flat?.high?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-200/60 mt-1">{aiPricingResult.advice}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 8: MOBILE APP MANAGER */}
      {currentTab === "mobile_app" && (
        <div className="space-y-6">
          {/* Header Description block */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>APK / AAB OTA Release Engine</span>
              </div>
              <h3 className="text-base font-black tracking-tight">Mobile App Distribution Manager</h3>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Compile, sign, and push over-the-air updates directly to the dynamic landing page downloaders and native simulator enclaves. Super administrators can manage active release statuses and trace download parameters.
              </p>
            </div>
            <button
              onClick={fetchMobileManagementData}
              disabled={mobileLoading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-bold rounded-xl transition text-[10px] uppercase tracking-wider flex items-center space-x-2 cursor-pointer self-stretch md:self-auto justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${mobileLoading ? "animate-spin" : ""}`} />
              <span>Refresh Control Node</span>
            </button>
          </div>

          {mobileLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Querying distribution clusters...</p>
            </div>
          ) : (
            <>
              {/* CURRENT ACTIVE APP RELEASE PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-emerald-600" />
                      <span>Current Active Mobile Application</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-black text-[9px] uppercase">
                      ONLINE
                    </span>
                  </div>

                  {mobileReleases.length > 0 ? (
                    (() => {
                      const activeApp = mobileReleases.find(r => r.status === "Production") || mobileReleases[0];
                      const protocol = window.location.protocol;
                      const host = window.location.host;
                      const downloadFullUrl = `${protocol}//${host}/downloads/${activeApp.filename}`;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2.5">
                            <div className="text-xs">
                              <span className="text-slate-400 block font-semibold text-[10px]">App Label</span>
                              <span className="font-bold text-slate-800 text-sm">FreelanceHub Africa Mobile App</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold text-[10px]">Package Version</span>
                                <span className="font-bold text-slate-800">v{activeApp.version}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold text-[10px]">Build Number</span>
                                <span className="font-bold text-slate-800">#{activeApp.build}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold text-[10px]">File Size</span>
                                <span className="font-bold text-slate-800">{activeApp.size}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold text-[10px]">Release Status</span>
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[9px] uppercase inline-block">
                                  {activeApp.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs pt-1">
                              <span className="text-slate-400 block font-semibold text-[10px]">Minimum Compatibility</span>
                              <span className="font-bold text-slate-800 text-[11px]">{activeApp.minAndroidVersion}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 flex flex-col justify-between">
                            <div className="text-xs space-y-1">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">Public CDN Link</span>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  readOnly
                                  value={downloadFullUrl}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 font-mono outline-none"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(downloadFullUrl);
                                    alert("CDN URL copied to clipboard!");
                                  }}
                                  className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <a
                                href={downloadFullUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition text-center uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/10"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Get Binary</span>
                              </a>
                              <button
                                onClick={() => {
                                  setUploadVersion(activeApp.version);
                                  setUploadBuild((parseInt(activeApp.build) + 1).toString());
                                  setUploadReleaseNotes(activeApp.releaseNotes);
                                  setUploadMinAndroid(activeApp.minAndroidVersion);
                                  document.getElementById("apk-drag-chooser")?.click();
                                }}
                                className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[10px] rounded-lg transition uppercase tracking-wider cursor-pointer"
                              >
                                Replace APK
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-slate-500 py-4">No active production APK deployed.</p>
                  )}
                </div>

                {/* STORAGE PROVIDER CONFIGURATION */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-emerald-600" />
                      <span>Release Storage Provider</span>
                    </span>
                    <p className="text-[10px] text-slate-400">Specify secure storage bucket coordinates.</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: "local", name: "Local Disk Sandbox", icon: HardDrive, desc: "Fast sandboxed storage (Development)" },
                      { id: "s3", name: "AWS S3 Cloud Buckets", icon: Cloud, desc: "Amazon Simple Storage Service" },
                      { id: "cloudinary", name: "Cloudinary CDN", icon: Server, desc: "Media Asset Pipeline" },
                      { id: "gcs", name: "Google Cloud Storage", icon: Cpu, desc: "Enterprise object storage Clusters" }
                    ].map(prov => {
                      const Icon = prov.icon;
                      const isSelected = storageProvider === prov.id;
                      return (
                        <button
                          key={prov.id}
                          onClick={() => handleStorageProviderChange(prov.id)}
                          className={`w-full p-2.5 border rounded-xl flex items-center space-x-3 text-left transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-500 text-slate-800 shadow-sm"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold">{prov.name}</div>
                            <div className="text-[9px] text-slate-400 leading-none mt-0.5">{prov.desc}</div>
                          </div>
                          {isSelected && (
                            <div className="ml-auto text-[9px] font-black text-emerald-700 shrink-0 uppercase tracking-wider bg-emerald-100/50 px-1.5 py-0.5 rounded">
                              Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* OVERALL APP DISTRIBUTION STATISTICS METRICS */}
              {mobileStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Downloads</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">{(mobileStats.total || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">✓ Verified OTA Hits</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Downloads Today</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">{(mobileStats.today || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">▲ 14% vs yesterday</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Downloads This Week</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">{(mobileStats.week || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">100% cloud delivery</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Downloads This Month</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">{(mobileStats.month || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">✓ Peak traffic: Mondays</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Latest Version Hits</span>
                    <span className="text-xl font-black text-emerald-600 block mt-1">{(mobileStats.latestVersion || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block mt-1">78.5% adoption rate</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Legacy Versions</span>
                    <span className="text-xl font-black text-slate-400 block mt-1">{(mobileStats.previousVersions || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block mt-1">21.5% old version hits</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DRAG AND DROP APK COMPILE & DEPLOY PANEL */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Compile, Sign & Deploys APK Release</span>
                    </span>
                    <p className="text-[10px] text-slate-400">Push over-the-air binary artifacts to your active users.</p>
                  </div>

                  {/* Drag and Drop area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && (file.name.endsWith(".apk") || file.name.endsWith(".aab"))) {
                        setApkFile(file);
                      } else {
                        alert("Please drop a valid .apk or .aab binary file.");
                      }
                    }}
                    onClick={() => document.getElementById("apk-drag-chooser")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 select-none ${
                      dragging
                        ? "bg-emerald-50 border-emerald-500 scale-98"
                        : apkFile
                          ? "bg-slate-50 border-slate-350"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".apk,.aab"
                      id="apk-drag-chooser"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setApkFile(file);
                      }}
                    />
                    <Smartphone className={`w-8 h-8 ${apkFile ? "text-emerald-600 animate-bounce" : "text-slate-400"}`} />
                    {apkFile ? (
                      <div>
                        <span className="text-[11px] font-black text-slate-800 block max-w-[280px] truncate mx-auto">{apkFile.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{(apkFile.size / (1024 * 1024)).toFixed(1)} MB • Click to replace file</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block">Drag & Drop .apk or .aab release file</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Or click to browse storage files</span>
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1 text-[10px] uppercase tracking-wider">Release Version</label>
                      <input
                        type="text"
                        value={uploadVersion}
                        onChange={(e) => setUploadVersion(e.target.value)}
                        placeholder="e.g. 2.2.0"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 font-bold rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1 text-[10px] uppercase tracking-wider">Build Number</label>
                      <input
                        type="text"
                        value={uploadBuild}
                        onChange={(e) => setUploadBuild(e.target.value)}
                        placeholder="e.g. 220"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 font-bold rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1 text-[10px] uppercase tracking-wider">Min Android Version</label>
                      <input
                        type="text"
                        value={uploadMinAndroid}
                        onChange={(e) => setUploadMinAndroid(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 font-bold rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1 text-[10px] uppercase tracking-wider">Initial Deployment Status</label>
                      <select
                        value={uploadStatus}
                        onChange={(e) => setUploadStatus(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="Draft">Draft (Internal Sandbox Only)</option>
                        <option value="Beta">Beta (Selected Cohort)</option>
                        <option value="Production">Production (Active Landing Page OTA)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-400 font-bold mb-1 text-[10px] uppercase tracking-wider">OTA Release Notes / What's New</label>
                    <textarea
                      rows={3}
                      value={uploadReleaseNotes}
                      onChange={(e) => setUploadReleaseNotes(e.target.value)}
                      placeholder="List changes..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 rounded-xl focus:outline-none font-medium leading-relaxed"
                    />
                  </div>

                  {isUploadingApk ? (
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Deploying Artifacts...</span>
                        <span className="text-emerald-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400 block leading-tight">
                        {uploadProgress <= 30 && "Signing binaries with SHA-256 secure certificate..."}
                        {uploadProgress > 30 && uploadProgress <= 70 && "Verifying compiler mappings & package alignments..."}
                        {uploadProgress > 70 && uploadProgress < 100 && `Pushing binary file to ${storageProvider.toUpperCase()} Storage Bucket...`}
                        {uploadProgress === 100 && "Compilation & Deploy complete!"}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!apkFile}
                      onClick={handleApkUploadSubmit}
                      className={`w-full py-3 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 ${
                        apkFile
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                          : "bg-slate-300 text-slate-450 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <Cpu className="w-4 h-4 text-white" />
                      <span>Compile, Sign & Deploy Version {uploadVersion}</span>
                    </button>
                  )}
                </div>

                {/* DISTRIBUTION PLATFORM METRIC GRAPHICS & METERS */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Operating System & Device Breakdown</span>
                    </span>
                    <p className="text-[10px] text-slate-400">Live breakdown of connected devices checking for OTA updates.</p>
                  </div>

                  {mobileStats && (
                    <div className="space-y-5">
                      {/* Android Version Meters */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Android OS Version Breakdown</span>
                        <div className="space-y-2 text-[10px]">
                          {Object.entries(mobileStats.androidVersionBreakdown || {}).map(([ver, count]: [string, any]) => {
                            const percent = ((count / mobileStats.total) * 100).toFixed(1);
                            return (
                              <div key={ver} className="space-y-1">
                                <div className="flex justify-between font-bold text-slate-600 text-[9px]">
                                  <span>{ver}</span>
                                  <span>{count.toLocaleString()} hits ({percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-slate-700 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Device Manufacturer Meters */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Device Manufacturer Breakdown</span>
                        <div className="space-y-2 text-[10px]">
                          {Object.entries(mobileStats.deviceBreakdown || {}).map(([dev, count]: [string, any]) => {
                            const percent = ((count / mobileStats.total) * 100).toFixed(1);
                            return (
                              <div key={dev} className="space-y-1">
                                <div className="flex justify-between font-bold text-slate-600 text-[9px]">
                                  <span>{dev} Smartphones</span>
                                  <span>{count.toLocaleString()} hits ({percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* VERSION HISTORY & ROLLBACK TERMINAL */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>App Release Version History & Control Terminal</span>
                  </span>
                  <p className="text-[10px] text-slate-400">Manage statuses, roll back deployment packages, or delete old builds.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-slate-700 text-xs select-none">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] uppercase font-black text-slate-400">
                        <th className="py-2.5 px-3">Release Version</th>
                        <th className="py-2.5 px-3">Build</th>
                        <th className="py-2.5 px-3">Package Filename</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Deploy Date</th>
                        <th className="py-2.5 px-3">Deployment Status</th>
                        <th className="py-2.5 px-3 text-center">Downloads</th>
                        <th className="py-2.5 px-3 text-right">OTA Control Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {mobileReleases.map((rel, index) => {
                        const protocol = window.location.protocol;
                        const host = window.location.host;
                        const downloadFullUrl = `${protocol}//${host}/downloads/${rel.filename}`;

                        return (
                          <tr key={rel.version} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 text-[11px] block">v{rel.version}</span>
                              {index === 0 && (
                                <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded uppercase block mt-0.5 w-max">
                                  LATEST BUILD
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] text-slate-500">#{rel.build}</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-slate-500 max-w-[150px] truncate" title={rel.filename}>
                              {rel.filename}
                            </td>
                            <td className="py-3 px-3 text-slate-500">{rel.size}</td>
                            <td className="py-3 px-3 text-slate-500">{rel.uploadDate}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                rel.status === "Production"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : rel.status === "Beta"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}>
                                {rel.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {(rel.downloads || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {rel.status !== "Production" ? (
                                  <button
                                    onClick={() => handlePublishStatus(rel.version, "Production")}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded text-[9px] font-bold uppercase transition cursor-pointer"
                                    title="Publish package to all landing page downloaders"
                                  >
                                    Publish / Rollback
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="px-2 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[9px] font-bold uppercase transition"
                                  >
                                    Active Production
                                  </button>
                                )}
                                <a
                                  href={downloadFullUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 text-[9px] font-bold uppercase transition inline-block text-center"
                                  title="Test package link downloads"
                                >
                                  Download
                                </a>
                                <button
                                  onClick={() => handleDeleteRelease(rel.version)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded transition cursor-pointer"
                                  title="Delete compilation package"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};
