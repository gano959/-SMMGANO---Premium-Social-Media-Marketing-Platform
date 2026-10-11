export type Currency = 'EGP' | 'USD';
export type Language = 'ar' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  walletBalanceEgp: number;
  walletBalanceUsd: number;
  preferredCurrency: Currency;
  language: Language;
  phone?: string;
  phoneVerified?: boolean;
  authProvider?: 'local' | 'google' | 'phone';
  googleId?: string;
  avatarUrl?: string;
  apiKey?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  platform: string;
  category: string;
  name: string;
  ratePer1000Usd: number;
  ratePer1000Egp: number;
  min: number;
  max: number;
  avgTime: string;
  description: string;
  descriptionAr: string;
  guarantee: string;
  speed: string;
  status: 'active' | 'maintenance';
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  link: string;
  quantity: number;
  chargeAmount: number;
  currency: Currency;
  exchangeRateUsed: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Partial' | 'Canceled';
  startCount: number;
  remains: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  events?: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

export interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  method: 'vodafone_cash' | 'instapay' | 'card' | 'fawry';
  amount: number;
  currency: Currency;
  status: 'pending' | 'approved' | 'rejected';
  referenceNumber: string;
  senderPhone?: string;
  receiptNote?: string;
  adminNote?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'order_charge' | 'refund' | 'admin_adjustment';
  amount: number;
  currency: Currency;
  balanceAfter: number;
  description: string;
  referenceId: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  orderId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    createdAt: string;
  }>;
}

export interface SiteConfig {
  siteName: string;
  exchangeRateUsdToEgp: number;
  mobileWalletDestination: string;
  mobileWalletAccountName: string;
  mobileWalletInstructionsAr: string;
  mobileWalletInstructionsEn: string;
  cardGatewayFeePercent: number;
  fawryFeePercent: number;
  announcementAr: string;
  announcementEn: string;
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  trustBadgeAr?: string;
  trustBadgeEn?: string;
  footerAboutAr?: string;
  footerAboutEn?: string;
  providerApiUrl?: string;
  providerApiKey?: string;
  providerAutoOrderEnabled?: boolean;
  providerBalance?: number;
  supportedCurrencies: Array<{
    code: Currency;
    symbol: string;
    name: string;
    isDefault: boolean;
  }>;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'BRUTE_FORCE_BLOCKED' | 'RATE_LIMIT_TRIGGERED' | 'XSS_ATTEMPT_BLOCKED' | 'ADMIN_ACTION' | 'FINANCIAL_TRANSACTION' | 'PROTOTYPE_POLLUTION_BLOCKED';
  severity: 'info' | 'warning' | 'critical' | 'success';
  ip: string;
  userAgent?: string;
  userId?: string;
  details: string;
}

export interface SecurityStats {
  blockedAttacksCount: number;
  verifiedRequestsCount: number;
  activeShields: {
    antiDDoS: boolean;
    antiBruteForce: boolean;
    xssSanitizer: boolean;
    sqlNoSqlInjectionGuard: boolean;
    escrowTamperGuard: boolean;
    sessionCryptoGuard: boolean;
    serverFingerprintHidden: boolean;
  };
  recentLogs: SecurityEvent[];
}

export interface SecurityScanCheck {
  name: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

export interface SecurityScanResult {
  message: string;
  timestamp: string;
  overallHealth: string;
  checks: SecurityScanCheck[];
}

