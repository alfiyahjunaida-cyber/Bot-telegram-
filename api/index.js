// BOT DEPLOY BY KIMZ 🗿 - NAMA ACAK OTOMATIS!

const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

let hostedBots = new Map();
let currentBotToken = process.env.BOT_TOKEN || '';

const keys = { vercel: [], gemini: [] };
function addKey(type, token, by) {
  if (keys[type].some(k => k.key === token)) return false;
  keys[type].push({ key: token, by: by, dipakai: 0 });
  return true;
}

function getVercelToken() {
  if (keys.vercel.length === 0) {
    if (process.env.VERCEL_TOKEN_1) {
      return { token: process.env.VERCEL_TOKEN_1, nomor: 1, by: 'OWNER (Env)', dipakai: 0 };
    }
    return null;
  }
  keys.vercel.sort((a, b) => a.dipakai - b.dipakai);
  let k = keys.vercel[0];
  k.dipakai++;
  let nomor = keys.vercel.indexOf(k) + 1;
  return { token: k.key, nomor: nomor, by: k.by, dipakai: k.dipakai };
}

// BIKIN NAMA ACAK!
function bikinNamaAcak() {
  const huruf = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let acak = '';
  for (let i = 0; i < 6; i++) {
    acak += huruf[Math.floor(Math.random() * huruf.length)];
  }
  return `kimz-${acak}`;
}

async function deployBersih(fileBuffer, projectName, token) {
  try {
    await fetch(`https://api.vercel.com/v9/projects`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName, framework: null })
    });
  } catch (e) {}

  const res = await fetch(
    `https://api.vercel.com/v13/deployments?project=${projectName}&skipAutoDetectionConfirmation=1`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectName,
        files: [{ file: 'index.html', data: fileBuffer.toString('base64'), encoding: 'base64' }],
        projectSettings: { framework: null },
        target: 'production'
      })
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return `https://${projectName}.vercel.app`;
}

function makeBot(token) {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    return ctx.reply(
      `👋 Halo ${ctx.from.first_name}!\n🤖 Bot deploy by kimz! 🗿\n\nKirim aja file .html lu!\nLangsung jadi web! Nama nya acak otomatis!\n\nKetik /deploy dulu wok!`,
      { reply_markup: { inline_keyboard: [
        [{ text: '🚀 DEPLOY WEB (Nama Acak)', callback_data: 'deploy' }],
        [{ text: '🔑 LIST KEY ∞', callback_data: 'listkey' }],
      ]}}
    );
  });

  bot.action('deploy', (ctx) => {
    ctx.answerCbQuery();
    userState.set(ctx.from.id, { step: 'wait_file' });
    return ctx.reply(`🚀 GAS DEPLOY!\nKirim file .html lu sekarang wok!\nNanti nama web nya acak otomatis! Contoh: kimz-a1b2c3.vercel.app`);
  });

  bot.action('listkey', (ctx) => { ctx.answerCbQuery(); return sendListKey(ctx); });
  bot.command('listkey', (ctx) => sendListKey(ctx));
  bot.command('deploy', (ctx) => {
    userState.set(ctx.from.id, { step: 'wait_file' });
    return ctx.reply(`🚀 GAS DEPLOY!\nKirim file .html lu sekarang wok!`);
  });

  bot.command('setkey', (ctx) => {
    const args = ctx.message.text.split(' ');
    const type = args[1] ? args[1].toLowerCase() : null;
    const key = args[2];
    if (!type || !key) return ctx.reply(`Cara: /setkey vercel TOKEN_LU`);
    if (!keys[type]) return ctx.reply(`❌ Type cuma: vercel / gemini`);
    const by = `@${ctx.from.username || ctx.from.first_name}`;
    if (!addKey(type, key, by)) return ctx.reply(`❌ Token udah ada!`);
    return ctx.reply(`✅ Token ${type} ke simpen! Jadi key ke-${keys[type].length}!\nBy: ${by}`);
  });

  bot.command('delkey', (ctx) => {
    const args = ctx.message.text.split(' ');
    const type = args[1] ? args[1].toLowerCase() : null;
    const index = parseInt(args[2]) - 1;
    if (!type || isNaN(index)) return ctx.reply(`Cara: /delkey vercel 1`);
    if (!keys[type] || !keys[type][index]) return ctx.reply(`❌ Nomor gak ada!`);
    const hapus = keys[type].splice(index, 1)[0];
    return ctx.reply(`✅ Key ${type} ke-${index+1} by ${hapus.by} udah di hapus!`);
  });

  // LANGSUNG DEPLOY PAS KIRIM FILE! GAK PERLU ISI NAMA!
  bot.on('document', async (ctx) => {
    const state = userState.get(ctx.from.id);
    if (!state || state.step !== 'wait_file') return ctx.reply(`Klik dulu [ 🚀 DEPLOY WEB ] wok!`);
    const doc = ctx.message.document;
    if (!doc.file_name.endsWith('.html') && !doc.file_name.endsWith('.zip')) return ctx.reply(`❌ File harus .html / .zip!`);
    
    const projectName = bikinNamaAcak();
    const keyInfo = getVercelToken();
    if (!keyInfo) return ctx.reply(`❌ Token Vercel belum di-set! /setkey vercel TOKEN_LU`);

    try {
      await ctx.reply(`📥 File diterima! ${doc.file_name} (${(doc.file_size/1024).toFixed(1)} KB)\n🎲 Nama acak: ${projectName}\n🚀 Lagi deploy...\n🔑 Pake Key Vercel ke-${keyInfo.nomor} by ${keyInfo.by}...`);
      const fileLink = await ctx.telegram.getFileLink(doc.file_id);
      const fileRes = await fetch(fileLink.href);
      const fileBuffer = Buffer.from(await fileRes.arrayBuffer());
      userState.delete(ctx.from.id);

      const link = await deployBersih(fileBuffer, projectName, keyInfo.token);
      return ctx.reply(
        `✅ BERHASIL! 🎉\n\n` +
        `🔗 Link lu:\n${link}\n\n` +
        `📦 File: ${doc.file_name} -> Jadi index.html!\n` +
        `🎲 Nama Acak: ${projectName}\n` +
        `🔑 Pake Key Vercel ke-${keyInfo.nomor}\n` +
        `👤 Punya: ${keyInfo.by}\n` +
        `📊 Key ini udah di pake: ${keyInfo.dipakai}x\n\n` +
        `Buka link nya wok! Udah sama persis kayak HTML lu!`
      );
    } catch (e) { 
      userState.delete(ctx.from.id);
      return ctx.reply(`❌ Gagal deploy wok! ${e.message}\n🔑 Key ke-${keyInfo.nomor} by ${keyInfo.by} error!`); 
    }
  });

  // Kalo user ngetik teks biasa, kasih tau cara nya
  bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    return ctx.reply(`Kirim file .html nya aja wok! Gak perlu isi nama! Nama nya acak otomatis!\nKlik /deploy dulu!`);
  });

  return bot;
}

function sendListKey(ctx) {
  let pesan = `🔑 LIST KEY ∞ by kimz\n\n🚀 VERCEL (${keys.vercel.length} token):\n`;
  if (keys.vercel.length === 0) {
    pesan += `❌ Belum ada di memori!\n`;
    if (process.env.VERCEL_TOKEN_1) pesan += `✅ Key ke-1 dari Env (owner) - AKTIF!\n`;
  } else keys.vercel.forEach((k,i) => { pesan += `${i+1}. ${k.key.slice(0,4)}***${k.key.slice(-4)} by ${k.by} (${k.dipakai}x)\n`; });
  pesan += `\n🤖 GEMINI (${keys.gemini.length} token):\n`;
  if (keys.gemini.length === 0) pesan += `❌ Belum ada!\n`;
  else keys.gemini.forEach((k,i) => { pesan += `${i+1}. ${k.key.slice(0,4)}***${k.key.slice(-4)} by ${k.by}\n`; });
  pesan += `\nMau nyumbang? /setkey vercel TOKEN_LU`;
  return ctx.reply(pesan);
}

const userState = new Map();
let mainBot = null;
if (currentBotToken) {
  mainBot = makeBot(currentBotToken);
  hostedBots.set(currentBotToken, { bot: mainBot });
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const setToken = url.searchParams.get('setToken');
  if (setToken) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${setToken}/getMe`);
      const j = await r.json();
      if (!j.ok) return res.status(400).json({ ok: false, error: 'Token salah! ' + j.description });
      if (!hostedBots.has(setToken)) {
        const newBot = makeBot(setToken);
        hostedBots.set(setToken, { bot: newBot, username: j.result.username });
      }
      currentBotToken = setToken;
      try {
        await fetch(`https://api.telegram.org/bot${setToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '-1004487166809', text: `🗿 Bot baru jalan!\n🤖 @${j.result.username}\nBy hosting free kimz!` })
        });
      } catch (e) {}
      return res.status(200).json({ ok: true, totalBot: hostedBots.size, username: j.result.username });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let botToUse = mainBot;
      if (currentBotToken && hostedBots.has(currentBotToken)) {
        botToUse = hostedBots.get(currentBotToken).bot;
      }
      if (!botToUse && hostedBots.size > 0) {
        botToUse = [...hostedBots.values()][0].bot;
      }
      if (botToUse) await botToUse.handleUpdate(req.body);
      for (let [tok, obj] of hostedBots) {
        if (obj.bot !== botToUse) {
          try { await obj.bot.handleUpdate(req.body); } catch (e) {}
        }
      }
    } catch (e) { console.error(e); }
    return res.status(200).send('OK');
  }

  return res.status(200).send('Bot jalan wok! 🗿');
};
