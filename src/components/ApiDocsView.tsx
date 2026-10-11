import React, { useState } from 'react';
import { User, Language } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { Key, Copy, Check, Terminal, Code2, Globe } from 'lucide-react';

interface ApiDocsViewProps {
  user: User | null;
  language: Language;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ user, language }) => {
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const apiKey = user?.apiKey || 'gano_live_demo_key_98234120934';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const sampleCurl = `curl -X POST https://smmgano.com/api/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "${apiKey}",
    "action": "balance"
  }'`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          SMMGANO API Integration (v2 Standard)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'ar'
            ? 'اربط موقعك أو متجرك بـ SMMGANO عبر بروتوكول SMM v2 القياسي لتنفيذ الطلبات آلياً'
            : 'Standard SMM v2 API endpoints for reseller automation, bots, and external platforms.'}
        </p>
      </div>

      {/* User API Key Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-[#800020]/25 dark:border-[#5C0018]/50 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#800020] dark:text-rose-400" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {language === 'ar' ? 'مفتاح الـ API الخاص بك' : 'Your Live API Secret Key'}
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          {language === 'ar' ? 'استخدم هذا المفتاح لمصادقة جميع طلبات الـ POST البرمجية.' : 'Include this parameter with every v2 request.'}
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#28171e] border border-slate-200 dark:border-[#5C0018]/40 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold break-all">
            {apiKey}
          </span>
          <button
            onClick={handleCopyKey}
            className="px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* API Endpoint & Sample */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#800020] dark:text-rose-400" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Base Endpoint URL
          </h3>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs">
          POST /api/v2
        </div>

        {/* Action 1: Balance */}
        <div className="pt-4 space-y-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            1. User Balance (action = &quot;balance&quot;)
          </h4>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
{`// Request Body (JSON or Form-Data)
{
  "key": "${apiKey}",
  "action": "balance"
}

// Response
{
  "balance": 1450.00,
  "currency": "EGP",
  "balance_usd": 35.00
}`}
          </pre>
        </div>

        {/* Action 2: Services */}
        <div className="pt-4 space-y-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            2. Services List (action = &quot;services&quot;)
          </h4>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
{`// Request
{
  "key": "${apiKey}",
  "action": "services"
}

// Response
[
  {
    "service": "ig-101",
    "name": "Instagram Followers [HQ Real - 30 Days Refill]",
    "type": "Default",
    "category": "Instagram Followers",
    "rate": 60.00,
    "rate_usd": 1.20,
    "min": 50,
    "max": 50000,
    "dripfeed": false
  }
]`}
          </pre>
        </div>

        {/* Action 3: Status */}
        <div className="pt-4 space-y-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            3. Order Status (action = &quot;status&quot;)
          </h4>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
{`// Request
{
  "key": "${apiKey}",
  "action": "status",
  "order": "ORD-78192"
}

// Response
{
  "charge": 150.00,
  "start_count": 1420,
  "status": "In Progress",
  "remains": 1200,
  "currency": "EGP"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
