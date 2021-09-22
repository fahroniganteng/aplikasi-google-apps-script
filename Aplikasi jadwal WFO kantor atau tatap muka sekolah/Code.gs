/*
 * App Jadwal - Google Apps Script
 * ***********************************************************************************
 * Code by    : fahroni|ganteng
 * Contact me : fahroniganteng@gmail.com
 * YouTube    : https://www.youtube.com/c/FahroniGanteng
 * Github     : https://github.com/fahroniganteng
 * Date       : Sep 2021
 * License    : MIT
 */

function doGet() {
  let template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getJadwal(tgl) {
  // let tgl = '2021-01-04';
  let ws = SpreadsheetApp.getActive().getSheetByName('Jadwal User');
  let lastRow = SpreadsheetApp.getActive().getSheetByName('SETTING')
    .getRange('B5').getValue();

  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  let arrTgl = ws.getRange(2, 1, lastRow, 1).getValues().map(function (r) {
    return Utilities.formatDate(new Date(r[0]), timeZone, 'yyyy-MM-dd');
  });

  let indexTgl = arrTgl.indexOf(tgl);
  if (indexTgl >= 0) {
    let header = ws.getRange(1, 2, 1, 3).getValues()[0];
    let data = ws.getRange(indexTgl + 2, 2, 1, 3).getValues()[0];
    return [header, data];
  }
  else
    return false;
}

