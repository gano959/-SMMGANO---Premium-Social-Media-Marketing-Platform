import React from 'react';
import { Language, Currency } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { SmmGanoLogo } from './SmmGanoLogo.js';
import { Phone, ShieldCheck, Zap, Globe, Mail } from 'lucide-react';

interface FooterProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const t = useTranslation(language);

  return (
    <footer className="mt-20 border-t border-[#800020]/15 dark:border-[#5C0018]/40 bg-white dark:bg-[#140b0e] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <SmmGanoLogo size="md" showSubtitle={true} />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'المنصة الرائدة في الشرق الأوسط لخدمات السوشيال ميديا والتسويق الرقمي بأسعار الجملة ودعم فوري لفودافون كاش.'
                : 'Your all-in-one social media marketing platform for managing engagement services, tracking orders, and automated tools.'}
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ar' ? 'روابط المنصة' : 'Platform Navigation'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('new-order')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  {t.newOrder}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  {t.services}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  {t.orders}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('add-funds')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  {t.addFunds}
                </button>
              </li>
            </ul>
          </div>

          {/* Egyptian Wallet Information */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ar' ? 'طرق الدفع والشحن' : 'Payment & Wallets'}
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1f1216] border border-[#800020]/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#800020] dark:text-rose-300">
                <Phone className="w-3.5 h-3.5" />
                <span>فودافون كاش / انستاباي</span>
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                01033537322
              </div>
              <p className="text-[10px] text-slate-500">
                {language === 'ar' ? 'متاح 24/7 للإيداع الفوري والمراجعة' : '24/7 available for manual deposit verification'}
              </p>
            </div>
          </div>

          {/* Developers & API */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ar' ? 'المطورين والموزعين' : 'Developers & Resellers'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('api')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  SMM v2 Standard API
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tickets')} className="hover:text-[#800020] dark:hover:text-rose-300 transition-colors">
                  {t.tickets}
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Non-Drop Guaranteed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#5C0018]/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-4">
            <span>SMMGANO Platform v3.2</span>
            <span>·</span>
            <span>EGP & USD Dual Ledger</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
