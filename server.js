
const mainMenu = 'منوی اصلی';
const langChange = 'تغییر زبان مقصد';

const mainMenuMsg = 'یک جمله به هر زبونی وارد کن تا برات ترجمه کنم.😉';
const langChangeMsg = 'زبونی مقصدتو تایپ کن یا از منوی زیر انتخاب کن🤓';
const langChangedMsg = '🌐زبان تغییر کرد به '
const waitMsg = 'یکم صبر کن الان جواب میدم🤔';
const unknownLangMsg = 'این زبونو نشناختم😓';
const sourceLang = 'زبان مبدا🌐';
const langs = require('langs');
const fs = require('fs');
const express = require('express');
const app = express();
const Botgram = require('botgram');
const translate = require('google-translate-query');

var currentState = mainMenu;
var lang='فارسی';

//#region keyboards
var mainKeyboard =[
  [langChange],

];
var langsKeyboard = [
  [ mainMenu],
  [ 'فارسی','English'],
  [ 'Español', 'العربية'],
  [ 'Français','Türkçe'],
];

//#endregion

const { TELEGRAM_BOT_TOKEN } = process.env;
if (!TELEGRAM_BOT_TOKEN) {
  console.error('Seems like you forgot to pass Telegram Bot Token. I can not proceed...');
  process.exit(1);
}
const bot = new Botgram(TELEGRAM_BOT_TOKEN);
// Imports the Google Cloud client library
var googleTTS = require('google-tts-api');



//#region my functions

function showLangChangeMenu(msg,reply) {
  currentState = langChange;
  reply.keyboard(langsKeyboard, true).text(langChangeMsg);
}

function showMainMenu(msg,reply) {
  currentState = mainMenu;
  reply.keyboard(mainKeyboard, true).text(mainMenuMsg);
}

function changeLang(passedLang,reply) {
  if(langs.has("local",passedLang))
    lang = passedLang;
  else {
    reply.markdown(unknownLangMsg);
    return;
  }
  reply.markdown(langChangedMsg + ' ' + passedLang);
}


function getLangByParams(firstParam,secondParam) {
  try {
    return langs.where(firstParam,secondParam);
  } catch (error) {
    return secondParam;
  }
}

function replyTranslation(query,reply) {
  translate(query, {to: getLangByParams("local",lang)[1]}).then(res => {
    reply.markdown(res.text)
    reply.markdown(sourceLang+ ' '+  getLangByParams('1',res.from.language.iso).local);
}).catch(err => {
    console.error(err);
});
}
//#endregion


//#region bot callbacks

bot.command('start',function name(msg,reply,next) {
  showMainMenu(msg,reply);
})

function onMessage(msg, reply) {
  switch (msg.text) {
    case mainMenu:
      {
        showMainMenu(msg,reply);
        return;
      }
      case langChange:
      {
        showLangChangeMenu(msg,reply);
        return;
      }
      default:
      break;
  }
  switch (currentState) {
    case mainMenu:
      {
        replyTranslation(msg.text,reply);
        break;
      }
      case langChange:
      {
        changeLang(msg.text,reply);
        break;
      }
    default:
      break;
  }
}
bot.text(onMessage);
//#endregion
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
});
app.get('/', function(request, response) {
  console.log('resp');
  response.end('hello');
});