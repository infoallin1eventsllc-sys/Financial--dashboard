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

</div>

---

A full-stack, real-time global currency dashboard tracking **17 currencies** across Fiat, Crypto, and CBDC categories. Features live market simulation, AI-powered macroeconomic analysis, and an interactive shock simulator — all built from scratch without a charting template.

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
- **KPI row** — Converted Corporate Revenue, 24H Velocity, Active Clients, Digital Asset/CBDC Ratio

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

- Custom headline override for any free-form crisis scenario
- High-fidelity offline fallback presets when Gemini is unavailable
- One-click "Resolve & Reset" clears the crisis banner instantly

### Business Dashboard
- **Sales Ledger** — auto-generated real-time transactions + manual sale logger; full-text search, status filter, sort by value or recency
- **Currency Converter** — cross-asset calculator with swap button; converts via USD bridge
- **Quantum Calendar** — macro event timeline with block numbers, volatility index, and animated status indicators
- **AI Research Lab + Tokenizer** — research a speculative asset with AI, auto-fill parameters, then deploy it live to the watchlist

### Data Export
- Export transactions as **CSV** or **JSON**
- Export all exchange rates as **CSV**

### API Resiliency
- `generateContentWithRetry` — exponential backoff with configurable retries and delay
- Full offline fallback for every Gemini endpoint
- Live telemetry monitor panel (latency, request counter, fail-protection status)

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Recharts, lucide-react |
| Backend | Node.js, Express, Vite dev middleware |
| AI | Google Gemini (`@google/genai` — `gemini-2.0-flash`) via server proxy |
| Tooling | Vite 6, esbuild, tsx |

---

## Architecture

```
Browser (React)  ──fetch──►  Express (/api/*)  ──key──┺  Gemini API
       │                          │
       └──── setInterval 3s ──────┘  (in-memory market state)
```

- Browser polls `/api/rates` every 3 seconds for live rate updates
- All AI calls route through Express — `GEMINI_API_KEY` stays server-side only
- Market simulation runs in a Node.js `setInterval` loop with per-asset volatility coefficients
- New transactions auto-generated every ~12 seconds; capped at 25 entries in memory

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
npm run lint     # Type-check with tsc --noEmit
npm run build    # Build client + bundle server to dist/
npm start        # Run production build (node dist/server.cjs)
```

---

## Project Structure

```
src/
  App.tsx       # All UI — watchlist, charts, AI panels, shock simulator, tokenizer
  types.ts      # TypeScript interfaces (Currency, MarketState, Transaction, etc.)
  main.tsx      # React entry point
  index.css     # Tailwind 4 + custom scrollbar and animation utilities
server.ts       # Express server, market simulation loop, all /api/* endpoints
index.html      # Vite HTML entry shell
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Server-side key for Gemini AI — never exposed to the client |
| `APP_URL` | Public URL of the deployed app |

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
