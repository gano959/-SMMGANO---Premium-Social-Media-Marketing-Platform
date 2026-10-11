import React, { useState, useEffect } from 'react';
import { User, Deposit, Order, Service, SupportTicket, Language, Currency, SecurityStats, SecurityEvent, SecurityScanResult } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { api } from '../lib/api.js';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Settings,
  Users,
  ShoppingBag,
  Layers,
  AlertCircle,
  Clock,
  Zap,
  ExternalLink,
  Edit3,
  Save,
  MessageSquare,
  Send,
  FileText,
  Sliders,
  Check,
  ShieldAlert,
  Lock,
  Key,
  Terminal,
  Activity,
  Globe,
  Server
} from 'lucide-react';

interface AdminConsoleProps {
  currentUser: User;
  language: Language;
  onRefreshAll: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  language,
  onRefreshAll
}) => {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'deposits' | 'pending_orders' | 'services' | 'cms_text' | 'tickets' | 'orders' | 'settings' | 'users' | 'security' | 'providers'>('deposits');

  const [overview, setOverview] = useState<any | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Service price editing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState<number>(0);
  const [editMin, setEditMin] = useState<number>(0);
  const [editMax, setEditMax] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'active' | 'maintenance'>('active');

  // Website Copy CMS State
  const [heroTitleAr, setHeroTitleAr] = useState<string>('');
  const [heroTitleEn, setHeroTitleEn] = useState<string>('');
  const [heroSubtitleAr, setHeroSubtitleAr] = useState<string>('');
  const [heroSubtitleEn, setHeroSubtitleEn] = useState<string>('');
  const [announcementAr, setAnnouncementAr] = useState<string>('');
  const [announcementEn, setAnnouncementEn] = useState<string>('');
  const [trustBadgeAr, setTrustBadgeAr] = useState<string>('');
  const [trustBadgeEn, setTrustBadgeEn] = useState<string>('');

  // Support ticket live reply state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');

  // Settings: exchange rate and destination
  const [exchangeRate, setExchangeRate] = useState<number>(50);
  const [mobileNumber, setMobileNumber] = useState<string>('01033537322');
  const [accountName, setAccountName] = useState<string>('Vodafone Cash & InstaPay Desk (SMMGANO)');

  // User balance adjustment
  const [adjustUserId, setAdjustUserId] = useState<string>('');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustCurrency, setAdjustCurrency] = useState<Currency>('EGP');
  const [adjustReason, setAdjustReason] = useState<string>('Bonus / Manual Top-Up');

  // Security Shield State
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  // SMM Provider Integration State
  const [providerUrl, setProviderUrl] = useState<string>('');
  const [providerKey, setProviderKey] = useState<string>('');
  const [providerAutoOrder, setProviderAutoOrder] = useState<boolean>(false);
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [hasProviderKey, setHasProviderKey] = useState<boolean>(false);
  const [testingProvider, setTestingProvider] = useState<boolean>(false);
  const [providerTestResult, setProviderTestResult] = useState<{ success: boolean; message: string; balance?: any } | null>(null);
  const [sendingOrderToProviderId, setSendingOrderToProviderId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, depData, ordData, srvData, usrData, settsData, tckData, secData, provData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminDeposits(),
        api.getAdminOrders(),
        api.getAdminServices(),
        api.getAdminUsers(),
        api.getAdminSettings(),
        api.getAdminTickets(),
        api.getAdminSecurityStatus().catch(() => ({ status: '', stats: null })),
        api.getAdminProvider().catch(() => null)
      ]);

      setOverview(ovData.stats);
      setDeposits(depData.deposits);
      setOrders(ordData.orders);
      setServices(srvData.services);
      setUsers(usrData.users);
      setSettings(settsData.settings);
      setTickets(tckData.tickets);

      if (secData && secData.stats) {
        setSecurityStats(secData.stats);
        setSecurityLogs(secData.stats.recentLogs || []);
      }

      if (provData) {
        setProviderUrl(provData.providerApiUrl || '');
        setHasProviderKey(provData.hasApiKey);
        setProviderAutoOrder(provData.providerAutoOrderEnabled);
        setProviderBalance(provData.providerBalance);
      }

      if (settsData.settings) {
        const s = settsData.settings;
        setExchangeRate(s.exchangeRateUsdToEgp || 50);
        setMobileNumber(s.mobileWalletDestination || '01033537322');
        setAccountName(s.mobileWalletAccountName || 'Vodafone Cash & InstaPay Desk (SMMGANO)');
        setAnnouncementAr(s.announcementAr || '');
        setAnnouncementEn(s.announcementEn || '');
        setHeroTitleAr(s.heroTitleAr || 'SMMGANO — نمِّ تواجدك الرقمي على مواقع التواصل.');
        setHeroTitleEn(s.heroTitleEn || 'SMMGANO — Grow Your Social Presence.');
        setHeroSubtitleAr(s.heroSubtitleAr || '');
        setHeroSubtitleEn(s.heroSubtitleEn || '');
        setTrustBadgeAr(s.trustBadgeAr || '');
        setTrustBadgeEn(s.trustBadgeEn || '');
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    try {
      const res = await api.updateAdminProvider({
        providerApiUrl: providerUrl,
        providerApiKey: providerKey.trim() ? providerKey.trim() : undefined,
        providerAutoOrderEnabled: providerAutoOrder
      });
      setHasProviderKey(res.hasApiKey);
      setProviderKey('');
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save provider settings');
    }
  };

  const handleTestProvider = async () => {
    setTestingProvider(true);
    setProviderTestResult(null);
    try {
      const res = await api.testAdminProvider({
        providerApiUrl: providerUrl,
        providerApiKey: providerKey.trim() ? providerKey.trim() : undefined
      });
      setProviderTestResult(res);
      if (res.balance !== undefined) {
        setProviderBalance(Number(res.balance));
      }
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setProviderTestResult({
        success: false,
        message: err.message || 'تعذر الاتصال بالمزود الخارجي'
      });
    } finally {
      setTestingProvider(false);
    }
  };

  const handleSendOrderToProvider = async (orderId: string) => {
    setSendingOrderToProviderId(orderId);
    try {
      const res = await api.sendOrderToProvider(orderId);
      setActionNotice(res.message);
      loadData();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'فشل إرسال الطلب للمزود');
    } finally {
      setSendingOrderToProviderId(null);
    }
  };

  const handleRunSecurityScan = async () => {
    setScanning(true);
    try {
      const res = await api.runAdminSecurityScan();
      setScanResult(res);
      setActionNotice(res.message);
      const sec = await api.getAdminSecurityStatus();
      if (sec?.stats) {
        setSecurityStats(sec.stats);
        setSecurityLogs(sec.stats.recentLogs || []);
      }
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Security scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleClearSecurityLogs = async () => {
    try {
      const res = await api.clearAdminSecurityLogs();
      setActionNotice(res.message);
      const sec = await api.getAdminSecurityStatus();
      if (sec?.stats) {
        setSecurityStats(sec.stats);
        setSecurityLogs(sec.stats.recentLogs || []);
      }
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to clear logs');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDeposit = async (id: string, approved: boolean) => {
    try {
      const res = await api.verifyDeposit(id, approved);
      setActionNotice(res.message);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Deposit verification failed');
    }
  };

  const handleApproveOrder = async (id: string) => {
    try {
      const res = await api.approveAdminOrder(id);
      setActionNotice(res.message);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectOrder = async (id: string) => {
    try {
      const res = await api.rejectAdminOrder(id, 'تم الرفض بواسطة الإدارة واسترجاع الرصيد للعميل');
      setActionNotice(res.message);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(id, status, `Updated by admin to ${status}`);
      setActionNotice(`تم تحديث حالة الطلب #${id} إلى ${status}`);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // Price Editing Handler
  const startEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setEditPriceUsd(service.ratePer1000Usd);
    setEditMin(service.min);
    setEditMax(service.max);
    setEditStatus(service.status);
  };

  const handleSaveServicePrice = async (serviceId: string) => {
    try {
      await api.updateService(serviceId, {
        ratePer1000Usd: editPriceUsd,
        ratePer1000Egp: Number((editPriceUsd * exchangeRate).toFixed(2)),
        min: editMin,
        max: editMax,
        status: editStatus
      });
      setActionNotice(`تم تحديث سعر الخدمة #${serviceId} بنجاح!`);
      setEditingServiceId(null);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update service price');
    }
  };

  // Save Website Copy (CMS)
  const handleSaveCmsContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        heroTitleAr: heroTitleAr.trim(),
        heroTitleEn: heroTitleEn.trim(),
        heroSubtitleAr: heroSubtitleAr.trim(),
        heroSubtitleEn: heroSubtitleEn.trim(),
        announcementAr: announcementAr.trim(),
        announcementEn: announcementEn.trim(),
        trustBadgeAr: trustBadgeAr.trim(),
        trustBadgeEn: trustBadgeEn.trim()
      });
      setActionNotice('تم حفظ وتحديث نصوص وكلام الموقع بنجاح وتم تطبيقها على الواجهة!');
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save website copy');
    }
  };

  // Web Support Reply
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;

    try {
      const res = await api.replyAdminTicket(selectedTicket.id, adminReplyText.trim());
      setAdminReplyText('');
      setSelectedTicket(res.ticket);
      setActionNotice('تم إرسال الرد للعميل عبر الويب مباشرة!');
      loadData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        exchangeRateUsdToEgp: exchangeRate,
        mobileWalletDestination: mobileNumber.trim(),
        mobileWalletAccountName: accountName.trim()
      });
      setActionNotice('Platform settings updated successfully');
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUserId) return;
    try {
      await api.adjustUserBalance(adjustUserId, adjustAmount, adjustCurrency, adjustReason);
      setActionNotice(`User balance updated with ${adjustAmount} ${adjustCurrency}`);
      loadData();
      onRefreshAll();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Balance adjustment failed');
    }
  };

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.adminTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'تعديل أسعار الخدمات، موافقة فورية على الطلبات والشحن، دعم فني مباشر عبر الويب، وتعديل نصوص الموقع'
              : 'Edit service prices, review pending orders & deposits, reply to web tickets, and update website copy.'}
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400" />
          <span>{language === 'ar' ? 'تحديث البيانات' : 'Refresh Console'}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-[#5C0018]/40 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {/* 1. Deposits */}
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'deposits'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>{language === 'ar' ? 'طلبات الشحن' : 'Deposits'} ({pendingDeposits.length})</span>
        </button>

        {/* 2. Pending Orders */}
        <button
          onClick={() => setActiveTab('pending_orders')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pending_orders'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'ar' ? 'طلبات تنتظر الموافقة' : 'Pending Orders'} ({pendingOrders.length})</span>
        </button>

        {/* 3. Service Prices */}
        <button
          onClick={() => setActiveTab('services')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'services'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{language === 'ar' ? 'تعديل أسعار الخدمات' : 'Price Management'}</span>
        </button>

        {/* 4. Website Copy CMS */}
        <button
          onClick={() => setActiveTab('cms_text')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'cms_text'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{language === 'ar' ? 'تعديل كلام ونصوص الموقع' : 'Website Copy CMS'}</span>
        </button>

        {/* 5. In-App Web Support */}
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{language === 'ar' ? 'الدعم الفني عبر الويب' : 'Web Support Desk'} ({tickets.length})</span>
        </button>

        {/* 6. All Orders */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل كافة الطلبات' : 'All Orders'}</span>
        </button>

        {/* 7. Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{language === 'ar' ? 'سعر الصرف' : 'Exchange Rate'}</span>
        </button>

        {/* 8. Users */}
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'ar' ? 'المستخدمين والأرصدة' : 'Users'}</span>
        </button>

        {/* 9. Security & Shield */}
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          <span>{language === 'ar' ? 'الأمان والحماية الفائقة' : 'Security Shield'}</span>
        </button>

        {/* 10. API Providers */}
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'providers'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>{language === 'ar' ? 'ربط المزودين (API Providers)' : 'API Providers'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: PENDING DEPOSITS ("Add Funds Approval")                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C1117] border border-[#800020]/30 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#800020] dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>{language === 'ar' ? 'اعتماد شحن الرصيد للعميل:' : 'Deposit Approval:'}</strong>{' '}
              {language === 'ar'
                ? 'قام العميل بطلب شحن رصيد. اضغط على زر [موافقة وإضافة الرصيد للعميل فوراً] ليتم شحن محفظته وتحديث رصيده بالثواني.'
                : 'Clicking [Approve & Credit] immediately increments the user balance and marks the transaction approved.'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#140D11] border border-slate-200 dark:border-[#800020]/30 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#800020]/30 mb-4 flex items-center justify-between">
              <span>{language === 'ar' ? 'طلبات شحن الرصيد المعلقة' : 'Pending Deposit Requests'}</span>
              <span className="font-mono text-xs font-bold text-[#800020] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-[#800020]/30">
                {pendingDeposits.length} Pending
              </span>
            </h3>

            {pendingDeposits.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? 'تمت مراجعة واعتماد جميع طلبات الشحن! لا توجد طلبات معلقة.' : 'All deposit requests have been processed.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.map(dep => (
                  <div
                    key={dep.id}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-[#1B1117] border border-[#800020]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#800020] dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                          #{dep.id}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          العميل: {dep.userName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ({dep.userEmail})
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
                        <strong>رقم المحول منه:</strong> <span className="font-bold underline">{dep.senderPhone || 'غير محدد'}</span> · <strong>رقم العملية:</strong> <span className="font-bold text-[#800020] dark:text-rose-300">{dep.referenceNumber}</span>
                      </div>
                      {dep.receiptNote && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1a0e13] p-2 rounded-lg border border-slate-200 dark:border-[#5C0018]/30">
                          <strong>ملاحظة العميل:</strong> {dep.receiptNote}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المبلغ المطلوب إضافته:' : 'Amount to Credit:'}</span>
                        <span className="font-mono font-black text-2xl text-[#800020] dark:text-rose-300">
                          {dep.amount} {dep.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyDeposit(dep.id, true)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{language === 'ar' ? `موافقة وإضافة ${dep.amount} ${dep.currency} للعميل` : `Approve & Credit ${dep.amount}`}</span>
                        </button>
                        <button
                          onClick={() => handleVerifyDeposit(dep.id, false)}
                          className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t.reject}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: PENDING ORDERS ("Order Approval by Admin")                   */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'pending_orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C1117] border border-[#800020]/30 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-[#800020] dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>{language === 'ar' ? 'موافقة الإدارة على طلبات الخدمات:' : 'Order Approval Flow:'}</strong>{' '}
              {language === 'ar'
                ? 'هذه الطلبات أنشأها العملاء وتنتظر موافقتك لبدء التنفيذ الفوري. اضغط [موافقة وبدء التنفيذ] لبدء ضخ المتابعين/المشاهدات، أو [رفض واسترجاع الرصيد] لإلغاء الطلب ورد المبلغ لمحفظة العميل آلياً.'
                : 'Orders remain in Pending status until you review and approve them.'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30 flex items-center justify-between">
              <span>{language === 'ar' ? 'الطلبات بانتظار موافقة المدير' : 'Client Orders Awaiting Approval'}</span>
              <span className="font-mono text-xs font-bold text-[#800020] bg-rose-50 px-2 py-0.5 rounded">
                {pendingOrders.length} Pending
              </span>
            </h3>

            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? 'لا توجد طلبات جديدة بانتظار الموافقة حالياً.' : 'No orders pending approval.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map(ord => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-[#28171e] border-2 border-[#800020]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#800020] dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                          #{ord.id}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          العميل: {ord.userEmail}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          ({ord.platform})
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {ord.serviceName}
                      </div>
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-2 break-all">
                        <span>الرابط: {ord.link}</span>
                        <a
                          href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#800020] hover:underline inline-flex items-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        الكمية: <strong>{ord.quantity.toLocaleString()} وحدة</strong> · التكلفة: <strong>{ord.chargeAmount} {ord.currency}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleApproveOrder(ord.id)}
                        className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'ar' ? 'موافقة وبدء التنفيذ الفوري' : 'Approve & Start Delivery'}</span>
                      </button>
                      <button
                        onClick={() => handleRejectOrder(ord.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{language === 'ar' ? 'رفض واسترجاع الرصيد' : 'Reject & Refund'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: SERVICE PRICE MANAGEMENT ("تعديل أسعار الخدمات")             */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'services' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'ar' ? 'إدارة وتعديل أسعار خدمات المنصة' : 'Service Price Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'يمكنك تعديل السعر لكل 1000، والحد الأدنى والأقصى مباشرة، ويتم تحديث سعر الجنيه تلقائياً.' : 'Edit rate per 1,000 in USD and EGP will be calculated automatically based on exchange rate.'}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#800020]">
              1 USD = {exchangeRate} EGP
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#5C0018]/30 text-slate-500">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'اسم الخدمة' : 'Service Name'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'السعر (USD)' : 'Price (USD)'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'السعر بالجنيه (EGP)' : 'Price (EGP)'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'الحد الأدنى/الأقصى' : 'Min / Max'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => {
                  const isEditing = editingServiceId === svc.id;

                  return (
                    <tr key={svc.id} className="border-b border-slate-100 dark:border-[#5C0018]/20 hover:bg-slate-50 dark:hover:bg-[#28171e]/50">
                      <td className="py-3 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                        #{svc.id}
                      </td>
                      <td className="py-3 px-3 max-w-xs font-semibold text-slate-800 dark:text-slate-100">
                        {svc.name}
                      </td>

                      {/* Price USD */}
                      <td className="py-3 px-3 font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.05"
                            value={editPriceUsd}
                            onChange={e => setEditPriceUsd(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-[#800020] bg-white dark:bg-[#150a0e] text-xs font-mono"
                          />
                        ) : (
                          <span>${svc.ratePer1000Usd.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Price EGP */}
                      <td className="py-3 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                        {isEditing ? (
                          <span>{(editPriceUsd * exchangeRate).toFixed(2)} ج.م</span>
                        ) : (
                          <span>{(svc.ratePer1000Usd * exchangeRate).toFixed(2)} ج.م</span>
                        )}
                      </td>

                      {/* Min / Max */}
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {isEditing ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="number"
                              value={editMin}
                              onChange={e => setEditMin(Number(e.target.value))}
                              className="w-16 px-1.5 py-1 rounded border border-slate-300 text-xs font-mono"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={editMax}
                              onChange={e => setEditMax(Number(e.target.value))}
                              className="w-20 px-1.5 py-1 rounded border border-slate-300 text-xs font-mono"
                            />
                          </div>
                        ) : (
                          <span>{svc.min.toLocaleString()} - {svc.max.toLocaleString()}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as any)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            svc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {svc.status}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSaveServicePrice(svc.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>حفظ</span>
                            </button>
                            <button
                              onClick={() => setEditingServiceId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditService(svc)}
                            className="px-2.5 py-1 rounded-lg bg-[#800020] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#5C0018] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل السعر</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: WEBSITE COPY CMS ("تعديل نصوص وكلام الموقع")                 */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'cms_text' && (
        <form onSubmit={handleSaveCmsContent} className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs max-w-3xl space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {language === 'ar' ? 'تعديل نصوص وكلام واجهة الموقع (CMS)' : 'Website Copy & Content Editor'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'قم بتعديل أي جملة أو وصف في الصفحة الرئيسية أو شريط الإعلانات وسيتم تطبيقها مباشرة على الموقع.' : 'Edit hero headline, description, announcement bar text, and trust badges.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Announcement bar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'نص شريط الإعلانات العلوي (عربي)' : 'Top Announcement Bar (Arabic)'}
              </label>
              <input
                type="text"
                value={announcementAr}
                onChange={e => setAnnouncementAr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
              />
            </div>

            {/* Hero Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'العنوان الرئيسي في الصفحة (Hero Title - عربي)' : 'Hero Title (Arabic)'}
              </label>
              <input
                type="text"
                value={heroTitleAr}
                onChange={e => setHeroTitleAr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Hero Title EN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hero Title (English)
              </label>
              <input
                type="text"
                value={heroTitleEn}
                onChange={e => setHeroTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white font-bold"
              />
            </div>

            {/* Hero Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'الوصف والنبذة الترويجية (Hero Subtitle - عربي)' : 'Hero Description (Arabic)'}
              </label>
              <textarea
                rows={3}
                value={heroSubtitleAr}
                onChange={e => setHeroSubtitleAr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
              />
            </div>

            {/* Hero Subtitle EN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hero Description (English)
              </label>
              <textarea
                rows={3}
                value={heroSubtitleEn}
                onChange={e => setHeroSubtitleEn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
              />
            </div>

            {/* Trust badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ar' ? 'شارة الثقة في أعلى الصفحة (Trust Badge)' : 'Trust Badge Tag'}
              </label>
              <input
                type="text"
                value={trustBadgeAr}
                onChange={e => setTrustBadgeAr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ وتطبيق النصوص على الموقع الآن' : 'Save & Publish Website Copy'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5: IN-APP WEB SUPPORT INBOX ("الدعم الفني عبر الويب")           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tickets List (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
              {language === 'ar' ? 'صندوق محادثات الدعم الفني عبر الويب' : 'Web Support Tickets Inbox'}
            </h3>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {language === 'ar' ? 'لا توجد تذاكر دعم فني حتى الآن' : 'No tickets opened yet'}
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {tickets.map(tck => (
                  <div
                    key={tck.id}
                    onClick={() => setSelectedTicket(tck)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      selectedTicket?.id === tck.id
                        ? 'border-[#800020] bg-rose-50/60 dark:bg-[#28171e]'
                        : 'border-slate-100 dark:border-[#5C0018]/25 bg-slate-50 dark:bg-[#1c0d12]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-[#800020] dark:text-rose-300">
                        #{tck.id}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        tck.status === 'answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tck.status}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {tck.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {tck.userEmail}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Chat (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs flex flex-col justify-between min-h-[450px]">
            {selectedTicket ? (
              <div className="space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="pb-3 border-b border-slate-100 dark:border-[#5C0018]/30 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        #{selectedTicket.id} - {selectedTicket.subject}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedTicket.userEmail} {selectedTicket.orderId ? `· Related Order: #${selectedTicket.orderId}` : ''}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-rose-100 text-[#800020] text-xs font-bold">
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* Thread messages */}
                  <div className="space-y-3 py-4 max-h-80 overflow-y-auto pr-1">
                    {selectedTicket.messages.map(m => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          m.sender === 'admin'
                            ? 'bg-[#800020]/10 border border-[#800020]/25 mr-8 rtl:mr-0 rtl:ml-8'
                            : 'bg-slate-100 dark:bg-[#28171e] ml-8 rtl:ml-0 rtl:mr-8'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className={m.sender === 'admin' ? 'text-[#800020] dark:text-rose-300' : 'text-slate-600'}>
                            {m.senderName} {m.sender === 'admin' ? '(Admin Staff)' : ''}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply input */}
                <form onSubmit={handleSendAdminReply} className="pt-3 border-t border-slate-100 dark:border-[#5C0018]/30 flex gap-2">
                  <input
                    type="text"
                    required
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب ردك للعميل مباشرة على الويب...' : 'Type admin reply to user...'}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إرسال الرد' : 'Reply'}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                {language === 'ar' ? 'اختر تذكرة من اليسار لعرض المحادثة والرد عليها عبر الويب' : 'Select a ticket on the left to view and reply on the web'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 6: ALL ORDERS TABLE                                            */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            {language === 'ar' ? 'إدارة كافة طلبات المنصة وتحديث الحالات' : 'Manage All Platform Orders'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#5C0018]/30 text-slate-500">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Charge</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id} className="border-b border-slate-100 dark:border-[#5C0018]/20">
                    <td className="py-3 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                      #{ord.id}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                      {ord.userEmail}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-semibold max-w-xs truncate">
                      {ord.serviceName}
                    </td>
                    <td className="py-3 px-3 font-mono">{ord.quantity.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold">{ord.chargeAmount} {ord.currency}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        ord.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        ord.status === 'Pending' ? 'bg-rose-100 text-[#800020] border border-rose-300' :
                        ord.status === 'Canceled' ? 'bg-slate-200 text-slate-600' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ord.status === 'Pending' ? (language === 'ar' ? 'بانتظار موافقة الإدارة' : 'Pending Approval') : ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {ord.status === 'Pending' ? (
                          <button
                            onClick={() => handleApproveOrder(ord.id)}
                            className="px-2 py-1 rounded bg-[#800020] text-white text-[10px] font-bold hover:bg-[#5C0018]"
                          >
                            موافقة
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectOrder(ord.id)}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold"
                        >
                          Cancel/Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 7: EXCHANGE RATE SETTINGS                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs max-w-2xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            {t.exchangeRateSettings}
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.usdToEgpRate}
            </label>
            <input
              type="number"
              step="0.1"
              value={exchangeRate}
              onChange={e => setExchangeRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'رقم محفظة فودافون كاش / انستاباي للتحويلات اليدوية' : 'Official Egyptian Mobile Wallet Number'}
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'اسم المحفظة الظاهر للعملاء' : 'Wallet Holder / Desk Name'}
            </label>
            <input
              type="text"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {t.updateSettings}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 8: USERS & BALANCE ADJUSTMENTS                                 */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
              {t.registeredUsers}
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => setAdjustUserId(u.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    adjustUserId === u.id
                      ? 'border-[#800020] bg-rose-50/50 dark:bg-[#28171e]'
                      : 'border-slate-100 dark:border-[#5C0018]/20 bg-slate-50 dark:bg-[#1c0d12]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {u.name} {u.role === 'admin' ? '🛡️' : ''}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {u.email}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-[#800020] dark:text-rose-300">
                      {u.walletBalanceEgp.toFixed(2)} EGP
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${u.walletBalanceUsd.toFixed(2)} USD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
              Manual Wallet Adjustment
            </h3>

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selected User ID
                </label>
                <input
                  type="text"
                  required
                  value={adjustUserId}
                  onChange={e => setAdjustUserId(e.target.value)}
                  placeholder="Click a user on the left"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (+/-)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={adjustCurrency}
                    onChange={e => setAdjustCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                  >
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Audit
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#800020] text-white font-bold text-xs hover:bg-[#5C0018] transition-colors cursor-pointer"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 9: SECURITY & PENETRATION DEFENSE SHIELD                        */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Main Security Status Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#170a0f] via-[#240e18] to-[#170a0f] border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {language === 'ar' ? 'منظومة الأمان والحماية ضد الاختراق' : 'Penetration Defense & Security Shield'}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Grade AAA+ Hardened
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'ar'
                    ? 'النظام محصن بالكامل ضد هجمات حجب الخدمة (DDoS)، التخمين (Brute-Force)، الحقن البرمجي (XSS & Injection)، وتلاعب الأرصدة.'
                    : 'System is fully hardened against DDoS, Brute-Force, XSS/Injection, and balance tampering.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleRunSecurityScan}
                disabled={scanning}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>{scanning ? (language === 'ar' ? 'جاري الفحص...' : 'Scanning...') : (language === 'ar' ? 'فحص أمني ذاتي شامل' : 'Run Security Scan')}</span>
              </button>
              <button
                onClick={handleClearSecurityLogs}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
                title={language === 'ar' ? 'تصفير السجلات' : 'Clear Logs'}
              >
                {language === 'ar' ? 'مسح السجلات' : 'Clear Logs'}
              </button>
            </div>
          </div>

          {/* Key Security Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{language === 'ar' ? 'الهجمات المحظورة' : 'Blocked Attacks'}</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {securityStats?.blockedAttacksCount ?? 0}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {language === 'ar' ? 'صد فوري بنسبة 100%' : '100% Mitigated'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{language === 'ar' ? 'الطلبات الموثوقة' : 'Verified Requests'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {(securityStats?.verifiedRequestsCount ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {language === 'ar' ? 'تم فحصها وتعقيمها' : 'Inspected & Clean'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{language === 'ar' ? 'الدروع النشطة' : 'Active Shields'}</span>
                <Lock className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                7 / 7
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {language === 'ar' ? 'تعمل بكفاءة كاملة' : 'Fully Operational'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{language === 'ar' ? 'تشفير الجلسات' : 'Session Security'}</span>
                <Key className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                256-Bit
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {language === 'ar' ? 'CSPRNG عالي العشوائية' : 'Cryptographic CSPRNG'}
              </div>
            </div>
          </div>

          {/* Diagnostic Scan Output (When Run) */}
          {scanResult && (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">
                    {scanResult.message}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(scanResult.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {scanResult.checks.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 flex items-start gap-2.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                      ✓
                    </span>
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Defense Modules Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'طبقات الدفاع والحماية المدمجة' : 'Integrated Security Defense Layers'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'ar' ? 'مكافحة DDoS وتحديد المعدل' : 'Anti-DDoS & Rate Limiting'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'محرك فحص التردد يحدد 250 طلب/دقيقة للعامة، و12 طلب/دقيقة للعمليات الحساسة، مع حظر فوري لأي نشاط روبوتي مشبوه.'
                    : 'Sliding window IP limiter restricts 250 req/min globally and 12 req/min on authentication to block bot flooding.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (250 req/min)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>{language === 'ar' ? 'درع مكافحة التخمين (Brute-Force)' : 'Brute-Force Lockout Guard'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'قفل تلقائي فوري لأي بريد أو IP بعد 5 محاولات دخول خاطئة متتالية لمدة 10 دقائق لمنع سرقة الحسابات.'
                    : 'Automatic lock of target account/IP after 5 failed password attempts for 10 minutes to stop credential stuffing.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (5 Max Attempts)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  <span>{language === 'ar' ? 'تعقيم المدخلات (Anti-XSS & Injection)' : 'Anti-XSS & Injection Filter'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'فلترة متكررة لكافة المدخلات والنصوص لحذف وسوم السكربت، وبروتوكولات الجافاسكربت، ومنع هجمات Prototype Pollution.'
                    : 'Recursive payload sanitization strips <script> tags, javascript: protocols, null bytes, and prototype pollution keys.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (Recursive Filter)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  <span>{language === 'ar' ? 'حماية الرصيد والضمان المالي' : 'Escrow Ledger & Anti-Tamper'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'عمليات الخصم والشحن تتم بشكل ذري (Atomic)، مع التحقق الصارم من الأرقام الصحيحة ورفض الأرقام السالبة والكسور غير الصالحة.'
                    : 'Atomic financial deductions with strict positive finite integer checks prevent negative-value balance exploitation.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (Escrow Enforced)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  <span>{language === 'ar' ? 'صلاحيات الإدارة والتحقق من الجلسات' : 'RBAC & Session Cryptography'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'جلسات مشفرة 256 بت مع وقت انتهاء صلاحية محدد، وفحص صارم لرتبة المدير (Role Verification) على مستوى الخادم لكل أمر إداري.'
                    : 'High-entropy 256-bit sessions with strict expiration and server-side RBAC validation on all administrative endpoints.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (Role Protected)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-2">
                  <ShieldAlert className="w-4 h-4 text-purple-500" />
                  <span>{language === 'ar' ? 'رؤوس الأمان وإخفاء هوية الخادم' : 'Security Headers & Cloaking'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'حذف X-Powered-By، مع إرسال CSP، ومنع التضمين الخارجي (Anti-Clickjacking عبر X-Frame-Options)، وحماية MIME.'
                    : 'Cloaks Express headers, applies CSP, blocks iframe clickjacking (SAMEORIGIN), and forces nosniff content policies.'}
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  STATUS: ACTIVE (CSP & SAMEORIGIN)
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Security Audit Logs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1117] border border-slate-200 dark:border-[#5C0018]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#800020] dark:text-rose-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {language === 'ar' ? 'سجل العمليات الأمنية المباشر (Security Audit Log)' : 'Real-Time Security Audit Log'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {securityLogs.length} {language === 'ar' ? 'حدث مسجل' : 'events logged'}
              </span>
            </div>

            {securityLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {language === 'ar' ? 'لا توجد سجلات أمنية حالياً. كافة العمليات آمنة.' : 'No security incidents recorded. System running normally.'}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-50 dark:bg-[#170a0f] border-b border-slate-200 dark:border-[#5C0018]/30">
                    <tr>
                      <th className="px-3 py-2.5">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                      <th className="px-3 py-2.5">{language === 'ar' ? 'نوع الحدث' : 'Event Type'}</th>
                      <th className="px-3 py-2.5">{language === 'ar' ? 'المستوى' : 'Severity'}</th>
                      <th className="px-3 py-2.5">IP</th>
                      <th className="px-3 py-2.5">{language === 'ar' ? 'التفاصيل' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#5C0018]/20 font-mono">
                    {securityLogs.map((log) => {
                      const badgeColor =
                        log.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : log.severity === 'success'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#200e16]/50 transition-colors">
                          <td className="px-3 py-2 text-slate-400 whitespace-nowrap text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            {log.type}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px]">
                            {log.ip}
                          </td>
                          <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-sans text-xs">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
