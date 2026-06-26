<div align="center">

# Sovereign Reserve Terminal

### Real-Time Global Currency Intelligence Dashboard

*Built by Otis Williams*

![Sovereign Reserve Terminal](docs/screenshot.png)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Vitest](https://img.shields.io/badge/Vitest-19_Tests_Passing-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)

</div>

---

A full-stack, real-time global currency dashboard tracking **17 currencies** across Fiat, Crypto, and CBDC categories. Features live market simulation, AI-powered macroeconomic analysis, an interactive shock simulator, and a fully tested, component-driven React architecture — built from scratch without a charting template.

---

## Code Quality Highlights

| Metric | Detail |
|--------|--------|
| **Architecture** | 14 focused components + 2 custom hooks + 2 utility modules (no monolithic files) |
| **Test Suite** | 19 Vitest unit tests — all passing (`npm test`) |
| **TypeScript** | Zero `any` types — all state and data fully typed with interfaces |
| **Type Check** | `npm run lint` passes clean with `tsc --noEmit` |
| **Persistence** | Transactions survive server restarts via `data/transactions.json` |
| **Real KPIs** | 24H Velocity calculated from actual transaction timestamps (not hardcoded) |

---

## Features

### Live Market Feeds
- **17 currencies tracked** — USD, EUR, GBP, JPY, AUD, CAD, CHF, CNH, INR, ZAR, BRL, MXN, BTC, ETH, e-CNY, Digital Euro, e-USD
- **3-second tick simulation** — configurable volatility per asset class (crypto vs fiat vs CBDC)
- **Flash tick indicators** — green/red price-change highlights on every watchlist row
- **SVG sparklines** — custom-built polyline charts showing the last 30 price ticks per currency
- **Currency rebasing** — switch the base currency and every price, KPI, and chart recalculates instantly

### Charts & Analytics
- **Area chart with dual-axis correlation overlay** — compare any two assets simultaneously using Recharts
- **Market Mood Sentiment Dial** — custom SVG arc gauge driven by AI outlook + price momentum
- **Revenue Treemap** — hierarchical SVG partition layout grouping transactions by Fiat / Digital / CBDC
- **KPI row** — Converted Corporate Revenue, 24H Velocity (real), Active Clients, Digital/CBDC Ratio

### AI Intelligence (Gemini 2.0 Flash)
- **Per-currency AI brief** — executive summary, 12-month target, risk factors, growth drivers, and 2030+ futuristic forecast
- **Global Monetary Outlook** — 5–10 year macro forecast covering CBDC evolution, de-dollarization, crypto integration, and emerging markets
- **AI Sovereign Research Lab** — query Gemini for any speculative currency concept and receive a full parameter specification
- **Shock event generation** — Gemini produces headlines, descriptions, and per-currency impact percentages for crisis scenarios
- All AI calls route through a secure Express proxy — the API key never touches the client bundle

### Macroeconomic Shock Simulator

| Preset | Description |
|--------|-------------|
| 🛡️ US Debt Default | Capital flight from USD to CHF, BTC, CNH |
| 🪙 CBDC Mandate | Surge in e-CNY, Digital Euro, e-USD; crypto panic |
| 🌶️ Food Hyperinflation | EM currencies crash; CHF and BTC spike |
| 🔋 OPEC Petro-Dollar Abandon | USD falls; AUD/CAD/BRL surge on commodity backing |
| 🤖 AI Automation Wave | ETH and USD surge; smart contract utility demand |

### Business Dashboard
- **Sales Ledger** — auto-generated real-time transactions + manual sale logger; full-text search, status filter, sort by value or recency
- **Currency Converter** — cross-asset calculator with swap button; converts via USD bridge
- **Quantum Calendar** — macro event timeline with block numbers, volatility index, and animated status indicators
- **AI Research Lab + Tokenizer** — research a speculative asset with AI, auto-fill parameters, then deploy it live to the watchlist
- **Data Export** — transactions as CSV or JSON; exchange rates as CSV

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS 4, Recharts, lucide-react |
| Backend | Node.js, Express, Vite dev middleware |
| AI | Google Gemini (`@google/genai` — `gemini-2.0-flash`) via server proxy |
| Testing | Vitest — 19 unit tests across utility modules |
| Tooling | Vite 6, esbuild, tsx |
| Persistence | JSON file (`data/transactions.json`) — survives server restarts |

---

## Architecture

```
Browser (React 19)                    Express (/api/*)              Gemini API
  │                                        │                             │
  ├─ useMarket (polls /api/rates 3s) ──────┤                             │
  ├─ useAI    (fetches analysis)  ─────────┤──── generateContentWithRetry┘
  │                                        │
  ├─ 14 focused components                 ├─ /api/rates        (GET)
  │   ├─ Header, KPIRow, CrisisBanner      ├─ /api/transactions (POST → persisted)
  │   ├─ CurrencyWatchlist, PriceChart     ├─ /api/simulate-shock
  │   ├─ AIBrief, CurrencyConverter        ├─ /api/gemini/analyze
  │   ├─ SalesHub, ResearchLab             ├─ /api/research-currency
  │   ├─ ShockSimulator, RecruiterHub      └─ /api/tokenize
  │   └─ ForecastModal, LoadingScreen
  │
  └─ 2 utility modules
      ├─ utils/calculations.ts  (KPIs, sentiment, chart data, treemap)
      └─ utils/formatters.ts    (rebased rates, currency display strings)
```

- `GEMINI_API_KEY` stays server-side — never in the client bundle
- Market simulation runs in a Node.js `setInterval` loop at 3-second intervals
- New transactions auto-generated every ~12 seconds; persisted to disk on each manual POST
- All utility functions are pure and independently unit-tested

---

## Testing

```bash
npm test          # Run all 19 Vitest unit tests
npm run test:watch  # Watch mode for development
```

| Test Suite | Tests | Coverage |
|-----------|-------|---------|
| `calculations.test.ts` | 12 | `computeKPIs`, `computeSentiment`, `buildChartData` |
| `formatters.test.ts` | 7 | `getRebasedRate`, `formatCurrencyValue` |

Tests validate currency rebasing math, KPI aggregations, sentiment scoring, chart data generation, and edge cases (unknown currencies, empty transactions, digital/fiat inversion).

---

## Project Structure

```
src/
  App.tsx                   # Thin coordinator (~280 lines) — state, handlers, layout
  types.ts                  # All TypeScript interfaces (Currency, MarketState, etc.)
  main.tsx                  # React entry point
  index.css                 # Tailwind 4 + custom scrollbar utilities

  components/
    Header.tsx              # Base currency selector + AI forecast button
    KPIRow.tsx              # 4 KPI cards with real calculated metrics
    CrisisBanner.tsx        # Shock event alert + resolve button
    CurrencyWatchlist.tsx   # Filtered ticker list with sparklines + flash states
    PriceChart.tsx          # Recharts area chart with dual-axis correlation
    AIBrief.tsx             # Sentiment gauge + AI analysis display
    CurrencyConverter.tsx   # Cross-asset calculator
    SalesHub.tsx            # Ledger, treemap, calendar, log-sale form
    ResearchLab.tsx         # AI research + manual tokenizer + telemetry
    ShockSimulator.tsx      # Crisis presets + inject button
    RecruiterHub.tsx        # Architecture walkthrough panel
    ForecastModal.tsx       # Global AI macro outlook overlay
    LoadingScreen.tsx       # Initial load state
    ForecastModal.tsx       # Global AI macro outlook modal

  hooks/
    useMarket.ts            # Polls /api/rates, tracks flash states
    useAI.ts                # Fetches AI analysis + global forecast

  utils/
    calculations.ts         # Pure functions: KPIs, sentiment, chart data, treemap
    formatters.ts           # Currency display strings, rebased rate math

  __tests__/
    calculations.test.ts    # 12 unit tests
    formatters.test.ts      # 7 unit tests

server.ts                   # Express server, market loop, all API endpoints, persistence
index.html                  # Vite HTML shell
```

---

## Getting Started

**Prerequisites:** Node.js 18+ and a Gemini API key.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set GEMINI_API_KEY=your_key_here

# 3. Start (Express + Vite on http://localhost:3000)
npm run dev
```

```bash
npm test         # Run unit tests
npm run lint     # Type-check with tsc --noEmit
npm run build    # Build client + bundle server to dist/
npm start        # Run production build (node dist/server.cjs)
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Server-side key for Gemini AI — never exposed to the client |

`.env` is gitignored. Only `.env.example` is committed.

---

## Deployment

Deploy to any Node host (Cloud Run, Render, Railway, Fly.io):

```bash
npm run build && npm start
```

The server reads `process.env.PORT`, falling back to `3000`.

---

## License

Released under the MIT License.
