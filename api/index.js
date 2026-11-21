import { Telegraf } from 'telegraf';
import axios from 'axios';
import JSZip from 'jszip';

let BOT_TOKEN = process.env.BOT_TOKEN || '';
const LOG_GROUP_ID = '-1004487166809';
let GLOBAL_KEYS = { vercel1: '', vercel2: '', vercel3: '', gemini1: '', gemini2: '', gemini3: '' };
let KEY_OWNER = {};
const userState = new Map();

function sensorKey(key) { if (!key || key.length < 8) return 'Belum di-set'; return `${key.slice(0,4)}***${key.slice(-4)}`; }
function getUsername(ctx) { return ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name; }
async function kirimNotifGrup(pesan, bot) { try { if(bot) await bot.telegram.sendMessage(LOG_GROUP_ID, pesan); } catch(e){ console.log(e.message); } }

function setupBot(bot) {
  bot.start((ctx) => ctx.reply(`👋 Halo ${ctx.from.first_name}!\n\n🤖 Tolls Deployer Bot\nby kimz 🗿\nDeploy web cuma lewat Telegram wok!`, { reply_markup: { inline_keyboard: [[{ text: '🚀 DEPLOY WEB', callback_data: 'deploy' }],[{ text: '🔑 LIST KEY', callback_data: 'listkey' }, { text: '📋 CARA PAKE', callback_data: 'help' }]] } }));
  bot.command('id', (ctx) => ctx.reply(`ID lu: ${ctx.from.id}\nID chat: ${ctx.chat.id}`));
  bot.command('help', (ctx) => ctx.reply(`📋 CARA PAKE - by kimz:\n\n1. SETKEY:\n/setkey vercel1 <token>\n/setkey gemini1 <key>\n\n2. LISTKEY:\n/listkey\n\n3. DEPLOY:\nKlik 🚀 DEPLOY WEB -> Kirim HTML/ZIP -> Isi nama -> Jadi!\n\n4. AI:\n/ai <pertanyaan>`));
  bot.command('setkey', async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 3) return ctx.reply(`Cara: /setkey vercel1 <token>\nYang boleh: vercel1, vercel2, vercel3, gemini1, gemini2, gemini3`);
    const keyName = args[1].toLowerCase();
    const keyValue = args[2];
    const username = getUsername(ctx);
    const allowed = ['vercel1','vercel2','vercel3','gemini1','gemini2','gemini3'];
    if (!allowed.includes(keyName)) return ctx.reply(`❌ Nama key salah!`);
    const isUpdate = !!GLOBAL_KEYS[keyName];
    const oldOwner = KEY_OWNER[keyName];
    GLOBAL_KEYS[keyName] = keyValue; KEY_OWNER[keyName] = ctx.from.username || ctx.from.first_name;
    await ctx.reply(`✅ BERHASIL! MAKASIH BANYAK WOK! 🗿🔥\n\nMakasih API Key nya ${username}!\nLu baik banget udah mau nyumbang key! 🙏\n\n🔑 Key: ${keyName}\n👀 Isi: ${sensorKey(keyValue)}\n👤 Di-set sama: ${username}\n${isUpdate ? `⚠️ Sebelumnya punya @${oldOwner}\n` : ''}📊 Sekarang SEMUA user bisa pake key lu!`);
    await kirimNotifGrup(`🔔 ADA YANG SETKEY NIH WOK! 🗿\n\n👤 Siapa: ${username} (ID: ${ctx.from.id})\n🔑 Key: ${keyName}\n👀 Isi: ${sensorKey(keyValue)}\n${isUpdate ? `🔄 Nge-timpa key lama punya @${oldOwner}\n` : `✨ Key baru!\n`}`, bot);
  });
  bot.command(['listkey','mykey','keys'], (ctx) => {
    let t = `🔑 LIST KEY - GOTONG ROYONG! by kimz\n\n🚀 VERCEL:\n`;
    t += `${GLOBAL_KEYS.vercel1 ? '✅' : '❌'} vercel1: ${sensorKey(GLOBAL_KEYS.vercel1)} ${KEY_OWNER.vercel1 ? `(by @${KEY_OWNER.vercel1})` : ''}\n`;
    t += `${GLOBAL_KEYS.vercel2 ? '✅' : '❌'} vercel2: ${sensorKey(GLOBAL_KEYS.vercel2)} ${KEY_OWNER.vercel2 ? `(by @${KEY_OWNER.vercel2})` : ''}\n`;
    t += `${GLOBAL_KEYS.vercel3 ? '✅' : '❌'} vercel3: ${sensorKey(GLOBAL_KEYS.vercel3)} ${KEY_OWNER.vercel3 ? `(by @${KEY_OWNER.vercel3})` : ''}\n\n🤖 GEMINI:\n`;
    t += `${GLOBAL_KEYS.gemini1 ? '✅' : '❌'} gemini1: ${sensorKey(GLOBAL_KEYS.gemini1)} ${KEY_OWNER.gemini1 ? `(by @${KEY_OWNER.gemini1})` : ''}\n`;
    t += `${GLOBAL_KEYS.gemini2 ? '✅' : '❌'} gemini2: ${sensorKey(GLOBAL_KEYS.gemini2)} ${KEY_OWNER.gemini2 ? `(by @${KEY_OWNER.gemini2})` : ''}\n`;
    t += `${GLOBAL_KEYS.gemini3 ? '✅' : '❌'} gemini3: ${sensorKey(GLOBAL_KEYS.gemini3)} ${KEY_OWNER.gemini3 ? `(by @${KEY_OWNER.gemini3})` : ''}\n\nMau nyumbang? /setkey <nama> <key>`;
    ctx.reply(t);
  });
  bot.command(['ai','ask'], async (ctx) => {
    const q = ctx.message.text.replace(/\/(ai|ask)/, '').trim();
    if (!q) return ctx.reply('Pake: /ai <pertanyaan>');
    const keys = [GLOBAL_KEYS.gemini1, GLOBAL_KEYS.gemini2, GLOBAL_KEYS.gemini3].filter(Boolean);
    if (keys.length === 0) return ctx.reply('❌ Belum ada yang setkey gemini wok!');
    for (let i = 0; i < keys.length; i++) {
      try {
        const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys[i]}`, { contents: [{ parts: [{ text: q }] }] });
        return ctx.reply(`🤖 AI (gemini${i+1}):\n${res.data.candidates[0].content.parts[0].text}`);
      } catch (e) { if (e.response?.status === 429) continue; return ctx.reply(`❌ Error: ${e.message}`); }
    }
    ctx.reply('❌ Semua key Gemini limit wok!');
  });
  bot.action('deploy', (ctx) => { ctx.answerCbQuery(); userState.set(ctx.from.id, { step: 'wait_file' }); ctx.reply(`🚀 MULAI DEPLOY!\n\nKirim file lu sekarang wok!\n\nBoleh:\n✅ 1 file HTML\n✅ 1 file ZIP (langsung di-unzip!)\n\nKirim sekarang!`); });
  bot.action('listkey', (ctx) => { ctx.answerCbQuery(); ctx.reply('Ketik /listkey wok!'); });
  bot.action('help', (ctx) => { ctx.answerCbQuery(); ctx.reply('Ketik /help wok!'); });
  bot.on('document', async (ctx) => {
    const state = userState.get(ctx.from.id);
    if (!state || state.step !== 'wait_file') return ctx.reply('Mau deploy? Klik dulu 🚀 DEPLOY WEB di /start wok!');
    const doc = ctx.message.document;
    if (!doc.file_name.endsWith('.html') && !doc.file_name.endsWith('.zip')) return ctx.reply('❌ File harus .html atau .zip wok!');
    await ctx.reply(`📥 File ${doc.file_name} diterima! Lagi download...`);
    try {
      const fileLink = await ctx.telegram.getFileLink(doc.file_id);
      const res = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(res.data);
      let files = [];
      if (doc.file_name.endsWith('.zip')) {
        await ctx.reply('📦 File ZIP ketemu! Lagi di-unzip...');
        const zip = await JSZip.loadAsync(buffer);
        for (const fileName of Object.keys(zip.files)) {
          const file = zip.files[fileName];
          if (file.dir) continue; if (fileName.startsWith('__MACOSX')) continue;
          const content = await file.async('nodebuffer');
          files.push({ file: fileName, data: content.toString('base64') });
        }
        if (files.length === 0) return ctx.reply('❌ ZIP nya kosong wok!');
        await ctx.reply(`✅ Berhasil unzip! Ada ${files.length} file!\n${files.map(f => `📄 ${f.file}`).join('\n')}`);
      } else { files = [{ file: 'index.html', data: buffer.toString('base64') }]; await ctx.reply(`✅ File ${doc.file_name} berhasil!`); }
      userState.set(ctx.from.id, { step: 'wait_name', fileName: doc.file_name, files: files });
      await ctx.reply(`Sekarang isi NAMA WEB lu wok!\nContoh: tolls-ganteng\nNanti jadi: https://tolls-ganteng.vercel.app`);
    } catch (e) { ctx.reply('❌ Gagal download / unzip wok! ' + e.message); }
  });
  bot.on('text', async (ctx) => {
    const state = userState.get(ctx.from.id);
    if (!state || state.step !== 'wait_name') return;
    if (ctx.message.text.startsWith('/')) return;
    const projectName = ctx.message.text.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (projectName.length < 3) return ctx.reply('❌ Nama web minimal 3 huruf wok!');
    await ctx.reply(`🚀 Lagi deploy ${projectName}... Tunggu 10-20 detik wok!`);
    const tokens = [GLOBAL_KEYS.vercel1, GLOBAL_KEYS.vercel2, GLOBAL_KEYS.vercel3].filter(Boolean);
    if (tokens.length === 0) return ctx.reply('❌ Belum ada yang setkey vercel wok! /setkey vercel1 <token> dulu!');
    try {
      let result = null; let keyUsed = 0;
      for (let i = 0; i < tokens.length; i++) {
        try {
          const res = await axios.post(`https://api.vercel.com/v13/deployments`, { name: projectName, files: state.files, target: 'production' }, { headers: { Authorization: `Bearer ${tokens[i]}` } });
          result = res.data; keyUsed = i + 1; break;
        } catch (e) { if (e.response?.status === 429 || e.response?.status === 403) { await ctx.reply(`⚠️ Key ${i+1} limit, ganti ke Key ${i+2}...`); continue; } throw e; }
      }
      if (!result) throw new Error('Semua key limit!');
      userState.delete(ctx.from.id);
      const username = getUsername(ctx);
      await ctx.reply(`✅ BERHASIL DEPLOY WOK! 🗿🔥\n\n🌐 Link web lu:\nhttps://${result.url}\n\n📦 Project: ${projectName}\n📄 File: ${state.fileName} (${state.files.length} file)\n🔑 Pake Key: vercel${keyUsed}\n\nShare ke temen lu wok!`);
      await kirimNotifGrup(`🚀 ADA YANG DEPLOY WEB!\n\n👤 Siapa: ${username}\n🌐 Web: https://${result.url}\n📦 Project: ${projectName}`, bot);
    } catch (e) { ctx.reply(`❌ Gagal deploy wok! ${e.response?.data?.error?.message || e.message}`); }
  });
}

export default async function handler(req, res) {
  try {
    if (req.query && req.query.setToken) { BOT_TOKEN = req.query.setToken; return res.status(200).json({ ok: true, msg: 'Token ke-simpan!' }); }
    if (!BOT_TOKEN) return res.status(200).send('bot tele hosting free by kimz - Isi token dulu di web wok!');
    const bot = new Telegraf(BOT_TOKEN);
    setupBot(bot);
    if (req.method === 'GET') {
      const webhook = process.env.WEBHOOK_URL || req.headers['x-forwarded-host'] ? `https://${req.headers.host}` : '';
      if (webhook) await bot.telegram.setWebhook(webhook);
      return res.status(200).send('✅ bot tele hosting free by kimz - JALAN!');
    }
    await bot.handleUpdate(req.body, res);
  } catch (e) { console.error(e); res.status(500).send('Error: ' + e.message); }
}
