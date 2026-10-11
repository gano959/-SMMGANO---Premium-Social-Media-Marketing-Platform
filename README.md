# SMMGANO — Premium Social Media Marketing Platform

> **SMMGANO — Grow Your Social Presence.**
> Your all-in-one social media marketing platform for managing engagement services, tracking orders, and accessing powerful tools through one seamless dashboard.

---

## 💎 Official Brand Identity

- **Brand Name:** SMMGANO
- **Visual Palette:**
  - **Primary Burgundy:** `#800020`
  - **Deep Burgundy:** `#5C0018`
  - **Dark Burgundy:** `#3D0010`
  - **Burgundy Accent:** `#A32645`
  - **Soft Burgundy Background:** `#F8EEF1`
  - **Pure White:** `#FFFFFF`
  - **Dark Charcoal:** `#242126`
- **Languages:** Arabic (العربية - Full RTL support) & English (LTR).
- **Settlement Currencies:** Egyptian Pound (**EGP** / ج.م) & US Dollar (**USD** / $).
- **Configured Egyptian Mobile Wallet Destination:** **`01033537322`** (Vodafone Cash / InstaPay).

---

## 🚀 Key Features

1. **Dual-Currency Accounting Engine:**
   - Real-time exchange rate management (1 USD = 50.0 EGP).
   - Immutable financial transaction ledgers.
   - Separate balances in EGP and USD with atomic deductions.

2. **Egyptian Mobile Wallet (Vodafone Cash & InstaPay):**
   - Configurable destination number: **`01033537322`**.
   - 3-step deposit flow with transfer reference and sender phone validation.
   - Admin verification workflow (approve to credit wallet or reject with notes).

3. **Multi-Platform Service Catalog:**
   - Instagram, TikTok, YouTube, Facebook, Telegram, X (Twitter), Threads, Spotify, LinkedIn.
   - Followers, views, likes, comments, shares, watch hours, and B2B connections.
   - Real-time cost preview (Qty × Rate ÷ 1000).

4. **Executive Admin Console:**
   - Verify and approve Vodafone Cash / InstaPay transfers.
   - Order dispatch control (Pending, In Progress, Completed, Canceled with refund).
   - Dynamic exchange rate adjustment.
   - User wallet balance adjustments.

5. **SMM v2 Standard API:**
   - Fully compatible with reseller bots and external panels (`POST /api/v2`).
   - `action=balance`, `action=services`, `action=status`, `action=add`.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Initial Balance |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `admin@smmgano.com` | `Admin1234!` | 50,000 EGP / $1,000 USD |
| **Demo Client** | `client@smmgano.com` | `User1234!` | 1,450 EGP / $35 USD |

*One-click login buttons are also available on the homepage and modal.*

---

## 🛠️ Installation & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot API reloading and Vite SPA middleware.

### 3. Run Automated Tests
```bash
npx tsx tests/api.test.ts
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

```bash
docker compose up -d --build
```
This builds and launches the full stack container on port 3000 with volume persistence for the database.
