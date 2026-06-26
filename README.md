# Sovereign Reserve Terminal — Global Currency Dashboard

A full-stack, real-time global currency dashboard built with React 19, TypeScript, Tailwind CSS 4, and a Node/Express backend with Gemini AI. Tracks 17 currencies across Fiat, Crypto, and CBDC categories with live simulation, AI analysis, and macroeconomic shock injection.

> Built by Otis Williams

---

## Features

### Live Market Feeds
- **17 currencies tracked**: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNH, INR, ZAR, BRL, MXN, BTC, ETH, e-CNY, Digital Euro, e-USD
- **Real-time rate simulation** — market rates fluctuate every 3 seconds with configurable volatility per asset
- **Flash tick indicators** — green/red price-change highlights on every watchlist row
- **SVG sparklines** per currency showing the last 30 price ticks
- **Currency rebasing** — switch the base currency (USD, EUR, BTC, etc.) and every price, KPI, and chart recalculates instantly

### Charts & Analytics
- **Area chart** with correlation overlay — compare any two assets on dual Y-axes
- **Market Mood Sentiment Dial** — SVG gauge driven by AI outlook, price momentum, and driver/risk counts
- **Revenue Treemap** — hierarchical SVG partition layout grouping transactions by Fiat / Digital / CBDC
- **KPI row** — Converted Corporate Revenue, 24H Velocity, Active Clients, Digital Asset/CBDC Ratio

### AI Intelligence (Gemini)
- **Per-currency AI brief** — executive summary, 12M target, risk factors, growth drivers, and 2030+ futuristic forecast
- **Global Monetary Outlook** — 5-10 year macro forecast covering CBDC evolution, de-dollarization, crypto integration, and emerging markets
- **AI Sovereign Research Lab** — query Gemini for any speculative currency concept and receive a full parameter spec
- **Shock event generation** — Gemini produces headlines, descriptions, and per-currency impact percentages for crisis scenarios
- All AI calls go through an Express proxy; the API key never leaves the server

### Shock Simulator
- 5 preset scenarios: US Debt Default, CBDC Mandate, Food Hyperinflation, OPEC Petro-Dollar Abandon, AI Automation Wave
- Custom headline override for free-form crises
- High-fidelity offline fallback presets activate if Gemini is unavailable
- "Resolve & Reset" button clears the crisis banner instantly

### Business Dashboard
- **Sales Ledger** — real-time auto-generated transactions + manual sale logger; filterable by status, sortable by value or recency, full-text search
- **Currency Converter** — cross-asset calculator with swap button
- **Quantum Calendar** — macro event timeline with block numbers, volatility index, and animated status indicators
- **AI Research Lab + Tokenizer** — research a speculative asset with AI, auto-fill parameters, then deploy it live to the watchlist

### Data Export
- Export transactions as CSV or JSON
- Export all current exchange rates as CSV

### API Resiliency
- Exponential backoff retry (`generateContentWithRetry`) with configurable retries and delay
- Full offline fallback for every Gemini endpoint
- Live telemetry monitor panel (latency, request counter, fail-protection status)

---

## Tech Stack

| Layer    | Tools                                                               |
| -------- | ------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Tailwind CSS 4, Recharts, lucide-react        |
| Backend  | Node.js, Express, Vite middleware                                    |
| AI       | Google Gemini (`@google/genai` — `gemini-2.0-flash`) via server proxy |
| Tooling  | Vite 6, esbuild, tsx                                                 |

---

## Architecture

```
Browser (React)  ──fetch──►  Express (/api/*)  ──key──►  Gemini API
       │                          │
       └──── setInterval 3s ──────┘  (in-memory market state)
```

The browser polls `/api/rates` every 3 seconds. All AI calls go through the Express server which holds `GEMINI_API_KEY` — the key is never in the client bundle.

---

## Getting Started

**Prerequisites:** Node.js 18+ and a Gemini API key.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

# 3. Run in development (Express + Vite on http://localhost:3000)
npm run dev
```

### Other Scripts

```bash
npm run lint     # Type-check with tsc --noEmit
npm run build    # Build client and bundle server to dist/
npm start        # Run the production build (node dist/server.cjs)
```

---

## Environment Variables

| Variable         | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `GEMINI_API_KEY` | Server-side key for all Gemini calls (never exposed to client) |
| `APP_URL`        | Public URL of the deployed app                      |

`.env` is gitignored; only `.env.example` is committed.

---

## Project Structure

```
src/
  App.tsx       # All UI: watchlist, charts, AI panels, shock simulator, tokenizer
  types.ts      # TypeScript interfaces (Currency, MarketState, Transaction, etc.)
  main.tsx      # React entry point
  index.css     # Tailwind 4 + custom scrollbars and animations
server.ts       # Express server, market simulation loop, all API endpoints
index.html      # Vite HTML shell
```

---

## Deployment

This is a Node server app (serves both API and built client), so deploy to a Node host — Cloud Run, Render, Railway, or Fly.io.

```bash
npm run build && npm start
```

The server reads `process.env.PORT` (falling back to 3000).

---

## License

Released under the MIT License.
