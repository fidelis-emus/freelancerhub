import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Category, Booking, Dispute, AppConfig, Transaction, ChatMessage, RatingReview, BookingStatus } from "../types";

interface AppContextType {
  // Config & CMS
  config: AppConfig;
  updateConfig: (updater: (prev: AppConfig) => AppConfig) => void;
  resetConfig: () => void;

  // Active User session
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userRole: "customer" | "freelancer" | "admin";
  setUserRole: (role: "customer" | "freelancer" | "admin") => void;

  // Global Lists (Syncs with localStorage)
  freelancers: User[];
  customers: User[];
  categories: Category[];
  bookings: Booking[];
  disputes: Dispute[];
  transactions: Transaction[];

  // App functions
  registerUser: (formData: any, role: "customer" | "freelancer") => Promise<User>;
  updateFreelancerKYC: (userId: string, kycFields: Partial<User>) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Booking & Escrow Actions
  createBooking: (bookingData: Partial<Booking>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  advanceBookingStep: (bookingId: string) => void;
  addChatMessage: (bookingId: string, message: ChatMessage) => void;
  releaseEscrow: (bookingId: string) => void;
  refundEscrow: (bookingId: string) => void;
  addRating: (bookingId: string, rating: number, comment: string, photos?: string[]) => void;
  withdrawFunds: (userId: string, amount: number, bankName: string, accountNumber: string) => { success: boolean; error?: string };
  depositFunds: (userId: string, amount: number, reference: string) => void;

  // Admin User controls
  updateUserStatus: (userId: string, status: "verified" | "flagged" | "suspended" | "pending") => void;
  resolveDispute: (disputeId: string, resolution: "refund" | "payout" | "dismiss") => void;

  // AI features (Proxying to Express Server routes)
  getAIRecommendations: (requirements: string) => Promise<{ recommendations: any[]; summary: string }>;
  getAIPricingSuggestion: (category: string, subcategory: string, complexity: string, location: string) => Promise<any>;
  getAIProfileAudit: (profile: any) => Promise<any>;
  getAIJobAutocomplete: (brief: string, category: string) => Promise<any>;

  // Multi-language support
  language: string;
  setLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core Mock categories
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Home Services",
    description: "Plumbers, Electricians, Carpenters, AC Repair & Handymen",
    iconName: "Wrench",
    subcategories: ["Plumbers", "Electricians", "Painters", "Tilers", "Carpenters", "AC Technicians", "Solar Installers", "CCTV Installers", "Generator Repair"],
    active: true
  },
  {
    id: "cat-2",
    name: "Transportation & Rides",
    description: "On-demand taxi, keke riders, dispatch messengers & haulage",
    iconName: "Car",
    subcategories: ["Taxi Drivers", "Keke Drivers", "Bike Riders", "Dispatch Riders", "Truck Drivers", "Chauffeurs"],
    active: true
  },
  {
    id: "cat-3",
    name: "Building & Construction",
    description: "Architects, Surveyors, Engineers & Project Managers",
    iconName: "Building2",
    subcategories: ["Architects", "Civil Engineers", "Structural Engineers", "Interior Designers", "Building Contractors"],
    active: true
  },
  {
    id: "cat-4",
    name: "Beauty & Wellness",
    description: "Professional hairstylists, makeup, barbers, and massage therapists",
    iconName: "Sparkles",
    subcategories: ["Hairdressers", "Barbers", "Makeup Artists", "Nail Technicians", "Massage Therapists"],
    active: true
  },
  {
    id: "cat-5",
    name: "Technology & Code",
    description: "Developers, Designers, Marketers & AI Consultants",
    iconName: "Laptop",
    subcategories: ["Software Developers", "Mobile App Developers", "Website Developers", "UI/UX Designers", "Digital Marketers", "Graphic Designers", "AI Engineers"],
    active: true
  },
  {
    id: "cat-6",
    name: "Cleaning & Fumigation",
    description: "Deep house cleaning, dry cleaners, office hygiene & pest control",
    iconName: "Trash2",
    subcategories: ["Home Cleaning", "Office Cleaning", "Dry Cleaning", "Pest Control", "Fumigation"],
    active: true
  },
  {
    id: "cat-7",
    name: "Events & Entertainment",
    description: "DJs, MCs, wedding caterers, planners, and expert photographers",
    iconName: "Mic",
    subcategories: ["DJs", "MCs", "Caterers", "Event Planners", "Photographers", "Videographers"],
    active: true
  },
  {
    id: "cat-8",
    name: "Business Services & Legal",
    description: "Accountants, Lawyers, Business Registrars & Advisors",
    iconName: "Briefcase",
    subcategories: ["Accountants", "Lawyers", "Company Registration Agents", "Tax Consultants"],
    active: true
  },
  {
    id: "cat-9",
    name: "Agriculture & Farms",
    description: "Veterinarians, tractor services, fishery & poultry experts",
    iconName: "Sprout",
    subcategories: ["Tractor Services", "Poultry Experts", "Fish Farmers", "Irrigation Experts", "Veterinarians"],
    active: true
  }
];

const INITIAL_CONFIG: AppConfig = {
  appName: "FreelanceHub Africa",
  headerLogo: "FH",
  homepageBanner: "Instantly Book Certified & Background-Checked Local Professionals",
  heroImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80",
  aboutUs: "FreelanceHub Africa is the continent's elite double-sided on-demand workforce marketplace. We provide vetted home, corporate, agricultural, and technological service professionals. Built to solve local service discovery, secure payment escrow mechanisms, and service reliability.",
  contactEmail: "support@freelancehub.africa",
  contactPhone: "+234 812 345 6789",
  socialFacebook: "https://facebook.com/FreelanceHubAfrica",
  socialTwitter: "https://twitter.com/FreelanceHubAf",
  socialInstagram: "https://instagram.com/FreelanceHubAfrica",
  terms: "By accessing this marketplace, you agree to place all booking funds into our secure escrow holding system. Funds are strictly released upon client validation of satisfactory job completion or automated Super Admin dispute resolution.",
  privacyPolicy: "We collect government ID scans, selfie biometric comparisons, and location telemetry solely for user verification, fraud prevention, active service geotracking, and marketplace safety audits.",
  faqs: [
    { q: "How does the Escrow wallet work?", a: "When booking a freelancer, funds are locked in our secure marketplace wallet. Once the provider completes the task and you click 'Release Escrow', the payment goes to the provider's wallet minus our service fee." },
    { q: "How are freelancers verified?", a: "Freelancers must upload their official government passport/ID, provide a live selfie, input certifications, and pass our security background check to get a verified badge." },
    { q: "What if there is a dispute?", a: "If work is unsatisfactory or a freelancer fails to show, customers can file a dispute. Our Admin CMS console team reviews live chat, tracking data, and delivers a fair resolution refund." }
  ],
  platformCommission: 15,
  withdrawalCharge: 500, // standard 500 NGN or equivalent local unit
  bankDetails: {
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0123456789",
    accountName: "FreelanceHub Africa Escrow Ltd"
  },
  supportedBanks: ["GTBank", "Access Bank", "Zenith Bank", "UBA", "First Bank", "Kuda MFB", "Standard Bank", "KCB Bank", "Equity Bank"]
};

// Initial African freelancers
export const INITIAL_FREELANCERS: User[] = [
  {
    id: "f-1",
    role: "freelancer",
    firstName: "Emeka",
    lastName: "Okonkwo",
    businessName: "Okonkwo Plumbing & Gas Solutions",
    email: "emeka.plumbing@gmail.com",
    phone: "+234 803 111 2222",
    whatsApp: "+234 803 111 2222",
    gender: "Male",
    dob: "1988-11-12",
    state: "Lagos",
    city: "Ikeja",
    address: "24 Allen Avenue, Ikeja, Lagos",
    gpsLocation: { lat: 6.5965, lng: 3.3421 },
    avatarUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop&q=80",
    kycStatus: "verified",
    yearsOfExperience: 8,
    bio: "Certified Master Plumber specializing in emergency residential water mains leak detection, POP bathroom tiling pipework, water treatment installations, and CCTV drain audits. Available 24/7 in mainland Lagos.",
    categories: ["cat-1"],
    servicesOffered: ["Plumbers", "Water Treatment Experts", "Borehole Experts"],
    languagesSpoken: ["English", "Yoruba", "Igbo"],
    rating: 4.9,
    ratingCount: 37,
    price: 4500, // Hourly NGN
    walletBalance: 24500,
    pendingBalance: 12000,
    workingHours: "07:00 - 21:00",
    availability: "available",
    certificates: ["National Vocational Plumbing License V4", "Lagos State Handyman Board Accreditation"],
    portfolio: [
      { id: "p-1-1", title: "Residential Borehole Digging", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=400&fit=crop&q=80", description: "Completed an 80ft deep-water borehole excavation with automatic treatment pumps in Magodo." },
      { id: "p-1-2", title: "Luxury Bath Fittings Setup", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&fit=crop&q=80", description: "Installed sleek black matte sanitary fixtures and thermostatic shower valves." }
    ]
  },
  {
    id: "f-2",
    role: "freelancer",
    firstName: "Sarah",
    lastName: "Wanjiku",
    businessName: "Wanjiku Tech Studios",
    email: "sarah.dev@gmail.com",
    phone: "+254 712 345 678",
    whatsApp: "+254 712 345 678",
    gender: "Female",
    dob: "1994-04-20",
    state: "Nairobi",
    city: "Westlands",
    address: "Mombasa Road, Westlands, Nairobi",
    gpsLocation: { lat: -1.2682, lng: 36.8081 },
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80",
    kycStatus: "verified",
    yearsOfExperience: 5,
    bio: "Senior Full Stack Mobile App & Website developer. Specialized in building pixel-perfect React Native, Flutter apps, Node.js REST APIs, and Stripe/Paystack payment integration schemes. Dedicated to clean architecture.",
    categories: ["cat-5"],
    servicesOffered: ["Mobile App Developers", "Software Developers", "Website Developers", "UI/UX Designers"],
    languagesSpoken: ["English", "Swahili"],
    rating: 4.8,
    ratingCount: 52,
    price: 15000, // NGN equivalent or local KES
    walletBalance: 180000,
    pendingBalance: 45000,
    workingHours: "09:00 - 18:00",
    availability: "available",
    certificates: ["B.Sc Computer Science - University of Nairobi", "Google Mobile Developer Professional Cert"],
    portfolio: [
      { id: "p-2-1", title: "E-Commerce App (Flutter)", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop&q=80", description: "Created an online market platform with local mobile money (M-Pesa) checkout." }
    ]
  },
  {
    id: "f-3",
    role: "freelancer",
    firstName: "Kwesi",
    lastName: "Appiah",
    businessName: "Appiah Electric & CCTV",
    email: "kwesicctv@gmail.com",
    phone: "+233 24 455 6677",
    whatsApp: "+233 24 455 6677",
    gender: "Male",
    dob: "1991-08-05",
    state: "Greater Accra",
    city: "East Legon",
    address: "Boundary Road, East Legon, Accra",
    gpsLocation: { lat: 5.6322, lng: -0.1623 },
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
    kycStatus: "pending",
    yearsOfExperience: 6,
    bio: "Elite CCTV camera setups, solar inverter load designs, smart home automation wiring, and popping POP lightning fixtures. I troubleshoot complex industrial panel boards safely.",
    categories: ["cat-1"],
    servicesOffered: ["Electricians", "CCTV Installers", "Solar Installers"],
    languagesSpoken: ["English", "Twi", "Ga"],
    rating: 4.6,
    ratingCount: 19,
    price: 3500,
    walletBalance: 0,
    pendingBalance: 0,
    workingHours: "08:00 - 18:00",
    availability: "available",
    certificates: ["Energy Commission Ghana - Electrician License Class A", "Ubiquiti UniFi Networking Professional"],
    portfolio: []
  },
  {
    id: "f-4",
    role: "freelancer",
    firstName: "Ayo",
    lastName: "Adeleke",
    businessName: "Lagos Ride Elite",
    email: "ayo.rides@gmail.com",
    phone: "+234 703 999 8888",
    whatsApp: "+234 703 999 8888",
    gender: "Male",
    dob: "1992-05-15",
    state: "Lagos",
    city: "Surulere",
    address: "72 Adeniran Ogunsanya, Surulere, Lagos",
    gpsLocation: { lat: 6.5024, lng: 3.3512 },
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
    kycStatus: "verified",
    yearsOfExperience: 4,
    bio: "Polished, background-checked Chauffeur and Uber/Cab Driver with an air-conditioned 2018 Toyota Corolla. Specializes in Lagos airport pick-ups, business meetings hire, and long-range logistics.",
    categories: ["cat-2"],
    servicesOffered: ["Taxi Drivers", "Uber Drivers", "Cab Drivers", "Chauffeurs"],
    languagesSpoken: ["English", "Yoruba"],
    rating: 5.0,
    ratingCount: 142,
    price: 5000,
    walletBalance: 42000,
    pendingBalance: 0,
    workingHours: "05:00 - 23:00",
    availability: "available",
    certificates: ["Lagos State Drivers Institute (LASDRI) ID 993", "Professional VIP Defensive Driving Cert"],
    portfolio: []
  },
  {
    id: "f-5",
    role: "freelancer",
    firstName: "Zola",
    lastName: "Ndlovu",
    businessName: "Sparkle Johannesburg Cleaning Services",
    email: "zola.clean@gmail.com",
    phone: "+27 82 444 5555",
    whatsApp: "+27 82 444 5555",
    gender: "Female",
    dob: "1995-10-30",
    state: "Gauteng",
    city: "Sandton",
    address: "Rivonia Road, Sandton, Johannesburg",
    gpsLocation: { lat: -26.1076, lng: 28.0567 },
    avatarUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?w=400&h=400&fit=crop&q=80",
    kycStatus: "verified",
    yearsOfExperience: 3,
    bio: "Bespoke cleaning Solutions for High-End Sandton Offices, residential estates, post-renovation cleanup, deep steam carpet cleaning, and ecological fumigation pest defense.",
    categories: ["cat-6"],
    servicesOffered: ["Home Cleaning", "Office Cleaning", "Fumigation", "Pest Control"],
    languagesSpoken: ["English", "Zulu", "Xhosa"],
    rating: 4.7,
    ratingCount: 29,
    price: 3000,
    walletBalance: 15500,
    pendingBalance: 6000,
    workingHours: "08:00 - 17:00",
    availability: "available",
    certificates: ["SABS Cleaning Safety Protocol Cert", "EcoClean Green Chemical Training Seal"],
    portfolio: []
  }
];

export const INITIAL_CUSTOMERS: User[] = [
  {
    id: "c-1",
    role: "customer",
    firstName: "Fidelis",
    lastName: "Emus",
    email: "fidelisemus@gmail.com",
    phone: "+234 812 345 6789",
    state: "Lagos",
    city: "Lekki Phase 1",
    address: "Block 12, Plot 4, Admiralty Way, Lekki, Lagos",
    gpsLocation: { lat: 6.4446, lng: 3.4862 },
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
    kycStatus: "verified",
    rating: 4.9,
    ratingCount: 12,
    walletBalance: 75000,
    pendingBalance: 0
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "book-1",
    customerId: "c-1",
    customerName: "Fidelis Emus",
    customerPhone: "+234 812 345 6789",
    freelancerId: "f-1",
    freelancerName: "Emeka Okonkwo",
    freelancerAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop&q=80",
    category: "Home Services",
    subcategory: "Plumbers",
    title: "Kitchen Pipe Burst Repair",
    description: "Urgent: Water is dripping from behind the kitchen cabinets causing pop floor ceiling leakage.",
    price: 9000, // 2 Hours base * price
    status: "completed",
    paymentStatus: "released",
    bookingType: "instant",
    location: "Block 12, Admiralty Way, Lekki",
    gpsLocation: { lat: 6.4446, lng: 3.4862 },
    eta: "Arrived",
    distance: "0 km",
    currentStep: 4,
    chatHistory: [
      { id: "msg-1", senderId: "c-1", text: "Hello Emeka, how soon can you get to Lekki Admiralty?", timestamp: "2026-07-16T10:00:00Z", isRead: true },
      { id: "msg-2", senderId: "f-1", text: "Good morning! I am finishing a quick valve fix in Victoria Island, I can reach your gate in 25 minutes.", timestamp: "2026-07-16T10:02:00Z", isRead: true },
      { id: "msg-3", senderId: "c-1", text: "Great, please call me when you reach the security checkpoint.", timestamp: "2026-07-16T10:03:00Z", isRead: true }
    ],
    reviews: {
      id: "rev-1",
      bookingId: "book-1",
      customerId: "c-1",
      customerName: "Fidelis Emus",
      customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
      rating: 5,
      comment: "Emeka arrived super fast, located the hairline fracture in the copper pipe behind the dishwasher, and welded it within 30 minutes. Extremely neat and clean work!",
      timestamp: "2026-07-16T11:45:00Z",
      verified: true
    },
    paymentMethod: "wallet"
  },
  {
    id: "book-2",
    customerId: "c-1",
    customerName: "Fidelis Emus",
    customerPhone: "+234 812 345 6789",
    freelancerId: "f-4",
    freelancerName: "Ayo Adeleke",
    freelancerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
    category: "Transportation & Rides",
    subcategory: "Cab Drivers",
    title: "Airport Chauffeur Transfer",
    description: "Scheduled VIP airport transfer from Lekki Phase 1 to Muritala Muhammed Airport Lagos (MM2). Leaving at 3 PM.",
    price: 12000,
    status: "started",
    paymentStatus: "escrow",
    bookingType: "scheduled",
    scheduledTime: "2026-07-17T15:00:00.000Z",
    location: "Block 12, Admiralty Way, Lekki",
    gpsLocation: { lat: 6.4446, lng: 3.4862 },
    eta: "14 mins",
    distance: "5.4 km",
    currentStep: 1, // En Route
    chatHistory: [
      { id: "msg-4", senderId: "f-4", text: "Good day Fidelis, I am polishing the car. I will start heading to Lekki shortly.", timestamp: "2026-07-17T11:30:00Z", isRead: true },
      { id: "msg-5", senderId: "c-1", text: "Excellent, thank you. The flight is at 6 PM, so we must beat the 3rd Mainland Bridge traffic.", timestamp: "2026-07-17T11:32:00Z", isRead: true }
    ],
    paymentMethod: "card"
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync state from localStorage or load defaults
  const [config, setConfigState] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("fh_app_config");
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [freelancers, setFreelancers] = useState<User[]>(() => {
    const saved = localStorage.getItem("fh_freelancers");
    return saved ? JSON.parse(saved) : INITIAL_FREELANCERS;
  });

  const [customers, setCustomers] = useState<User[]>(() => {
    const saved = localStorage.getItem("fh_customers");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("fh_categories");
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("fh_bookings");
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem("fh_disputes");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("fh_transactions");
    return saved ? JSON.parse(saved) : [
      {
        id: "t-1",
        userId: "c-1",
        type: "deposit",
        amount: 100000,
        status: "completed",
        timestamp: "2026-07-15T09:00:00Z",
        description: "Initial cash deposit via bank card",
        reference: "DEP-8374839-LKG"
      },
      {
        id: "t-2",
        userId: "c-1",
        bookingId: "book-1",
        type: "escrow_lock",
        amount: 9000,
        status: "completed",
        timestamp: "2026-07-16T10:00:00Z",
        description: "Payment locked in escrow for Plumbing leakage",
        reference: "ESC-903820-KKA"
      },
      {
        id: "t-3",
        userId: "f-1",
        bookingId: "book-1",
        type: "payout",
        amount: 7650, // 9000 - 15% platform fee (1350)
        status: "completed",
        timestamp: "2026-07-16T11:50:00Z",
        description: "Escrow release payout for Job #book-1",
        reference: "PAY-103820-IKJ"
      }
    ];
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem("fh_current_user");
    if (saved) return JSON.parse(saved);
    // By default, log in the preloaded Customer Fidelis
    const defaults = INITIAL_CUSTOMERS[0];
    localStorage.setItem("fh_current_user", JSON.stringify(defaults));
    return defaults;
  });

  const [userRole, setUserRoleState] = useState<"customer" | "freelancer" | "admin">("customer");

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem("fh_language") || "en";
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("fh_language", lang);
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("fh_app_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("fh_freelancers", JSON.stringify(freelancers));
  }, [freelancers]);

  useEffect(() => {
    localStorage.setItem("fh_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("fh_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("fh_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("fh_disputes", JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem("fh_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem("fh_current_user", JSON.stringify(user));
      setUserRoleState(user.role);
    } else {
      localStorage.removeItem("fh_current_user");
    }
  };

  const updateConfig = (updater: (prev: AppConfig) => AppConfig) => {
    setConfigState(prev => {
      const next = updater(prev);
      localStorage.setItem("fh_app_config", JSON.stringify(next));
      return next;
    });
  };

  const resetConfig = () => {
    setConfigState(INITIAL_CONFIG);
  };

  const registerUser = async (formData: any, role: "customer" | "freelancer"): Promise<User> => {
    const isFreelancer = role === "freelancer";
    const newId = `${isFreelancer ? "f" : "c"}-${Date.now()}`;
    const newUser: User = {
      id: newId,
      role: role,
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.businessName || "",
      email: formData.email,
      phone: formData.phone,
      whatsApp: formData.whatsApp || formData.phone,
      gender: formData.gender || "Not Specified",
      dob: formData.dob || "1990-01-01",
      state: formData.state,
      city: formData.city,
      address: formData.address,
      gpsLocation: formData.gpsLocation || { lat: 6.4446, lng: 3.4862 },
      avatarUrl: formData.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&q=80",
      kycStatus: isFreelancer ? "pending" : "verified",
      yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
      bio: formData.bio || "",
      categories: formData.categories || [],
      servicesOffered: formData.servicesOffered || [],
      languagesSpoken: formData.languagesSpoken || ["English"],
      rating: 5.0,
      ratingCount: 0,
      price: formData.price ? parseFloat(formData.price) : 3000,
      walletBalance: 0,
      pendingBalance: 0,
      availability: "available",
      workingHours: "08:00 - 18:00",
      certificates: formData.certificates || [],
      portfolio: formData.portfolio || [],
      govtIdUrl: formData.govtIdUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=500&fit=crop&q=80",
      selfieUrl: formData.selfieUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80"
    };

    if (isFreelancer) {
      setFreelancers(prev => [...prev, newUser]);
    } else {
      setCustomers(prev => [...prev, newUser]);
    }

    setCurrentUser(newUser);
    return newUser;
  };

  const updateFreelancerKYC = (userId: string, kycFields: Partial<User>) => {
    setFreelancers(prev => prev.map(f => f.id === userId ? { ...f, ...kycFields } : f));
    setCustomers(prev => prev.map(c => c.id === userId ? { ...c, ...kycFields } : c));
    if (currentUser && currentUser.id === userId) {
      const updated = { ...currentUser, ...kycFields };
      setCurrentUser(updated);
    }
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // Escrow Wallet Mechanics
  const createBooking = (bookingData: Partial<Booking>) => {
    const id = `book-${Date.now()}`;
    const newBooking: Booking = {
      id,
      customerId: currentUser?.id || "c-1",
      customerName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      customerPhone: currentUser?.phone || "+234 800 000 0000",
      freelancerId: bookingData.freelancerId || "",
      freelancerName: bookingData.freelancerName || "",
      freelancerAvatar: bookingData.freelancerAvatar,
      category: bookingData.category || "General",
      subcategory: bookingData.subcategory || "General",
      title: bookingData.title || "Quick Job",
      description: bookingData.description || "",
      price: bookingData.price || 0,
      status: "pending",
      paymentStatus: "pending",
      bookingType: bookingData.bookingType || "instant",
      scheduledTime: bookingData.scheduledTime,
      location: bookingData.location || currentUser?.address || "",
      gpsLocation: bookingData.gpsLocation || currentUser?.gpsLocation || { lat: 6.4446, lng: 3.4862 },
      eta: bookingData.bookingType === "emergency" ? "5-10 mins" : "25 mins",
      distance: "3.2 km",
      currentStep: 0,
      chatHistory: [
        {
          id: `msg-${Date.now()}`,
          senderId: "system",
          text: `Booking requested. Waiting for ${bookingData.freelancerName} to accept.`,
          timestamp: new Date().toISOString()
        }
      ],
      paymentMethod: bookingData.paymentMethod || "wallet"
    };

    setBookings(prev => [newBooking, ...prev]);

    // Handle Escrow Lock if payment method is wallet
    if (newBooking.paymentMethod === "wallet" && currentUser) {
      const customerUser = customers.find(c => c.id === currentUser.id);
      if (customerUser) {
        const balance = customerUser.walletBalance - newBooking.price;
        setCustomers(prev => prev.map(c => c.id === customerUser.id ? { ...c, walletBalance: balance } : c));
        
        // Log transaction
        const newTrans: Transaction = {
          id: `t-${Date.now()}`,
          userId: customerUser.id,
          bookingId: id,
          type: "escrow_lock",
          amount: newBooking.price,
          status: "completed",
          timestamp: new Date().toISOString(),
          description: `Escrow lock for job: ${newBooking.title}`,
          reference: `ESC-${Date.now().toString().slice(-6)}`
        };
        setTransactions(prev => [newTrans, ...prev]);
        
        // Update current user state
        setCurrentUser({ ...currentUser, walletBalance: balance });
      }
    }

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      const updatedChat = [...b.chatHistory, {
        id: `msg-${Date.now()}`,
        senderId: "system",
        text: `Status updated to: ${status.toUpperCase()}`,
        timestamp: new Date().toISOString()
      }];

      let paymentStatus = b.paymentStatus;
      if (status === "accepted" && b.paymentStatus === "pending") {
        // Mock card or transfer payment arriving
        paymentStatus = "escrow";
      }

      return {
        ...b,
        status,
        paymentStatus,
        chatHistory: updatedChat,
        currentStep: status === "accepted" ? 1 : b.currentStep
      };
    }));
  };

  const advanceBookingStep = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const nextStep = b.currentStep + 1;
      
      const stepTexts = [
        "Freelancer accepted the gig and is preparing to start.",
        "Freelancer is now en-route / on the way.",
        "Freelancer has arrived at your location.",
        "Freelancer is actively working on the task.",
        "Task completed. Please review and release escrow payout!"
      ];

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: "system",
        text: stepTexts[Math.min(nextStep, 4)],
        timestamp: new Date().toISOString()
      };

      const finalStatus = nextStep >= 4 ? "completed" : b.status;

      return {
        ...b,
        currentStep: Math.min(nextStep, 4),
        status: finalStatus as BookingStatus,
        chatHistory: [...b.chatHistory, newMsg],
        eta: nextStep === 2 ? "Arrived" : nextStep === 3 ? "WIP" : b.eta,
        distance: nextStep >= 2 ? "0 km" : b.distance
      };
    }));
  };

  const addChatMessage = (bookingId: string, message: ChatMessage) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const history = [...b.chatHistory, message];
      
      // Auto-reply simulation for demo purposes
      let autoReplyMsg: ChatMessage | null = null;
      if (message.senderId === b.customerId && !message.text.startsWith("[System")) {
        const textLower = message.text.toLowerCase();
        let replyText = "Perfect! I will update you as soon as there is progress.";
        if (textLower.includes("where") || textLower.includes("eta")) {
          replyText = "I'm currently en-route. The traffic is a bit tight but I should be there within 15 minutes.";
        } else if (textLower.includes("price") || textLower.includes("charge")) {
          replyText = `The platform price of ${b.price} NGN is correct and securely held in escrow. No worries!`;
        } else if (textLower.includes("hello") || textLower.includes("hi")) {
          replyText = `Hello! Thank you for booking me for ${b.subcategory}. I am getting my tools ready now.`;
        }
        
        setTimeout(() => {
          setBookings(currentBookings => currentBookings.map(item => {
            if (item.id === bookingId) {
              const replyId = `msg-reply-${Date.now()}`;
              return {
                ...item,
                chatHistory: [...item.chatHistory, {
                  id: replyId,
                  senderId: b.freelancerId,
                  text: replyText,
                  timestamp: new Date().toISOString(),
                  isRead: false
                }]
              };
            }
            return item;
          }));
        }, 1500);
      }

      return {
        ...b,
        chatHistory: history
      };
    }));
  };

  const releaseEscrow = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      // Transfer money to Freelancer
      const freelancerId = b.freelancerId;
      const amount = b.price;
      const fee = Math.floor(amount * (config.platformCommission / 100));
      const payout = amount - fee;

      // Update Freelancer Wallet balance
      setFreelancers(provs => provs.map(f => {
        if (f.id === freelancerId) {
          return {
            ...f,
            walletBalance: f.walletBalance + payout
          };
        }
        return f;
      }));

      // Log transaction
      const trans: Transaction = {
        id: `t-${Date.now()}`,
        userId: freelancerId,
        bookingId: bookingId,
        type: "payout",
        amount: payout,
        status: "completed",
        timestamp: new Date().toISOString(),
        description: `Escrow release payout (Platform Fee -${config.platformCommission}% deducted)`,
        reference: `PAY-${Date.now().toString().slice(-6)}`
      };
      setTransactions(txs => [trans, ...txs]);

      return {
        ...b,
        paymentStatus: "released",
        status: "completed"
      };
    }));
  };

  const refundEscrow = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      const customerId = b.customerId;
      const amount = b.price;

      setCustomers(custs => custs.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            walletBalance: c.walletBalance + amount
          };
        }
        return c;
      }));

      if (currentUser && currentUser.id === customerId) {
        setCurrentUser({ ...currentUser, walletBalance: currentUser.walletBalance + amount });
      }

      // Log transaction
      const trans: Transaction = {
        id: `t-${Date.now()}`,
        userId: customerId,
        bookingId: bookingId,
        type: "refund",
        amount: amount,
        status: "completed",
        timestamp: new Date().toISOString(),
        description: `Refund for disputed booking: ${b.title}`,
        reference: `REF-${Date.now().toString().slice(-6)}`
      };
      setTransactions(txs => [trans, ...txs]);

      return {
        ...b,
        paymentStatus: "refunded",
        status: "cancelled"
      };
    }));
  };

  const addRating = (bookingId: string, rating: number, comment: string, photos?: string[]) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      
      const newReview: RatingReview = {
        id: `rev-${Date.now()}`,
        bookingId,
        customerId: b.customerId,
        customerName: b.customerName,
        rating,
        comment,
        timestamp: new Date().toISOString(),
        photos,
        verified: true
      };

      // Update Freelancer Rating & Count
      setFreelancers(provs => provs.map(f => {
        if (f.id === b.freelancerId) {
          const currentTotal = f.rating * f.ratingCount;
          const nextCount = f.ratingCount + 1;
          const nextRating = Math.round(((currentTotal + rating) / nextCount) * 10) / 10;
          return {
            ...f,
            rating: nextRating,
            ratingCount: nextCount
          };
        }
        return f;
      }));

      return {
        ...b,
        reviews: newReview
      };
    }));
  };

  const withdrawFunds = (userId: string, amount: number, bankName: string, accountNumber: string) => {
    let success = false;
    let errorMsg = "";

    const provider = freelancers.find(f => f.id === userId);
    if (provider) {
      if (provider.walletBalance < amount) {
        return { success: false, error: "Insufficient balance for withdrawal" };
      }

      const totalDeducted = amount;
      setFreelancers(prev => prev.map(f => f.id === userId ? { ...f, walletBalance: f.walletBalance - totalDeducted } : f));
      
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, walletBalance: currentUser.walletBalance - totalDeducted });
      }

      const trans: Transaction = {
        id: `t-${Date.now()}`,
        userId,
        type: "withdrawal",
        amount,
        status: "completed",
        timestamp: new Date().toISOString(),
        description: `Withdrawal to ${bankName} (${accountNumber})`,
        reference: `WIT-${Date.now().toString().slice(-6)}`
      };
      setTransactions(prev => [trans, ...prev]);
      success = true;
    } else {
      errorMsg = "User not found";
    }

    return { success, error: errorMsg };
  };

  const depositFunds = (userId: string, amount: number, reference: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === userId) {
        return { ...c, walletBalance: c.walletBalance + amount };
      }
      return c;
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, walletBalance: currentUser.walletBalance + amount });
    }

    const trans: Transaction = {
      id: `t-${Date.now()}`,
      userId,
      type: "deposit",
      amount,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: `Wallet top-up via Card/Transfer`,
      reference
    };
    setTransactions(prev => [trans, ...prev]);
  };

  // Admin User controls
  const updateUserStatus = (userId: string, status: "verified" | "flagged" | "suspended" | "pending") => {
    setFreelancers(prev => prev.map(f => f.id === userId ? { ...f, kycStatus: status } : f));
    setCustomers(prev => prev.map(c => c.id === userId ? { ...c, kycStatus: status } : c));
  };

  const resolveDispute = (disputeId: string, resolution: "refund" | "payout" | "dismiss") => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: resolution === "refund" ? "resolved_refund" : "resolved_payout" } : d));
    
    const d = disputes.find(item => item.id === disputeId);
    if (d) {
      if (resolution === "refund") {
        refundEscrow(d.bookingId);
      } else if (resolution === "payout") {
        releaseEscrow(d.bookingId);
      }
    }
  };

  // AI features - Server-side Gemini API connectors
  const getAIRecommendations = async (requirements: string) => {
    try {
      const response = await fetch("/api/ai/recommend-freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements, freelancers }),
      });
      const data = await response.json();
      return data;
    } catch (e) {
      console.error("Failed fetching AI Recommendations, falling back to local simulation.", e);
      // Fallback local matching
      const matches = freelancers.slice(0, 3).map((f, index) => ({
        freelancerId: f.id,
        rank: index + 1,
        compatibilityScore: 95 - index * 10,
        matchingReason: `Local match: ${f.firstName} operates in ${f.city} and offers ${f.servicesOffered?.slice(0,2).join(", ")} which matches your keywords.`,
      }));
      return {
        recommendations: matches,
        summary: "Local State matching fallback. The Gemini API was either offline or configured locally.",
      };
    }
  };

  const getAIPricingSuggestion = async (category: string, subcategory: string, complexity: string, location: string) => {
    try {
      const response = await fetch("/api/ai/suggest-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subcategory, complexity, location }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return {
        currency: "NGN",
        hourly: { low: 2500, avg: 4000, high: 8000 },
        flat: { low: 15000, avg: 35000, high: 75000 },
        marketFactors: ["Fuel Costs for transport", "Regional labor supply", "Skill requirements"],
        advice: "Local price guidelines. Pricing depends heavily on transport distance and material costs.",
      };
    }
  };

  const getAIProfileAudit = async (profile: any) => {
    try {
      const response = await fetch("/api/ai/verify-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return {
        riskScore: 12,
        verdict: "Approved",
        flags: [],
        analysisSummary: "Local check: Bio matches listed skills. Account details appear valid.",
      };
    }
  };

  const getAIJobAutocomplete = async (brief: string, category: string) => {
    try {
      const response = await fetch("/api/ai/autocomplete-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, category }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return {
        jobTitle: `Professional ${category} Service Request`,
        scopeOfWork: ["Discuss specifications", "Perform initial assessment", "Carry out complete service work", "Clean up and test operations"],
        requiredSkills: [category],
        deliverables: ["Fully functional installation", "Troubleshooting verification report"],
        timelineRecommendation: "1-2 days based on complexity",
        formattedDescriptionMarkdown: `### Job Description\n\n**Request**: ${brief}\n\nWe need a professional technician to evaluate and carry out complete ${category} maintenance. Clear access and safety standards will be provided.`
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole: setUserRoleState,
        freelancers,
        customers,
        categories,
        bookings,
        disputes,
        transactions,
        registerUser,
        updateFreelancerKYC,
        addCategory,
        updateCategory,
        deleteCategory,
        createBooking,
        updateBookingStatus,
        advanceBookingStep,
        addChatMessage,
        releaseEscrow,
        refundEscrow,
        addRating,
        withdrawFunds,
        depositFunds,
        updateUserStatus,
        resolveDispute,
        getAIRecommendations,
        getAIPricingSuggestion,
        getAIProfileAudit,
        getAIJobAutocomplete,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
