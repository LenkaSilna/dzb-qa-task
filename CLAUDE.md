# CLAUDE.md — dzb-qa-task

## Projekt

Playwright E2E testy pro **Dovolená za Benefity** — multivariant aplikace (CZ, PL, Whitelabel).
QA task pro Arvio Technologies.

## Příkazy

```bash
npm run test              # Spustit testy (default projekt)
npm run test:cz           # CZ varianta
npm run test:whitelabel   # Whitelabel varianta
npm run test:all-projects # Všechny varianty
npm run test:headed       # S viditelným prohlížečem
npm run test:ui           # Interaktivní UI mode
npm run test:report       # HTML report
npm run lint              # ESLint
npm run lint:fix          # ESLint + autofix
npm run format            # Prettier write
npm run format:check      # Prettier check
```

## Struktura

```
tests/
├── smoke/          # Spec soubory (*.spec.ts)
├── pages/          # Page Object Model
│   └── VoucherPage.ts
└── lib/            # Sdílené utility
    ├── paymentMethods.ts  # Platební metody per varianta
    ├── testData.ts        # Testovací data (PersonalInfo, GiftInfo)
    └── routes.ts          # URL cesty per varianta
```

## Konvence

- Page Object Model — lokátory NIKDY v spec souborech
- Testy se filtrují per projekt přes `test.skip(testInfo.project.name !== projectName)`
- Varianty CZ vs Whitelabel se řeší v page objektu (if/else na `this.project`)
- TypeScript strict, ESLint + Prettier
- Assertions: min. 3 per test, kontroluj stav UI, chybové hlášky, URL

## Sub-agenti

Projekt má nastavené sub-agenty v `.claude/agents/`:

- **test-writer** — psaní nových Playwright testů
- **code-review** — code review existujícího kódu
- **quality-check** — kontrola kvality (tsc, lint, prettier, best practices)
- **test-runner** — spouštění testů, analýza výsledků, oponování
- **lead** — kontrola splnění požadavků z TASK.md a README.md
