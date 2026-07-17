export type UserRole = "customer" | "freelancer" | "admin";

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  estimatedTime: string;
  images?: string[];
}

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone: string;
  whatsApp?: string;
  gender?: string;
  dob?: string;
  state: string;
  city: string;
  address: string;
  gpsLocation?: { lat: number; lng: number };
  avatarUrl?: string;
  
  // Freelancer specific KYC
  govtIdUrl?: string;
  selfieUrl?: string;
  kycStatus: "unverified" | "pending" | "verified" | "flagged" | "suspended";
  yearsOfExperience?: number;
  bio?: string;
  categories?: string[]; // IDs of categories
  servicesOffered?: string[]; // Subcategories/Services names
  languagesSpoken?: string[];
  rating: number;
  ratingCount: number;
  portfolio?: PortfolioItem[];
  servicesList?: ServicePackage[]; // Custom service packages list
  certificates?: string[];
  workingHours?: string; // e.g. "08:00 - 17:00"
  availability?: "available" | "busy" | "offline";
  price?: number; // base flat rate
  
  // Financial info
  walletBalance: number;
  pendingBalance: number;
  deviceInfo?: string;
  ipLog?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
  subcategories: string[];
  active: boolean;
}

export type BookingStatus = 
  | "pending" 
  | "accepted" 
  | "rejected" 
  | "started" 
  | "completed" 
  | "cancelled" 
  | "disputed";

export type PaymentStatus = 
  | "pending" 
  | "escrow" 
  | "released" 
  | "refunded";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mimeType?: string;
  isVoice?: boolean;
  isEmoji?: boolean;
  isRead?: boolean;
}

export interface RatingReview {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  timestamp: string;
  photos?: string[];
  verified: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingType: "instant" | "scheduled" | "emergency";
  scheduledTime?: string;
  location: string;
  gpsLocation?: { lat: number; lng: number };
  eta?: string; // e.g. "12 mins"
  distance?: string; // e.g. "2.4 km"
  currentStep: number; // 0: Assigned, 1: En Route, 2: Arrived, 3: In Progress, 4: Finished
  chatHistory: ChatMessage[];
  reviews?: RatingReview;
  paymentMethod: "card" | "transfer" | "wallet";
}

export interface Dispute {
  id: string;
  bookingId: string;
  bookingTitle: string;
  customerId: string;
  customerName: string;
  freelancerId: string;
  freelancerName: string;
  reason: string;
  openDate: string;
  status: "open" | "resolved_refund" | "resolved_payout" | "under_investigation";
  claimAmount: number;
}

export interface AppConfig {
  appName: string;
  headerLogo: string;
  homepageBanner: string;
  heroImage: string;
  aboutUs: string;
  contactEmail: string;
  contactPhone: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  terms: string;
  privacyPolicy: string;
  faqs: { q: string; a: string }[];
  platformCommission: number; // default e.g. 15%
  withdrawalCharge: number; // flat or e.g. 2%
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  supportedBanks: string[];
  
  // Custom enhanced configs
  platformFeeType?: "fixed" | "percentage" | "hybrid";
  platformFeeFixedValue?: number;
  platformFeePercentValue?: number;
  taxEnabled?: boolean;
  taxType?: "percentage" | "fixed";
  taxValue?: number;
  
  // Simulated App Uploads
  apkVersion?: string;
  apkSize?: string;
  apkReleaseNotes?: string;
  apkDownloadUrl?: string;
  
  // Multi-Bank Accounts list
  bankAccounts?: { id: string; bankName: string; accountNumber: string; accountName: string }[];
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  type: "deposit" | "escrow_lock" | "payout" | "withdrawal" | "refund";
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  description: string;
  reference: string;
}
