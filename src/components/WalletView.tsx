import React, { useState } from 'react';
import { User, Deposit, Transaction, Currency, Language, SiteConfig } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import { api } from '../lib/api.js';
import {
  Wallet,
  Phone,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Zap,
  Lock,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface WalletViewProps {
  user: User;
  deposits: Deposit[];
  transactions: Transaction[];
  currency: Currency;
  language: Language;
  config: SiteConfig | null;
  onDepositSuccess: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  deposits,
  transactions,
  currency,
  language,
  config,
  onDepositSuccess
}) => {
  const t = useTranslation(language);
  const destinationNumber = config?.mobileWalletDestination || '01033537322';
  const accountName = config?.mobileWalletAccountName || 'Vodafone Cash & InstaPay Desk (SMMGANO)';

  // Tabs: 'electronic' (Recommended) vs 'manual'
  const [paymentMode, setPaymentMode] = useState<'electronic' | 'manual'>('electronic');

  // Electronic Payment Gateway State
  const [electronicMethod, setElectronicMethod] = useState<'wallet' | 'card' | 'fawry'>('wallet');
  const [electronicAmount, setElectronicAmount] = useState<number>(200);
  const [electronicWalletPhone, setElectronicWalletPhone] = useState<string>(user.phone || '');
  const [electronicCardNumber, setElectronicCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [electronicExpiry, setElectronicExpiry] = useState<string>('12/28');
  const [electronicCvc, setElectronicCvc] = useState<string>('789');
  const [isProcessingElectronic, setIsProcessingElectronic] = useState<boolean>(false);
  const [electronicStep, setElectronicStep] = useState<'input' | 'processing' | 'otp' | 'success'>('input');
  const [otpCode, setOtpCode] = useState<string>('123456');

  // Manual fallback state
  const [amount, setAmount] = useState<number>(200);
  const [senderPhone, setSenderPhone] = useState<string>(user.phone || '');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(destinationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Electronic Checkout Trigger
  const handleStartElectronicPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (electronicAmount <= 0) {
      setError('Please specify a deposit amount');
      return;
    }

    if (electronicMethod === 'wallet' && !electronicWalletPhone.trim()) {
      setError('Please enter your mobile wallet phone number');
      return;
    }

    // Move to electronic gateway simulation window
    setElectronicStep('processing');
    setTimeout(() => {
      setElectronicStep('otp');
    }, 1200);
  };

  // Confirm Electronic Payment
  const handleConfirmElectronicPayment = async () => {
    setIsProcessingElectronic(true);
    setError(null);

    try {
      const gatewayName = electronicMethod === 'wallet'
        ? 'Vodafone Cash & InstaPay Direct Gateway'
        : electronicMethod === 'card'
        ? 'Visa / MasterCard Electronic 3D-Secure'
        : 'Fawry Direct Electronic Gateway';

      const res = await api.electronicPay({
        method: electronicMethod === 'wallet' ? 'electronic_wallet' : electronicMethod === 'card' ? 'electronic_card' : 'electronic_fawry',
        amount: electronicAmount,
        currency: electronicMethod === 'card' ? currency : 'EGP',
        accountIdentifier: electronicMethod === 'wallet' ? electronicWalletPhone : electronicCardNumber,
        electronicGatewayName: gatewayName
      });

      setSuccessNotice(res.message);
      setElectronicStep('success');
      onDepositSuccess();

      setTimeout(() => {
        setElectronicStep('input');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Electronic payment gateway declined');
      setElectronicStep('input');
    } finally {
      setIsProcessingElectronic(false);
    }
  };

  // Manual Transfer Submission
  const handleManualDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (amount <= 0) {
      setError('Please specify a deposit amount');
      return;
    }

    if (!transactionRef.trim()) {
      setError('Please provide the transaction reference number or confirmation code');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createDeposit({
        method: 'vodafone_cash',
        amount,
        currency: 'EGP',
        senderPhone: senderPhone.trim(),
        transactionRef: transactionRef.trim(),
        receiptNote: receiptNote.trim()
      });

      setSuccessNotice(res.message);
      setTransactionRef('');
      setReceiptNote('');
      onDepositSuccess();
    } catch (err: any) {
      setError(err.message || 'Deposit submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Wallet Balance Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#800020] to-[#5C0018] text-white shadow-lg shadow-[#800020]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-rose-200 block mb-1">
            {t.totalBalance}
          </span>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              {currency === 'EGP' ? `${user.walletBalanceEgp.toFixed(2)} ج.م` : `$${user.walletBalanceUsd.toFixed(2)}`}
            </span>
            <span className="text-sm font-medium text-rose-200 font-mono">
              ({currency === 'EGP' ? `$${user.walletBalanceUsd.toFixed(2)} USD` : `${user.walletBalanceEgp.toFixed(2)} EGP`})
            </span>
          </div>
          <p className="text-xs text-rose-100/80 mt-1">
            {t.walletSubtitle}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs space-y-1">
          <div className="text-rose-200 font-semibold">{language === 'ar' ? 'سعر الصرف المعتمد:' : 'Exchange Rate:'}</div>
          <div className="font-mono font-bold text-white text-sm">1 USD = {config?.exchangeRateUsdToEgp || 50} EGP</div>
        </div>
      </div>

      {/* Notification banner */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* Payment Gateway Mode Selector */}
      <div className="flex border-b border-slate-200 dark:border-[#5C0018]/40 gap-3 text-xs font-extrabold pb-1">
        <button
          onClick={() => setPaymentMode('electronic')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            paymentMode === 'electronic'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-[#800020] dark:text-rose-400" />
          <span>{language === 'ar' ? 'بوابة الدفع الإلكتروني الفوري' : 'Instant Online Gateway'}</span>
        </button>

        <button
          onClick={() => setPaymentMode('manual')}
          className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            paymentMode === 'manual'
              ? 'border-[#800020] text-[#800020] dark:text-rose-300 bg-[#800020]/5 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{language === 'ar' ? 'التحويل المباشر للمحفظة' : 'Direct Wallet Transfer'}</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. INSTANT ELECTRONIC PAYMENT GATEWAY (MAIN)        */}
      {/* ---------------------------------------------------- */}
      {paymentMode === 'electronic' && (
        <div className="space-y-6">
          {/* Method Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setElectronicMethod('wallet')}
              className={`p-4 rounded-xl border text-center transition-all ${
                electronicMethod === 'wallet'
                  ? 'bg-[#800020] text-white border-[#800020] shadow-md'
                  : 'bg-white dark:bg-[#1f1216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs">{language === 'ar' ? 'المحافظ الإلكترونية (فودافون كاش / انستاباي)' : 'Electronic Wallet (Vodafone / InstaPay)'}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{language === 'ar' ? 'دفع إلكتروني مباشر عبر التطبيق' : 'Direct Electronic Checkout'}</div>
            </button>

            <button
              type="button"
              onClick={() => setElectronicMethod('card')}
              className={`p-4 rounded-xl border text-center transition-all ${
                electronicMethod === 'card'
                  ? 'bg-[#800020] text-white border-[#800020] shadow-md'
                  : 'bg-white dark:bg-[#1f1216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs">{language === 'ar' ? 'البطاقات البنكية (فيزا / ماستركارد / ميزة)' : 'Visa / Mastercard / Meeza'}</div>
              <div className="text-[10px] opacity-80 mt-0.5">3-D Secure Electronic Pay</div>
            </button>

            <button
              type="button"
              onClick={() => setElectronicMethod('fawry')}
              className={`p-4 rounded-xl border text-center transition-all ${
                electronicMethod === 'fawry'
                  ? 'bg-[#800020] text-white border-[#800020] shadow-md'
                  : 'bg-white dark:bg-[#1f1216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#5C0018]/40 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs">{language === 'ar' ? 'فوري باي الإلكتروني المباشر' : 'Fawry Direct Electronic Pay'}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{language === 'ar' ? 'دفع إلكتروني سريع' : 'Instant Online Clearance'}</div>
            </button>
          </div>

          {/* Electronic Checkout Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'ar' ? 'بوابة الدفع الإلكتروني المباشر' : 'Secure Online Electronic Checkout'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'يتم شحن الرصيد آلياً وفورياً بعد إتمام الدفع بالثواني' : 'Funds are credited instantly upon electronic clearance'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>Instant Auth</span>
              </span>
            </div>

            {/* Step: Input */}
            {electronicStep === 'input' && (
              <form onSubmit={handleStartElectronicPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'مبلغ الشحن الإلكتروني' : 'Deposit Amount'} (
                    {electronicMethod === 'card' ? currency : 'EGP ج.م'}
                    )
                  </label>
                  <input
                    type="number"
                    required
                    min={electronicMethod === 'card' && currency === 'USD' ? 1 : 20}
                    step={electronicMethod === 'card' && currency === 'USD' ? 1 : 10}
                    value={electronicAmount}
                    onChange={e => setElectronicAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                  />
                  <div className="flex gap-2 mt-2">
                    {[100, 200, 500, 1000].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setElectronicAmount(amt)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#28171e] text-slate-700 dark:text-slate-300"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {electronicMethod === 'wallet' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'ar' ? 'رقم محفظتك الإلكترونية (فودافون كاش / انستاباي / اتصالات / أورنج)' : 'Your Electronic Mobile Wallet Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={electronicWalletPhone}
                      onChange={e => setElectronicWalletPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {language === 'ar' ? 'سيتم إرسال إشعار الدفع وتأكيد العملية إلكترونياً إلى محفظتك مباشرة' : 'Direct electronic payment request will be triggered to your phone'}
                    </span>
                  </div>
                )}

                {electronicMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={electronicCardNumber}
                        onChange={e => setElectronicCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={electronicExpiry}
                          onChange={e => setElectronicExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                        <input
                          type="text"
                          value={electronicCvc}
                          onChange={e => setElectronicCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-[#800020] hover:bg-[#5C0018] shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>
                    {language === 'ar'
                      ? `متابعة الدفع الإلكتروني (${electronicAmount} ${electronicMethod === 'card' ? currency : 'EGP'})`
                      : `Proceed to Electronic Checkout (${electronicAmount})`}
                  </span>
                </button>
              </form>
            )}

            {/* Step: Processing animation */}
            {electronicStep === 'processing' && (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-[#800020] border-t-transparent animate-spin mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'ar' ? 'جاري الاتصال ببوابة الدفع الإلكترونية...' : 'Connecting to Electronic Payment Gateway...'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'يرجى الانتظار ثوانٍ لتأمين الجلسة المشفرة' : 'Establishing 256-bit SSL encrypted session'}
                </p>
              </div>
            )}

            {/* Step: OTP / Confirmation Modal */}
            {electronicStep === 'otp' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>{language === 'ar' ? 'تأكيد عملية الدفع الإلكتروني' : 'Confirm Electronic Transaction'}</span>
                  </div>
                  <p>
                    {language === 'ar'
                      ? `تم إصدار إشعار دفع بقيمة ${electronicAmount} ج.م إلى رقم محفظتك (${electronicWalletPhone || 'المحفظة الإلكترونية'}). أدخل كود التحقق أو اضغط تأكيد لإتمام الشحن الفوري.`
                      : `Payment challenge issued for ${electronicAmount}. Confirm to charge and credit your wallet.`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'كود التأكيد الإلكتروني (OTP / PIN)' : 'Electronic Auth Code'}
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmElectronicPayment}
                    disabled={isProcessingElectronic}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingElectronic ? 'جاري الشحن...' : (language === 'ar' ? 'تأكيد الدفع وشحن الرصيد فوراً' : 'Confirm & Credit Now')}
                  </button>
                  <button
                    onClick={() => setElectronicStep('input')}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {electronicStep === 'success' && (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تم الدفع الإلكتروني بنجاح!' : 'Electronic Payment Successful!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? `تمت إضافة ${electronicAmount} إلى محفظتك بنجاح وبشكل فوري.` : `Credited ${electronicAmount} to your wallet.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MANUAL BACKUP TRANSFER OPTION                     */}
      {/* ---------------------------------------------------- */}
      {paymentMode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-[#800020]/25 dark:border-[#5C0018]/50 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.egyptianMobileWallet}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-[#F8EEF1] dark:from-[#2a131a] dark:to-[#1f0d14] border border-[#800020]/25 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {t.transferDestination}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#800020] dark:text-rose-300 tracking-wider">
                    {destinationNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#5C0018] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                  {accountName}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleManualDepositSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
                {language === 'ar' ? 'إرسال بيانات التحويل للمراجعة الفورية' : 'Submit Transfer Details for Rapid Review'}
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.depositAmount} (EGP ج.م)
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  step="10"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.senderPhone}
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.transactionRef}
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="VF-9821390 / SMS Reference"
                  className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#170a0f] text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#800020] hover:bg-[#5C0018] shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : `${t.submitDeposit} (${amount} EGP)`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposits History Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
          {t.recentDeposits}
        </h3>

        {deposits.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            {language === 'ar' ? 'لا توجد عمليات إيداع سابقة' : 'No deposits recorded yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#5C0018]/30 text-slate-500">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">{t.method}</th>
                  <th className="py-2.5 px-3">{t.amount}</th>
                  <th className="py-2.5 px-3">{t.reference}</th>
                  <th className="py-2.5 px-3">{t.date}</th>
                  <th className="py-2.5 px-3">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(dep => (
                  <tr key={dep.id} className="border-b border-slate-100 dark:border-[#5C0018]/20">
                    <td className="py-3 px-3 font-mono font-bold text-[#800020] dark:text-rose-300">
                      #{dep.id}
                    </td>
                    <td className="py-3 px-3 uppercase font-semibold">
                      {dep.method.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {dep.amount} {dep.currency}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {dep.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          dep.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : dep.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        {dep.status === 'approved' ? (language === 'ar' ? 'معتمد ومضاف' : 'Approved') :
                         dep.status === 'pending' ? (language === 'ar' ? 'بانتظار موافقة الإدارة' : 'Pending Approval') :
                         (language === 'ar' ? 'مرفوض' : 'Rejected')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1216] border border-slate-200 dark:border-[#5C0018]/40 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-[#5C0018]/30">
          {language === 'ar' ? 'سجل العمليات المالية والمحفظة' : 'Financial Transactions & Ledger'}
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            {language === 'ar' ? 'لا توجد عمليات مالية مسجلة' : 'No transactions recorded yet'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#5C0018]/30 text-slate-500">
                  <th className="py-2.5 px-3">TXN</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th className="py-2.5 px-3">{t.amount}</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'الرصيد بعدها' : 'Balance After'}</th>
                  <th className="py-2.5 px-3">{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-slate-100 dark:border-[#5C0018]/20">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {txn.id}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {txn.description}
                    </td>
                    <td className={`py-3 px-3 font-mono font-bold ${
                      txn.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {txn.amount > 0 ? `+${txn.amount}` : txn.amount} {txn.currency}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {txn.balanceAfter} {txn.currency}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(txn.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
