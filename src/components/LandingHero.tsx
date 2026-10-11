import React, { useState, useEffect } from 'react';
import { Currency, Language, Service, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { SocialMediaIcon } from './SocialMediaIcons.js';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Activity,
  Zap,
  Sliders,
  Flame,
  Radio,
  Layers,
  Sparkles,
  Users,
  Eye,
  Heart,
  Share2,
  Clock
} from 'lucide-react';

interface LandingHeroProps {
  currency: Currency;
  language: Language;
  config: SiteConfig | null;
  services: Service[];
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTab: (tab: string) => void;
  onQuickDemoLogin: (role: 'admin' | 'user') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  currency,
  language,
  config,
  services,
  onOpenAuth,
  onSelectTab,
  onQuickDemoLogin
}) => {
  const t = useTranslation(language);
  const rate = config?.exchangeRateUsdToEgp || 50;

  // Selected for interactive calculator
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [quantity, setQuantity] = useState<number>(2500);

  // Animated live follower counter for hero preview
  const [liveCounter, setLiveCounter] = useState<number>(14280);
  const [liveLikes, setLiveLikes] = useState<number>(3420);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 5) + 1);
      setLiveLikes(prev => prev + Math.floor(Math.random() * 3));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const platformServices = services.filter(
    s => s.platform.toLowerCase() === selectedPlatform.toLowerCase()
  );
  const activeService = platformServices[0] || services[0];

  const estimatedPrice = activeService
    ? (currency === 'USD'
        ? (quantity / 1000) * activeService.ratePer1000Usd
        : (quantity / 1000) * (activeService.ratePer1000Usd * rate))
    : 0;

  const socialShowcase = [
    {
      name: 'Instagram',
      tag: 'ig',
      metric: `${liveCounter.toLocaleString()}+`,
      metricLabel: language === 'ar' ? 'متابعين حقيقيين' : 'Real Followers',
      iconClass: 'text-pink-500',
      bgGlow: 'hover:shadow-pink-500/20',
      servicesCount: '18 Services'
    },
    {
      name: 'TikTok',
      tag: 'tiktok',
      metric: '1.4M+',
      metricLabel: language === 'ar' ? 'مشاهدات فورية' : 'Instant Views',
      iconClass: 'text-slate-100',
      bgGlow: 'hover:shadow-rose-500/20',
      servicesCount: '14 Services'
    },
    {
      name: 'YouTube',
      tag: 'youtube',
      metric: '50K+',
      metricLabel: language === 'ar' ? 'ساعات مشاهدة ومشتركين' : 'Subs & Watch Time',
      iconClass: 'text-red-500',
      bgGlow: 'hover:shadow-red-500/20',
      servicesCount: '12 Services'
    },
    {
      name: 'Telegram',
      tag: 'telegram',
      metric: '85K+',
      metricLabel: language === 'ar' ? 'أعضاء قنوات وجروبات' : 'Channel Members',
      iconClass: 'text-sky-400',
      bgGlow: 'hover:shadow-sky-500/20',
      servicesCount: '9 Services'
    },
    {
      name: 'Facebook',
      tag: 'facebook',
      metric: '120K+',
      metricLabel: language === 'ar' ? 'متابعين وتفاعل صفحات' : 'Page Followers',
      iconClass: 'text-blue-500',
      bgGlow: 'hover:shadow-blue-500/20',
      servicesCount: '11 Services'
    },
    {
      name: 'X (Twitter)',
      tag: 'x',
      metric: '35K+',
      metricLabel: language === 'ar' ? 'ريتويت ومتابعين' : 'Retweets & Likes',
      iconClass: 'text-slate-200',
      bgGlow: 'hover:shadow-slate-400/20',
      servicesCount: '8 Services'
    }
  ];

  const liveTickerOrders = [
    { id: '#89201', platform: 'Instagram', service: 'HQ Followers', qty: '5,000', time: '1s ago' },
    { id: '#89202', platform: 'TikTok', service: 'High Speed Views', qty: '50,000', time: '4s ago' },
    { id: '#89203', platform: 'YouTube', service: 'Monetized Watch Time', qty: '1,000', time: '7s ago' },
    { id: '#89204', platform: 'Telegram', service: 'Non-Drop Members', qty: '2,500', time: '10s ago' },
    { id: '#89205', platform: 'Facebook', service: 'Page Likes & Followers', qty: '3,000', time: '14s ago' },
    { id: '#89206', platform: 'Instagram', service: 'Reels Viral Views', qty: '100,000', time: '18s ago' }
  ];

  return (
    <div className="relative overflow-hidden selection:bg-[#800020] selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#800020]/20 via-[#5C0018]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* SMMCPAN-Style Live Order Dispatch Ticker */}
      <div className="w-full overflow-hidden border-b border-[#800020]/20 dark:border-[#800020]/30 bg-white/70 dark:bg-[#120B0F]/90 backdrop-blur-md py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0 font-bold text-[#800020] dark:text-rose-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#800020] dark:text-rose-400" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {language === 'ar' ? 'التنفيذ اللحظي' : 'Live Feed'}
            </span>
          </div>
          <div className="overflow-hidden relative w-full">
            <div className="animate-ticker flex items-center gap-8 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              {liveTickerOrders.concat(liveTickerOrders).map((order, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <span className="text-[#800020] dark:text-rose-400 font-bold">{order.id}</span>
                  <span className="text-slate-400">·</span>
                  <SocialMediaIcon platform={order.platform} size="sm" className="opacity-80" />
                  <span>{order.service}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{order.qty}</span>
                  <span className="text-slate-400 text-[10px]">({order.time})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-10 pb-16 lg:pt-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#800020]/10 dark:bg-[#1E1117] text-[#800020] dark:text-rose-300 text-xs font-bold border border-[#800020]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'ar'
                  ? (config?.trustBadgeAr || 'سيرفر التسويق الرقمي الأول في مصر والشرق الأوسط')
                  : (config?.trustBadgeEn || 'SMMCPAN-Inspired Enterprise Infrastructure in Egypt & MENA')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
              {language === 'ar' ? (
                <span>{config?.heroTitleAr || 'SMMGANO — نمِّ تواجدك الرقمي على مواقع التواصل.'}</span>
              ) : (
                <span>{config?.heroTitleEn || 'SMMGANO — Grow Your Social Presence.'}</span>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? (config?.heroSubtitleAr || t.heroSubtitle)
                : (config?.heroSubtitleEn || t.heroSubtitle)}
            </p>

            {/* Quick Demo Access Buttons Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#160E13] border border-slate-200 dark:border-[#800020]/30 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'دخول فوري مباشر:' : 'Quick Demo Access:'}
              </span>
              <button
                onClick={() => onQuickDemoLogin('user')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.demoClient}</span>
                <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">1,450 EGP</span>
              </button>
              <button
                onClick={() => onQuickDemoLogin('admin')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white dark:bg-[#25151D] dark:hover:bg-[#341B28] dark:border dark:border-[#800020]/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
                <span>{t.demoAdmin}</span>
              </button>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#800020] via-[#A32645] to-[#5C0018] hover:opacity-95 shadow-lg shadow-[#800020]/30 hover:shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base group cursor-pointer"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onSelectTab('services')}
                className="px-6 py-3.5 rounded-xl font-bold text-[#800020] dark:text-rose-200 bg-white dark:bg-[#1A1015] border border-[#800020]/30 hover:border-[#800020] hover:bg-[#800020]/5 transition-all text-sm sm:text-base shadow-xs cursor-pointer"
              >
                {t.exploreServices}
              </button>
            </div>

            {/* Features check list with pure SVG icons */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#800020] dark:text-rose-400 shrink-0" />
                <span>{language === 'ar' ? 'فودافون كاش وانستاباي' : 'Vodafone Cash & InstaPay'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#800020] dark:text-rose-400 shrink-0" />
                <span>{language === 'ar' ? 'دفع إلكتروني آلي فوري' : 'Automated 24/7 Dispatch'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#800020] dark:text-rose-400 shrink-0" />
                <span>{language === 'ar' ? 'ضمان تعويض 30 يوماً' : '30-Day Refill Guarantee'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: SMMCPAN-Inspired Animated Social Media Card & Calculator */}
          <div className="lg:col-span-5 space-y-4">
            {/* Animated Social Media Floating Card Preview */}
            <div className="relative rounded-2xl bg-white dark:bg-[#140D11] border border-[#800020]/30 shadow-2xl p-6 sm:p-7 backdrop-blur-md">
              {/* Floating Social Pill 1 (Instagram live metric) */}
              <div className="absolute -top-3 -right-3 rtl:-right-auto rtl:-left-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-[#800020]/40 shadow-xl flex items-center gap-2 animate-float-slow text-xs font-mono font-bold z-20">
                <SocialMediaIcon platform="Instagram" size="sm" className="text-pink-400" />
                <span>+{liveCounter.toLocaleString()}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Floating Social Pill 2 (TikTok Views live metric) */}
              <div className="absolute -bottom-3 -left-3 rtl:-left-auto rtl:-right-3 px-3 py-1.5 rounded-xl bg-[#800020] text-white border border-rose-300/30 shadow-xl flex items-center gap-2 animate-float-reverse text-xs font-mono font-bold z-20">
                <SocialMediaIcon platform="TikTok" size="sm" className="text-white" />
                <span>+850K Views</span>
                <Zap className="w-3 h-3 text-amber-300" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#800020]/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#800020] to-[#5C0018] text-white flex items-center justify-center font-bold shadow-xs">
                    <Activity className="w-4 h-4 text-rose-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {language === 'ar' ? 'حاسبة الأسعار اللحظية' : 'Real-Time Rate Calculator'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'ar' ? 'تسعير رسمي بالجملة للموزعين' : 'Wholesale SMMCPAN Catalog'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#800020] dark:text-rose-300 bg-[#800020]/10 dark:bg-[#800020]/20 px-2.5 py-1 rounded-md font-mono">
                  {currency === 'EGP' ? 'EGP ج.م' : 'USD $'}
                </span>
              </div>

              {/* Platform Selector buttons with animated SVG brand icons */}
              <div className="pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t.platform}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Instagram', 'TikTok', 'YouTube', 'Telegram'].map(plat => (
                      <button
                        key={plat}
                        onClick={() => setSelectedPlatform(plat)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center border flex flex-col items-center gap-1 cursor-pointer ${
                          selectedPlatform === plat
                            ? 'bg-[#800020] text-white border-[#800020] shadow-sm'
                            : 'bg-slate-50 dark:bg-[#1D1117] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#800020]/30 hover:bg-slate-100 dark:hover:bg-[#281822]'
                        }`}
                      >
                        <SocialMediaIcon
                          platform={plat}
                          size="sm"
                          className={selectedPlatform === plat ? 'text-white' : 'opacity-80'}
                        />
                        <span className="text-[10px]">{plat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.service}
                  </label>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1D1117] border border-slate-200 dark:border-[#800020]/30 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {activeService ? activeService.name : 'Select a platform'}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#800020] dark:text-rose-400" />
                        {activeService?.speed || 'High speed'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        {activeService?.guarantee || 'Refill guaranteed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>{t.quantity}</span>
                    <span className="font-mono text-sm text-[#800020] dark:text-rose-300 font-bold">
                      {quantity.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full accent-[#800020] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>500</span>
                    <span>5,000</span>
                    <span>10,000</span>
                    <span>20,000</span>
                  </div>
                </div>

                {/* Calculation outcome */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#800020]/15 via-[#F8EEF1] to-white dark:from-[#25121B] dark:via-[#1A0E14] dark:to-[#120A0E] border border-[#800020]/30">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                        {t.totalCost}
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#800020] dark:text-rose-300 font-mono">
                        {currency === 'EGP'
                          ? `${estimatedPrice.toFixed(2)} EGP`
                          : `$${estimatedPrice.toFixed(2)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {t.orderNow}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMMCPAN-Style Animated Social Media Platforms Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#800020]/20 dark:border-[#800020]/30">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] dark:text-rose-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تغطية متكاملة لجميع المنصات' : 'Full Spectrum Social Coverage'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {language === 'ar' ? 'خدمات السوشيال ميديا المدعومة' : 'Supported Social Media Networks'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {language === 'ar'
              ? 'سرعات تسليم عالية، تحديثات مستمرة مع كل تحديث لخوارزميات المنصات، وحماية كاملة من النقصان'
              : 'Enterprise APIs, instant automated server queues, and lifetime refill warranties.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {socialShowcase.map((item, idx) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => onSelectTab('services')}
              className={`p-6 rounded-2xl bg-white dark:bg-[#140D11] border border-slate-200 dark:border-[#800020]/30 hover:border-[#800020] dark:hover:border-rose-400 transition-all cursor-pointer shadow-xs hover:shadow-xl group relative overflow-hidden ${item.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#20131A] border border-[#800020]/20 flex items-center justify-center shadow-xs">
                    <SocialMediaIcon platform={item.name} size="md" className={item.iconClass} glow={true} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#800020] dark:group-hover:text-rose-300 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.servicesCount}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#800020] dark:group-hover:text-rose-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
              </div>

              {/* Engagement counter simulation */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1016] border border-slate-100 dark:border-[#800020]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {item.metricLabel}
                  </span>
                  <span className="font-mono font-bold text-sm text-[#800020] dark:text-rose-300">
                    {item.metric}
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SMMCPAN Quantitative Platform Stats */}
      <section className="border-y border-[#800020]/20 dark:border-[#800020]/30 bg-white/70 dark:bg-[#120B0F]/90 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#800020] dark:text-rose-300 font-mono">
                1,840,000+
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'طلب تم إنجازه بنجاح' : 'Delivered Orders'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#800020] dark:text-rose-300 font-mono">
                01033537322
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'محفظة فودافون كاش الرسمية' : 'Official Cash Wallet'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#800020] dark:text-rose-300 font-mono">
                99.8%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'دقة الإنجاز بالموعد' : 'On-Time Automated Dispatch'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#800020] dark:text-rose-300 font-mono">
                24 / 7
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'دعم فني عبر تذاكر الويب' : 'Direct In-App Web Support'}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
