/*
 * Telegram Bot - Google Apps Script
 * ***********************************************************************************
 * Code by    : fahroni|ganteng
 * Contact me : fahroniganteng@gmail.com
 * YouTube    : https://www.youtube.com/c/FahroniGanteng
 * Github     : https://github.com/fahroniganteng
 * Date       : Sep 2021
 * License    : MIT
 */


var token = '----- isikan token dari botFather ----';

// only need to run once
function setWebhook() {
  // only to create permission
  let drive = DriveApp.getRootFolder();

  let Bot = new TelegramBot();
  let result = Bot.request('setWebhook', {
    url: 'https://script.google.com/macros/s/-----------ID-file----------/exec'
  });
  Logger.log(result);
}

// Global variable to store post data from telegram
var TelegramData;
function doPost(e) {
  // check valid request
  if (!validRequest_(e)) return;

  let Bot = new TelegramBot();
  let Cmd = TelegramData.message.text;

  // Start process request
  if (Cmd == '/start') {
    let text =
      'Selamat datang di bot\n' +
      '<b>DEMO JADWAL</b>\n\n' +
      'Congratulations! It works!\nPlease run command /help to start using bot.'
      ;
    Bot.sendMessage(text, 'HTML');
  }
  else if (Cmd == '/help') {
    let text =
      '<b>Perintah</b>\n' +
      '/start - Bot Info\n' +
      '/help - Manual bot\n\n' +
      '/jadwal -  Jadwal hari ini\n' +
      '/kelas - Jadwal per kelas\n'
      ;
    Bot.sendMessage(text, 'HTML');
  }
  else if (Cmd == '/jadwal') {
    Bot.sendMessage(new jadwal().getJadwalAllKelas(), 'HTML');
  }
  else if (Cmd == '/kelas') {
    Bot.sendMessageKeyboard('Silakan memilih kelas / bidang.', new jadwal().getKelas());
  }
  else {
    Bot.sendMessageKeyboard(new jadwal().getJadwalKelas(Cmd), false, 'HTML');
  }
}


function validRequest_(e) {
  // Only response if type is text message
  try {
    if (e.postData.type == 'application/json') {
      TelegramData = JSON.parse(e.postData.contents);
      return typeof TelegramData.message.text != 'undefined';
    }
    else return false;
  }
  catch (e) {
    return false;
  }
}



/**
 * Telegram Bot function
 * ******************************************
 */
class TelegramBot {
  request(method, data) {
    let options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(data)
    };
    let response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/' + method, options);
    if (response.getResponseCode() == 200) {
      return JSON.parse(response.getContentText());
    }
    return false;
  }
  sendMessage(text, mode) {
    // mode (string): HTML, Markdown, MarkdownV2
    // https://core.telegram.org/bots/api#formatting-options
    mode = mode || 'None';
    return this.request('sendMessage', {
      'chat_id': TelegramData.message.from.id,
      'text': text,
      'parse_mode': mode
    });
  }
  sendLocation(latitude, longitude) {
    return this.request('sendLocation', {
      'chat_id': TelegramData.message.from.id,
      'latitude': latitude,
      'longitude': longitude
    });
  }
  sendDice() {
    return this.request('sendDice', {
      'chat_id': TelegramData.message.from.id,
    });
  }
  sendMessageKeyboard(text, keyboard, mode) {
    mode = mode || 'None';
    keyboard = keyboard ?
      { 'keyboard': keyboard } :
      { 'remove_keyboard': true };
    return this.request('sendMessage', {
      'chat_id': TelegramData.message.from.id,
      'text': text,
      'parse_mode': mode,
      'reply_markup': JSON.stringify(keyboard)
    });
  }
}


class jadwal {
  constructor() {
    this.ws = SpreadsheetApp.getActive().getSheetByName('Jadwal User');
    this.lastRow = SpreadsheetApp.getActive().getSheetByName('SETTING')
      .getRange('B5').getValue();
    this.timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  }
  getArrTgl() {
    let timeZone = this.timeZone;
    return this.ws.getRange(2, 1, this.lastRow, 1).getValues().map(function (r) {
      return Utilities.formatDate(new Date(r[0]), timeZone, 'yyyy-MM-dd');
    });
  }
  getHeader() {
    return this.ws.getRange(1, 2, 1, 3).getValues()[0];
  }
  getJadwalAllKelas() {
    let now = new Date();
    let today = Utilities.formatDate(now, this.timeZone, 'yyyy-MM-dd');
    let indexToday = this.getArrTgl().indexOf(today);

    if (indexToday >= 0) {
      let text = 'Tanggal ' + Utilities.formatDate(now, this.timeZone, 'dd MMM yyyy') + '\n';
      text += '-------------------------------------\n';
      let data = this.ws.getRange(indexToday + 2, 2, 1, 3).getValues()[0];
      this.getHeader().forEach(function (e, i) {
        text += '<b>' + e + '</b>\n';
        if (data[i])
          text += data[i] + '\n\n';
        else
          text += 'tidak ada jadwal\n\n';
      });
      return text;
    }
    else
      return 'Jadwal hari ini tidak ditemukan';
  }
  getKelas() {
    let keyboard = [];
    this.getHeader().forEach(function (e) {
      keyboard.push([{ 'text': e }])
    });
    return keyboard;
  }
  getJadwalKelas(kelas) {
    // let kelas = 'Kelas 1';
    let now = new Date();
    let today = Utilities.formatDate(now, this.timeZone, 'yyyy-MM-dd');
    let indexToday = this.getArrTgl().indexOf(today);
    let indexHeader = this.getHeader().indexOf(kelas);

    if (indexToday >= 0 && indexHeader >= 0) {
      let data = this.ws.getRange(indexToday + 2, indexHeader + 2).getValue();
      let text = '<b>Jadwal</b> \n';
      text += 'Tanggal : ' + Utilities.formatDate(now, this.timeZone, 'dd MMM yyyy') + '\n';
      text += 'Kelas : ' + kelas + '\n\n';
      if(data)
        text += data + '\n';
      else 
        text += 'tidak ada jadwal\n';
      return text;
    }
    else
      return 'Jadwal hari ini untuk kelas ' + kelas + 'tidak ditemukan';
  }
}
