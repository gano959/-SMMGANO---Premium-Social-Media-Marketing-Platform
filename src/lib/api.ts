import { User, Service, Order, Deposit, Transaction, SupportTicket, SiteConfig, Currency, SecurityStats, SecurityEvent, SecurityScanResult } from '../types.js';

const TOKEN_KEY = 'burgundy_session_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
  },

  // Auth
  async register(payload: { name: string; email: string; password: string; preferredCurrency?: Currency; phone?: string }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.token);
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.token);
    return data;
  },

  async loginWithGoogle(payload: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
    preferredCurrency?: Currency;
  }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.token);
    return data;
  },

  async sendPhoneOtp(phone: string) {
    return this.request<{
      message: string;
      phone: string;
      devCode: string;
      expiresInSeconds: number;
    }>('/auth/phone/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyPhoneOtp(payload: {
    phone: string;
    code: string;
    name?: string;
    preferredCurrency?: Currency;
  }) {
    const data = await this.request<{ token: string; user: User; message: string }>('/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.token);
    return data;
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  },

  async updateProfile(updates: Partial<User>) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Public config
  async getConfig() {
    return this.request<SiteConfig>('/config');
  },

  // Services
  async getServices(params?: { platform?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.platform) query.append('platform', params.platform);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return this.request<{ services: Service[]; exchangeRateUsdToEgp: number }>(`/services${qs ? `?${qs}` : ''}`);
  },

  // Orders
  async calculateOrder(payload: { serviceId: string; quantity: number; currency: Currency }) {
    return this.request<{
      serviceId: string;
      serviceName: string;
      quantity: number;
      currency: Currency;
      ratePer1000: number;
      chargeAmount: number;
      exchangeRate: number;
    }>('/orders/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async placeOrder(payload: { serviceId: string; link: string; quantity: number; currency: Currency }) {
    return this.request<{
      message: string;
      order: Order;
      remainingBalance: number;
      currency: Currency;
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getOrders() {
    return this.request<{ orders: Order[] }>('/orders');
  },

  async getOrder(id: string) {
    return this.request<{ order: Order }>(`/orders/${id}`);
  },

  // Wallet
  async getWalletSummary() {
    return this.request<{
      walletBalanceEgp: number;
      walletBalanceUsd: number;
      preferredCurrency: Currency;
      exchangeRate: number;
      recentTransactions: Transaction[];
      recentDeposits: Deposit[];
    }>('/wallet/summary');
  },

  async getDeposits() {
    return this.request<{ deposits: Deposit[] }>('/wallet/deposits');
  },

  async getTransactions() {
    return this.request<{ transactions: Transaction[] }>('/wallet/transactions');
  },

  async createDeposit(payload: {
    method: 'vodafone_cash' | 'instapay' | 'card' | 'fawry';
    amount: number;
    currency: Currency;
    senderPhone?: string;
    transactionRef?: string;
    receiptNote?: string;
  }) {
    return this.request<{
      message: string;
      deposit: Deposit;
      mobileWalletDestination: string;
    }>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async electronicPay(payload: {
    method: string;
    amount: number;
    currency: Currency;
    accountIdentifier?: string;
    electronicGatewayName?: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      deposit: Deposit;
      newBalance: number;
      currency: Currency;
    }>('/wallet/electronic-pay', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Support
  async getTickets() {
    return this.request<{ tickets: SupportTicket[] }>('/tickets');
  },

  async createTicket(payload: { subject: string; message: string; orderId?: string; priority?: string }) {
    return this.request<{ message: string; ticket: SupportTicket }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async addTicketMessage(ticketId: string, message: string) {
    return this.request<{ ticket: SupportTicket }>(`/tickets/${ticketId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Admin
  async getAdminOverview() {
    return this.request<{
      stats: {
        totalUsers: number;
        totalOrders: number;
        activeOrdersCount: number;
        completedOrdersCount: number;
        pendingDepositsCount: number;
        totalRevenueEgp: number;
        totalRevenueUsd: number;
        activeServicesCount: number;
        exchangeRate: number;
        mobileWalletNumber: string;
      };
      recentOrders: Order[];
      pendingDeposits: Deposit[];
    }>('/admin/overview');
  },

  async getAdminDeposits() {
    return this.request<{ deposits: Deposit[] }>('/admin/deposits');
  },

  async getAdminPendingActions() {
    return this.request<{
      totalCount: number;
      deposits: Array<any>;
      orders: Array<any>;
    }>('/admin/pending-actions');
  },

  async verifyDeposit(depositId: string, approved: boolean, adminNote?: string) {
    return this.request<{ message: string; deposit: Deposit }>(`/admin/deposits/${depositId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ approved, adminNote })
    });
  },

  async approveAdminOrder(orderId: string) {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${orderId}/approve`, {
      method: 'POST'
    });
  },

  async rejectAdminOrder(orderId: string, reason?: string) {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async getAdminOrders() {
    return this.request<{ orders: Order[] }>('/admin/orders');
  },

  async updateOrderStatus(orderId: string, status: Order['status'], note?: string) {
    return this.request<{ order: Order }>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
  },

  async getAdminServices() {
    return this.request<{ services: Service[] }>('/admin/services');
  },

  async createService(payload: Partial<Service>) {
    return this.request<{ service: Service }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateService(id: string, updates: Partial<Service>) {
    return this.request<{ service: Service }>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminSettings() {
    return this.request<{ settings: any }>('/admin/settings');
  },

  async updateAdminSettings(settings: any) {
    return this.request<{ settings: any }>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  },

  async getAdminUsers() {
    return this.request<{ users: User[] }>('/admin/users');
  },

  async adjustUserBalance(userId: string, amount: number, currency: Currency, reason?: string) {
    return this.request<{ message: string; user: User }>(`/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, currency, reason })
    });
  },

  async getAdminTickets() {
    return this.request<{ tickets: SupportTicket[] }>('/admin/tickets');
  },

  async replyAdminTicket(ticketId: string, message: string) {
    return this.request<{ ticket: SupportTicket }>(`/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  async getAdminSecurityStatus() {
    return this.request<{ status: string; stats: SecurityStats }>('/admin/security/status');
  },

  async getAdminSecurityLogs() {
    return this.request<{ logs: SecurityEvent[] }>('/admin/security/logs');
  },

  async clearAdminSecurityLogs() {
    return this.request<{ message: string }>('/admin/security/clear-logs', {
      method: 'POST'
    });
  },

  async runAdminSecurityScan() {
    return this.request<SecurityScanResult>('/admin/security/trigger-scan', {
      method: 'POST'
    });
  },

  // SMM Outbound Provider API
  async getAdminProvider() {
    return this.request<{
      providerApiUrl: string;
      providerApiKeyMasked: string;
      hasApiKey: boolean;
      providerAutoOrderEnabled: boolean;
      providerBalance: number | null;
    }>('/admin/provider');
  },

  async updateAdminProvider(payload: {
    providerApiUrl?: string;
    providerApiKey?: string;
    providerAutoOrderEnabled?: boolean;
  }) {
    return this.request<{
      message: string;
      providerApiUrl: string;
      hasApiKey: boolean;
      providerAutoOrderEnabled: boolean;
    }>('/admin/provider', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async testAdminProvider(payload?: { providerApiUrl?: string; providerApiKey?: string }) {
    return this.request<{
      success: boolean;
      message: string;
      balance: string | number;
      currency?: string;
      error?: string;
    }>('/admin/provider/test', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },

  async sendOrderToProvider(orderId: string, providerServiceId?: string) {
    return this.request<{
      success: boolean;
      message: string;
      providerOrderId?: string | number;
    }>(`/admin/orders/${orderId}/send-to-provider`, {
      method: 'POST',
      body: JSON.stringify({ providerServiceId })
    });
  }
};

