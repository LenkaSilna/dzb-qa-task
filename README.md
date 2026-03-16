# Dovolená za Benefity — Playwright E2E Tests

Automatizované testy pro nákup voucheru na multivariant e-shopu "Dovolená za Benefity".
Pokrývá varianty **CZ** a **Whitelabel (Pluxee CZ)** — happy path pro všechny platební metody, gift option a unhappy path scénáře.

---

## Jak spustit

### Požadavky

- Node.js 20+
- npm

### Instalace

```bash
git clone <repo-url>
cd dzb-qa-task
npm install
npm run playwright:install
```

### Spuštění testů

```bash
# CZ varianta
npm run test:cz

# Whitelabel varianta
npm run test:whitelabel

# Obě varianty najednou
npm run test:all-projects

# S viditelným prohlížečem (debugging)
npm run test:all-projects:headed

# Interaktivní Playwright UI
npm run test:ui

# HTML report (po spuštění testů)
npm run test:report
```

### Code quality

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npx tsc --noEmit      # TypeScript
```

---

## Struktura a architektura testů

```
tests/
├── lib/
│   ├── paymentMethods.ts       # Platební metody — centrální definice s availableIn per projekt
│   ├── routes.ts               # URL cesty per varianta
│   ├── testData.ts             # Testovací data (PersonalInfo, GiftInfo)
│   └── timing.ts               # Timing konstanty — single source of truth, žádné hardcoded hodnoty
├── pages/
│   └── VoucherPage.ts          # Page Object Model — abstrahuje CZ/WL rozdíly
└── smoke/
    ├── voucher-happy.spec.ts   # Happy path — všechny platební metody + gift
    └── voucher-unhappy.spec.ts # Unhappy path — prázdný formulář, chybějící T&C
```

### Co testy pokrývají

| Scénář                                 |   CZ    | Whitelabel |
| -------------------------------------- | :-----: | :--------: |
| Happy path per platební metoda         | 6 testů |  3 testy   |
| Nákup jako dárek ("Kupuji jako dárek") | 1 test  |   1 test   |
| Submit prázdného formuláře + validace  | 1 test  |   1 test   |
| Submit bez T&C checkboxů               | 1 test  |   1 test   |
| **Celkem**                             |  **9**  |   **6**    |

### Architektonická rozhodnutí

**Page Object Model (POM):** 
Jeden `VoucherPage` pro obě varianty. CZ používá stabilní sémantické ID (`#customer-firstname`, `#voucher-value-1`), WL má dynamické Vue ID → selektory řešeny přes `getByLabel()` a `getByRole()`. Rozdíly jsou abstrahovány v POM metodách, spec soubory zůstávají čisté.

**Data-driven přístup:** 
Happy path iteruje přes platební metody z `paymentMethods.ts`. Přidání nové metody = 1 řádek v konfiguraci, žádná změna v testech.

**Projekt filtrování:** 
Spec soubory definují testy pro obě varianty, Playwright `test.skip()` zajistí, že se spustí jen relevantní testy pro daný projekt.

---

## Zjištění z exploratory testingu

Před psaním testů jsem provedla průzkum live aplikace — DOM inspekce, analýza selektorů a ověření chování formuláře.

### PL varianta — chybějící voucher stránka

PL varianta na `/voucher` zobrazuje chybovou stránku ("Przepraszamy, nie udało się załadować strony"). TASK.md nezmiňuje PL v seznamu platebních metod. Stránka `/sprawdz-voucher` existuje, ale slouží k ověření platnosti kódu (ekvivalent CZ `/overeni-poukazu`), ne k nákupu.

**Rozhodnutí:** Voucher testy pouze pro CZ + Whitelabel. PL projekt zůstává v configu pro budoucí rozšíření.

### URL — preview-qa-test vs preprod

TASK.md definuje `preview-qa-test` URL, ale tyto přestaly resolvovat DNS. `preprod` URL fungují spolehlivě a zobrazují stejný obsah.

**Rozhodnutí:** Testy běží proti `preprod` prostředí.

| Varianta   | URL                                             |
| ---------- | ----------------------------------------------- |
| CZ         | `wa-fe-dzb-cz-preprod.azurewebsites.net`        |
| Whitelabel | `wa-fe-dzb-pluxee-cz-preprod.azurewebsites.net` |

### Žádné data-testid atributy

Ani jedna varianta nepoužívá `data-testid`. CZ má stabilní sémantické ID (`#customer-firstname`, `#buy-as-gift`, `#cancellation-conditions`). WL má Vue-generované ID (`v-0-0-0-*`), které se mění dle renderovacího pořadí — proto jsou pro WL použity `getByLabel` a CSS class selektory.

### Technické problémy (vyřešené)

1. **PostHog feature flags re-render resetuje formulář:** 
Po načtení stránky PostHog SDK posílá request na `/_ph/flags/`. Response dorazí ~1-2s po `domcontentloaded` a Vue provede re-render, který resetuje stav radio buttonů (voucher value) na `unchecked`. Pokud uživatel stihne vybrat hodnotu poukazu před příchodem PostHog response, výběr se ztratí. Řešení v testech: `goto()` čeká na PostHog response (`waitForResponse('/_ph/flags')`) před jakoukoli interakcí. **Doporučení pro dev tým:** Vue store by měl preservovat user input při re-renderu po PostHog flags, nebo PostHog inicializovat před renderem formuláře.

2. **Checkbox labels s `<a>` linky (CZ):** 
T&C checkboxy obsahují `<a>` tagy s PDF odkazy. Klik na label sám o sobě PDF neotevírá, ale Playwright auto-scroll může trefit `<a>` element a způsobit nežádoucí navigaci (`?marketing=on`). Řešení: neutralizace `href` atributů před interakcí. Potenciální rozšíření: ověřit, že PDF odkazy jsou validní a vedou na správné dokumenty.

3. **Vue custom dropdown (CZ):** 
Platební metoda je custom Vue select komponent, který nereaguje na JS `click()`. Řešení: Playwright `click({ force: true })` s retry logikou (5 pokusů).

4. **Odlišná DOM struktura WL:** 
WL nemá `#voucher-form`, formulář je `<form class="@container">`. Řešení: odlišný form selector per varianta v POM.

5. **Preprod server errors:** 
Některé platební metody vrací server error po submit ("Nastala neznámá chyba"). Toto je akceptovatelné — znamená to, že formulář prošel client-side validací a byl odeslán na backend. Naopak form validation error ("V objednávkovém formuláři se vyskytují chyby") vždy znamená FAIL — chybí povinná pole nebo checkboxy.

---

## Jak jsem využila AI

Projekt byl vytvořen ve spolupráci s **Claude Code** (Anthropic CLI). AI bylo klíčovým nástrojem v celém procesu:

**Exploratory testing:** 
Claude spouštěl diagnostické skripty přímo proti live stránkám — automatizovaná inspekce DOM, identifikace selektorů, mapování platebních metod z dropdownu a analýza struktury checkbox labels.

**Iterativní debugging:** 
Po každém test runu Claude analyzoval chybové výstupy a screenshoty z Playwright reportu. Diagnostikoval root cause (např. Playwright auto-scroll trefil `<a>` element v checkbox labelu → nežádoucí navigace) a navrhl fix. Tento cyklus (run → analyze → fix) proběhl ~8× než byly všechny testy stabilní.

**Architektura:** 
Claude navrhl POM strukturu s abstrakcí CZ/WL rozdílů, data-driven přístup pro platební metody a strategii pro řešení Vue-specifických problémů (dropdown retry, JS checkbox manipulation).

**Specializovaní sub-agenti:** 
Pro systematickou práci jsem si nastavila vlastní Claude Code sub-agenty — test-writer (psaní testů), code-review (review kódu), quality-check (lint, tsc, best practices), test-runner (spouštění a analýza výsledků) a lead (kontrola splnění požadavků z TASK.md). Každý agent měl definovaný scope a instrukce, což zajistilo konzistentní kvalitu výstupů.

**Můj podíl:**
Definovala jsem požadavky, validovala rozhodnutí (např. přepnutí na preprod URL) a kontrolovala kvalitu kódu. Požadovala jsem, aby testy vyplňovaly formulář sekvenčně jako reálný uživatel — ne přeskakováním do sekcí nebo přímým nastavováním hodnot. Když Claude původně navrhl tolerovat server errory jako PASS, zamítla jsem to — testy musí ověřovat správné odeslání formuláře. Díky tomu jsme odhalili race condition — Vue re-render po příchodu PostHog flags resetoval uživatelský input ve formuláři. Claude byl efektivní na mechanickou práci (DOM inspekce, iterativní fixing), já jsem řídila strategii a kvalitu výstupů.

---

## Reflexe

S více časem bych se zaměřila na následující oblasti:

1. Přidala bych **data-testid atributy** jako doporučení pro dev tým — eliminovalo by to většinu flakiness a zjednodušilo selektory na obou variantách.
2. Rozšířila bych unhappy path o **edge cases** (neplatný email, krátký telefon, speciální znaky v adrese) a **assertions na konkrétní chybové hlášky per pole** — nejen obecný počet chyb, ale ověření textu "povinné pole" / "zadejte prosím" u každého povinného fieldu.
3. Implementovala bych **API mocking** pro platební gateway, aby happy path testy nezávisely na stavu preprod backendu.
4. Přidala bych **accessibility testy** — keyboard navigation formulářem, správné ARIA atributy na custom dropdown komponentech.
5. Vyřešila bych Vue dropdown stabilitu elegantněji — buď custom Playwright fixture, nebo request interception místo retry smyčky s `force: true`.
6. Gift option test pro WL by mohl kontrolovat **WL-specifické success/error texty** — aktuálně obě varianty sdílejí stejný assertion flow, ale WL může mít odlišné formulace.
