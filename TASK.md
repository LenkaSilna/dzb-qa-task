# QA Automation Task

## Kontext

Jedním z našich produktů je **Dovolená za Benefity** — multivariant aplikace s:

- Více variantami, které vypadají podobně
- Kompletně vizuálně odlišným whitelabelem
- Různými platebními metodami dle varianty

**Varianty produktu:**

| Projekt    | URL                                                   |
| ---------- | ----------------------------------------------------- |
| CZ         | https://wa-fe-dzb-cz-preprod.azurewebsites.net        |
| PL         | https://wa-fe-dzb-pl-preprod.azurewebsites.net        |
| Whitelabel | https://wa-fe-dzb-pluxee-cz-preprod.azurewebsites.net |

---

## Úkol: Praktická implementace v Playwrightu

**Časový limit: 4 hodiny** — TOTO JE TVRDÝ LIMIT. Kandidátovi, který k nám nastoupí čas proplatíme.

Ve spolupráci s AI vytvoř automatizované testy pro náš produkt.

### Nákup voucheru (`/voucher` stránka)

Stránka `/voucher` slouží k nákupu voucheru.
Platební metody se liší dle varianty — viz `tests/lib/paymentMethods.ts`.

**Happy path** — pokryj úspěšný nákup pro každou dostupnou platební metodu dané varianty:

- CZ: Benefitní karta Edenred, Edenred Benefity Premium (Cafeterie), Benefitní karta Pluxee, Benefitní karta UP, Platební karta, Převodem z účtu
- Whitelabel: Benefitní karta Pluxee, Platební karta, Převodem z účtu

Jeden z happy path testů pokryj s volbou **"Kupuji jako dárek"** — tato možnost odhalí další povinná pole (Jméno obdarovaného, Vzkaz).

**Unhappy path** — pokryj alespoň tyto scénáře:

- Odeslání formuláře s chybějícím povinným polem
- Odeslání bez zaškrtnutí povinných T&C checkboxů

**Důležité:** Chceme vidět, že testy kontrolují více věcí v každém kroku — nejen "klikni a nespadlo to", ale i konkrétní assertions na stav UI, chybové hlášky nebo změnu URL.

---

## Technické požadavky

- Framework: **Playwright + TypeScript** (povinně)
- Testy musí skutečně fungovat proti live produktu (URL výše)
- Prostředí je **preprod** — formulář vyplň a odešli, ale neklikej na tlačítko platby (stačí nám odeslání objednávky)
- Produkt je veřejný, nepotřebuješ credentials
- Řeš rozdíly mezi variantami — způsob řešení je na tobě, ale je pro nás důležitý
- Spuštění pouze lokálně (bez CI/CD setup)
- Reporting: stačí Playwright default report
- Kód musí být čitelný a maintainovatelný

## Co odevzdej

1. GitHub repository s funkčním kódem testů - udělej si fork tohoto repa
2. README s:
   - Instrukcemi jak spustit
   - Popisem struktury a architektury testů
   - Popisem jak jsi využil/a AI v procesu tvorby
   - Stručnou reflexí (3–5 vět) — co bys dělal/a jinak, pokud bys měl/a víc času

## Hodnotíme

- Kvalitu a strukturu kódu
- Dobrý základ pro budoucí rozšiřitelnost
- Řešení rozdílů mezi variantami produktu
- Schopnost efektivně využít AI
- Praktičnost řešení pro reálné nasazení

---

## Důležité poznámky

- Ptej se, pokud ti cokoliv není jasné
- **4 hodiny jsou skutečné maximum** — raději odevzdat méně, ale v limitu
- Očekáváme aktivní využití AI — zajímá nás, jak s ním umíš pracovat
- **Pokud narazíš na nejasnost:** Udělej rozumné rozhodnutí a zdokumentuj ho v README. Chceme vidět tvůj problem-solving a komunikační schopnosti.
