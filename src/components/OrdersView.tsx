import React, { useState } from 'react';
import { Order, Currency, Language } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { SocialMediaIcon } from './SocialMediaIcons.js';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  currency: Currency;
  language: Language;
  onReorder: (serviceId: string, link: string, quantity: number) => void;
  onRefresh: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currency,
  language,
  onReorder,
  onRefresh
}) => {
  const t = useTranslation(language);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status.toLowerCase() === filter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      o.id.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      o.link.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.orders}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'تتبع حالة تنفيذ طلباتك ونسب الإنجاز بالوقت الفعلي'
              : 'Monitor real-time progress, start counts, and delivery metrics'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#800020] dark:text-rose-400" />
          <span>{language === 'ar' ? 'تحديث السجل' : 'Refresh List'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'In Progress', 'Completed', 'Pending', 'Canceled'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === st
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#28171e]'
              }`}
            >
              {st === 'all' ? (language === 'ar' ? 'الكل' : 'All') : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث برقم الطلب أو الرابط...' : 'Search by ID or URL...'}
            className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {t.noOrdersFound}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 hover:border-[#800020]/30 transition-all shadow-xs space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#5C0018]/25">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-extrabold text-[#800020] dark:text-rose-300 bg-[#800020]/10 px-2.5 py-1 rounded-md">
                    #{order.id}
                  </span>
                  <button
                    onClick={() => handleCopy(order.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedId === order.id && (
                    <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                  )}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <SocialMediaIcon platform={order.platform} size="sm" className="opacity-90" />
                    <span>{order.platform}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
                      order.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : order.status === 'In Progress'
                        ? 'bg-[#800020]/10 text-[#800020] dark:text-rose-300 border-[#800020]/30'
                        : order.status === 'Pending'
                        ? 'bg-[#800020]/15 text-[#800020] dark:text-rose-300 border-[#800020]/40'
                        : order.status === 'Canceled'
                        ? 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                    }`}
                  >
                    {order.status === 'Pending'
                      ? (language === 'ar' ? 'بانتظار موافقة الإدارة' : 'Pending Admin Approval')
                      : order.status}
                  </span>
                </div>
              </div>

              {/* Middle row: Service Name and Link */}
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.serviceName}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                  <span>{order.link}</span>
                  <a
                    href={order.link.startsWith('http') ? order.link : `https://${order.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#800020] dark:text-rose-300 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Progress Bar (if in progress) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'ar' ? 'نسبة الإنجاز:' : 'Progress:'} {order.progressPercent}%</span>
                  <span>{t.remains}: {order.remains.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#28171e] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#800020] to-[#A32645] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, order.progressPercent))}%` }}
                  />
                </div>
              </div>

              {/* Bottom stats row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <span><strong>{t.quantity}:</strong> {order.quantity.toLocaleString()}</span>
                  <span>·</span>
                  <span><strong>{t.startCount}:</strong> {order.startCount.toLocaleString()}</span>
                  <span>·</span>
                  <span><strong>{t.charge}:</strong> <span className="font-mono font-bold text-slate-900 dark:text-white">{order.chargeAmount} {order.currency}</span></span>
                </div>

                <button
                  onClick={() => onReorder(order.serviceId, order.link, order.quantity)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#800020] hover:text-white dark:bg-[#28171e] dark:hover:bg-[#800020] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  {language === 'ar' ? 'إعادة طلب نفس الخدمة' : 'Re-order Service'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
