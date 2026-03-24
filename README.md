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
├── fixtures.ts                   # Custom Playwright fixtures (voucherPage, orderStatusPage, paymentMethods)
├── lib/
│   ├── paymentMethods.ts         # Platební metody — key → display name lookup
│   ├── routes.ts                 # URL cesty per varianta
│   ├── testData.ts               # Testovací data (PersonalInfo, GiftInfo)
│   └── timing.ts                 # Timeout konstanty pro web-first assertions
├── pages/
│   ├── OrderStatusPage.ts        # POM pro /status/ stránku po úspěšném submitu
│   └── VoucherPage.ts            # POM pro objednávkový formulář — abstrahuje CZ/WL rozdíly
└── smoke/
    ├── voucher-happy.spec.ts     # Happy path — všechny platební metody + gift
    └── voucher-unhappy.spec.ts   # Unhappy path — prázdný formulář, chybějící T&C
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

**Parameterized Projects + Fixtures:**
Platební metody a varianta projektu se definují v `playwright.config.ts` přes custom `use` options ([Playwright docs pattern](https://playwright.dev/docs/test-parameterize#parameterized-projects)). Custom fixtures (`tests/fixtures.ts`) injektují `voucherPage` a `paymentMethods` do testů. Spec soubory neimportují žádnou konfiguraci přímo — jen konzumují fixtures. Přidání nové varianty = nový project v configu, žádná změna v testech.

---

## Zjištění z exploratory testingu

Před psaním testů jsem provedla průzkum live aplikace — DOM inspekce, analýza selektorů a ověření chování formuláře.

### PL varianta — chybějící voucher stránka

PL varianta na `/voucher` zobrazuje chybovou stránku ("Przepraszamy, nie udało się załadować strony"). TASK.md nezmiňuje PL v seznamu platebních metod. Stránka `/sprawdz-voucher` existuje, ale slouží k ověření platnosti kódu (ekvivalent CZ `/overeni-poukazu`), ne k nákupu.

**Rozhodnutí:** Voucher testy pouze pro CZ + Whitelabel. PL projekt odstraněn z configu (vrátit zpět = přidat project do `playwright.config.ts`).

### URL — preview-qa-test

TASK.md definuje `preview-qa-test` URL. Původně přestaly resolvovat DNS a testy běžely proti `preprod`, ale po druhém review byly URL opraveny zpět na správné `preview-qa-test` prostředí.

**Rozhodnutí:** Testy běží proti `preview-qa-test` prostředí dle zadání.

| Varianta   | URL                                                     |
| ---------- | ------------------------------------------------------- |
| CZ         | `wa-fe-dzb-cz-preview-qa-test.azurewebsites.net`        |
| Whitelabel | `wa-fe-dzb-pluxee-cz-preview-qa-test.azurewebsites.net` |

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

5. **Server errors po submitu:**
   Na `preview-qa-test` prostředí formuláře úspěšně prochází až na `/status/` stránku. Happy path testy striktně vyžadují navigaci na `/status/` — server error i form validation error jsou FAIL.

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

---

## Refaktoring na základě code review feedbacku

Po odevzdání původní verze jsem obdržela feedback na kvalitu kódu. Následující sekce popisuje provedené změny.

### Co bylo vytknuto

1. **`waitForTimeout`** — 7 výskytů v kódu, schovaných za `TIMING` konstanty. Centralizace je lepší než magic numbers, ale samotný pattern je Playwright anti-pattern — čekání fixní doby místo čekání na konkrétní stav.
2. **Žádné fixtures** — `VoucherPage` se vytvářela přímo v testu (`new VoucherPage(page, projectName)`). Bez dependency injection se instanciace opakuje v každém testu.
3. **Payment methods v spec souborech** — import `PAYMENT_METHODS` + helper funkce `getProjectPaymentMethods()` přímo ve spec souborech. Testy věděly, odkud platební metody pocházejí.

### Co bylo provedeno

#### 1. Parameterized Projects + Custom Fixtures

Implementace dle [Playwright dokumentace](https://playwright.dev/docs/test-parameterize#parameterized-projects):

- **`tests/fixtures.ts`** — definuje `ProjectOptions` (`projectVariant`, `projectPaymentMethods`) jako `{ option: true }` a dvě fixtures: `voucherPage` (DI pro POM) a `paymentMethods` (resolvuje klíče na display names).
- **`playwright.config.ts`** — každý project definuje `projectVariant` a `projectPaymentMethods` v `use`. Typováno přes `defineConfig<ProjectOptions>`.
- **Spec soubory** — importují `test` z `../fixtures`, konzumují `voucherPage` a `paymentMethods` přes destructuring. Žádný přímý import `PAYMENT_METHODS`, žádný `test.skip(testInfo.project.name !== projectName)`.
- **Validace** — fixture throwne error pokud `projectVariant` chybí v configu (fail-fast místo tichého fallbacku na default).

**Výsledek:** přidání nové varianty = nový project v `playwright.config.ts`, žádná úprava spec souborů.

#### 2. Eliminace všech `waitForTimeout`

Všech 7 výskytů nahrazeno web-first assertions:

| Metoda                                   | Bylo                   | Nahrazeno čím                                                           |
| ---------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| `goto()` — po cookie dismiss             | `waitForTimeout(500)`  | Odstraněno — `expect(submitButton).toBeVisible()` níže slouží jako gate |
| `goto()` — po scrollu k formuláři        | `waitForTimeout(500)`  | `expect(submitButton).toBeVisible()`                                    |
| `toggleGiftOption()` — před klikem       | `waitForTimeout(300)`  | Odstraněno — Playwright `click()` čeká na actionability sám             |
| `toggleGiftOption()` — po zaškrtnutí     | `waitForTimeout(500)`  | `expect(giftRecipientName).toBeVisible()`                               |
| `selectPaymentMethod()` — před dropdown  | `waitForTimeout(500)`  | `expect(dropdownBtn).toBeVisible()`                                     |
| `selectPaymentMethod()` — mezi retries   | `waitForTimeout(500)`  | `expect(dropdownList).toBeHidden()`                                     |
| `expectUrlUnchanged()` — URL stabilizace | `waitForTimeout(1000)` | `expect(page).toHaveURL(regex)`                                         |

Nepoužívané timing konstanty (`shortDelay`, `mediumDelay`, `urlStabilize`) odstraněny z `timing.ts`.

#### 3. Oprava flaky WL empty form testu

WL varianta při validaci prázdného formuláře zobrazuje hlášku "Pole označená \* jsou povinná" místo `aria-invalid` atributů na polích. Pod zátěží (paralelní workers) se `aria-invalid` atributy nemusely nastavit včas, což způsobovalo flaky test.

**Fix:** `expectValidationErrorsVisible()` pro WL čeká na validační hlášku přes `getByText()` místo čekání na `aria-invalid` selektory.

#### 4. Cleanup

- **`paymentMethods.ts`** — odstraněny nepoužívané exporty (`getAllPaymentMethods`, `PROJECT_PAYMENT_METHODS`, `availableIn`, `uiPattern`, `ProjectType`). Zůstává jen `PaymentMethodType` a `PAYMENT_METHODS` (key → name lookup pro fixture).
- **`eslint.config.mts`** — přidán `ignores: ['playwright-report/**', 'test-results/**']`; odstraněn `playwright/no-wait-for-timeout: 'off'` (žádné `waitForTimeout` v kódu).
- **PL projekt** — odstraněn z `playwright.config.ts` a `package.json` scriptů (nemá voucher stránku).

---

## Druhé kolo úprav — code review + quality check

Po prvním refaktoringu proběhl další cyklus code review a quality check. Níže jsou popsané všechny provedené změny.

### 1. Strict happy path — `expectFormSubmitted`

Původní verze tiše akceptovala server error jako PASS ("form prošel validaci"). Happy path test by měl trvat na úspěchu, ne tolerovat selhání backendu.

**Fix:** `expectFormSubmitted` nyní striktně vyžaduje navigaci na `/status/`. Server error i form validation error jsou FAIL. Po úspěšné navigaci se ověřuje obsah status stránky přes `OrderStatusPage`.

### 2. Nový Page Object — `OrderStatusPage`

Přidán POM pro `/status/` stránku (`tests/pages/OrderStatusPage.ts`) s třemi assertion metodami:

- `expectOnStatusPage()` — ověřuje URL pattern `/status/{uuid}`
- `expectSummaryPricing()` — ověřuje viditelnost cenového souhrnu (CZ: heading "Rekapitulace" + "Celková cena", WL: `dl.summary-block` s cenou v Kč)
- `expectOrderIdentifier()` — ověřuje, že stránka zobrazuje pricing content (potvrzení zpracování objednávky)

`OrderStatusPage` je injektován přes fixture v `tests/fixtures.ts` jako `orderStatusPage`.

### 3. Odstranění `force: true` na checkboxech

Diagnostika prokázala, že T&C checkboxy nejsou překryté jiným elementem — `force: true` nebyl potřeba. Odstraněn z `checkRequiredTerms()`. Zůstává pouze na dropdown click (Vue custom select — pragmatický workaround).

### 4. baseURL opraveno na qa-test

`playwright.config.ts` přepnut z `*-preprod.azurewebsites.net` na `*-preview-qa-test.azurewebsites.net` dle zadání v TASK.md.

### 5. Lokátory přesunuty z spec souborů do POM

Unhappy path spec obsahoval raw lokátory (`page.locator('#cancellation-conditions')`, `page.getByText('zadejte prosím')` atd.), což porušovalo POM pravidlo. Přesunuty do nových metod v `VoucherPage`:

- `expectSpecificValidationMessage()` — ověřuje CZ-specifickou hlášku "zadejte prosím" / WL hlášku "Pole označená \* jsou povinná"
- `expectTermsNotChecked()` — ověřuje, že T&C checkboxy nejsou zaškrtnuté

### 6. Popisná chybová hláška na dropdown retry

Pokud se Vue custom dropdown neotevře po všech pokusech, Playwright nyní zobrazí `"Payment dropdown failed to open after N attempts"` místo generického timeout.

### 7. Komentář k `expectSummaryVisible`

Ověřeno, že obě varianty (CZ i WL) mají heading "Rekapitulace" na voucher stránce. Přidán komentář vysvětlující, proč metoda nepotřebuje variant branching.

### 8. ESLint — `assertFunctionPatterns` pro POM assertions

Unhappy spec po přesunu lokátorů do POM neobsahuje přímé `expect()` volání — pouze POM metody `voucherPage.expect*()`. ESLint `playwright/expect-expect` upraven na `assertFunctionPatterns: ['^expect']` pro rozpoznání assertion metod volaných přes member expressions. Odstraněny nepotřebné `no-conditional-in-test` a `no-conditional-expect` výjimky (podmínky přesunuty do POM).
