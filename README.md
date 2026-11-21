# Save the date: Marek & Paulo

Jednoduchá stránka na adrese **https://save.marekandpaulo.com**: datum, místo a formulář, kam hosté pošlou adresu pro pozvánku. Odpovědi se ukládají do tabulky Google Sheets.

## Co je kde

| Soubor | K čemu je |
|---|---|
| `index.html` | Celá stránka a formulář (otevírá se v okně přes stránku) |
| `css/style.css` | Vzhled. Barvy a fonty jsou nahoře v `:root` |
| `js/i18n.js` | Všechny texty ve 4 jazycích (CZ, EN, PT, DE) |
| `js/app.js` | Přepínání jazyků, přidávání doprovodu, odeslání formuláře |
| `js/config.js` | Adresa Apps Scriptu (krok 6). Dokud je prázdná, formulář běží jen jako ukázka |
| `apps-script/Code.gs` | Kód, který se vloží do Google Sheets a zapisuje odpovědi |
| `CNAME` | Říká GitHub Pages, na jaké doméně stránka běží |

Jazyk se vybere automaticky podle prohlížeče. Natvrdo ho jde nastavit v odkazu, třeba `?lang=pt`, což se hodí, když posíláš odkaz konkrétním lidem.

## Nastavení (krok za krokem)

1. ✅ **Porkbun: CNAME** `save` → `hoffmma5.github.io`
2. ✅ **GitHub: ověření domény** (TXT záznam `_github-pages-challenge-hoffmma5`)
3. ✅ **GitHub: nový repozitář** `save-the-date` (Public)
4. **Nahrát kód** (`git push`)
5. **Zapnout GitHub Pages** a nastavit doménu
6. **Google Sheet + Apps Script** pro formulář

Podrobný postup ke krokům 4 až 6 je v chatu s Claudem a doplní se sem.
