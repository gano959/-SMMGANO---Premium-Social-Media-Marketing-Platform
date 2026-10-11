import React, { useState, useEffect } from 'react';
import { User, Currency, Language, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { SmmGanoLogo } from './SmmGanoLogo.js';
import { api } from '../lib/api.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Bell,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  ChevronDown,
  X,
  CreditCard
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  config: SiteConfig | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onDataRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  isDark,
  onToggleDark,
  config,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  onDataRefresh
}) => {
  const t = useTranslation(language);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingActions, setPendingActions] = useState<{
    totalCount: number;
    deposits: any[];
    orders: any[];
  }>({ totalCount: 0, deposits: [], orders: [] });

  const fetchPending = async () => {
    if (user?.role === 'admin') {
      try {
        const res = await api.getAdminPendingActions();
        setPendingActions(res);
      } catch {
        // quiet
      }
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 12000);
    return () => clearInterval(interval);
  }, [user]);

  const handleApproveDeposit = async (id: string) => {
    try {
      await api.verifyDeposit(id, true, 'Approved via Admin Notification');
      fetchPending();
      onDataRefresh?.();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleApproveOrder = async (id: string) => {
    try {
      await api.approveAdminOrder(id);
      fetchPending();
      onDataRefresh?.();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectOrder = async (id: string) => {
    try {
      await api.rejectAdminOrder(id, 'Rejected by Admin');
      fetchPending();
      onDataRefresh?.();
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const displayBalance = user
    ? (currency === 'EGP'
        ? `${user.walletBalanceEgp.toFixed(2)} EGP`
        : `$${user.walletBalanceUsd.toFixed(2)}`)
    : null;

  const navItems = !user ? [
    { id: 'home', label: t.dashboard },
    { id: 'services', label: t.services },
    { id: 'api', label: t.apiDocs }
  ] : [
    { id: 'dashboard', label: t.dashboard },
    { id: 'new-order', label: t.newOrder },
    { id: 'orders', label: t.orders },
    { id: 'services', label: t.services },
    { id: 'add-funds', label: t.addFunds },
    { id: 'tickets', label: t.tickets },
    { id: 'api', label: t.apiDocs },
    ...(user.role === 'admin' ? [{ id: 'admin', label: t.adminPanel, isAdmin: true }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors bg-white/95 dark:bg-[#0D080A]/95 border-[#800020]/20 dark:border-[#800020]/30 shadow-sm">
      {/* Top Announcement Bar */}
      {config && (
        <div className="bg-gradient-to-r from-[#5C0018] via-[#800020] to-[#3D0010] text-white text-xs py-1.5 px-4 font-medium tracking-wide flex items-center justify-between overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="truncate text-xs opacity-95">
                {language === 'ar' ? config.announcementAr : config.announcementEn}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-rose-200 shrink-0">
              <span>1 USD = {config.exchangeRateUsdToEgp} EGP</span>
              <span className="opacity-40">|</span>
              <span className="text-white/80">SMMCPAN Protocol v2.4</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab(user ? 'dashboard' : 'home')}
          className="cursor-pointer group flex items-center gap-3 select-none"
        >
          <SmmGanoLogo size="md" showSubtitle={true} />
        </div>

        {/* Animated Navigation items (Desktop) with Smooth Glow Pill */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-xs text-slate-700 dark:text-slate-300 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#800020] dark:hover:text-white'
                } ${item.isAdmin ? 'border border-[#800020]/30' : ''}`}
              >
                {/* Glow Background Pill via Motion */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavGlow"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#800020] to-[#5C0018] shadow-md shadow-[#800020]/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />}
                  {item.label}
                  {item.isAdmin && pendingActions.totalCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right side controls: Currency, Lang, Dark Mode, Notifications, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Live Notification Bell */}
          {user?.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-[#800020]/10 hover:bg-[#800020]/20 dark:bg-[#1C1117] dark:hover:bg-[#281822] border border-[#800020]/30 text-[#800020] dark:text-rose-300 transition-colors cursor-pointer"
                title={language === 'ar' ? 'طلبات بانتظار موافقة الإدارة' : 'Pending Approvals'}
              >
                <Bell className="w-4 h-4" />
                {pendingActions.totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-[#800020] text-white font-mono font-bold text-[10px] animate-bounce shadow-sm">
                    {pendingActions.totalCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#140D11] border border-[#800020]/30 shadow-2xl p-4 z-50 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#800020]/30">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400" />
                        <span>{language === 'ar' ? 'طلبات الإدارة المعلقة' : 'Pending Admin Actions'}</span>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pendingActions.totalCount === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        {language === 'ar' ? 'لا توجد طلبات معلقة حالياً' : 'No pending actions.'}
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {/* Pending Deposits */}
                        {pendingActions.deposits.map(dep => (
                          <div
                            key={dep.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-[#1B1117] border border-[#800020]/30 space-y-2"
                          >
                            <div className="flex items-start gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {language === 'ar' ? dep.messageAr : dep.messageEn}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Ref: {dep.referenceNumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="px-2.5 py-1 rounded bg-[#800020] hover:bg-[#5C0018] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'ar' ? 'موافقة وإضافة الرصيد' : 'Approve & Credit'}</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Pending Orders */}
                        {pendingActions.orders.map(ord => (
                          <div
                            key={ord.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-[#1B1117] border border-[#800020]/30 space-y-2"
                          >
                            <div className="flex items-start gap-2">
                              <Layers className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {language === 'ar' ? ord.messageAr : ord.messageEn}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                                  Target: {ord.link}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => handleApproveOrder(ord.id)}
                                className="px-2.5 py-1 rounded bg-[#800020] hover:bg-[#5C0018] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'ar' ? 'موافقة وبدء التنفيذ' : 'Approve Order'}</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(ord.id)}
                                className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-400 font-bold text-[10px] cursor-pointer"
                              >
                                <span>{language === 'ar' ? 'رفض واسترجاع' : 'Reject'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Currency Switcher */}
          <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 text-xs font-mono font-bold">
            <button
              onClick={() => onCurrencyChange('EGP')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                currency === 'EGP'
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#800020]'
              }`}
            >
              EGP
            </button>
            <button
              onClick={() => onCurrencyChange('USD')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#800020]'
              }`}
            >
              USD
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 text-slate-700 dark:text-slate-300 hover:text-[#800020] transition-colors flex items-center gap-1 cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400" />
            <span className="font-sans">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#160D12] border border-slate-200 dark:border-[#800020]/30 text-slate-700 dark:text-slate-300 hover:text-[#800020] transition-colors cursor-pointer"
            title={isDark ? t.lightMode : t.darkMode}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile or Login CTA */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => onSelectTab('add-funds')}
                className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1D1118] border border-[#800020]/30 hover:border-[#800020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <Wallet className="w-3 h-3 text-[#800020] dark:text-rose-400" />
                  <span>{t.totalBalance}</span>
                </div>
                <div className="font-mono font-black text-xs text-[#800020] dark:text-rose-300">
                  {displayBalance}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  onClick={() => onSelectTab('dashboard')}
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#800020] to-[#5C0018] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:text-[#800020] transition-colors cursor-pointer"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#800020] to-[#5C0018] text-white shadow-sm hover:shadow-[#800020]/30 transition-all cursor-pointer"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
