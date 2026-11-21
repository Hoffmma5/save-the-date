# Save the date: Marek & Paulo

Jednoduchá stránka na adrese **https://save.marekandpaulo.com**: datum, místo a formulář, kam hosté pošlou adresu pro pozvánku. Odpovědi se ukládají do tabulky Google Sheets.

## Co je kde

| Soubor | K čemu je |
|---|---|
| `index.html` | Celá stránka a formulář (otevírá se v okně přes stránku) |
| `css/style.css` | Vzhled. Barvy a fonty jsou nahoře v `:root` |
| `js/i18n.js` | Všechny texty ve 4 jazycích (CZ, EN, PT, DE) |
| `js/app.js` | Přepínání jazyků, kroky formuláře, seznam hostů, odeslání |
| `js/config.js` | Adresa Apps Scriptu (krok 6). Dokud je prázdná, formulář běží jen jako ukázka |
| `apps-script/Code.gs` | Kód, který se vloží do Google Sheets a zapisuje odpovědi |
| `guests.csv` | Seznam hostů pro krok 2 formuláře (sloupce `name,group`) |
| `CNAME` | Říká GitHub Pages, na jaké doméně stránka běží |

Jazyk se vybere automaticky podle prohlížeče. Natvrdo ho jde nastavit v odkazu, třeba `?lang=pt`, což se hodí, když posíláš odkaz konkrétním lidem.

## Formulář a seznam hostů

Formulář má tři kroky:
1. **Skupina:** Česká rodina / Família portuguesa / Friends who are basically family.
2. **Jméno:** seznam z `guests.csv` vyfiltrovaný podle skupiny. Od tohoto kroku je formulář v jazyce skupiny (cz → čeština, pt → portugalština, friends → angličtina). Když je ve skupině víc než 8 položek, objeví se vyhledávání.
3. **Adresa:** ulice, PSČ, město, země (povinné; země se předvyplní podle skupiny) a nepovinná poznámka.

`guests.csv` jde upravovat v Excelu. Ulož ho jako **CSV UTF-8**, jinak se rozbijí háčky. Oddělovač může být čárka i středník. První sloupec `name` je text, který se ukáže v seznamu (třeba „Jana Nováková + Petr Novák“), druhý sloupec `group` má hodnoty `cz`, `pt` nebo `friends`.

⚠️ Seznam je veřejný: kdokoli si může otevřít `save.marekandpaulo.com/guests.csv` nebo ho najít v repozitáři. Obsahuje jen jména.

## Nastavení (krok za krokem)

1. ✅ **Porkbun: CNAME** `save` → `hoffmma5.github.io`
2. ✅ **GitHub: ověření domény** (TXT záznam `_github-pages-challenge-hoffmma5`)
3. ✅ **GitHub: nový repozitář** `save-the-date` (Public)
4. **Nahrát kód** (`git push`)
5. **Zapnout GitHub Pages** a nastavit doménu
6. **Google Sheet + Apps Script** pro formulář

Podrobný postup ke krokům 4 až 6 je v chatu s Claudem a doplní se sem.
