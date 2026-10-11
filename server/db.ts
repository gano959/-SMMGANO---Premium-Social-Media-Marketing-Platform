import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  walletBalanceEgp: number;
  walletBalanceUsd: number;
  preferredCurrency: 'EGP' | 'USD';
  language: 'ar' | 'en';
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
  currency: 'EGP' | 'USD';
  exchangeRateUsed: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Partial' | 'Canceled';
  startCount: number;
  remains: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  events: Array<{
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
  currency: 'EGP' | 'USD';
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
  currency: 'EGP' | 'USD';
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

export interface Settings {
  exchangeRateUsdToEgp: number; // e.g. 50.0
  mobileWalletDestination: string; // "01033537322"
  mobileWalletAccountName: string; // "Vodafone Cash & InstaPay Desk"
  mobileWalletInstructionsAr: string;
  mobileWalletInstructionsEn: string;
  cardGatewayFeePercent: number;
  fawryFeePercent: number;
  siteName: string;
  announcementAr: string;
  announcementEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  trustBadgeAr: string;
  trustBadgeEn: string;
  footerAboutAr: string;
  footerAboutEn: string;
  providerApiUrl?: string; // e.g. "https://justanotherpanel.com/api/v2"
  providerApiKey?: string;
  providerAutoOrderEnabled?: boolean;
  providerBalance?: number;
}

export interface PhoneOtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  services: Service[];
  orders: Order[];
  deposits: Deposit[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  settings: Settings;
  sessions: Record<string, { userId: string; expiresAt: number }>;
  otps?: Record<string, PhoneOtpRecord>;
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_burgundy_salt_2026').digest('hex');
}

const INITIAL_SERVICES: Service[] = [
  // Instagram
  {
    id: 'ig-101',
    platform: 'Instagram',
    category: 'Instagram Followers',
    name: 'Instagram Followers [HQ Real - 30 Days Refill - 10K/Day]',
    ratePer1000Usd: 1.20,
    ratePer1000Egp: 60.0,
    min: 50,
    max: 50000,
    avgTime: '15 Minutes',
    description: 'High quality real-looking profiles with posts and stories. Safe for personal and business accounts. 30 days automatic refill guarantee.',
    descriptionAr: 'متابعين انستغرام عالي الجودة بحسابات حقيقية وصور شخصية. آمن تماماً للحسابات الشخصية والتجارية مع ضمان إعادة تعبئة 30 يوم.',
    guarantee: '30 Days Refill',
    speed: '10,000 / Day',
    status: 'active'
  },
  {
    id: 'ig-102',
    platform: 'Instagram',
    category: 'Instagram Followers',
    name: 'Instagram Arab / Egyptian Followers [Targeted - Lifetime Guarantee]',
    ratePer1000Usd: 2.80,
    ratePer1000Egp: 140.0,
    min: 100,
    max: 20000,
    avgTime: '45 Minutes',
    description: 'Targeted Arabic & Egyptian follower profiles. Natural gradual delivery to avoid platform spikes.',
    descriptionAr: 'متابعين عرب ومصريين مستهدفين بحسابات نشطة. سرعة طبيعية تدريجية تناسب المتاجر والمؤثرين.',
    guarantee: 'Lifetime Refill',
    speed: '3,000 / Day',
    status: 'active'
  },
  {
    id: 'ig-103',
    platform: 'Instagram',
    category: 'Instagram Likes',
    name: 'Instagram Real Likes [Instant Start - Super Fast - High Retention]',
    ratePer1000Usd: 0.35,
    ratePer1000Egp: 17.5,
    min: 50,
    max: 100000,
    avgTime: '2 Minutes',
    description: 'Instant start likes on any post or reel. Helps boost discoverability on the Explore page.',
    descriptionAr: 'إعجابات انستغرام فورية لأي منشور أو ريلز. تساعد في رفع التفاعل والظهور في صفحة الاكسبلور.',
    guarantee: 'Non-Drop',
    speed: '50,000 / Day',
    status: 'active'
  },
  {
    id: 'ig-104',
    platform: 'Instagram',
    category: 'Instagram Views & Reels',
    name: 'Instagram Reels Views [Viral Algorithm Boost - Instant]',
    ratePer1000Usd: 0.15,
    ratePer1000Egp: 7.5,
    min: 100,
    max: 1000000,
    avgTime: 'Instant',
    description: 'Ultra fast reel views with high watch completion rate to trigger Instagram algorithm recommendation.',
    descriptionAr: 'مشاهدات ريلز فائقة السرعة مع معدل إكمال مرتفع لتفعيل خوارزمية المقترحات.',
    guarantee: 'Lifetime',
    speed: '500,000 / Day',
    status: 'active'
  },

  // TikTok
  {
    id: 'tt-201',
    platform: 'TikTok',
    category: 'TikTok Followers',
    name: 'TikTok Followers [Premium Stable - Non-Drop - 20K/Day]',
    ratePer1000Usd: 2.10,
    ratePer1000Egp: 105.0,
    min: 100,
    max: 50000,
    avgTime: '20 Minutes',
    description: 'Stable follower growth for TikTok accounts. Unlocks Creator and LIVE streaming features (1,000+ required).',
    descriptionAr: 'زيادة متابعين تيك توك ثابتين لفتح ميزة البث المباشر (LIVE) وصندوق المبدعين.',
    guarantee: '60 Days Refill',
    speed: '20,000 / Day',
    status: 'active'
  },
  {
    id: 'tt-202',
    platform: 'TikTok',
    category: 'TikTok Views',
    name: 'TikTok Video Views [FYP Trigger - Ultra Fast - Max 10M]',
    ratePer1000Usd: 0.08,
    ratePer1000Egp: 4.0,
    min: 1000,
    max: 5000000,
    avgTime: 'Instant',
    description: 'Ultra high-speed views to jumpstart new uploads on the For You Page (FYP).',
    descriptionAr: 'مشاهدات فائقة السرعة لدعم الفيديو للوصول إلى صفحة الاكسبلور فور يو (FYP).',
    guarantee: 'Non-Drop',
    speed: '1,000,000 / Day',
    status: 'active'
  },
  {
    id: 'tt-203',
    platform: 'TikTok',
    category: 'TikTok Likes & Shares',
    name: 'TikTok Real Likes [Real User Quality - Gradual]',
    ratePer1000Usd: 0.85,
    ratePer1000Egp: 42.5,
    min: 50,
    max: 100000,
    avgTime: '10 Minutes',
    description: 'High engagement likes to increase video interaction ratios.',
    descriptionAr: 'لايكات تيك توك عالية الجودة لرفع نسبة التفاعل وتحسين تصنيف الفيديو.',
    guarantee: '30 Days Refill',
    speed: '25,000 / Day',
    status: 'active'
  },

  // Facebook
  {
    id: 'fb-301',
    platform: 'Facebook',
    category: 'Facebook Page Likes & Followers',
    name: 'Facebook Page Likes + Followers [Real Mixed Worldwide - 30 Days]',
    ratePer1000Usd: 1.95,
    ratePer1000Egp: 97.5,
    min: 100,
    max: 20000,
    avgTime: '1 Hour',
    description: 'Grows both Page Likes and Followers simultaneously for business pages and public figures.',
    descriptionAr: 'زيادة إعجابات ومتابعي الصفحات العامة والتجارية معاً بمظهر موثوق.',
    guarantee: '30 Days Refill',
    speed: '5,000 / Day',
    status: 'active'
  },
  {
    id: 'fb-302',
    platform: 'Facebook',
    category: 'Facebook Post Reactions',
    name: 'Facebook Custom Post Reactions [Love / Care / Haha / Wow]',
    ratePer1000Usd: 0.60,
    ratePer1000Egp: 30.0,
    min: 50,
    max: 50000,
    avgTime: '5 Minutes',
    description: 'Selectable emotional reactions (Love, Care, Haha, Wow) for posts and pictures.',
    descriptionAr: 'رياكتات فيسبوك مخصصة (أحببته، ادعمه، هاها، واو) لمنشورات الصفحات والحسابات.',
    guarantee: 'Non-Drop',
    speed: '30,000 / Day',
    status: 'active'
  },

  // YouTube
  {
    id: 'yt-401',
    platform: 'YouTube',
    category: 'YouTube Subscribers',
    name: 'YouTube Subscribers [Monetization Eligible - Non-Drop]',
    ratePer1000Usd: 7.50,
    ratePer1000Egp: 375.0,
    min: 50,
    max: 5000,
    avgTime: '2 Hours',
    description: 'High-retention subscribers suitable for fulfilling YouTube Partner Program 1,000 subscriber quota.',
    descriptionAr: 'مشتركين يوتيوب مؤهلين لتحقيق شروط تفعيل الربح 1000 مشترك مع ثبات عالي.',
    guarantee: 'Lifetime Refill',
    speed: '500 / Day',
    status: 'active'
  },
  {
    id: 'yt-402',
    platform: 'YouTube',
    category: 'YouTube Views',
    name: 'YouTube Views [High Retention 3-5 Min - Suggested Videos Source]',
    ratePer1000Usd: 1.40,
    ratePer1000Egp: 70.0,
    min: 500,
    max: 500000,
    avgTime: '30 Minutes',
    description: 'Organic-style traffic from suggested videos and external search. 3 to 5 minutes average watch time.',
    descriptionAr: 'مشاهدات يوتيوب احتباس عالي (3 إلى 5 دقائق) من مصادر الفيديوهات المقترحة.',
    guarantee: 'Lifetime',
    speed: '20,000 / Day',
    status: 'active'
  },

  // Telegram
  {
    id: 'tg-501',
    platform: 'Telegram',
    category: 'Telegram Channel Members',
    name: 'Telegram Channel Members [Arab / Egyptian Community - 0% Drop]',
    ratePer1000Usd: 1.30,
    ratePer1000Egp: 65.0,
    min: 100,
    max: 100000,
    avgTime: '10 Minutes',
    description: 'High quality members for Telegram channels and public groups with Arabic/Egyptian profiles.',
    descriptionAr: 'أعضاء قنوات وجروبات تيليجرام عرب ومصريين بدون نقص لتعزيز موثوقية القناة.',
    guarantee: 'Lifetime Non-Drop',
    speed: '15,000 / Day',
    status: 'active'
  },
  {
    id: 'tg-502',
    platform: 'Telegram',
    category: 'Telegram Post Views',
    name: 'Telegram Post Views [Instant Multi-Post or Single Post]',
    ratePer1000Usd: 0.10,
    ratePer1000Egp: 5.0,
    min: 100,
    max: 500000,
    avgTime: 'Instant',
    description: 'Instant view count boost on recent channel announcements and forwardable posts.',
    descriptionAr: 'مشاهدات فورية لمنشورات تيليجرام لزيادة مصداقية وتفاعل المحتوى.',
    guarantee: 'Lifetime',
    speed: '200,000 / Day',
    status: 'active'
  },

  // X (Twitter)
  {
    id: 'x-601',
    platform: 'X (Twitter)',
    category: 'X Followers',
    name: 'X (Twitter) Followers [Active Looks - Organic Speed - 30 Days]',
    ratePer1000Usd: 2.90,
    ratePer1000Egp: 145.0,
    min: 50,
    max: 20000,
    avgTime: '30 Minutes',
    description: 'High standard Twitter/X profiles with avatars, bios, and tweets.',
    descriptionAr: 'متابعين تويتر / إكس ذوو مظهر حقيقي وسرعة طبيعية لضمان سلامة الحساب.',
    guarantee: '30 Days Refill',
    speed: '3,000 / Day',
    status: 'active'
  },
  {
    id: 'x-602',
    platform: 'X (Twitter)',
    category: 'X Retweets & Likes',
    name: 'X (Twitter) Retweets & Likes Combo [Boost Viral Potential]',
    ratePer1000Usd: 1.50,
    ratePer1000Egp: 75.0,
    min: 50,
    max: 10000,
    avgTime: '15 Minutes',
    description: 'Balanced retweets and likes package to amplify tweets and trends.',
    descriptionAr: 'إعادة تغريد ولايكات لتسريع انتشار التغريدات ومواكبة التريند.',
    guarantee: 'Non-Drop',
    speed: '5,000 / Day',
    status: 'active'
  },

  // Threads
  {
    id: 'th-701',
    platform: 'Threads',
    category: 'Threads Followers',
    name: 'Meta Threads Followers [Fast Delivery - Clean Profiles]',
    ratePer1000Usd: 1.80,
    ratePer1000Egp: 90.0,
    min: 50,
    max: 10000,
    avgTime: '20 Minutes',
    description: 'Direct followers for Instagram Threads accounts.',
    descriptionAr: 'متابعين منصة ثريدز من ميتا لتعزيز التواجد الرقمي السريع.',
    guarantee: '30 Days Refill',
    speed: '5,000 / Day',
    status: 'active'
  },

  // Snapchat
  {
    id: 'sc-801',
    platform: 'Snapchat',
    category: 'Snapchat Followers',
    name: 'Snapchat Public Profile Subscribers [Arab Traffic Support]',
    ratePer1000Usd: 4.20,
    ratePer1000Egp: 210.0,
    min: 100,
    max: 15000,
    avgTime: '1 Hour',
    description: 'Subscribers for Snapchat public profiles and creators.',
    descriptionAr: 'مشتركين لملف سناب شات التعريفي العام لدعم المبدعين والمتاجر.',
    guarantee: '30 Days Refill',
    speed: '2,000 / Day',
    status: 'active'
  },

  // Spotify
  {
    id: 'sp-901',
    platform: 'Spotify',
    category: 'Spotify Plays & Streams',
    name: 'Spotify Track Plays [Royalty Eligible - Top Tiers]',
    ratePer1000Usd: 1.10,
    ratePer1000Egp: 55.0,
    min: 500,
    max: 200000,
    avgTime: '1 Hour',
    description: 'High duration streams for Spotify tracks from active premium countries.',
    descriptionAr: 'استماعات سبوتيفاي للمسارات والأغاني مدة كاملة مؤهلة للأرباح.',
    guarantee: 'Lifetime',
    speed: '10,000 / Day',
    status: 'active'
  },

  // LinkedIn
  {
    id: 'li-1001',
    platform: 'LinkedIn',
    category: 'LinkedIn Followers & Connections',
    name: 'LinkedIn Company Page Followers [B2B Corporate Grade]',
    ratePer1000Usd: 8.50,
    ratePer1000Egp: 425.0,
    min: 100,
    max: 5000,
    avgTime: '3 Hours',
    description: 'Corporate profiles following company pages to build strong B2B credibility.',
    descriptionAr: 'متابعين لصفحات الشركات على لينكد إن من حسابات مهنية احترافية.',
    guarantee: '60 Days Refill',
    speed: '1,000 / Day',
    status: 'active'
  }
];

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.services) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing fresh seed', err);
    }

    // Default Seed Data
    const adminPasswordHash = hashPassword('Admin1234!');
    const userPasswordHash = hashPassword('User1234!');

    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'SMMGANO Executive Admin',
      email: 'admin@smmgano.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      walletBalanceEgp: 50000.0,
      walletBalanceUsd: 1000.0,
      preferredCurrency: 'EGP',
      language: 'ar',
      phone: '+201033537322',
      apiKey: 'gano_live_adm_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    };

    const clientUser: User = {
      id: 'usr-client-1',
      name: 'Ahmed El-Sayed (Demo Client)',
      email: 'client@smmgano.com',
      passwordHash: userPasswordHash,
      role: 'user',
      walletBalanceEgp: 1450.0,
      walletBalanceUsd: 35.0,
      preferredCurrency: 'EGP',
      language: 'ar',
      phone: '+201012345678',
      apiKey: 'gano_live_usr_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    };

    const initialSettings: Settings = {
      exchangeRateUsdToEgp: 50.0, // 1 USD = 50.0 EGP
      mobileWalletDestination: '01033537322',
      mobileWalletAccountName: 'Vodafone Cash & InstaPay Desk (SMMGANO)',
      mobileWalletInstructionsAr: 'يرجى تحويل المبلغ المطلوب إلى رقم فودافون كاش أو انستاباي: 01033537322 ثم تقديم رقم العملية ورقم هاتفك المحول منه لتأكيد الإيداع في رصيد SMMGANO.',
      mobileWalletInstructionsEn: 'Please transfer the desired amount to Vodafone Cash or InstaPay: 01033537322 and submit the transaction reference + your sender phone number for verification.',
      cardGatewayFeePercent: 2.5,
      fawryFeePercent: 1.5,
      siteName: 'SMMGANO',
      announcementAr: '🎉 أهلاً بك في منصة SMMGANO — السيرفر الأول لخدمات السوشيال ميديا! دعم فوري للمحافظ الإلكترونية والبطاقات.',
      announcementEn: '🎉 Welcome to SMMGANO — Grow Your Social Presence. Instant Electronic Payments & Automated Delivery!',
      heroTitleAr: 'SMMGANO — نمِّ تواجدك الرقمي على مواقع التواصل.',
      heroTitleEn: 'SMMGANO — Grow Your Social Presence.',
      heroSubtitleAr: 'منصتك الشاملة لخدمات التسويق الرقمي وإدارة التفاعل، وتتبع الطلبات، والوصول لأقوى الأدوات من لوحة تحكم واحدة وسلسة.',
      heroSubtitleEn: 'Your all-in-one social media marketing platform for managing engagement services, tracking orders, and accessing powerful tools through one seamless dashboard.',
      trustBadgeAr: 'السيرفر رقم #1 في مصر والشرق الأوسط للتسويق الرقمي',
      trustBadgeEn: 'Leading High-Speed SMM Infrastructure in Egypt & MENA',
      footerAboutAr: 'المنصة الرائدة في الشرق الأوسط لخدمات السوشيال ميديا والتسويق الرقمي بأسعار الجملة ودعم فوري.',
      footerAboutEn: 'Your all-in-one social media marketing platform for managing engagement services, tracking orders, and automated tools.'
    };

    const initialOrders: Order[] = [
      {
        id: 'ORD-78192',
        userId: clientUser.id,
        userEmail: clientUser.email,
        serviceId: 'ig-101',
        serviceName: 'Instagram Followers [HQ Real - 30 Days Refill - 10K/Day]',
        platform: 'Instagram',
        link: 'https://instagram.com/burgundy_brand_egypt',
        quantity: 2500,
        chargeAmount: 150.0,
        currency: 'EGP',
        exchangeRateUsed: 50.0,
        status: 'Completed',
        startCount: 1420,
        remains: 0,
        progressPercent: 100,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        events: [
          { status: 'Pending', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Order placed & deducted 150 EGP' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(), note: 'Dispatched to Instagram cluster' },
          { status: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'All 2,500 followers successfully delivered' }
        ]
      },
      {
        id: 'ORD-78250',
        userId: clientUser.id,
        userEmail: clientUser.email,
        serviceId: 'tt-202',
        serviceName: 'TikTok Video Views [FYP Trigger - Ultra Fast - Max 10M]',
        platform: 'TikTok',
        link: 'https://www.tiktok.com/@creator/video/734892182910',
        quantity: 10000,
        chargeAmount: 40.0,
        currency: 'EGP',
        exchangeRateUsed: 50.0,
        status: 'In Progress',
        startCount: 350,
        remains: 2400,
        progressPercent: 76,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
        events: [
          { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Order accepted' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(), note: 'Current count: 7,950 / 10,000' }
        ]
      }
    ];

    const initialDeposits: Deposit[] = [
      {
        id: 'DEP-49102',
        userId: clientUser.id,
        userEmail: clientUser.email,
        userName: clientUser.name,
        method: 'vodafone_cash',
        amount: 1000.0,
        currency: 'EGP',
        status: 'approved',
        referenceNumber: 'VF-998231024',
        senderPhone: '01012345678',
        receiptNote: 'Transferred via Vodafone Cash to 01033537322 at 2:30 PM',
        adminNote: 'Verified on Vodafone Cash portal, credited 1000 EGP',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        verifiedAt: new Date(Date.now() - 86400000 * 2.9).toISOString(),
        verifiedBy: 'admin@burgundysmm.com'
      },
      {
        id: 'DEP-49215',
        userId: clientUser.id,
        userEmail: clientUser.email,
        userName: clientUser.name,
        method: 'vodafone_cash',
        amount: 600.0,
        currency: 'EGP',
        status: 'pending',
        referenceNumber: 'VF-998245911',
        senderPhone: '01012345678',
        receiptNote: 'Sent 600 EGP to 01033537322 via InstaPay / VF Cash just now',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    const initialTransactions: Transaction[] = [
      {
        id: 'TXN-001',
        userId: clientUser.id,
        type: 'deposit',
        amount: 1000.0,
        currency: 'EGP',
        balanceAfter: 1640.0,
        description: 'Approved deposit via Vodafone Cash [Ref: VF-998231024]',
        referenceId: 'DEP-49102',
        createdAt: new Date(Date.now() - 86400000 * 2.9).toISOString()
      },
      {
        id: 'TXN-002',
        userId: clientUser.id,
        type: 'order_charge',
        amount: -150.0,
        currency: 'EGP',
        balanceAfter: 1490.0,
        description: 'Payment for Order #ORD-78192 (Instagram Followers)',
        referenceId: 'ORD-78192',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'TXN-003',
        userId: clientUser.id,
        type: 'order_charge',
        amount: -40.0,
        currency: 'EGP',
        balanceAfter: 1450.0,
        description: 'Payment for Order #ORD-78250 (TikTok Views)',
        referenceId: 'ORD-78250',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ];

    const initialTickets: SupportTicket[] = [
      {
        id: 'TCK-201',
        userId: clientUser.id,
        userEmail: clientUser.email,
        subject: 'Inquiry regarding custom API rate limits for Instagram Reels',
        orderId: 'ORD-78192',
        priority: 'medium',
        status: 'answered',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        messages: [
          {
            id: 'msg-1',
            sender: 'user',
            senderName: clientUser.name,
            message: 'Hello, what is the maximum recommended speed per hour for Instagram Reels views to look completely organic?',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'msg-2',
            sender: 'admin',
            senderName: 'Burgundy Support Team',
            message: 'Hello Ahmed! We recommend a drip-feed rate of approximately 2,000 to 5,000 views per hour for normal accounts. Our system naturally spaces the delivery.',
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
          }
        ]
      }
    ];

    const seeded: DatabaseSchema = {
      users: [adminUser, clientUser],
      services: INITIAL_SERVICES,
      orders: initialOrders,
      deposits: initialDeposits,
      transactions: initialTransactions,
      tickets: initialTickets,
      settings: initialSettings,
      sessions: {}
    };

    this.saveDatabaseSync(seeded);
    return seeded;
  }

  private saveDatabaseSync(dataToSave: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database.json', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDatabaseSync(this.data);
    }, 150);
  }

  // Accessors
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }

  public findUserByPhone(phone: string): User | undefined {
    const norm = this.normalizePhone(phone);
    if (!norm) return undefined;
    return this.data.users.find(u => u.phone && this.normalizePhone(u.phone) === norm);
  }

  public findUserByGoogleId(googleId: string): User | undefined {
    return this.data.users.find(u => u.googleId === googleId);
  }

  public generatePhoneOtp(phone: string): { code: string; expiresInSeconds: number } {
    if (!this.data.otps) {
      this.data.otps = {};
    }
    const norm = this.normalizePhone(phone);
    // Generate secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 300; // 5 minutes validity
    this.data.otps[norm] = {
      phone: norm,
      code,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      createdAt: new Date().toISOString()
    };
    this.save();
    return { code, expiresInSeconds };
  }

  public verifyPhoneOtp(phone: string, inputCode: string): boolean {
    if (!this.data.otps) return false;
    const norm = this.normalizePhone(phone);
    const record = this.data.otps[norm];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      delete this.data.otps[norm];
      this.save();
      return false;
    }
    if (record.code.trim() === inputCode.trim()) {
      delete this.data.otps[norm];
      this.save();
      return true;
    }
    return false;
  }

  public createOrLoginPhoneUser(params: {
    phone: string;
    name?: string;
    preferredCurrency?: 'EGP' | 'USD';
  }): User {
    const norm = this.normalizePhone(params.phone);
    let user = this.findUserByPhone(norm);
    if (user) {
      user.phoneVerified = true;
      if (params.name && !user.name) user.name = params.name;
      this.save();
      return user;
    }

    // Check if placeholder email already exists
    const cleanPhoneDigits = norm.replace(/\+/g, '');
    const generatedEmail = `user_${cleanPhoneDigits}@smmgano.com`;
    let existingEmailUser = this.findUserByEmail(generatedEmail);
    if (existingEmailUser) {
      existingEmailUser.phone = norm;
      existingEmailUser.phoneVerified = true;
      this.save();
      return existingEmailUser;
    }

    const newUser: User = {
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      name: params.name?.trim() || `عميل ${norm.slice(-4)}`,
      email: generatedEmail,
      phone: norm,
      phoneVerified: true,
      authProvider: 'phone',
      passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
      role: 'user',
      walletBalanceEgp: 0,
      walletBalanceUsd: 0,
      preferredCurrency: params.preferredCurrency || 'EGP',
      language: 'ar',
      apiKey: 'smm_live_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public createOrUpdateGoogleUser(params: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    preferredCurrency?: 'EGP' | 'USD';
  }): User {
    let user = this.findUserByGoogleId(params.googleId);
    if (!user) {
      user = this.findUserByEmail(params.email);
    }

    if (user) {
      user.googleId = params.googleId;
      user.authProvider = 'google';
      if (params.name) user.name = params.name;
      if (params.avatarUrl) user.avatarUrl = params.avatarUrl;
      this.save();
      return user;
    }

    const newUser: User = {
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      name: params.name || params.email.split('@')[0],
      email: params.email.toLowerCase(),
      googleId: params.googleId,
      avatarUrl: params.avatarUrl,
      authProvider: 'google',
      passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
      role: 'user',
      walletBalanceEgp: 0,
      walletBalanceUsd: 0,
      preferredCurrency: params.preferredCurrency || 'EGP',
      language: 'ar',
      apiKey: 'smm_live_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'walletBalanceEgp' | 'walletBalanceUsd' | 'apiKey'>): User {
    const newUser: User = {
      ...userData,
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      walletBalanceEgp: 0,
      walletBalanceUsd: 0,
      apiKey: 'smm_live_' + crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  public getServices(): Service[] {
    return this.data.services;
  }

  public findServiceById(id: string): Service | undefined {
    return this.data.services.find(s => s.id === id);
  }

  public updateService(id: string, updates: Partial<Service>): Service | undefined {
    const service = this.findServiceById(id);
    if (!service) return undefined;
    Object.assign(service, updates);
    this.save();
    return service;
  }

  public addService(serviceData: Omit<Service, 'id'>): Service {
    const newService: Service = {
      ...serviceData,
      id: 'srv-' + crypto.randomUUID().slice(0, 8)
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  public deleteService(id: string): boolean {
    const initialLen = this.data.services.length;
    this.data.services = this.data.services.filter(s => s.id !== id);
    if (this.data.services.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'progressPercent' | 'events' | 'startCount' | 'remains'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      startCount: Math.floor(100 + Math.random() * 500),
      remains: orderData.quantity,
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: `Order queued. Charged ${orderData.chargeAmount} ${orderData.currency}.`
        }
      ]
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, newStatus: Order['status'], note?: string): Order | undefined {
    const order = this.findOrderById(id);
    if (!order) return undefined;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    if (newStatus === 'Completed') {
      order.progressPercent = 100;
      order.remains = 0;
    } else if (newStatus === 'In Progress') {
      order.progressPercent = Math.max(15, order.progressPercent || 35);
      order.remains = Math.floor(order.quantity * 0.65);
    }
    order.events.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`
    });
    this.save();
    return order;
  }

  public getDeposits(userId?: string): Deposit[] {
    if (userId) {
      return this.data.deposits.filter(d => d.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.deposits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findDepositById(id: string): Deposit | undefined {
    return this.data.deposits.find(d => d.id === id);
  }

  public createDeposit(depositData: Omit<Deposit, 'id' | 'createdAt' | 'status'>): Deposit {
    const newDeposit: Deposit = {
      ...depositData,
      id: 'DEP-' + Math.floor(10000 + Math.random() * 90000),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.deposits.unshift(newDeposit);
    this.save();
    return newDeposit;
  }

  /**
   * Atomic deposit verification:
   * Credits user's wallet in the correct currency (EGP or USD) and records an immutable transaction ledger.
   */
  public verifyDeposit(depositId: string, approved: boolean, adminEmail: string, adminNote?: string): { success: boolean; deposit?: Deposit; error?: string } {
    const deposit = this.findDepositById(depositId);
    if (!deposit) return { success: false, error: 'Deposit not found' };
    if (deposit.status !== 'pending') return { success: false, error: `Deposit is already ${deposit.status}` };

    const user = this.findUserById(deposit.userId);
    if (!user) return { success: false, error: 'User not found' };

    deposit.verifiedAt = new Date().toISOString();
    deposit.verifiedBy = adminEmail;
    deposit.adminNote = adminNote || (approved ? 'Verified and approved' : 'Rejected by administrator');

    if (approved) {
      deposit.status = 'approved';
      if (deposit.currency === 'EGP') {
        user.walletBalanceEgp = Number((user.walletBalanceEgp + deposit.amount).toFixed(2));
      } else {
        user.walletBalanceUsd = Number((user.walletBalanceUsd + deposit.amount).toFixed(2));
      }

      // Record transaction ledger
      const txn: Transaction = {
        id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        userId: user.id,
        type: 'deposit',
        amount: deposit.amount,
        currency: deposit.currency,
        balanceAfter: deposit.currency === 'EGP' ? user.walletBalanceEgp : user.walletBalanceUsd,
        description: `Deposit via ${deposit.method.toUpperCase()} [Ref: ${deposit.referenceNumber}]`,
        referenceId: deposit.id,
        createdAt: new Date().toISOString()
      };
      this.data.transactions.unshift(txn);
    } else {
      deposit.status = 'rejected';
    }

    this.save();
    return { success: true, deposit };
  }

  public getTransactions(userId?: string): Transaction[] {
    if (userId) {
      return this.data.transactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addTransaction(txnData: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const newTxn: Transaction = {
      ...txnData,
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString()
    };
    this.data.transactions.unshift(newTxn);
    this.save();
    return newTxn;
  }

  public getTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.data.tickets.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findTicketById(id: string): SupportTicket | undefined {
    return this.data.tickets.find(t => t.id === id);
  }

  public createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string, senderName: string): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-' + crypto.randomUUID().slice(0, 8),
          sender: 'user',
          senderName,
          message: initialMessage,
          createdAt: new Date().toISOString()
        }
      ]
    };
    this.data.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  public addTicketMessage(ticketId: string, sender: 'user' | 'admin', senderName: string, text: string): SupportTicket | undefined {
    const ticket = this.findTicketById(ticketId);
    if (!ticket) return undefined;
    ticket.messages.push({
      id: 'msg-' + crypto.randomUUID().slice(0, 8),
      sender,
      senderName,
      message: text,
      createdAt: new Date().toISOString()
    });
    ticket.updatedAt = new Date().toISOString();
    ticket.status = sender === 'admin' ? 'answered' : 'open';
    this.save();
    return ticket;
  }

  public getSettings(): Settings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<Settings>): Settings {
    Object.assign(this.data.settings, updates);
    this.save();
    return this.data.settings;
  }

  // Session Management
  public createSession(userId: string): string {
    const token = 'sess_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    this.data.sessions[token] = { userId, expiresAt };
    this.save();
    return token;
  }

  public getSessionUser(token: string): User | undefined {
    const session = this.data.sessions[token];
    if (!session) return undefined;
    if (session.expiresAt < Date.now()) {
      delete this.data.sessions[token];
      this.save();
      return undefined;
    }
    return this.findUserById(session.userId);
  }

  public deleteSession(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  public verifyPassword(user: User, pass: string): boolean {
    return user.passwordHash === hashPassword(pass);
  }

  public setPassword(user: User, newPass: string) {
    user.passwordHash = hashPassword(newPass);
    this.save();
  }
}

export const db = new Database();
