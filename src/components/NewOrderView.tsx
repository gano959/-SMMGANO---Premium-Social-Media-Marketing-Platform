import React, { useState, useEffect } from 'react';
import { User, Service, Currency, Language, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { api } from '../lib/api.js';
import { SocialMediaIcon } from './SocialMediaIcons.js';
import {
  Send,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Wallet,
  Clock,
  ArrowRight,
  Info,
  ChevronDown,
  Sliders
} from 'lucide-react';

interface NewOrderViewProps {
  user: User;
  services: Service[];
  currency: Currency;
  language: Language;
  config: SiteConfig | null;
  onOrderSuccess: () => void;
  onNavigate: (tab: string) => void;
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  user,
  services,
  currency,
  language,
  config,
  onOrderSuccess,
  onNavigate
}) => {
  const t = useTranslation(language);
  const rate = config?.exchangeRateUsdToEgp || 50;

  // Selected state
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [comments, setComments] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Filter services by platform
  const platformServices = services.filter(
    s => s.platform.toLowerCase() === selectedPlatform.toLowerCase()
  );

  // Available categories for this platform
  const categories = Array.from(new Set(platformServices.map(s => s.category)));

  // Filtered by category
  const activeServices = selectedCategory === 'all'
    ? platformServices
    : platformServices.filter(s => s.category === selectedCategory);

  // Set default service when platform or category changes
  useEffect(() => {
    if (activeServices.length > 0 && !activeServices.find(s => s.id === selectedServiceId)) {
      setSelectedServiceId(activeServices[0].id);
      setQuantity(activeServices[0].min || 100);
    }
  }, [selectedPlatform, selectedCategory, activeServices, selectedServiceId]);

  const activeService = services.find(s => s.id === selectedServiceId) || activeServices[0];

  // Calculate live charge
  const ratePer1000 = activeService
    ? (currency === 'USD' ? activeService.ratePer1000Usd : Number((activeService.ratePer1000Usd * rate).toFixed(2)))
    : 0;

  const totalCharge = activeService
    ? Number(((quantity / 1000) * ratePer1000).toFixed(2))
    : 0;

  // Wallet check
  const availableBalance = currency === 'EGP' ? user.walletBalanceEgp : user.walletBalanceUsd;
  const isInsufficient = availableBalance < totalCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService) return;

    if (quantity < activeService.min || quantity > activeService.max) {
      setError(`Quantity must be between ${activeService.min.toLocaleString()} and ${activeService.max.toLocaleString()}`);
      return;
    }

    if (!link.trim()) {
      setError('Please provide the target link / URL');
      return;
    }

    if (isInsufficient) {
      setError(`Insufficient ${currency} balance. Please top up your wallet.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.placeOrder({
        serviceId: activeService.id,
        link: link.trim(),
        quantity,
        currency
      });

      setSuccessOrder(res.order);
      setLink('');
      onOrderSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    'Instagram',
    'TikTok',
    'YouTube',
    'Facebook',
    'Telegram',
    'X (Twitter)',
    'Threads',
    'Spotify',
    'LinkedIn'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.newOrder}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'ar'
            ? 'اختر المنصة والخدمة المطلوبة وأدخل الرابط للبدء الفوري'
            : 'Select platform, service, and enter destination URL for instant dispatch'}
        </p>
      </div>

      {/* Success Modal */}
      {successOrder && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                {language === 'ar' ? 'تم إرسال الطلب بنجاح وهو بانتظار موافقة الإدارة!' : 'Order Placed & Awaiting Admin Approval!'}
                <span className="font-mono underline ml-2">#{successOrder.id}</span>
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                {language === 'ar'
                  ? `تم إرسال إشعار للمدير لمراجعة الطلب واعتماده (${successOrder.serviceName}). سيبدأ التنفيذ فور الموافقة.`
                  : `Notification sent to Admin for approval (${successOrder.serviceName}). Delivery starts immediately upon review.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 rounded-xl bg-[#800020] text-white font-bold text-xs hover:bg-[#5C0018] transition-colors"
            >
              {language === 'ar' ? 'متابعة الطلبات' : 'View Orders'}
            </button>
            <button
              onClick={() => setSuccessOrder(null)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-medium text-xs hover:bg-amber-100 transition-colors"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Platform Switcher Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          1. {t.platform}
        </label>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setSelectedPlatform(p);
                setSelectedCategory('all');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-[#800020] text-white border-[#800020] shadow-sm'
                  : 'bg-white dark:bg-[#1f1216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50'
              }`}
            >
              <SocialMediaIcon platform={p} size="sm" className={selectedPlatform === p ? 'text-white' : 'opacity-80'} />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-5">
            {/* Category Selector */}
            {categories.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. {t.category}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                >
                  <option value="all">{language === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                3. {t.service}
              </label>
              <select
                value={selectedServiceId}
                onChange={e => {
                  setSelectedServiceId(e.target.value);
                  const svc = services.find(s => s.id === e.target.value);
                  if (svc && quantity < svc.min) setQuantity(svc.min);
                }}
                className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
              >
                {activeServices.map(svc => (
                  <option key={svc.id} value={svc.id}>
                    #{svc.id} - {svc.name} — [
                    {currency === 'USD'
                      ? `$${svc.ratePer1000Usd.toFixed(2)}`
                      : `${(svc.ratePer1000Usd * rate).toFixed(2)} EGP`}
                    / 1k]
                  </option>
                ))}
              </select>
            </div>

            {/* Service Quick Specs Card */}
            {activeService && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#28171e] border border-slate-200 dark:border-[#5C0018]/40 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{activeService.name}</span>
                  <span className="text-[#800020] dark:text-rose-300 font-mono">
                    {currency === 'USD'
                      ? `$${activeService.ratePer1000Usd.toFixed(2)} / 1,000`
                      : `${(activeService.ratePer1000Usd * rate).toFixed(2)} EGP / 1,000`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {language === 'ar' ? activeService.descriptionAr : activeService.description}
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-[#5C0018]/30 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400" /> <strong>{t.averageSpeed}:</strong> {activeService.speed}</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> <strong>{t.guarantee}:</strong> {activeService.guarantee}</span>
                  <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5 text-slate-500" /> <strong>{t.minQuantity}/{t.maxQuantity}:</strong> {activeService.min.toLocaleString()} - {activeService.max.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Target Link input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                4. {t.link}
              </label>
              <input
                type="text"
                required
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://instagram.com/p/C4x... or https://tiktok.com/@username"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020] font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {language === 'ar'
                  ? 'تأكد من أن الحساب أو المنشور عام (Public) وليس خاصاً'
                  : 'Ensure the target profile or post is set to public (not private)'}
              </span>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  5. {t.quantity}
                </label>
                {activeService && (
                  <span className="text-[11px] text-slate-400">
                    Min: {activeService.min.toLocaleString()} · Max: {activeService.max.toLocaleString()}
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                min={activeService?.min || 100}
                max={activeService?.max || 100000}
                step="100"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Insufficient Funds Warning */}
            {isInsufficient && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.insufficientFunds}</span>
                </div>
                <p className="text-[11px]">
                  {language === 'ar'
                    ? `رصيدك المتاح: ${availableBalance.toFixed(2)} ${currency}، والمطلوب: ${totalCharge.toFixed(2)} ${currency}.`
                    : `Available: ${availableBalance.toFixed(2)} ${currency}, Required: ${totalCharge.toFixed(2)} ${currency}.`}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('add-funds')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#800020] text-white font-bold text-xs hover:bg-[#5C0018] transition-colors"
                >
                  {t.addFunds} (01033537322)
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isInsufficient}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-[#800020] to-[#5C0018] hover:opacity-95 shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{t.orderProcessing}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.placeOrder} ({totalCharge.toFixed(2)} {currency})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-[#800020]/20 dark:border-[#5C0018]/40 shadow-xs space-y-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#5C0018]/30 pb-3">
              <Zap className="w-4 h-4 text-[#800020] dark:text-rose-400" />
              <span>{language === 'ar' ? 'ملخص التكلفة والطلب' : 'Order Cost Summary'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.platform}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPlatform}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.quantity}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.ratePer1000}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {ratePer1000.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.totalBalance}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {availableBalance.toFixed(2)} {currency}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#5C0018]/30 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{t.totalCost}:</span>
                <span className="font-black text-2xl text-[#800020] dark:text-rose-300 font-mono">
                  {totalCharge.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            {/* Guarantee and safety badges */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#5C0018]/30 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'ar' ? 'آمن 100% ولا نطلب كلمات المرور أبداً' : '100% Safe — Never requests passwords'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'ar' ? 'بدء فوري خلال دقائق' : 'Instant dispatch via automated cluster'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
