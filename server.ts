import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { MarketState, Currency, ShockEvent, AIAnalysis, AIGlobalOutlook, Transaction, QuantumEvent } from './src/types.js';

dotenv.config();

const PERSISTENCE_FILE = path.join(process.cwd(), 'data', 'transactions.json');

function loadPersistedTransactions(): Transaction[] {
  try {
    const dir = path.dirname(PERSISTENCE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(PERSISTENCE_FILE)) return [];
    const raw = fs.readFileSync(PERSISTENCE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistTransactions(transactions: Transaction[]): void {
  try {
    const dir = path.dirname(PERSISTENCE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist transactions:', err);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK if API Key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Gemini API client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini API Client:", error);
  }
} else {
  console.log("Running in High-Fidelity Simulator Mode (No GEMINI_API_KEY detected).");
}

// Robust helper with exponential backoff / retries for Gemini API calls to tolerate rate limits or 503 unavailability
async function generateContentWithRetry(prompt: string, responseMimeType?: string, maxRetries = 2, delayMs = 1500) {
  if (!aiClient) return null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: responseMimeType ? { responseMimeType } : undefined
      });
      return response;
    } catch (err: any) {
      console.warn(`Gemini API attempt ${attempt} failed: ${err.message || err}`);
      if (attempt === maxRetries) {
        throw err;
      }
      // Brief sleep before retry
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

// Global currency list configuration
const INITIAL_CURRENCIES: { [code: string]: { name: string; symbol: string; category: 'fiat' | 'digital' | 'cbdc'; emoji: string; baseRate: number; volatility: number } } = {
  USD: { name: "United States Dollar", symbol: "$", category: "fiat", emoji: "🇺🇸", baseRate: 1.0, volatility: 0.0004 },
  EUR: { name: "Euro", symbol: "€", category: "fiat", emoji: "🇪🇺", baseRate: 0.92, volatility: 0.0007 },
  GBP: { name: "British Pound", symbol: "£", category: "fiat", emoji: "🇬🇧", baseRate: 0.79, volatility: 0.0008 },
  JPY: { name: "Japanese Yen", symbol: "¥", category: "fiat", emoji: "🇯🇵", baseRate: 155.4, volatility: 0.0016 },
  AUD: { name: "Australian Dollar", symbol: "A$", category: "fiat", emoji: "🇦🇺", baseRate: 1.51, volatility: 0.0011 },
  CAD: { name: "Canadian Dollar", symbol: "C$", category: "fiat", emoji: "🇨🇦", baseRate: 1.37, volatility: 0.0009 },
  CHF: { name: "Swiss Franc", symbol: "Fr", category: "fiat", emoji: "🇨🇭", baseRate: 0.91, volatility: 0.0005 },
  CNH: { name: "Chinese Yuan (Offshore)", symbol: "C¥", category: "fiat", emoji: "🇨🇳", baseRate: 7.25, volatility: 0.0010 },
  INR: { name: "Indian Rupee", symbol: "₹", category: "fiat", emoji: "🇮🇳", baseRate: 83.5, volatility: 0.0006 },
  ZAR: { name: "South African Rand", symbol: "R", category: "fiat", emoji: "🇿🇦", baseRate: 18.4, volatility: 0.0020 },
  BRL: { name: "Brazilian Real", symbol: "R$", category: "fiat", emoji: "🇧🇷", baseRate: 5.15, volatility: 0.0024 },
  MXN: { name: "Mexican Peso", symbol: "Mex$", category: "fiat", emoji: "🇲🇽", baseRate: 16.7, volatility: 0.0019 },
  BTC: { name: "Bitcoin", symbol: "₿", category: "digital", emoji: "🪙", baseRate: 0.000015, volatility: 0.011 }, // relative to USD (~$66,000)
  ETH: { name: "Ethereum", symbol: "Ξ", category: "digital", emoji: "⟠", baseRate: 0.00028, volatility: 0.015 },  // relative to USD (~$3,570)
  'e-CNY': { name: "Digital Yuan (CBDC)", symbol: "e-¥", category: "cbdc", emoji: "🇨🇳", baseRate: 7.25, volatility: 0.0002 },
  'Digital Euro': { name: "Digital Euro (CBDC)", symbol: "e-€", category: "cbdc", emoji: "🇪🇺", baseRate: 0.92, volatility: 0.00015 },
  'e-USD': { name: "FedDollar (CBDC)", symbol: "e-$", category: "cbdc", emoji: "🇺🇸", baseRate: 1.0, volatility: 0.0001 }
};

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', client: 'Aethera Systems', amount: 12500, currency: 'EUR', status: 'completed', timestamp: Date.now() - 3600000 * 2, service: 'Sovereign API Licenses' },
  { id: 'tx_2', client: 'Neo-Tokyo Logistics', amount: 2400000, currency: 'JPY', status: 'completed', timestamp: Date.now() - 3600000 * 5, service: 'Smart Routing Systems' },
  { id: 'tx_3', client: 'Helios Carbon Grid', amount: 0.35, currency: 'BTC', status: 'completed', timestamp: Date.now() - 3600000 * 12, service: 'Decentralized Energy Clearing' },
  { id: 'tx_4', client: 'Valerius Wealth Advisors', amount: 18500, currency: 'CHF', status: 'pending', timestamp: Date.now() - 600000, service: 'Sovereign Vault Storage' },
  { id: 'tx_5', client: 'Beijing Rail Bureau', amount: 65000, currency: 'e-CNY', status: 'processing', timestamp: Date.now() - 300000, service: 'High-Speed Transit Ledger' }
];

const persistedTransactions = loadPersistedTransactions();

// Seed Market State with historical random walk, Transactions, and Quantum Calendar
const marketState: MarketState = {
  currencies: {},
  lastUpdated: Date.now(),
  shockEvent: null,
  transactions: persistedTransactions.length > 0 ? persistedTransactions : SEED_TRANSACTIONS,
  quantumCalendar: [
    { id: 'q_1', title: 'Federal Open Market Committee Rate Decision', timestamp: Date.now() + 3600000 * 14, timeLabel: 'In 14 hours', category: 'macro', status: 'Converging', quantumBlock: 894520, volatilityIndex: 'High', description: 'Federal Reserve consensus on terminal interest parameter bounds.' },
    { id: 'q_2', title: 'Digital Yuan Cross-Border Clearing Update', timestamp: Date.now() + 3600000 * 3, timeLabel: 'In 3 hours', category: 'cbdc', status: 'Converging', quantumBlock: 894502, volatilityIndex: 'Medium', description: 'Eurasian clearance protocols for multi-sovereign trade rails.' },
    { id: 'q_3', title: 'Ethereum London Consensus Smart Fork', timestamp: Date.now() - 3600000 * 4, timeLabel: '4 hours ago', category: 'digital', status: 'Executed', quantumBlock: 894480, volatilityIndex: 'EXTREME', description: 'Decentralized gas protocol parameter adjustment stabilized successfully.' },
    { id: 'q_4', title: 'Swiss Gold-Backed Digital Registry Audit', timestamp: Date.now() + 3600000 * 36, timeLabel: 'In 1.5 days', category: 'fiat', status: 'Scheduled', quantumBlock: 894610, volatilityIndex: 'Low', description: 'Comprehensive vault reserves verification published in Bern.' },
    { id: 'q_5', title: 'FedDollar Liquidity Test Injection', timestamp: Date.now() + 600000, timeLabel: 'In 10 mins', category: 'cbdc', status: 'Converging', quantumBlock: 894498, volatilityIndex: 'High', description: 'Federal Reserve simulation testing of 5 Billion high-velocity e-USD.' }
  ]
};

function seedMarketData() {
  Object.entries(INITIAL_CURRENCIES).forEach(([code, conf]) => {
    const history: number[] = [];
    let currentRate = conf.baseRate;
    
    // Generate 30 points of random walk
    for (let i = 0; i < 30; i++) {
      // Simulate historical fluctuations around base
      const step = 1 + (Math.random() - 0.5) * conf.volatility * 4;
      currentRate = currentRate * step;
      history.push(currentRate);
    }

    const dayHigh = Math.max(...history);
    const dayLow = Math.min(...history);
    const changePercent = ((currentRate - history[0]) / history[0]) * 100;

    marketState.currencies[code] = {
      code,
      name: conf.name,
      symbol: conf.symbol,
      category: conf.category,
      emoji: conf.emoji,
      currentRate,
      history,
      dayHigh,
      dayLow,
      changePercent
    };
  });
}

seedMarketData();

// Live client list for automated randomized sales transactions
const MOCK_CLIENTS = ['Hyperion Corp', 'Atlas Freight', 'Vanguard Clearing', 'Oasis Energy', 'Titan Biotech', 'Genesis Digital', 'Sovereign Wealth Singapore', 'Zeta Quantum Systems', 'Eurasia Carbon Fund'];
const MOCK_SERVICES = ['Corporate Hedging Bridge', 'Automated Treasury Arbitrage', 'Cross-Border Clearing API', 'Quant Liquidity Sourcing', 'AI-Driven Smart Contract Execution', 'CBDC Direct Billing Bridge'];
const CURRENCY_CODES = Object.keys(INITIAL_CURRENCIES);

// Live loop: Fluctuate rates every 3 seconds to represent active market action
// Plus periodically roll in live sales transactions and increment quantum blocks!
let liveCounter = 0;
setInterval(() => {
  liveCounter++;

  // 1. Fluctuate Currencies
  Object.keys(marketState.currencies).forEach(code => {
    const currency = marketState.currencies[code];
    const conf = INITIAL_CURRENCIES[code];
    if (!conf) return;

    // USD base always stays 1.0, others fluctuate
    if (code === 'USD') {
      currency.history.push(1.0);
      if (currency.history.length > 30) currency.history.shift();
      return;
    }

    const fluctuation = 1 + (Math.random() - 0.5) * conf.volatility;
    const newRate = currency.currentRate * fluctuation;
    
    currency.currentRate = newRate;
    currency.history.push(newRate);
    if (currency.history.length > 30) {
      currency.history.shift();
    }

    currency.dayHigh = Math.max(currency.dayHigh, newRate);
    currency.dayLow = Math.min(currency.dayLow, newRate);
    
    // Calculate percent change relative to the first element in history
    const baseVal = currency.history[0];
    currency.changePercent = baseVal !== 0 ? ((newRate - baseVal) / baseVal) * 100 : 0;
  });

  // 2. Increment Quantum Calendar Blocks & transition close events
  marketState.quantumCalendar.forEach(evt => {
    evt.quantumBlock += Math.floor(Math.random() * 3) + 1;
    // Periodically fluctuate some statuses to show real-time synchronization
    if (evt.status === 'Converging' && Math.random() < 0.05) {
      evt.status = 'Executed';
      evt.timeLabel = 'Just Executed';
    }
  });

  // 3. Rolling live business sales: Add a new sale every ~12 seconds (4 ticks)
  if (liveCounter % 4 === 0) {
    const randomClient = MOCK_CLIENTS[Math.floor(Math.random() * MOCK_CLIENTS.length)];
    const randomService = MOCK_SERVICES[Math.floor(Math.random() * MOCK_SERVICES.length)];
    const randomCurr = CURRENCY_CODES[Math.floor(Math.random() * CURRENCY_CODES.length)];
    
    // Calculate randomized amount based on currency class
    let rawAmount = Math.floor(Math.random() * 25000) + 1500;
    if (randomCurr === 'BTC') {
      rawAmount = parseFloat((Math.random() * 0.15 + 0.01).toFixed(4));
    } else if (randomCurr === 'ETH') {
      rawAmount = parseFloat((Math.random() * 2.5 + 0.1).toFixed(3));
    } else if (randomCurr === 'JPY') {
      rawAmount = rawAmount * 150;
    }

    const newTx: Transaction = {
      id: `tx_live_${Date.now()}`,
      client: randomClient,
      amount: rawAmount,
      currency: randomCurr,
      status: Math.random() < 0.85 ? 'completed' : 'processing',
      timestamp: Date.now(),
      service: randomService
    };

    // Keep transactions at max 25 elements to avoid infinite memory bloat
    marketState.transactions.unshift(newTx);
    if (marketState.transactions.length > 25) {
      marketState.transactions.pop();
    }
  }
  
  marketState.lastUpdated = Date.now();
}, 3000);


// API Endpoint: Get latest market rates, sales transactions and quantum timeline
app.get('/api/rates', (req, res) => {
  res.json(marketState);
});

// API Endpoint: Register a new manual business sale transaction from the workspace
app.post('/api/transactions', (req, res) => {
  const { client, amount, currency, service } = req.body;

  if (!client || !amount || !currency || !service) {
    return res.status(400).json({ error: "Missing required transaction fields: client, amount, currency, service" });
  }

  const clientStr = String(client).trim();
  const serviceStr = String(service).trim();
  const currencyStr = String(currency).trim();
  const amountNum = parseFloat(amount);

  if (clientStr.length < 1 || clientStr.length > 120) {
    return res.status(400).json({ error: "Client name must be between 1 and 120 characters." });
  }
  if (serviceStr.length < 1 || serviceStr.length > 200) {
    return res.status(400).json({ error: "Service description must be between 1 and 200 characters." });
  }
  if (!marketState.currencies[currencyStr]) {
    return res.status(400).json({ error: "Unknown currency code." });
  }
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }

  const newTx: Transaction = {
    id: `tx_manual_${Date.now()}`,
    client: clientStr,
    amount: amountNum,
    currency: currencyStr,
    status: 'completed',
    timestamp: Date.now(),
    service: serviceStr
  };

  marketState.transactions.unshift(newTx);
  if (marketState.transactions.length > 25) {
    marketState.transactions.pop();
  }
  persistTransactions(marketState.transactions);

  marketState.lastUpdated = Date.now();
  res.json({ success: true, transaction: newTx });
});


// API Endpoint: Trigger a simulated global macroeconomic shock
app.post('/api/simulate-shock', async (req, res) => {
  const { shockType, customShockName } = req.body;

  let shockName = customShockName || "Macroeconomic Crisis";
  let promptDetails = "";

  switch (shockType) {
    case 'usd_default':
      shockName = "US Treasury Technical Default";
      promptDetails = "The United States Treasury misses a technical debt service deadline due to political brinkmanship. Capital flees USD toward safe havens like Swiss Franc (CHF), Gold/Bitcoin (BTC), and competing reserve blocks like CNH and CBDCs.";
      break;
    case 'cbdc_mandate':
      shockName = "Global Sovereign CBDC Mandate";
      promptDetails = "Central banks globally outlaw legacy anonymous currencies and mandate e-USD, Digital Euro, and e-CNY. Massive volume surges in CBDCs, while privacy-oriented or decentralized systems suffer brief panic before surging.";
      break;
    case 'hyperinflation':
      shockName = "Global Resource Scarcity Hyperinflation";
      promptDetails = "Severe supply chain disruptions cause a sudden 200% spike in oil and food prices. Emerging market fiat currencies (ZAR, BRL, INR) crash violently, while hard assets and the Swiss Franc (CHF) skyrocket.";
      break;
    case 'green_transition':
      shockName = "OPEC Abandons Petro-Dollar for Green Credits";
      promptDetails = "OPEC officially switches resource billing to a basket of e-CNY and carbon credits. The US dollar falls heavily, while commodities-backed currencies (AUD, CAD, BRL) and digital green frameworks surge.";
      break;
    case 'ai_automation':
      shockName = "AI-Driven Hyper-Productivity Surge";
      promptDetails = "Unprecedented software automation triggers massive deflation. Corporate fiat values surge, interest rates plummet to zero, and tech-utility cryptos like Ethereum (ETH) see massive institutional backing.";
      break;
    default:
      shockName = customShockName || "Geopolitical Sudden Shift";
      promptDetails = "A sudden geopolitical development causes instant liquidity re-pricing across all asset categories.";
  }

  const timestamp = Date.now();
  const id = `shock_${timestamp}`;

  let shockEvent: ShockEvent = {
    id,
    name: shockName,
    description: `A heavy shift is shaking the currency networks. Markets are reacting to "${shockName}".`,
    timestamp,
    impacts: {}
  };

  // If Gemini client is ready, let it generate the rich analysis and rates adjustments!
  if (aiClient) {
    try {
      const prompt = `Act as an elite global macroeconomist and currency strategist.
A massive shock has just hit the global markets: "${shockName}".
Context: ${promptDetails}

Analyze how this event instantly impacts exchange rates (relative to USD, or if USD is affected, show USD relative to other global values).
We need to generate percentage price shifts (impacts) for each of these currency codes:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)
- CNH (Chinese Yuan)
- INR (Indian Rupee)
- ZAR (South African Rand)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- BTC (Bitcoin)
- ETH (Ethereum)
- e-CNY (Digital Yuan)
- Digital Euro (Digital Euro)
- e-USD (e-USD FedDollar)

IMPORTANT: Provide the output in strict JSON format matching this schema:
{
  "name": "A creative, high-impact news headline for the event",
  "description": "A sophisticated 3-sentence economic bulletin explaining the geopolitical flow of capital, central bank actions, and immediate panic/euphoria.",
  "impacts": {
    "USD": -4.2, // percentage shift (e.g. -4.2 means a 4.2% drop)
    "EUR": 1.5,
    "CHF": 5.8,
    "BTC": 12.4,
    ...
  }
}
Ensure all currency codes listed above have a corresponding number in the impacts map. Keep traditional fiat shifts between -15% and +15%, while Digital/Crypto assets can shift up to -45% or +60%.`;

      const response = await generateContentWithRetry(prompt, "application/json");
      const text = response?.text || "{}";
      const parsed = JSON.parse(text);
      
      shockEvent = {
        id,
        name: parsed.name || shockName,
        description: parsed.description || `Immediate repricing has occurred across key blocks.`,
        timestamp,
        impacts: parsed.impacts || {}
      };
    } catch (err) {
      console.error("Gemini shock generation failed, falling back to simulator defaults:", err);
      // Fallback is handled below
    }
  }

  // Ensure all impacts are filled (either from Gemini or fallback)
  const codes = Object.keys(INITIAL_CURRENCIES);
  codes.forEach(code => {
    if (shockEvent.impacts[code] === undefined) {
      // High-fidelity fallback presets based on the shockType
      let change = 0;
      const r = () => (Math.random() - 0.5) * 2; // minor randomized noise
      
      if (shockType === 'usd_default') {
        if (code === 'USD' || code === 'e-USD') change = -8.5 + r();
        else if (code === 'CHF') change = 7.2 + r();
        else if (code === 'BTC') change = 14.5 + r();
        else if (code === 'ETH') change = 9.8 + r();
        else if (code === 'EUR' || code === 'GBP') change = 3.5 + r();
        else if (code === 'CNH' || code === 'e-CNY') change = 4.8 + r();
        else change = -1.2 + r();
      } else if (shockType === 'cbdc_mandate') {
        if (code === 'e-USD' || code === 'Digital Euro' || code === 'e-CNY') change = 18.4 + r();
        else if (code === 'BTC' || code === 'ETH') change = -12.5 + r(); // brief panic
        else if (code === 'USD' || code === 'EUR') change = -4.5 + r(); // paper cash flight
        else change = -2.0 + r();
      } else if (shockType === 'hyperinflation') {
        if (code === 'CHF') change = 9.2 + r();
        else if (code === 'BTC') change = 25.4 + r();
        else if (code === 'ETH') change = 18.1 + r();
        else if (code === 'ZAR' || code === 'BRL' || code === 'MXN' || code === 'INR') change = -14.6 + r();
        else if (code === 'USD' || code === 'EUR' || code === 'GBP') change = -3.8 + r();
        else change = 1.2 + r();
      } else if (shockType === 'green_transition') {
        if (code === 'USD' || code === 'e-USD') change = -6.5 + r();
        else if (code === 'CAD' || code === 'AUD' || code === 'BRL') change = 8.4 + r(); // commodity export surge
        else if (code === 'e-CNY' || code === 'CNH') change = 6.2 + r();
        else if (code === 'BTC') change = 11.2 + r();
        else change = 1.0 + r();
      } else if (shockType === 'ai_automation') {
        if (code === 'ETH') change = 22.4 + r(); // smart contract gas utility
        else if (code === 'BTC') change = 12.6 + r();
        else if (code === 'USD' || code === 'EUR' || code === 'GBP' || code === 'JPY') change = 5.4 + r();
        else change = -2.5 + r(); // resource-heavy emerging markets lag
      } else {
        // Generic shock
        change = (Math.random() - 0.4) * 8; // generally positive or negative spike
      }
      shockEvent.impacts[code] = parseFloat(change.toFixed(2));
    }
  });

  // Apply shock impacts directly to the live rates & push extreme points into history
  Object.keys(marketState.currencies).forEach(code => {
    const currency = marketState.currencies[code];
    const impactPercent = shockEvent.impacts[code] || 0;
    
    // Calculate new rate
    const multiplier = 1 + (impactPercent / 100);
    const newRate = currency.currentRate * multiplier;
    
    currency.currentRate = newRate;
    
    // Inject custom spike into history
    currency.history.push(newRate);
    if (currency.history.length > 30) currency.history.shift();

    currency.dayHigh = Math.max(currency.dayHigh, newRate);
    currency.dayLow = Math.min(currency.dayLow, newRate);
    
    const baseVal = currency.history[0];
    currency.changePercent = baseVal !== 0 ? ((newRate - baseVal) / baseVal) * 100 : 0;
  });

  // Keep description updated with the fallback narrative if needed
  if (!shockEvent.description || shockEvent.description.length < 10) {
    shockEvent.description = `Sovereign liquidity networks are rebalancing. High-frequency capital flight observed in real-time. Impact multipliers successfully integrated.`;
  }

  marketState.shockEvent = shockEvent;
  marketState.lastUpdated = Date.now();

  res.json({
    success: true,
    shockEvent
  });
});


// API Endpoint: Get Deep AI Analysis for a single selected Currency
app.post('/api/gemini/analyze', async (req, res) => {
  const { code } = req.body;
  const currency = marketState.currencies[code];
  if (!currency) {
    return res.status(404).json({ error: "Currency not found" });
  }

  if (aiClient) {
    try {
      const prompt = `Act as an elite Currency Strategist and Macro Investor.
Analyze the following currency:
Code: ${code}
Name: ${currency.name}
Category: ${currency.category}
Current Exchange Value relative to USD: ${currency.currentRate}

Provide a brilliant forward-looking economic analysis.
Respond with a strict JSON format matching this schema:
{
  "code": "${code}",
  "name": "${currency.name}",
  "summary": "A 2-sentence executive summary of the currency's current strategic positioning.",
  "outlook": "bullish" | "neutral" | "bearish",
  "target12m": "Sovereign range estimate or crypto price target (e.g. '+8% appreciation' or '$85,000')",
  "risks": [
    "A major risk point (e.g. inflation, policy error)",
    "Another structural risk"
  ],
  "drivers": [
    "Key structural growth driver",
    "Another catalyst"
  ],
  "futuristicForecast": "A speculative, highly forward-looking analysis of how this asset behaves in a 2030+ world dominated by CBDCs, AI-agents making automated transactions, and de-dollarization."
}`;

      const response = await generateContentWithRetry(prompt, "application/json");
      const parsed = JSON.parse(response?.text || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini currency analysis failed, using high-fidelity fallback:", err);
    }
  }

  // High-fidelity fallback if Gemini is offline
  let mockAnalysis: AIAnalysis = {
    code,
    name: currency.name,
    summary: `The currency is displaying robust short-term support amid fluctuating sovereign capital flows. Policy adjustments from central authorities remain key.`,
    outlook: 'neutral',
    target12m: '+2.5% vs. USD basket',
    risks: [
      "Monetary policy divergence and interest rate differentials",
      "Geopolitical friction slowing local industrial exports"
    ],
    drivers: [
      "Technological adoption of domestic digital clearing channels",
      "Robust physical trade surplus in central commodity registers"
    ],
    futuristicForecast: `By 2030, this asset will likely interface directly with multi-sovereign bridge systems, optimizing high-speed smart contracts run by decentralized AI treasuries.`
  };

  // Customize mock fallback slightly based on code type
  if (code === 'BTC') {
    mockAnalysis = {
      code,
      name: currency.name,
      summary: `Decentralized digital gold continues to gain massive institutional interest as a non-sovereign reserve asset and hedge against debt.`,
      outlook: 'bullish',
      target12m: '$92,500 - $110,000',
      risks: [
        "Global regulatory crackdowns on decentralized liquidity pooling",
        "Hashrate volatility and computing hardware energetic constraints"
      ],
      drivers: [
        "Escalating hyperinflation in secondary sovereign paper units",
        "Sovereign wealth funds allocating physical reserves to digital networks"
      ],
      futuristicForecast: `In a 2030 scenario, Bitcoin stands as the absolute base-layer global collateral settlement standard, used by AI agents to transfer value securely across planetary node systems without intermediate trusted banks.`
    };
  } else if (code === 'e-CNY') {
    mockAnalysis = {
      code,
      name: currency.name,
      summary: `China's sovereign CBDC is expanding rapidly through cross-border trade rails, bypass-routing traditional clearing systems.`,
      outlook: 'bullish',
      target12m: 'e-CNY trade volume expansion of +45%',
      risks: [
        "Sovereign friction from Western central blocks restricting import ports",
        "Consumer preference for commercial platforms over direct sovereign ledger nodes"
      ],
      drivers: [
        "Bilateral resource agreements settling directly in digital yuan pipelines",
        "Programmable fiscal injection capabilities allowing direct, targeted stimuli"
      ],
      futuristicForecast: `By 2030, the e-CNY will be the leading commercial ledger across Eurasia, utilizing automated smart contracts to swap currency for physical commodities instantaneously at container ports.`
    };
  } else if (code === 'CHF') {
    mockAnalysis = {
      code,
      name: currency.name,
      summary: `The premier physical safe haven, displaying solid structural backing and ultra-low sovereign debt vulnerability.`,
      outlook: 'bullish',
      target12m: 'Parity with USD or higher',
      risks: [
        "Swiss National Bank interventions to prevent extreme currency overvaluation",
        "Secondary exposure to broader European Union sovereign leverage"
      ],
      drivers: [
        "Flight to absolute safety during times of debt brinkmanship in major blocks",
        "Ultra-stable legal frameworks and high concentration of global private wealth"
      ],
      futuristicForecast: `By 2030, Switzerland will likely run a hybridized system bridging physical vault gold directly to digital tokenized certificates, providing an oasis of cryptographic financial safety.`
    };
  }

  res.json(mockAnalysis);
});


// API Endpoint: Research Future Global Currencies via Gemini AI
app.post('/api/research-currency', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: "Please provide a valid search or currency prompt." });
  }

  const query = prompt.trim();

  if (aiClient) {
    try {
      const geminiPrompt = `You are an elite global macroeconomic think-tank and monetary analyst.
Analyze the feasibility and design a tokenized parameter specification for a future proposed global currency inspired by: "${query}".

Provide the assessment in strict JSON format matching this schema:
{
  "name": "Full descriptive name of the currency",
  "symbol": "Single character or short symbol, e.g. ₮, ₲, ₾",
  "category": "digital" or "cbdc",
  "emoji": "Flag or coin emoji, e.g. 🌍, 🪙, 🇨🇳",
  "baseRate": 1.25, // Suggested initial conversion rate (units of this currency per 1 USD)
  "volatility": 0.0025, // Suggested standard daily volatility multiplier (between 0.0001 and 0.02)
  "feasibilityScore": 75, // Percentage feasibility score (0 to 100)
  "transitionHorizon": "2028 - 2033", // Timeline range
  "geopoliticalBacking": "Brief overview of geopolitical backing (2 sentences)",
  "pros": ["Catalyst bullet 1", "Catalyst bullet 2"],
  "cons": ["Risk/Barrier bullet 1", "Risk/Barrier bullet 2"],
  "summary": "A high-fidelity macro-economic synthesis summary (3-4 sentences)."
}
`;

      const response = await generateContentWithRetry(geminiPrompt, "application/json");
      const parsed = JSON.parse(response?.text || "{}");
      return res.json({ success: true, research: parsed });
    } catch (err) {
      console.error("Gemini currency research failed, using smart simulator:", err);
    }
  }

  // Smart high-fidelity fallback generator based on the prompt text!
  let name = "Researched Global Sovereign Ledger";
  let symbol = "₮";
  let category: 'digital' | 'cbdc' = "cbdc";
  let emoji = "🌍";
  let baseRate = 1.0;
  let volatility = 0.0015;
  let feasibilityScore = 68;
  let transitionHorizon = "2029 - 2034";
  let geopoliticalBacking = "Supported by a consortium of sovereign trade blocks seeking direct ledger settlement.";
  let pros = ["Eliminates traditional cross-border clearing fees", "Bypasses unilateral economic sanctions and embargo rails"];
  let cons = ["Resistance from legacy dominant reserve currency central banks", "Heavy computational scale and multi-sovereign validator coordination"];
  let summary = `Our research indicates a rising structural shift toward alternative global clearing blocks. If deployed, this tokenized ledger would provide instantaneous consensus settlement across participating nodes, fundamentally changing local trade billing.`;

  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('brics') || lowerQuery.includes('russia') || lowerQuery.includes('china') || lowerQuery.includes('brazil') || lowerQuery.includes('india')) {
    name = "BRICS Unified Ledger Token (BULT)";
    symbol = "🧱";
    category = "cbdc";
    emoji = "🇷🇺";
    baseRate = 2.45;
    volatility = 0.0022;
    feasibilityScore = 82;
    transitionHorizon = "2027 - 2031";
    geopoliticalBacking = "Explicitly backed by the BRICS+ expansion council to reduce dependency on Western Clearing infrastructure.";
    pros = ["Immediate bilateral commodity settlement for crude, minerals, and grains", "Sovereign liquidity protection decoupled from interest rate volatility"];
    cons = ["High internal trust deficit between core members regarding minting audits", "Vulnerability to regional bilateral political disputes"];
    summary = "The BRICS Unified Ledger Token represents a highly anticipated shift in international trade billing. Our simulation indicates that a gold or commodity basket backing would instantly establish a stable alternate monetary block, reducing global USD velocity.";
  } else if (lowerQuery.includes('gold') || lowerQuery.includes('commodity') || lowerQuery.includes('metal') || lowerQuery.includes('resource')) {
    name = "Sovereign Gold-Backed Registry Certificate (SGRC)";
    symbol = "⚜️";
    category = "digital";
    emoji = "👑";
    baseRate = 0.00045; // high value per unit
    volatility = 0.0012;
    feasibilityScore = 88;
    transitionHorizon = "2028 - 2032";
    geopoliticalBacking = "Jointly initiated by neutral banking centers and major sovereign gold vault deposits.";
    pros = ["True absolute hedge against fiat currency dilution and inflation", "Universal intrinsic consensus value recognized across all continents"];
    cons = ["Physical gold vault auditing latency and verification overhead", "Inherent liquidity caps tied strictly to tangible vault expansion limits"];
    summary = "A tokenized physical reserve asset bridges the security of tangible gold with the transaction speed of modern distributed ledger networks. This asset stands as the premier candidate for safe-haven treasury allocations under multi-system stress.";
  } else if (lowerQuery.includes('eco') || lowerQuery.includes('green') || lowerQuery.includes('carbon') || lowerQuery.includes('climate')) {
    name = "Global Carbon Emission Clearance Unit (GCEU)";
    symbol = "🌱";
    category = "digital";
    emoji = "☘️";
    baseRate = 12.8;
    volatility = 0.0045;
    feasibilityScore = 74;
    transitionHorizon = "2029 - 2035";
    geopoliticalBacking = "Heavily backed by the United Nations Environmental Taskforce and global sovereign green bonds.";
    pros = ["Directly incentivizes industrial carbon capture and sustainable initiatives", "High-growth speculative value backed by legally mandated compliance offsets"];
    cons = ["Complex transnational measurement standards prone to localized gaming", "Volatile legislative changes regarding international compliance limits"];
    summary = "A global carbon-linked currency is transforming environmental targets into highly tradeable capital assets. This token represents a significant innovation where sovereign purchasing power correlates directly with planetary carbon-negative productivity.";
  } else if (lowerQuery.includes('crypto') || lowerQuery.includes('decentralized') || lowerQuery.includes('bancor') || lowerQuery.includes('sdr')) {
    name = "Consensus Sovereign Drawing Right (CSDR)";
    symbol = "⚛️";
    category = "digital";
    emoji = "🌀";
    baseRate = 0.85;
    volatility = 0.0035;
    feasibilityScore = 70;
    transitionHorizon = "2028 - 2033";
    geopoliticalBacking = "Proactive central bank labs experimenting with algorithmic liquidity balancing nodes.";
    pros = ["Algorithmic basket balancing minimizes specific sovereign currency risk", "Highly transparent open-source distributed ledger governance"];
    cons = ["Extreme regulatory headwind from legacy sovereign fiscal authorities", "Complex consensus mechanisms demanding ultra-fast multi-chain validators"];
    summary = "The Consensus Sovereign Drawing Right represents a decentralized evolution of IMF SDRs. By bridging sovereign baskets with autonomous smart contract mechanics, it delivers an optimal risk-adjusted international ledger standard.";
  } else {
    // Dynamically derive some details based on user query
    const words = query.split(' ');
    const firstWord = words[0] || "Speculative";
    const cleanPrefix = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).replace(/[^a-zA-Z]/g, '');
    name = `${cleanPrefix} Global Trust Token`;
    symbol = "☤";
    emoji = "💎";
    baseRate = parseFloat((1.0 + Math.random() * 5.0).toFixed(2));
    volatility = 0.0025;
    feasibilityScore = 65;
    transitionHorizon = "2029 - 2034";
    geopoliticalBacking = "Supported by private banking cartels and emerging fintech special economic zones.";
    pros = [`Direct technological integration into ${cleanPrefix} digital registries`, "Frictionless programmatic asset transfers across legacy boundaries"];
    cons = ["Uncertain sovereign status and fragmented global licensing compliance", "Vulnerability to liquidity traps under extreme market risk-off conditions"];
    summary = `Our digital monetary simulation of the proposed ${name} shows high long-term technical viability. By creating a unified settlement ledger for ${cleanPrefix}-related resources, this token successfully bypasses traditional clearing friction.`;
  }

  res.json({
    success: true,
    research: {
      name,
      symbol,
      category,
      emoji,
      baseRate,
      volatility,
      feasibilityScore,
      transitionHorizon,
      geopoliticalBacking,
      pros,
      cons,
      summary
    }
  });
});


// API Endpoint: Tokenize and Deploy a New Future Global Currency
app.post('/api/tokenize', (req, res) => {
  const { code, name, symbol, category, emoji, baseRate, volatility } = req.body;

  if (!code || !name || !symbol || !category || !emoji || !baseRate) {
    return res.status(400).json({ error: "Missing required tokenization parameters: code, name, symbol, category, emoji, baseRate" });
  }

  const cleanCode = String(code).trim().toUpperCase();

  if (!/^[A-Z]{1,6}$/.test(cleanCode)) {
    return res.status(400).json({ error: "Ticker must be 1-6 uppercase letters only." });
  }
  if (String(name).trim().length > 80) {
    return res.status(400).json({ error: "Asset name must be 80 characters or fewer." });
  }
  if (String(symbol).trim().length > 8) {
    return res.status(400).json({ error: "Symbol must be 8 characters or fewer." });
  }
  if (!['fiat', 'digital', 'cbdc'].includes(category)) {
    return res.status(400).json({ error: "Invalid category. Must be fiat, digital, or cbdc." });
  }

  if (marketState.currencies[cleanCode]) {
    return res.status(400).json({ error: `Currency with ticker ${cleanCode} is already deployed on the dashboard.` });
  }

  // Pre-fill history of 30 items fluctuating around baseRate to look gorgeous on charts!
  const history: number[] = [];
  let currentRate = parseFloat(baseRate);
  const vol = parseFloat(volatility) || 0.001;

  for (let i = 0; i < 30; i++) {
    const step = 1 + (Math.random() - 0.5) * vol * 4;
    currentRate = currentRate * step;
    history.push(currentRate);
  }

  const dayHigh = Math.max(...history);
  const dayLow = Math.min(...history);
  const changePercent = ((currentRate - history[0]) / history[0]) * 100;

  // Add configuration to INITIAL_CURRENCIES so the live fluctuation loop picks it up!
  INITIAL_CURRENCIES[cleanCode] = {
    name: name.trim(),
    symbol: symbol.trim(),
    category: category,
    emoji: emoji.trim(),
    baseRate: parseFloat(baseRate),
    volatility: vol
  };

  // Add currency state to marketState
  marketState.currencies[cleanCode] = {
    code: cleanCode,
    name: name.trim(),
    symbol: symbol.trim(),
    category: category,
    emoji: emoji.trim(),
    currentRate,
    history,
    dayHigh,
    dayLow,
    changePercent
  };

  marketState.lastUpdated = Date.now();

  res.json({
    success: true,
    currency: marketState.currencies[cleanCode]
  });
});


// API Endpoint: Get Global AI Future Market Forecast
app.get('/api/gemini/global-forecast', async (req, res) => {
  if (aiClient) {
    try {
      const prompt = `Act as an expert currency strategist and futuristic monetary historian.
Provide a high-fidelity outlook on the global currency landscape for the next 5-10 years.
Analyze these distinct concepts:
1. Macro trends in paper vs digital assets
2. CBDC adoption & direct fiscal programming
3. De-dollarization & multi-polar clearing systems
4. Decentralized crypto integration into institutional pipelines
5. Emerging market currencies vs hard assets

Respond with a strict JSON format matching this schema:
{
  "macroTrends": [
    "A key global macroeconomic shift",
    "Another core shift"
  ],
  "cbdcEvolution": "A paragraph explaining the structural evolution of CBDCs and their geopolitical power plays.",
  "dedollarizationThreat": "A paragraph detailing the realistic pace of de-dollarization and regional clearing networks.",
  "cryptoIntegration": "A paragraph summarizing how decentralized protocols are fitting into legacy monetary systems.",
  "emergingMarketForecast": "A paragraph on the future survival or rise of emerging market sovereign currencies."
}`;

      const response = await generateContentWithRetry(prompt, "application/json");
      const parsed = JSON.parse(response?.text || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini global forecast failed, using fallback:", err);
    }
  }

  // Fallback high-fidelity outlook
  const mockGlobalOutlook: AIGlobalOutlook = {
    macroTrends: [
      "Inevitability of sovereign ledger digitization, leading to programmable money protocols.",
      "Growing structural demand for non-inflationary hard collateral (Swiss Franc, physical commodities, Bitcoin).",
      "Extreme divergence between debt-ridden developed economies and trade-surplus emerging blocks."
    ],
    cbdcEvolution: "Sovereign central banks are accelerating digital ledgers (e-CNY, Digital Euro, e-USD) to reclaim monetary control. Rather than just digital ledger cash, CBDCs are becoming programmable fiscal policy tools. Central banks can inject specialized stimulus directly into consumer wallets that expires if not spent within 30 days, or apply tiered interest rates.",
    dedollarizationThreat: "The dollar's role as the absolute singular global currency is shifting to a multi-polar system. Bilateral clearing rails outside of traditional networks (e.g. local currency swaps between India, Russia, and China) are solidifying. This does not mean the sudden collapse of USD, but a segmented, highly volatile currency trade environment.",
    cryptoIntegration: "Crypto-currencies are evolving from retail speculative tokens to institutional routing utilities. Sovereign wealth funds and global investment bank trusts are standardizing Bitcoin and Ethereum as primary digital liquidity reserves. Smart-contract rails are used for instant global treasury management.",
    emergingMarketForecast: "Emerging markets are taking two paths: highly vulnerable debt-heavy nations face catastrophic hyperinflation or direct dollarization/crypto-ization. Meanwhile, resource-rich nations are backing their sovereign currencies directly with oil, copper, and rare-earth registries, creating highly resilient commodity-pegged fiat tokens."
  };

  res.json(mockGlobalOutlook);
});


// Serve static assets or mount Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Global Currency Server running on http://localhost:${PORT}`);
  });
}

startServer();
