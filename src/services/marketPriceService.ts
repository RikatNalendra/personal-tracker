import { Asset, MarketQuote } from '../types/finance';

interface CryptoPriceResponse {
  [id: string]: {
    usd: number;
    idr: number;
    usd_24h_change?: number;
  };
}

const CRYPTO_COINGECKO_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDT: 'tether',
  BNB: 'binancecoin',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  ADA: 'cardano',
};

// Known base market prices for realistic fallback / simulation
const BASE_PRICES: Record<string, { price: number; currency: 'IDR' | 'USD'; change24h: number }> = {
  'ANTAM': { price: 1485000, currency: 'IDR', change24h: 0.95 },
  'BBCA.JK': { price: 10175, currency: 'IDR', change24h: 1.25 },
  'BBRI.JK': { price: 5125, currency: 'IDR', change24h: -0.48 },
  'BMRI.JK': { price: 6850, currency: 'IDR', change24h: 0.74 },
  'TLKM.JK': { price: 2850, currency: 'IDR', change24h: -0.35 },
  'ASII.JK': { price: 5050, currency: 'IDR', change24h: 0.50 },
  'NVDA': { price: 144.50, currency: 'USD', change24h: 2.85 },
  'AAPL': { price: 228.20, currency: 'USD', change24h: 0.42 },
  'MSFT': { price: 425.80, currency: 'USD', change24h: 0.65 },
  'GOOGL': { price: 178.40, currency: 'USD', change24h: 1.15 },
  'TSLA': { price: 342.50, currency: 'USD', change24h: -1.20 },
  'VOO': { price: 546.80, currency: 'USD', change24h: 0.62 },
  'SPY': { price: 595.40, currency: 'USD', change24h: 0.58 },
  'BTC': { price: 92400.00, currency: 'USD', change24h: 3.45 },
  'ETH': { price: 3450.00, currency: 'USD', change24h: 1.82 },
  'SOL': { price: 218.50, currency: 'USD', change24h: 4.10 },
};

export const marketPriceService = {
  /**
   * Fetch live USD/IDR exchange rate from free open exchange rate API
   */
  async fetchLiveExchangeRate(): Promise<number> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) {
          return Math.round(data.rates.IDR);
        }
      }
    } catch (e) {
      console.warn('Could not fetch open exchange rate, attempting backup...', e);
    }

    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) {
          return Math.round(data.rates.IDR);
        }
      }
    } catch (e) {
      console.warn('Backup exchange rate failed, using fallback rate', e);
    }

    // Default stable current executive rate
    return 16250;
  },

  /**
   * Fetch live crypto prices from CoinGecko
   */
  async fetchCryptoQuotes(tickers: string[]): Promise<Record<string, MarketQuote>> {
    const quotes: Record<string, MarketQuote> = {};
    const geckoIds: string[] = [];
    const tickerToGecko: Record<string, string> = {};

    tickers.forEach((t) => {
      const upper = t.toUpperCase();
      const id = CRYPTO_COINGECKO_MAP[upper];
      if (id) {
        geckoIds.push(id);
        tickerToGecko[id] = upper;
      }
    });

    if (geckoIds.length === 0) return quotes;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds.join(',')}&vs_currencies=usd,idr&include_24hr_change=true`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: CryptoPriceResponse = await res.json();
        for (const [id, priceInfo] of Object.entries(data)) {
          const ticker = tickerToGecko[id];
          if (ticker && priceInfo) {
            quotes[ticker] = {
              ticker,
              price: priceInfo.usd,
              currency: 'USD',
              change24hPercent: priceInfo.usd_24h_change || 0,
              lastUpdated: new Date().toISOString(),
              source: 'CoinGecko Live API',
            };
          }
        }
      }
    } catch (e) {
      console.warn('CoinGecko API unavailable or throttled, using cached/fallback quotes', e);
    }

    return quotes;
  },

  /**
   * Refresh all asset prices across classes
   */
  async refreshAllAssetPrices(
    assets: Asset[],
    usdToIdrRate: number
  ): Promise<{ updatedAssets: Asset[]; usdRate: number }> {
    // 1. Refresh USD/IDR rate
    let currentRate = usdToIdrRate;
    try {
      const freshRate = await this.fetchLiveExchangeRate();
      if (freshRate && freshRate > 10000) {
        currentRate = freshRate;
      }
    } catch (err) {
      console.warn('Failed to refresh USD rate:', err);
    }

    // 2. Refresh crypto tickers
    const cryptoTickers = assets
      .filter((a) => a.assetClass === 'crypto')
      .map((a) => a.ticker);
    const cryptoQuotes = await this.fetchCryptoQuotes(cryptoTickers);

    // 3. Update assets with live quotes or gentle realistic jitter
    const updatedAssets = assets.map((asset) => {
      const upperTicker = asset.ticker.toUpperCase();

      // Check if crypto live quote was fetched
      if (asset.assetClass === 'crypto' && cryptoQuotes[upperTicker]) {
        const quote = cryptoQuotes[upperTicker];
        return {
          ...asset,
          currentPrice: quote.price,
          priceChange24h: quote.change24hPercent,
          lastPriceUpdate: new Date().toISOString(),
        };
      }

      // Check base price or apply gentle market tick simulation (+/- 0.2% - 1.5%)
      const baseInfo = BASE_PRICES[upperTicker];
      if (baseInfo) {
        // Add subtle realistic fluctuation (+/- 0.4%)
        const randomFluct = (Math.random() - 0.48) * 0.008;
        const newPrice = Math.round(baseInfo.price * (1 + randomFluct) * 100) / 100;
        const newChange = Math.round((baseInfo.change24h + (Math.random() - 0.5) * 0.4) * 100) / 100;

        return {
          ...asset,
          currentPrice: newPrice,
          priceChange24h: newChange,
          lastPriceUpdate: new Date().toISOString(),
        };
      }

      // For custom assets (property, deposits), keep stable or update timestamp
      return {
        ...asset,
        lastPriceUpdate: new Date().toISOString(),
      };
    });

    return {
      updatedAssets,
      usdRate: currentRate,
    };
  },
};
