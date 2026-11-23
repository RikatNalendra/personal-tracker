export type Currency = 'IDR' | 'USD';

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'investment_cash' | 'brokerage';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // Stored in IDR by default
  currency: Currency;
  color: string;
  icon: string;
  accountNumber?: string;
  institution?: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Always positive
  date: string; // YYYY-MM-DD
  categoryId: string; // References Category.id (or 'transfer' if type is transfer)
  accountId: string; // Source account
  toAccountId?: string; // Target account if type === 'transfer'
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  monthlyBudget?: number; // Budget limit for expense categories in IDR
}

export type AssetClass = 'gold' | 'idx_stock' | 'us_stock' | 'crypto' | 'custom';

export interface Asset {
  id: string;
  name: string;
  ticker: string; // e.g. "ANTAM", "BBCA.JK", "NVDA", "BTC", "PROPERTY"
  assetClass: AssetClass;
  quantity: number; // e.g. grams of gold, number of stock shares, coins of crypto, units of real estate
  avgBuyPrice: number; // In asset's native currency (IDR for gold/IDX, USD for US stocks/crypto or IDR)
  currentPrice: number; // In native currency
  currency: Currency;
  purchaseDate: string; // YYYY-MM-DD
  notes?: string;
  customAssetType?: string; // e.g. 'Property', 'Time Deposit', 'P2P Lending'
  lastPriceUpdate?: string;
  priceChange24h?: number;
}

export interface MarketQuote {
  ticker: string;
  price: number;
  currency: Currency;
  change24h?: number;
  change24hPercent?: number;
  lastUpdated: string;
  source?: string;
}

export interface ExchangeRate {
  pair: 'USD/IDR';
  rate: number;
  lastUpdated: string;
}
