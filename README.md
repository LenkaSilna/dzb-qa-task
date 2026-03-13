# Dovolená za Benefity — Playwright Tests

## Setup

### Požadavky

- Node.js 20+
- npm
- Testujeme pouze desktop, stačí jeden prohlížeč (výchozí je Chromium)

### Instalace

1. Naklonuj repo
2. `npm install`
3. `npm run playwright:install`

## Spuštění

```bash
# Všechny projekty
npm run test:all-projects

# Všechny projekty s viditelným prohlížečem
npm run test:all-projects:headed

# Jeden projekt
npm run test:cz
npm run test:pl
npm run test:whitelabel

# S viditelným prohlížečem
npm run test:headed

# Interaktivní UI mode
npm run test:ui

# HTML report
npm run test:report
```

## Code quality

```bash
# Lint
npm run lint
npm run lint:fix

# Formátování
npm run format
npm run format:check
```

## Struktura projektu

```text
benefity/
├── tests/
│   ├── lib/
│   │   ├── paymentMethods.ts   # Platební metody per varianta
│   │   └── routes.ts           # URL cesty per varianta
│   └── smoke/
│       └── voucher.spec.ts     # Testy nákupu voucheru
├── eslint.config.mts
├── playwright.config.ts        # Konfigurace 3 projektů (cz/pl/whitelabel)
├── package.json
├── tsconfig.json
└── TASK.md                     # Zadání
```

Viz `TASK.md` pro zadání.
