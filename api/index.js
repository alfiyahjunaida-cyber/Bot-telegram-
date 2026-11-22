// KIMZ HOSTING BOT TELE FREE 🗿
// api/index.js - FINAL + MENU BAGUS + TOMBOL START!

const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const BOT_NAME = "KIMZ HOSTING BOT TELE FREE";
const OWNER = process.env.OWNER || "Kimz";
const GROUP_ID = process.env.GROUP_ID || "-1004487166809";

let hostedBots = new Map();
let currentBotToken = process.env.BOT_TOKEN || '';
const userState = new Map();
const keys = { vercel: [], gemini: [] };

function addKey(type, token, by) {
  if (keys[type].some(k => k.key === token)) return false;
  keys[type].push({ key: token, by: by, dipakai: 0 });
  return true;
}
function getVercelToken() {
  if (keys.vercel.length === 0) {
    if (process.env.VERCEL_TOKEN_1) return { token: process.env.VERCEL_TOKEN_1, nomor: 1, by: 'OWNER (Env)', dipakai: 0 };
    return null;
  }
  keys.vercel.sort((a,b)=>a.dipakai-b.dipakai);
  let k = keys.vercel[0]; k.dipakai++;
  return { token: k.key, nomor: keys.vercel.indexOf(k)+1, by: k.by, dipakai: k.dipakai };
}
function bikinNamaAcak() {
  const h='abcdefghijklmnopqrstuvwxyz0123456789'; let a='';
  for(let i=0;i<6;i++) a+=h[Math.floor(Math.random()*h.length)];
  return `kimz-${a}`;
}
async function deployBersih(fileBuffer, projectName, token) {
  try { await fetch(`https://api.vercel.com/v9/projects`,{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({name:projectName,framework:null})}); } catch(e){}
  const res = await fetch(`https://api.vercel.com/v13/deployments?project=${projectName}&skipAutoDetectionConfirmation=1`,{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({name:projectName,files:[{file:'index.html',data:fileBuffer.toString('base64'),[STRIPPED]
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return `https://${projectName}.vercel.app`;
}
async function kirimKeGrup(botToken, pesan) {
  if(!GROUP_ID) return;
  try{ await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:GROUP_ID,text:pesan,parse_mode:'HTML'})}); }catch(e){}
}

const MENU_UTAMA = (nama) => ({
text:`╔══════════════════╗\n   🗿 KIMZ HOSTING 🗿\n   BOT TELE FREE\n╚══════════════════╝\n\n👋 Halo ${nama}!\nSelamat datang di ${BOT_NAME}!\n\n✨ Hosting web GRATIS paling gacor!\nKirim HTML → Jadi link → Viral!\n\n┌─ 📊 STATISTIK ─┐\n│ ⚡ Speed: 5 Detik\n│ 💸 Harga: 100% FREE\n│ 🎲 Nama: kimz-xxxxxx\n│ 👤 Owner: ${OWNER}\n└───────────────┘\n\nPilih menu di bawah wok! 👇`,
menu: Markup.inlineKeyboard([
[Markup.button.callback('🚀 DEPLOY WEB','deploy'),Markup.button.callback('🎲 NAMA ACAK','random')],
[Markup.button.callback('🛠️ TOOLS GRATIS','tools'),Markup.button.callback('🔑 LIST KEY ∞','listkey')],
[Markup.button.callback('⚙️ SETTING BOT','setting'),Markup.button.callback('ℹ️ INFO BOT','info')],
[Markup.button.callback('💬 CHAT OWNER','owner'),Markup.button.callback('💸 DONASI','donasi')],
])
});

const MENU_TOOLS = {
text:`🛠️ TOOLS GRATIS - KIMZ HOSTING\n\nSemua tools ini GRATIS wok! Pilih yang lu butuh! 👇`,
menu: Markup.inlineKeyboard([
[Markup.button.callback('🔗 SHORTLINK','tool_shortlink'),Markup.button.callback('📷 QR GENERATOR','tool_qr')],
[Markup.button.callback('🔑 PASSWORD GEN','tool_pass'),Markup.button.callback('🎨 HTML EDITOR','tool_html')],
[Markup.button.callback('⬅️ KEMBALI','back_home')],
])
};

const MENU_SETTING = {
text:`⚙️ SETTING BOT - KIMZ HOSTING\n\n🆔 Grup ID: ${GROUP_ID}\n👤 Owner: ${OWNER}\n🤖 Bot: ${BOT_NAME}\n\nMau setting apa wok? 👇`,
menu: Markup.inlineKeyboard([
[Markup.button.callback('🆔 CEK GRUP ID','cek_grup'),Markup.button.callback('✅ CEK TOKEN BOT','cek_token')],
[Markup.button.callback('🔑 TAMBAH KEY VERCEL','add_key'),Markup.button.callback('🗑️ HAPUS KEY','del_key')],
[Markup.button.callback('⬅️ KEMBALI','back_home')],
])
};

function sendListKey(ctx){
let pesan=`🔑 LIST KEY ∞ - ${BOT_NAME}\n\n🚀 VERCEL (${keys.vercel.length}):\n`;
if(keys.vercel.length===0){pesan+=`❌ Belum ada di memori!\n`;if(process.env.VERCEL_TOKEN_1)pesan+=`✅ Key ke-1 dari Env (OWNER) - AKTIF!\n`;}
else keys.vercel.forEach((k,i)=>{pesan+=`${i+1}. ${k.key.slice(0,4)}***${k.key.slice(-4)} by ${k.by} (${k.dipakai}x)\n`;});
pesan+=`\n🤖 GEMINI (${keys.gemini.length}):\n`;
if(keys.gemini.length===0)pesan+=`❌ Belum ada!\n`;
else keys.gemini.forEach((k,i)=>{pesan+=`${i+1}. ${k.key.slice(0,4)}***${k.key.slice(-4)} by ${k.by}\n`;});
pesan+=`\n🆔 Grup: ${GROUP_ID}\nMau nyumbang? /setkey vercel TOKEN_LU`;
return ctx.reply(pesan,Markup.inlineKeyboard([[Markup.button.callback('⬅️ KEMBALI','back_home')]]));
}

function makeBot(token){
const bot=new Telegraf(token);
bot.start((ctx)=>{const m=MENU_UTAMA(ctx.from.first_name);return ctx.reply(m.text,m.menu);});
bot.command('menu',(ctx)=>{const m=MENU_UTAMA(ctx.from.first_name);return ctx.reply(m.text,m.menu);});
bot.command('start',(ctx)=>{const m=MENU_UTAMA(ctx.from.first_name);return ctx.reply(m.text,m.menu);});
bot.action('back_home',async(ctx)=>{await ctx.answerCbQuery('Balik ke menu! 🗿');const m=MENU_UTAMA(ctx.from.first_name);try{await ctx.editMessageText(m.text,m.menu);}catch(e){await ctx.reply(m.text,m.menu);}});
bot.action('deploy',(ctx)=>{ctx.answerCbQuery('Gas deploy! 🚀');userState.set(ctx.from.id,{step:'wait_file'});return ctx.reply(`🚀 GAS DEPLOY! - ${BOT_NAME}\n\nKirim file .html lu sekarang wok!\nNanti nama web nya acak otomatis! Contoh: kimz-a1b2c3.vercel.app\n\nNotif masuk ke Grup ID: ${GROUP_ID}`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ KEMBALI','back_home')]]));});
bot.command('deploy',(ctx)=>{userState.set(ctx.from.id,{step:'wait_file'});return ctx.reply(`🚀 GAS DEPLOY! Kirim file .html lu sekarang wok!`);});
bot.action('random',(ctx)=>{ctx.answerCbQuery();const nama=bikinNamaAcak();return ctx.reply(`🎲 NAMA ACAK LU!\n\nNama: ${nama}\nLink nanti: https://${nama}.vercel.app\n\nMau pake nama ini? Kirim file .html lu sekarang!`,Markup.inlineKeyboard([[Markup.button.callback('🚀 DEPLOY PAKE NAMA INI','deploy')],[Markup.button.callback('🎲 ACAK LAGI','random')],[Markup.button.callback('⬅️ KEMBALI','back_home')]]));});
bot.action('tools',async(ctx)=>{await ctx.answerCbQuery('Buka tools! 🛠️');try{await ctx.editMessageText(MENU_TOOLS.text,MENU_TOOLS.menu);}catch(e){await ctx.reply(MENU_TOOLS.text,MENU_TOOLS.menu);}});
bot.action('tool_shortlink',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`🔗 SHORTLINK\n\nComing soon wok! Sabar ya! 🗿`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ TOOLS','tools')]]));});
bot.action('tool_qr',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`📷 QR GENERATOR\n\nComing soon wok! 🗿`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ TOOLS','tools')]]));});
bot.action('tool_pass',(ctx)=>{ctx.answerCbQuery();const pass='Kimz'+Math.floor(Math.random()*99999)+'Gacor!';return ctx.reply(`🔑 PASSWORD BARU LU!\n\n\`${pass}\`\n\nCopy ya wok!`,{parse_mode:'Markdown',...Markup.inlineKeyboard([[Markup.button.callback('🔑 BIKIN LAGI','tool_pass'),Markup.button.callback('⬅️ TOOLS','tools')]])});});
bot.action('tool_html',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`🎨 HTML EDITOR\n\nBuka web KIMZ CODE buat edit HTML + Code bot lu dari web! 🗿`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ TOOLS','tools')]]));});
bot.action('setting',async(ctx)=>{await ctx.answerCbQuery('Buka setting! ⚙️');try{await ctx.editMessageText(MENU_SETTING.text,MENU_SETTING.menu);}catch(e){await ctx.reply(MENU_SETTING.text,MENU_SETTING.menu);}});
bot.action('cek_grup',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`🆔 GRUP ID LU:\n\n${GROUP_ID}\n\nBot kirim notif deploy ke grup ini wok!`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ SETTING','setting')]]));});
bot.action('cek_token',async(ctx)=>{ctx.answerCbQuery('Cek token...');try{const r=await fetch(`https://api.telegram.org/bot${token}/getMe`);const j=await r.json();if(j.ok)return ctx.reply(`✅ TOKEN VALID WOK! 🗿\nBot: @${j.result.username}\nNama: ${j.result.first_name}\nGrup ID: ${GROUP_ID}`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ SETTING','setting')]]));else return ctx.reply(`❌ Token error: ${j.description}`);}catch(e){return ctx.reply(`❌ Gagal: ${e.message}`);}});
bot.action('add_key',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`🔑 TAMBAH KEY VERCEL\n\nKetik di chat:\n/setkey vercel TOKEN_LU\n\nContoh:\n/setkey vercel abc123xxx`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ SETTING','setting')]]));});
bot.action('del_key',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`🗑️ HAPUS KEY\n\nKetik di chat:\n/delkey vercel 1\n\nCek dulu: /listkey`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ SETTING','setting')]]));});
bot.action('info',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`ℹ️ INFO BOT - KIMZ HOSTING\n\n🤖 Nama: ${BOT_NAME}\n👤 Owner: ${OWNER}\n🆔 Grup ID: ${GROUP_ID}\n📍 Lokasi: Gresik, East Java\n📅 Tahun: 2026\n💸 Harga: 100% GRATIS!\n\n✨ Fitur:\n- Deploy HTML → Vercel (5 detik)\n- Nama acak otomatis kimz-xxxxxx\n- Key Vercel ∞ (bisa nyumbang)\n- Tools gratis\n- Notif ke Grup ID\n\nMade with 🗿 by Kimz!`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ KEMBALI','back_home')]]));});
bot.action('owner',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`💬 CHAT OWNER\n\n👤 Owner: ${OWNER}\n🆔 Grup ID: ${GROUP_ID}\n\nChat aja wok! Kimz baik kok! 🗿`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ KEMBALI','back_home')]]));});
bot.action('donasi',(ctx)=>{ctx.answerCbQuery();return ctx.reply(`💸 DONASI - MAKASIH WOK! 🗿❤️\n\nMakasih udah mau support KIMZ HOSTING BOT TELE FREE!\n\nDonasi lu buat bayar server biar tetep GRATIS!\n\nChat owner aja buat donasi!`,Markup.inlineKeyboard([[Markup.button.callback('⬅️ KEMBALI','back_home')]]));});
bot.action('listkey',(ctx)=>{ctx.answerCbQuery();return sendListKey(ctx);});
bot.command('listkey',(ctx)=>sendListKey(ctx));
bot.command('cekbot',async(ctx)=>{try{const r=await fetch(`https://api.telegram.org/bot${token}/getMe`);const j=await r.json();if(j.ok)return ctx.reply(`✅ TOKEN VALID! @${j.result.username} | Grup: ${GROUP_ID}`);else return ctx.reply(`❌ ${j.description}`);}catch(e){return ctx.reply(`❌ ${e.message}`);}});
bot.command('setkey',(ctx)=>{const args=ctx.message.text.split(' ');const type=args[1]?args[1].toLowerCase():null;const key=args[2];if(!type||!key)return ctx.reply(`Cara: /setkey vercel TOKEN_LU`);if(!keys[type])return ctx.reply(`❌ Type cuma: vercel / gemini`);const by=`@${ctx.from.username||ctx.from.first_name}`;if(!addKey(type,key,by))return ctx.reply(`❌ Token udah ada!`);return ctx.reply(`✅ Token ${type} ke simpen! Jadi key ke-${keys[type].length}!\nBy: ${by}\nCek: /listkey`);});
bot.command('delkey',(ctx)=>{const args=ctx.message.text.split(' ');const type=args[1]?args[1].toLowerCase():null;const idx=parseInt(args[2])-1;if(!type||isNaN(idx))return ctx.reply(`Cara: /delkey vercel 1`);if(!keys[type]||!keys[type][idx])return ctx.reply(`❌ Nomor gak ada!`);const h=keys[type].splice(idx,1)[0];return ctx.reply(`✅ Key ${type} ke-${idx+1} by ${h.by} udah di hapus!`);});
bot.on('document',async(ctx)=>{
const state=userState.get(ctx.from.id);
if(!state||state.step!=='wait_file')return ctx.reply(`Klik dulu [ 🚀 DEPLOY WEB ] wok! Atau /deploy`);
const doc=ctx.message.document;
if(!doc.file_name.endsWith('.html')&&!doc.file_name.endsWith('.zip'))return ctx.reply(`❌ File harus .html / .zip!`);
const projectName=bikinNamaAcak();
const keyInfo=getVercelToken();
if(!keyInfo)return ctx.reply(`❌ Token Vercel belum di-set!\n/setkey vercel TOKEN_LU\nAtau Vercel Env: VERCEL_TOKEN_1`);
try{
await ctx.reply(`📥 File diterima! ${doc.file_name} (${(doc.file_size/1024).toFixed(1)} KB)\n🎲 Nama acak: ${projectName}\n🚀 Lagi deploy...\n🔑 Key Vercel ke-${keyInfo.nomor} by ${keyInfo.by}...`);
const fileLink=await ctx.telegram.getFileLink(doc.file_id);
const fileRes=await fetch(fileLink.href);
const fileBuffer=Buffer.from(await fileRes.arrayBuffer());
userState.delete(ctx.from.id);
const link=await deployBersih(fileBuffer,projectName,keyInfo.token);
await kirimKeGrup(token,`🚀 <b>DEPLOY BARU! - ${BOT_NAME}</b>\n\n👤 User: @${ctx.from.username||ctx.from.first_name}\n📦 File: ${doc.file_name}\n🔗 Link: ${link}\n🎲 Nama: ${projectName}\n🔑 Key ke-${keyInfo.nomor} by ${keyInfo.by}\n🆔 Grup: ${GROUP_ID}`);
return ctx.reply(`✅ BERHASIL! 🎉 - ${BOT_NAME}\n\n🔗 Link lu:\n${link}\n\n📦 File: ${doc.file_name} → index.html!\n🎲 Nama Acak: ${projectName}\n🔑 Key Vercel ke-${keyInfo.nomor} by ${keyInfo.by}\n🆔 Notif masuk ke Grup: ${GROUP_ID}\n\nBuka link nya wok! 🗿`,Markup.inlineKeyboard([[Markup.button.url('🌐 BUKA WEB LU',link)],[Markup.button.callback('🚀 DEPLOY LAGI','deploy'),Markup.button.callback('🏠 MENU','back_home')]]));
}catch(e){userState.delete(ctx.from.id);return ctx.reply(`❌ Gagal deploy! ${e.message}`);}
});
bot.on('text',async(ctx)=>{if(ctx.message.text.startsWith('/'))return;const m=MENU_UTAMA(ctx.from.first_name);return ctx.reply(`Kirim file .html nya aja wok! Atau pilih menu! 👇`,m.menu);});
return bot;
}

let mainBot=null;
if(currentBotToken){mainBot=makeBot(currentBotToken);hostedBots.set(currentBotToken,{bot:mainBot});}

module.exports=async(req,res)=>{
const url=new URL(req.url,'http://localhost');
const setToken=url.searchParams.get('setToken');
if(setToken){
try{
const r=await fetch(`https://api.telegram.org/bot${setToken}/getMe`);const j=await r.json();
if(!j.ok)return res.status(400).json({ok:false,error:'Token salah! '+j.description});
if(!hostedBots.has(setToken)){const nb=makeBot(setToken);hostedBots.set(setToken,{bot:nb,username:j.result.username});}
currentBotToken=setToken;
return res.status(200).json({ok:true,username:j.result.username,groupId:GROUP_ID});
}catch(e){return res.status(500).json({ok:false,error:e.message});}
}
if(req.method==='POST'){
try{
let botToUse=mainBot;
if(currentBotToken&&hostedBots.has(currentBotToken))botToUse=hostedBots.get(currentBotToken).bot;
if(!botToUse&&hostedBots.size>0)botToUse=[...hostedBots.values()][0].bot;
if(botToUse)await botToUse.handleUpdate(req.body);
for(let [tok,obj] of hostedBots){if(obj.bot!==botToUse){try{await obj.bot.handleUpdate(req.body);}catch(e){}}}
}catch(e){console.error(e);}
return res.status(200).send('OK');
}
if(!process.env.BOT_TOKEN)return res.status(200).send(`❌ BOT_TOKEN belum di set! Vercel -> Settings -> Env -> BOT_TOKEN\n\n${BOT_NAME} 🗿`);
return res.status(200).send(`${BOT_NAME} jalan wok! 🗿 Grup: ${GROUP_ID} Owner: ${OWNER}`);
};
