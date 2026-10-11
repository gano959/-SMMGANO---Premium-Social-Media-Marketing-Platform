import React, { useState } from 'react';
import { Service, Currency, Language, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { SocialMediaIcon } from './SocialMediaIcons.js';
import { Search, Zap, ShieldCheck, Clock, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface ServicesViewProps {
  services: Service[];
  currency: Currency;
  language: Language;
  config: SiteConfig | null;
  onSelectServiceForOrder: (serviceId: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  currency,
  language,
  config,
  onSelectServiceForOrder
}) => {
  const t = useTranslation(language);
  const rate = config?.exchangeRateUsdToEgp || 50;

  const [search, setSearch] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const platforms = ['all', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Telegram', 'X (Twitter)', 'Threads', 'Spotify', 'LinkedIn'];

  const filtered = services.filter(s => {
    const matchesPlatform = platformFilter === 'all' || s.platform.toLowerCase() === platformFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.descriptionAr.toLowerCase().includes(q);
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.services}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'ar'
            ? 'قائمة الخدمات المعتمدة مع أسعار فورية بالجنيه المصري والدولار'
            : 'Explore all high-retention services with dual EGP & USD settlement'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Platform Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                platformFilter === p
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#28171e]'
              }`}
            >
              {p !== 'all' && (
                <SocialMediaIcon platform={p} size="sm" className={platformFilter === p ? 'text-white' : 'opacity-80'} />
              )}
              <span>{p === 'all' ? (language === 'ar' ? 'جميع المنصات' : 'All Platforms') : p}</span>
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
            placeholder={t.searchServices}
            className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#5C0018]/30 text-slate-500">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">{t.service}</th>
                <th className="py-3 px-3">{t.rateUsd}</th>
                <th className="py-3 px-3">{t.rateEgp}</th>
                <th className="py-3 px-3">{t.minQuantity} / {t.maxQuantity}</th>
                <th className="py-3 px-3">{t.averageSpeed}</th>
                <th className="py-3 px-3 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(svc => (
                <tr
                  key={svc.id}
                  className="border-b border-slate-100 dark:border-[#5C0018]/20 hover:bg-slate-50 dark:hover:bg-[#28171e]/50 transition-colors"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                    #{svc.id}
                  </td>
                  <td className="py-3.5 px-3 max-w-md">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {svc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {language === 'ar' ? svc.descriptionAr : svc.description}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{svc.guarantee}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${svc.ratePer1000Usd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                    {(svc.ratePer1000Usd * rate).toFixed(2)} ج.م
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                    {svc.min.toLocaleString()} / {svc.max.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                    {svc.speed}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => onSelectServiceForOrder(svc.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white text-[11px] font-bold transition-all shadow-xs"
                    >
                      {t.orderNow}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
