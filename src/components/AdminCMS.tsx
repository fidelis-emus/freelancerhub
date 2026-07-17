import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { User, Category, Dispute, AppConfig, Transaction } from "../types";
import { 
  Users, Briefcase, CheckCircle2, XCircle, AlertTriangle, Settings, 
  Layers, Hammer, Landmark, DollarSign, FileText, Info, BarChart3, 
  Sparkles, RefreshCw, Eye, ThumbsUp, Trash, Plus, ShieldCheck, ShieldAlert, BookOpen
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from "recharts";

export const AdminCMS: React.FC = () => {
  const { 
    freelancers, customers, categories, bookings, disputes, transactions, 
    updateUserStatus, resolveDispute, addCategory, updateCategory, deleteCategory,
    config, updateConfig, resetConfig, getAIProfileAudit, getAIPricingSuggestion
  } = useApp();

  const [currentTab, setCurrentTab] = useState<"dashboard" | "users" | "categories" | "disputes" | "financials" | "cms" | "ai_sandbox">("dashboard");
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<User | null>(null);
  
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
  
  // App Config Settings form
  const [appName, setAppName] = useState(config.appName);
  const [banner, setBanner] = useState(config.homepageBanner);
  const [about, setAbout] = useState(config.aboutUs);
  const [email, setEmail] = useState(config.contactEmail);
  const [phone, setPhone] = useState(config.contactPhone);

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
      }
    }));
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
          {(["dashboard", "users", "categories", "disputes", "financials", "cms", "ai_sandbox"] as const).map(tab => (
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
        <div className="max-w-xl space-y-6">
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
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Withdrawal charge (NGN)</label>
                <input 
                  type="number"
                  value={charge}
                  onChange={(e) => setCharge(parseInt(e.target.value))}
                  className="w-full p-2.5 border border-slate-250 bg-slate-50 focus:bg-white text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

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
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10"
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
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/10"
            >
              Publish and Sync to App
            </button>
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

    </div>
  );
};
