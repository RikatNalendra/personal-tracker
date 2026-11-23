# Executive OS | Personal Finance, Investments & Daily Operations Dashboard

A responsive full-stack web application designed for high-performing executives, investors, and operators. Features an **Obsidian Dark Mode** command center integrating an **Indonesian Rupiah (IDR) Finance & Investment Portfolio Tracker** (with live market pricing) and a **Daily Task & Activity Manager** (with habit streaks and Kanban board), powered by **Google Drive Cloud Sync (`drive.file` scope)**.

---

## 1. Visual Design & Aesthetic Direction

* **Theme:** Sleek, comforting, and executive **Obsidian Dark Mode**.
* **Palette:**
  * **Primary Background:** `#0B0E14` (Deep obsidian)
  * **Card & Elevated Surfaces:** `#131722`
  * **Subtle Borders & Dividers:** `#1E2433` (Hover highlights at `#2A3246`)
  * **Typography:** `#F3F4F6` (Crisp off-white) with secondary slate `#9CA3AF`
  * **Emerald Green (`#10B981`):** Income, positive portfolio growth, completed priorities
  * **Soft Coral / Crimson (`#EF4444`):** Expenses, portfolio drawdowns, budget overruns
  * **Warm Champagne / Gold (`#F59E0B`):** Net worth badges, investment highlights, physical gold metrics, primary CTA buttons
* **Navigation:** Collapsible responsive sidebar with navigation across:
  1. **Executive Overview (Command Center)**
  2. **Cash Flow & Budgets**
  3. **Portfolio & Assets**
  4. **Daily Tasks & Operations**

---

## 2. Backend, Storage & Google Drive Integration

* **Direct Google Drive Integration (`drive.file` scope):**
  * Uses Google Identity Services (`window.google.accounts.oauth2.initTokenClient`).
  * Direct client-to-cloud synchronization without intermediate proxy servers.
  * Dedicated Folder: `Executive_Dashboard_Data` in the user's Google Drive.
  * Dedicated Master JSON DB File: `personal_executive_dashboard_db.json`.
* **Instant Offline Cache & Debounced Sync:**
  * Fast local storage cache (`localStorage`) for zero latency on every interaction.
  * Background debounced auto-sync (2.5s) to Google Drive whenever changes occur.
* **Sync Status Indicator:**
  * Header & sidebar badges: `Drive: Synced` (emerald check), `Drive: Syncing...` (amber pulse), `Drive: Error` (red alert), or `Local Mode`.
  * Manual triggers: **"Sync Now to Drive"** and **"Pull from Drive"**.
* **Manual Data Portability:**
  * Full JSON database **Export** and **Import** functionality.
  * One-click **"Reload Sample Executive Data"** and **"Clear All Data"**.

---

## 3. Module A: Complete Finance & Investment Tracker

### Currency & Valuation
* **Primary Currency:** Indonesian Rupiah (`IDR` / `Rp`) with standard dot thousand separators (e.g., `Rp 15.000.000`).
* **Secondary Currency Tagging (`USD` / `$`)** for international equities and crypto.
* **Live FX Integration:** Configurable and auto-refreshable USD-to-IDR exchange rate (e.g. `1 USD = Rp 16.250`).

### Cash Flow & Account Transfers
* **Income Tracking:** Executive Salary, Performance Bonuses, Retainers, Advisory Dividends, Investment Returns.
* **Expense Tracking:** Housing, Executive Dining, Transport, Sports & Golf, Family, Cloud Software, Apparel.
* **Accounts & Wallets Management:** Bank Central Asia (BCA), Bank Mandiri, Stockbit RDI (Rekening Dana Investor), GoPay/QRIS Wallet, Petty Cash Vault.
* **Internal Account Transfers:** Move funds between wallets (e.g. BCA to Stockbit RDI or BCA to GoPay) with automatic balance recalculations without distorting Income or Expense metrics.

### Assets & Multi-Class Investment Portfolio
* **Physical Gold Bullion (Antam / Spot):** Weight tracked in grams, price per gram in IDR, safe deposit location notes.
* **Indonesian Stocks (IDX):** e.g., `BBCA.JK`, `BBRI.JK`, `BMRI.JK`, `TLKM.JK`.
* **US Equities & ETFs:** e.g., `NVDA`, `AAPL`, `MSFT`, `VOO`, `SPY` (quoted in USD, auto-converted to IDR).
* **Cryptocurrency:** e.g., `BTC`, `ETH`, `SOL` (live pricing via public CoinGecko API).
* **Real Estate & Custom Assets:** e.g., BSD City Luxury Apartment, BCA Time Deposits (Deposito ARO 4.25% p.a.).
* **Live Market Pricing & Manual Price Override:**
  * "Refresh Prices" button fetches real-time quotes and updates valuations.
  * Manual price override modal available for every holding.
  * Real-time calculation of **Current Value (IDR)**, **Cost Basis (IDR)**, and **Unrealized P&L (Rp & %)**.

### Financial Health & Analytics
* **Monthly Budgets:** Spending limits with visual progress bars and automatic threshold warnings (80% amber alert / 100% coral alert).
* **Monthly Cash Flow Chart:** Recharts 6-month historical Income vs. Expense bar chart.
* **Expense Breakdown Chart:** 360° interactive Donut chart showing category allocations.
* **Asset Allocation Chart:** Portfolio distribution across Gold, IDX Stocks, US Equities, Crypto, and Real Estate.
* **Savings Rate %:** Calculated as `(MTD Income - MTD Expense) / MTD Income * 100%`.

---

## 4. Module B: Daily Task & Activity Tracker

* **Multi-Domain Workspaces:** Filter by domain tags: *Work / Office*, *Business*, *Personal*, *Fitness*, *Learning*.
* **Task Attributes:** Title, Notes, Workspace Tag, Priority (*High, Medium, Low*), Due Date, Time Block (e.g. `09:00 - 10:30`), and Recurring Toggle (*None, Daily, Weekdays, Weekly*).
* **Dual Views:**
  1. **Daily Focus Checklist:** Grouped by *Today's Critical Priorities*, *Executive Routines & Daily Habits* (with active streak badges e.g., `24d streak`), and *Upcoming Deliverables*.
  2. **Interactive Kanban Board:** 3 columns (*To Do*, *In Progress*, *Completed*) with one-click progress buttons and visual cards.
* **Frictionless Quick Add Bar:** Single-line top input to immediately add tasks for today with priority and workspace presets.
* **Daily Completion Progress Ring:** SVG circular gauge showing % of today's focus items completed, triggering a celebration confetti upon 100% completion!

---

## 5. Executive Overview (Command Center)

The default home screen unifies all vital metrics into an executive dashboard:
1. **Net Worth Card:** Total Liquid Cash + Total Portfolio Valuation in IDR with MTD Savings Rate.
2. **Monthly Cash Flow Snapshot:** Income vs. Expense comparison with overall monthly budget ceiling indicator.
3. **Portfolio Top Movers:** Top performing holdings ranked by unrealized return percentage.
4. **Today's Priorities & Habits:** Interactive checklist synced live with the task manager.
5. **Quick Action Deck:** Instant access to log transactions, add assets, create tasks, and sync with Google Drive.

---

## 6. How to Run Locally

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# The application will be running at http://localhost:5173/

# 3. Production build
npm run build
```

---

## 7. Google Drive OAuth 2.0 Setup (2-Minute Guide)

1. Navigate to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select a project (e.g., `Executive-OS`).
3. Enable **Google Drive API** in *APIs & Services > Library*.
4. In *OAuth consent screen*, set User Type to **External**, enter an app name and email, and add your Google account under **Test Users**.
5. In *Credentials*, click **Create Credentials > OAuth client ID**, select **Web application**.
6. Under **Authorized JavaScript origins**, add:
   `http://localhost:5173`
7. Copy your **Client ID** (e.g. `123456789-xxx.apps.googleusercontent.com`).
8. Open the application, click **Settings (Gear Icon) > Google Drive Sync**, paste the Client ID, and click **Connect with Google**.
