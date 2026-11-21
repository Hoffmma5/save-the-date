/**
 * Save the date: Marek & Paulo
 * Receives the form from save.marekandpaulo.com and writes one row per answer
 * into the first sheet of the Google Sheet this script belongs to.
 *
 * Setup: see README.md, step 6. After every change to this code you have to
 * publish a new version (Deploy → Manage deployments → Edit → New version).
 */

var HEADERS = [
  'Odesláno', 'Jméno', 'Skupina', 'Ulice', 'PSČ', 'Město', 'Země',
  'Poznámka', 'Jazyk'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // two people sending at once must not overwrite a row
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    var p = e.parameter;
    sheet.appendRow([
      new Date(),
      clean(p.name),
      clean(p.group),
      clean(p.street),
      clean(p.zip),
      clean(p.city),
      clean(p.country),
      clean(p.note),
      clean(p.lang)
    ]);

    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Keeps cells short and stops text starting with = + - @ from being read as a
// formula (someone could otherwise type a formula into the form).
function clean(value) {
  var s = String(value || '').slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
