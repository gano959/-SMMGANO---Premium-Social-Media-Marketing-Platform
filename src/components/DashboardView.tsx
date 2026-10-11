import React from 'react';
import { User, Order, Currency, Language, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
  Search
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  orders: Order[];
  currency: Currency;
  language: Language;
  config: SiteConfig | null;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  orders,
  currency,
  language,
  config,
  onNavigate
}) => {
  const t = useTranslation(language);
  const rate = config?.exchangeRateUsdToEgp || 50;

  // Order stats calculation
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter(o => o.status === 'In Progress' || o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const canceledOrders = orders.filter(o => o.status === 'Canceled').length;

  let totalSpentEgp = 0;
  for (const o of orders) {
    if (o.status !== 'Canceled') {
      if (o.currency === 'EGP') {
        totalSpentEgp += o.chargeAmount;
      } else {
        totalSpentEgp += o.chargeAmount * rate;
      }
    }
  }

  const balanceDisplay = currency === 'EGP'
    ? `${user.walletBalanceEgp.toFixed(2)} ج.م`
    : `$${user.walletBalanceUsd.toFixed(2)}`;

  const totalSpentDisplay = currency === 'EGP'
    ? `${totalSpentEgp.toFixed(2)} ج.م`
    : `$${(totalSpentEgp / rate).toFixed(2)}`;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Announcement Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#800020] via-[#A32645] to-[#5C0018] p-6 sm:p-8 text-white shadow-lg shadow-[#800020]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-rose-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SMMGANO Client Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ar' ? `مرحباً بك، ${user.name}` : `Welcome back, ${user.name}`}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
              {language === 'ar'
                ? 'لوحة تحكمك الموحدة لإدارة حملات السوشيال ميديا، ومتابعة الطلبات، وشحن الرصيد المباشر.'
                : 'Your central hub for tracking live engagement campaigns, automated deliveries, and wallet balances.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('new-order')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#800020] hover:bg-rose-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#800020]" />
              <span>{t.newOrder}</span>
            </button>
            <button
              onClick={() => onNavigate('add-funds')}
              className="px-4 py-2.5 rounded-xl bg-[#5C0018] hover:bg-[#3D0010] text-white border border-white/20 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4 text-amber-300" />
              <span>{t.addFunds}</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#1f1216] border border-[#800020]/20 dark:border-[#5C0018]/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.totalBalance}
            </span>
            <span className="text-2xl font-black text-[#800020] dark:text-rose-300 font-mono">
              {balanceDisplay}
            </span>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{currency === 'EGP' ? `≈ $${user.walletBalanceUsd.toFixed(2)} USD` : `≈ ${user.walletBalanceEgp.toFixed(2)} EGP`}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/20 flex items-center justify-center text-[#800020] dark:text-rose-300">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.totalSpent}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalSpentDisplay}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'ar' ? 'إجمالي الطلبات الفعالة' : 'Across all campaigns'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#20131A] flex items-center justify-center text-[#800020] dark:text-rose-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.activeOrders}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {inProgressOrders}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'ar' ? 'قيد التنفيذ والمراجعة' : 'In queue & processing'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#20131A] flex items-center justify-center text-[#800020] dark:text-rose-300">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.completedOrders}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {completedOrders}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'ar' ? 'تسليم بنسبة 100%' : '100% Fulfilled'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#20131A] flex items-center justify-center text-[#800020] dark:text-rose-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Egyptian Wallet Quick Notice Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-rose-50 to-[#F8EEF1] dark:from-[#2d141b] dark:to-[#1f0e13] border border-[#800020]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {language === 'ar' ? 'شحن فودافون كاش وانستاباي الفوري (01033537322)' : 'Instant Vodafone Cash & InstaPay Top-Up (01033537322)'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {language === 'ar'
                ? 'حول المبلغ بالجنيه إلى 01033537322 وأدخل رقم العملية لتأكيد الإيداع في رصيدك فورياً.'
                : 'Send funds to 01033537322 and submit transaction ID for rapid review by our desk.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('add-funds')}
          className="px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all shadow-xs shrink-0 text-center"
        >
          {t.addFunds}
        </button>
      </div>

      {/* Recent Orders Overview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#5C0018]/30 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'أحدث الطلبات النشطة' : 'Recent Order Activity'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'متابعة حية لحالة التنفيذ والنسبة المكتملة' : 'Live progress and delivery metrics'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-[#800020] dark:text-rose-300 hover:underline flex items-center gap-1"
          >
            <span>{language === 'ar' ? 'عرض كافة الطلبات' : 'View All Orders'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.noOrdersFound}
            </p>
            <button
              onClick={() => onNavigate('new-order')}
              className="px-4 py-2 rounded-lg bg-[#800020] text-white text-xs font-bold hover:bg-[#5C0018]"
            >
              {t.newOrder}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#28171e] border border-slate-100 dark:border-[#5C0018]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#800020]/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#800020] dark:text-rose-300">
                      #{order.id}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {order.platform}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                    {order.serviceName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                    {order.link}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {order.quantity.toLocaleString()} units
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {order.chargeAmount} {order.currency}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      order.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : order.status === 'In Progress'
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        : order.status === 'Canceled'
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
