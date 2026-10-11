import React, { useState, useEffect, useCallback } from 'react';
import { User, Service, Order, Deposit, Transaction, SupportTicket, SiteConfig, Currency, Language } from './types.js';
import { api } from './lib/api.js';
import { Header } from './components/Header.js';
import { LandingHero } from './components/LandingHero.js';
import { DashboardView } from './components/DashboardView.js';
import { NewOrderView } from './components/NewOrderView.js';
import { OrdersView } from './components/OrdersView.js';
import { WalletView } from './components/WalletView.js';
import { ServicesView } from './components/ServicesView.js';
import { TicketsView } from './components/TicketsView.js';
import { ApiDocsView } from './components/ApiDocsView.js';
import { AdminConsole } from './components/AdminConsole.js';
import { AuthModal } from './components/AuthModal.js';
import { Footer } from './components/Footer.js';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Persistence state
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('smmgano_currency') as Currency) || 'EGP';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('smmgano_language') as Language) || 'ar';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('smmgano_theme') === 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  // Data state
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Apply dark class and RTL direction to root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smmgano_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smmgano_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('smmgano_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('smmgano_currency', currency);
  }, [currency]);

  // Load session & public data
  const loadUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      if (activeTab === 'home') {
        setActiveTab('dashboard');
      }
    } catch {
      setUser(null);
    }
  }, [activeTab]);

  const loadPublicData = useCallback(async () => {
    try {
      const [cfgData, srvData] = await Promise.all([
        api.getConfig(),
        api.getServices()
      ]);
      setConfig(cfgData);
      setServices(srvData.services);
    } catch (err) {
      console.error('Failed to load public data:', err);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    if (!api.getToken()) return;
    try {
      const [ordData, depData, txData, tckData] = await Promise.all([
        api.getOrders(),
        api.getDeposits(),
        api.getTransactions(),
        api.getTickets()
      ]);
      setOrders(ordData.orders);
      setDeposits(depData.deposits);
      setTransactions(txData.transactions);
      setTickets(tckData.tickets);
    } catch (err) {
      console.error('Failed to load user specific records:', err);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
    if (api.getToken()) {
      loadUser();
    }
  }, [loadPublicData, loadUser]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('home');
  };

  const handleQuickDemoLogin = async (role: 'admin' | 'user') => {
    try {
      if (role === 'admin') {
        await api.login({ email: 'admin@smmgano.com', password: 'Admin1234!' });
      } else {
        await api.login({ email: 'client@smmgano.com', password: 'User1234!' });
      }
      await loadUser();
      await loadUserData();
      setActiveTab(role === 'admin' ? 'admin' : 'dashboard');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8] dark:bg-[#150c0f] text-[#242126] dark:text-slate-100 transition-colors">
      {/* App Header */}
      <Header
        user={user}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        config={config}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={mode => setAuthModal(mode)}
        onLogout={handleLogout}
        onDataRefresh={async () => {
          await loadUser();
          await loadUserData();
          await loadPublicData();
        }}
      />

      {/* Main Content Area with Smooth Motion Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full"
          >
            {/* If Not Logged In and on Home Tab */}
            {activeTab === 'home' && !user && (
              <LandingHero
                currency={currency}
                language={language}
                config={config}
                services={services}
                onOpenAuth={mode => setAuthModal(mode)}
                onSelectTab={setActiveTab}
                onQuickDemoLogin={handleQuickDemoLogin}
              />
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && user && (
              <DashboardView
                user={user}
                orders={orders}
                currency={currency}
                language={language}
                config={config}
                onNavigate={setActiveTab}
              />
            )}

            {/* New Order Tab */}
            {activeTab === 'new-order' && (
              user ? (
                <NewOrderView
                  user={user}
                  services={services}
                  currency={currency}
                  language={language}
                  config={config}
                  onOrderSuccess={async () => {
                    await loadUser();
                    await loadUserData();
                  }}
                  onNavigate={setActiveTab}
                />
              ) : (
                <div className="text-center py-16 space-y-4">
                  <h2 className="text-xl font-bold">Please log in to place an order</h2>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="px-6 py-2.5 rounded-xl bg-[#800020] text-white font-bold cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )
            )}

            {/* Orders List Tab */}
            {activeTab === 'orders' && (
              user ? (
                <OrdersView
                  orders={orders}
                  currency={currency}
                  language={language}
                  onReorder={() => {
                    setActiveTab('new-order');
                  }}
                  onRefresh={loadUserData}
                />
              ) : (
                <div className="text-center py-16 space-y-4">
                  <h2 className="text-xl font-bold">Please log in to view your orders</h2>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="px-6 py-2.5 rounded-xl bg-[#800020] text-white font-bold cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )
            )}

            {/* Add Funds / Wallet Tab */}
            {activeTab === 'add-funds' && (
              user ? (
                <WalletView
                  user={user}
                  deposits={deposits}
                  transactions={transactions}
                  currency={currency}
                  language={language}
                  config={config}
                  onDepositSuccess={async () => {
                    await loadUser();
                    await loadUserData();
                  }}
                />
              ) : (
                <div className="text-center py-16 space-y-4">
                  <h2 className="text-xl font-bold">Please log in to deposit funds</h2>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="px-6 py-2.5 rounded-xl bg-[#800020] text-white font-bold cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )
            )}

            {/* Public or Auth Services Catalog Tab */}
            {activeTab === 'services' && (
              <ServicesView
                services={services}
                currency={currency}
                language={language}
                config={config}
                onSelectServiceForOrder={() => {
                  if (user) {
                    setActiveTab('new-order');
                  } else {
                    setAuthModal('login');
                  }
                }}
              />
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'tickets' && (
              user ? (
                <TicketsView
                  user={user}
                  tickets={tickets}
                  language={language}
                  onRefresh={loadUserData}
                />
              ) : (
                <div className="text-center py-16 space-y-4">
                  <h2 className="text-xl font-bold">Please log in to access support</h2>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="px-6 py-2.5 rounded-xl bg-[#800020] text-white font-bold cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )
            )}

            {/* API Docs Tab */}
            {activeTab === 'api' && (
              <ApiDocsView
                user={user}
                language={language}
              />
            )}

            {/* Admin Console Tab (Only visible to Admin) */}
            {activeTab === 'admin' && (
              user && user.role === 'admin' ? (
                <AdminConsole
                  currentUser={user}
                  language={language}
                  onRefreshAll={async () => {
                    await loadUser();
                    await loadUserData();
                    await loadPublicData();
                  }}
                />
              ) : (
                <div className="text-center py-16 text-rose-600 font-bold">
                  Access Denied: Administrator role required.
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onNavigate={setActiveTab}
      />

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          isOpen={true}
          initialMode={authModal}
          language={language}
          currency={currency}
          onClose={() => setAuthModal(null)}
          onSuccess={async () => {
            await loadUser();
            await loadUserData();
            setActiveTab('dashboard');
          }}
        />
      )}
    </div>
  );
}
