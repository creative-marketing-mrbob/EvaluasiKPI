const DATABASE_SHEET_NAME = 'Database';
const HISTORY_SHEET_NAME = 'History';
const SUMMARY_SHEET_NAME = 'Sheet1';
const DATABASE_HEADERS = ['key', 'json', 'updated_at'];
const HISTORY_HEADERS = ['timestamp', 'member_id', 'member_name', 'month', 'type', 'note'];
const SUMMARY_HEADERS = ['month', 'member_id', 'member_name', 'type', 'note'];

function doGet(e) {
  const action = e.parameter.action || 'getState';
  const callback = e.parameter.callback;

  if (action !== 'getState') {
    return respond({ ok: false, error: 'Unknown action' }, callback);
  }

  return respond({ ok: true, sheets: getState() }, callback);
}

function doPost(e) {
  const payload = JSON.parse((e.postData && e.postData.contents) || '{}');

  if (payload.action !== 'saveState') {
    return respond({ ok: false, error: 'Unknown action' });
  }

  saveState(payload.sheets || []);
  writeHistory(payload.sheets || []);
  writeSummary(payload.sheets || []);

  return respond({ ok: true });
}

function getState() {
  const sheet = getDatabaseSheet();
  const values = sheet.getDataRange().getValues();
  const row = values.find((item) => item[0] === 'state');
  if (!row || !row[1]) return [];
  return JSON.parse(row[1]);
}

function saveState(sheets) {
  const sheet = getDatabaseSheet();
  const json = JSON.stringify(sheets);
  const now = new Date();
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row) => row[0] === 'state');

  if (rowIndex === -1) {
    sheet.appendRow(['state', json, now]);
    return;
  }

  sheet.getRange(rowIndex + 1, 1, 1, 3).setValues([['state', json, now]]);
}

function writeHistory(sheets) {
  const sheet = getHistorySheet();
  sheet.clearContents();
  sheet.getRange(1, 1, 1, HISTORY_HEADERS.length).setValues([HISTORY_HEADERS]);

  const rows = [];
  sheets.forEach((memberSheet) => {
    (memberSheet.evaluations || []).forEach((note) => {
      rows.push([
        new Date(),
        memberSheet.id,
        memberSheet.name,
        memberSheet.month,
        'Evaluasi',
        note,
      ]);
    });

    (memberSheet.appreciations || []).forEach((note) => {
      rows.push([
        new Date(),
        memberSheet.id,
        memberSheet.name,
        memberSheet.month,
        'Apresiasi',
        note,
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, HISTORY_HEADERS.length).setValues(rows);
  }
}

function writeSummary(sheets) {
  const sheet = getSummarySheet();
  sheet.clearContents();
  sheet.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);

  const rows = [];
  sheets.forEach((memberSheet) => {
    (memberSheet.evaluations || []).forEach((note) => {
      rows.push([
        memberSheet.month,
        memberSheet.id,
        memberSheet.name,
        'Evaluasi',
        note,
      ]);
    });

    (memberSheet.appreciations || []).forEach((note) => {
      rows.push([
        memberSheet.month,
        memberSheet.id,
        memberSheet.name,
        'Apresiasi',
        note,
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, SUMMARY_HEADERS.length);
}

function getDatabaseSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(DATABASE_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(DATABASE_SHEET_NAME);
  sheet.getRange(1, 1, 1, DATABASE_HEADERS.length).setValues([DATABASE_HEADERS]);
  return sheet;
}

function getHistorySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(HISTORY_SHEET_NAME);
  sheet.getRange(1, 1, 1, HISTORY_HEADERS.length).setValues([HISTORY_HEADERS]);
  return sheet;
}

function getSummarySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SUMMARY_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SUMMARY_SHEET_NAME, 0);
  sheet.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
  return sheet;
}

function respond(data, callback) {
  const body = callback
    ? `${callback}(${JSON.stringify(data)});`
    : JSON.stringify(data);

  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
