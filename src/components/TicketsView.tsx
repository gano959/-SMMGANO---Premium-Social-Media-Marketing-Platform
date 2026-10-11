import React, { useState } from 'react';
import { User, SupportTicket, Language } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { api } from '../lib/api.js';
import { MessageSquare, Plus, Send, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface TicketsViewProps {
  user: User;
  tickets: SupportTicket[];
  language: Language;
  onRefresh: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  user,
  tickets,
  language,
  onRefresh
}) => {
  const t = useTranslation(language);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // New ticket state
  const [subject, setSubject] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [message, setMessage] = useState<string>('');

  // Reply message
  const [replyText, setReplyText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const res = await api.createTicket({
        subject: subject.trim(),
        message: message.trim(),
        orderId: orderId.trim() || undefined,
        priority
      });
      setIsCreating(false);
      setSubject('');
      setMessage('');
      setOrderId('');
      onRefresh();
      setSelectedTicket(res.ticket);
    } catch (err: any) {
      alert(err.message || 'Failed to open ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setLoading(true);
    try {
      const res = await api.addTicketMessage(selectedTicket.id, replyText.trim());
      setReplyText('');
      setSelectedTicket(res.ticket);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.tickets}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'تواصل مباشرة مع فريق الدعم الفني والمحاسبي'
              : 'Direct communication desk with our support & engineering team'}
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
            className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-xl bg-[#800020] text-white hover:bg-[#5C0018] flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.openNewTicket}</span>
          </button>
        )}
      </div>

      {/* Ticket Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateTicket} className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.openNewTicket}
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.subject}
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Inquiry regarding order delivery..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.relatedOrder}
              </label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="ORD-78192"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.message}
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Please describe your question or issue in detail..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {loading ? 'Submitting...' : t.sendTicket}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {/* Selected Ticket Conversation Thread */}
      {selectedTicket && !isCreating && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  #{selectedTicket.id} · {selectedTicket.subject}
                </h3>
                {selectedTicket.orderId && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Related Order: #{selectedTicket.orderId}
                  </span>
                )}
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
              selectedTicket.status === 'answered'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            }`}>
              {selectedTicket.status}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {selectedTicket.messages.map(msg => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs space-y-1 ${
                  msg.sender === 'admin'
                    ? 'bg-gradient-to-r from-rose-50 to-[#F8EEF1] dark:from-[#2d141b] dark:to-[#1f0e13] border border-[#800020]/20 mr-6 rtl:mr-0 rtl:ml-6'
                    : 'bg-slate-50 dark:bg-[#28171e] border border-slate-200 dark:border-[#5C0018]/30 ml-6 rtl:ml-0 rtl:mr-6'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className={msg.sender === 'admin' ? 'text-[#800020] dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}>
                    {msg.senderName} {msg.sender === 'admin' ? '🛡️ (Staff)' : ''}
                  </span>
                  <span className="text-slate-400 font-normal">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply message...'}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {!isCreating && !selectedTicket && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
            {t.ticketHistory}
          </h3>

          {tickets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {language === 'ar' ? 'لا توجد تذاكر دعم سابقة' : 'No support tickets opened yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(tck => (
                <div
                  key={tck.id}
                  onClick={() => setSelectedTicket(tck)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#28171e] border border-slate-100 dark:border-[#5C0018]/30 hover:border-[#800020]/40 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#800020] dark:text-rose-300">
                        #{tck.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {tck.subject}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {tck.messages[tck.messages.length - 1]?.message}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {new Date(tck.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      tck.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}>
                      {tck.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
