/* 

   bse by Richie 
*/

require('../config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const FileType = require('file-type');
const PhoneNumber = require('awesome-phonenumber');

const {
  jidNormalizedUser,
  proto,
  getBinaryNodeChildren,
  getBinaryNodeChild,
  generateWAMessageContent,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  delay,
  areJidsSameUser,
  extractMessageContent,
  generateMessageID,
  downloadContentFromMessage,
  generateWAMessageFromContent,
  jidDecode,
  generateWAMessage,
  toBuffer,
  getContentType,
  getDevice
} = require('@whiskeysockets/baileys');

const { randomBytes } = require('crypto');

function decodeJid(jid) {
  if (!jid) return jid;
  if (typeof jid !== 'string') return jid;
  return jidNormalizedUser(jid);
}

/**
 * Check if the sender is a bot owner/creator
 * @param {Object} m - message object
 * @returns {Boolean}
 */
function isCreator(m) {
  if (!m || !m.sender) return false;
  return [...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
}

async function LoadDataBase(rich, m) {
  try {
    const botNumber = decodeJid(rich?.user?.id || '');

    // Ensure global.db.settings exists and set default properties
    let setBot = global.db.settings;
    if (typeof setBot !== 'object') global.db.settings = {};
    setBot = global.db.settings;
    if (setBot) {
      if (!('anticall' in setBot)) setBot.anticall = false;
      if (!('available' in setBot)) setBot.available = false;
      if (!('autoread' in setBot)) setBot.autoread = false;
      if (!('autorecording' in setBot)) setBot.autorecording = false;
      if (!('autotyping' in setBot)) setBot.autotyping = false;
      if (!('unavailable' in setBot)) setBot.unavailable = false;
      if (!('readsw' in setBot)) setBot.readsw = false;
      if (!('mode' in setBot)) setBot.mode = true;
      if (!('send' in setBot)) setBot.send = false;
    } else {
      global.db.settings = {
        anticall: false,
        autoread: false,
        autorecording: false,
        autotyping: false,
        available: false,
        unavailable: false,
        readsw: false,
        mode: true,
        send: false
      };
    }

    // User data safety
    if (m?.sender) {
      let user = global.db.users[m.sender];
      if (typeof user !== 'object') global.db.users[m.sender] = {};
      user = global.db.users[m.sender];
      if (user) {
        if (!('banned' in user)) user.banned = false;
        if (!('setalive' in user)) user.setalive = '';
        if (!('warn' in user)) user.warn = 0;
      } else {
        global.db.users[m.sender] = {
          banned: false,
          setalive: '',
          warn: 0
        };
      }
    }

    // Group data safety
    if (m?.isGroup && m?.chat) {
      let group = global.db.groups[m.chat];
      if (typeof group !== 'object') global.db.groups[m.chat] = {};
      group = global.db.groups[m.chat];
      if (group) {
        if (!('antilink' in group)) group.antilink = false;
        if (!('antilink2' in group)) group.antilink2 = false;
        if (!('welcome' in group)) group.welcome = false;
        if (!('goodbye' in group)) group.goodbye = false;
        if (!('mute' in group)) group.mute = false;
        if (!('open' in group)) group.open = false;
        if (!('antitag' in group)) group.antitag = false;
        if (!('banned' in group)) group.banned = false;
      } else {
        global.db.groups[m.chat] = {
          antilink: false,
          antilink2: false,
          welcome: false,
          goodbye: false,
          mute: false,
          open: false,
          antitag: false,
          banned: false
        };
      }
    }
  } catch (e) {
    console.error("LoadDataBase Error:", e);
    throw e;
  }
}

module.exports = { LoadDataBase, decodeJid, isCreator };

// Hot-reload this file when it changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});