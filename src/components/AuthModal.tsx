import React, { useState, useEffect } from 'react';
import { Currency, Language } from '../types.js';
import { useTranslation } from '../lib/translations.js';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { api } from '../lib/api.js';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  language: Language;
  currency: Currency;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMethod = 'phone' | 'email';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  language,
  currency,
  onClose,
  onSuccess
}) => {
  const t = useTranslation(language);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpBanner, setOtpBanner] = useState<{ code: string; phone: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  // General state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setOtpStep('phone');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpBanner(null);
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // In web app, we simulate or connect to Google Identity
      // Generating a deterministic or user-prompted Google profile
      const googleUserEmail = email && email.includes('@') ? email : 'google.user@gmail.com';
      const googleUserName = name || 'مستخدم Google';
      const googleId = 'gid_' + Math.random().toString(36).substring(2, 12);

      await api.loginWithGoogle({
        email: googleUserEmail,
        name: googleUserName,
        googleId,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        preferredCurrency: currency
      });

      setSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول بحساب Google بنجاح!' : 'Signed in with Google successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل تسجيل الدخول عبر Google' : 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Requesting 6-Digit Phone OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setError(language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح ومكتمل' : 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendPhoneOtp(cleanPhone);
      setOtpStep('code');
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);

      // Show received simulated SMS banner with the 6-digit code
      if (res.devCode) {
        setOtpBanner({ code: res.devCode, phone: cleanPhone });
        // Auto-focus or prefill assistance
      }
      setSuccessMsg(language === 'ar' ? `تم إرسال كود التأكيد (6 أرقام) إلى ${cleanPhone}` : `Confirmation code sent to ${cleanPhone}`);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'فشل إرسال كود التأكيد' : 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Verifying 6-Digit Phone OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError(language === 'ar' ? 'يرجى إدخال كود التأكيد المكون من 6 أرقام كاملاً' : 'Please enter all 6 digits of the confirmation code');
      return;
    }

    setLoading(true);
    try {
      await api.verifyPhoneOtp({
        phone: phone.trim(),
        code,
        name: phoneName.trim() || undefined,
        preferredCurrency: currency
      });

      setSuccessMsg(language === 'ar' ? 'تم التحقق من رقم هاتفك وتسجيل الدخول بنجاح!' : 'Phone verified and signed in successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'كود التأكيد غير صحيح' : 'Invalid confirmation code'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill OTP on single click of the banner
  const handleFillCode = (code: string) => {
    const digits = code.split('').slice(0, 6);
    setOtpDigits(digits);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Standard Email/Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await api.login({ email, password });
      } else {
        await api.register({
          name,
          email,
          password,
          preferredCurrency: currency,
          phone: emailPhone
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Fast Login
  const handleQuickLogin = async (demoRole: 'admin' | 'user') => {
    setError(null);
    setLoading(true);
    try {
      if (demoRole === 'admin') {
        await api.login({ email: 'admin@smmgano.com', password: 'Admin1234!' });
      } else {
        await api.login({ email: 'client@smmgano.com', password: 'User1234!' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1a0f13] border border-[#800020]/25 dark:border-[#5C0018]/50 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-[#800020]/30 font-bold text-xl">
            S
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar'
              ? 'سيرفر SMMGANO للخدمات الرقمية وحلول الميديا'
              : 'SMMGANO Social Media Marketing Platform'}
          </p>
        </div>

        {/* 1. GOOGLE ONE-CLICK SIGN IN BUTTON */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {language === 'ar' ? 'المتابعة والتسجيل باستخدام Google' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-white/10 w-full"></div>
          <span className="bg-white dark:bg-[#1a0f13] px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {language === 'ar' ? 'أو عبر' : 'Or with'}
          </span>
          <div className="border-t border-slate-200 dark:border-white/10 w-full"></div>
        </div>

        {/* METHOD TABS (PHONE & OTP vs EMAIL) */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-100 dark:bg-[#25151c] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-white dark:bg-[#800020] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#800020] dark:text-white" />
            <span>{language === 'ar' ? 'برقم الهاتف (كود 6 أرقام)' : 'Phone (SMS OTP)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'email'
                ? 'bg-white dark:bg-[#800020] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#800020] dark:text-white" />
            <span>{language === 'ar' ? 'البريد وكلمة المرور' : 'Email & Password'}</span>
          </button>
        </div>

        {/* Notification alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* METHOD A: PHONE NUMBER & 6-DIGIT OTP CONFIRMATION             */}
        {/* ------------------------------------------------------------- */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {otpStep === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <input
                      type="text"
                      value={phoneName}
                      onChange={e => setPhoneName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: أحمد محمود' : 'e.g. John Doe'}
                      className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'رقم الهاتف المحمول' : 'Mobile Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={language === 'ar' ? '01012345678 أو +2010...' : '+1 (555) 000-0000'}
                      dir="ltr"
                      className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020] text-left"
                    />
                  </div>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'ar'
                      ? 'سيتم إرسال رسالة نصية SMS تحتوي على كود تأكيد مكون من 6 أرقام لتسجيلك فوراً.'
                      : 'A 6-digit confirmation code will be sent to verify your phone.'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#800020] hover:bg-[#5C0018] shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>{language === 'ar' ? 'جاري إرسال الكود...' : 'Sending Code...'}</span>
                  ) : (
                    <>
                      <span>{language === 'ar' ? 'إرسال كود التأكيد (6 أرقام)' : 'Send Confirmation Code (6 Digits)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: ENTER 6-DIGIT OTP CODE */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Simulated SMS Received Notification Banner */}
                {otpBanner && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{language === 'ar' ? 'رسالة نصية SMS واردة' : 'Incoming SMS Notification'}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">
                        {otpBanner.phone}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {language === 'ar'
                        ? `كود تأكيد حسابك في SMMGANO هو:`
                        : `Your SMMGANO confirmation code is:`}{' '}
                      <strong className="font-mono text-sm font-black text-[#800020] dark:text-amber-300 px-1.5 py-0.5 bg-white dark:bg-amber-900/80 rounded border border-amber-300 dark:border-amber-700">
                        {otpBanner.code}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleFillCode(otpBanner.code)}
                      className="text-[11px] font-bold text-[#800020] dark:text-amber-300 underline cursor-pointer hover:opacity-80"
                    >
                      {language === 'ar' ? '👉 اضغط هنا لتعبئة الكود تلقائياً' : '👉 Click to autofill code'}
                    </button>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'أدخل كود التأكيد (6 أرقام):' : 'Enter 6-digit verification code:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      className="text-[11px] text-[#800020] dark:text-rose-300 hover:underline cursor-pointer"
                    >
                      {language === 'ar' ? 'تغيير الرقم' : 'Change phone'}
                    </button>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-between gap-1.5 sm:gap-2" dir="ltr">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-mono font-black rounded-xl border border-slate-300 dark:border-[#5C0018]/50 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020] focus:border-[#800020] shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {countdown > 0 ? (
                      `${language === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} ${countdown}s`
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="text-[#800020] dark:text-rose-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{language === 'ar' ? 'إعادة إرسال الكود' : 'Resend Code'}</span>
                      </button>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {phone}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#800020] hover:bg-[#5C0018] shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                  ) : (
                    <>
                      <span>{language === 'ar' ? 'تأكيد الرمز والدخول' : 'Verify & Sign In'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* METHOD B: EMAIL & PASSWORD FORM                               */}
        {/* ------------------------------------------------------------- */}
        {authMethod === 'email' && (
          <div>
            {/* Mode Toggle (Login vs Register) */}
            <div className="flex border-b border-slate-200 dark:border-[#5C0018]/40 mb-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 pb-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#800020] text-[#800020] dark:text-rose-300'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 pb-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  mode === 'register'
                    ? 'border-[#800020] text-[#800020] dark:text-rose-300'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.register}
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ahmed El-Sayed"
                        className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.senderPhone}
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <input
                        type="tel"
                        value={emailPhone}
                        onChange={e => setEmailPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#5C0018]/40 bg-white dark:bg-[#150a0f] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#800020] hover:bg-[#5C0018] shadow-md shadow-[#800020]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? t.login : t.register}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* FAST 1-CLICK DEMO BUTTONS */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-[#5C0018]/40">
          <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider mb-2">
            {language === 'ar' ? 'تجربة سريعة بنقرة واحدة (حساب تجريبي)' : 'Instant 1-Click Demo Login'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-rose-300 dark:bg-[#800020]/30 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{t.demoClient}</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.demoAdmin}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
