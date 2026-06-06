const config = require('../config');
const { runtime, formatBytes, formatNumber } = require('../lib/functions');
const os = require('os');

const commands = {};

// Menu / Help
commands['menu'] = commands['help'] = async (ctx) => {
    const uptime = runtime(process.uptime());
    const totalMem = formatBytes(os.totalmem());
    const freeMem = formatBytes(os.freemem());
    
    const menuText = `
╔══════════════════════════════════════╗
║       🤖 *GODFATHER XMD* 🤖         ║
║       Created by *Soham*             ║
╠══════════════════════════════════════╣
║ 📊 Uptime: ${uptime}
║ 💾 RAM: ${freeMem}/${totalMem}
║ 📌 Prefix: ${config.prefix}
║ 🔧 Mode: ${config.mode}
╚══════════════════════════════════════╝

╔═══ 📋 *MAIN MENU* ═══╗

┌──「 🛠️ *TOOLS* 」
│ ${config.prefix}ping
│ ${config.prefix}calc <expression>
│ ${config.prefix}weather <city>
│ ${config.prefix}translate <lang> <text>
│ ${config.prefix}tts <lang> <text>
│ ${config.prefix}define <word>
│ ${config.prefix}shorten <url>
│ ${config.prefix}qr <text>
│ ${config.prefix}ss <url>
│ ${config.prefix}carbon <code>
│ ${config.prefix}ip <address>
│ ${config.prefix}time <timezone>
│ ${config.prefix}remind <time> <msg>
│ ${config.prefix}count
│ ${config.prefix}base64encode <text>
│ ${config.prefix}base64decode <text>
│ ${config.prefix}binary <text>
│ ${config.prefix}lyrics <song>
│ ${config.prefix}uptime
│ ${config.prefix}sysinfo
└──────────────

┌──「 🤖 *AI* 」
│ ${config.prefix}ai <question>
│ ${config.prefix}gpt <question>
│ ${config.prefix}imagine <prompt>
│ ${config.prefix}gemini <question>
│ ${config.prefix}code <request>
│ ${config.prefix}summarize <text>
└──────────────

┌──「 🔍 *SEARCH* 」
│ ${config.prefix}google <query>
│ ${config.prefix}wiki <query>
│ ${config.prefix}github <username>
│ ${config.prefix}ytsearch <query>
│ ${config.prefix}image <query>
│ ${config.prefix}pinterest <query>
│ ${config.prefix}wallpaper <query>
│ ${config.prefix}movie <title>
│ ${config.prefix}news
└──────────────

┌──「 📥 *DOWNLOAD* 」
│ ${config.prefix}play <song name/URL>
│ ${config.prefix}video <name/URL>
│ ${config.prefix}ig <URL>
│ ${config.prefix}tiktok <URL>
│ ${config.prefix}fb <URL>
│ ${config.prefix}twitter <URL>
│ ${config.prefix}fetch <URL>
└──────────────

┌──「 🎨 *STICKER* 」
│ ${config.prefix}sticker
│ ${config.prefix}scircle
│ ${config.prefix}srounded
│ ${config.prefix}scrop
│ ${config.prefix}toimg
│ ${config.prefix}tsticker <text>
│ ${config.prefix}surl <URL>
│ ${config.prefix}steal <pack|author>
│ ${config.prefix}sgif
└──────────────

┌──「 🔄 *CONVERTER* 」
│ ${config.prefix}toptt
│ ${config.prefix}toaudio
│ ${config.prefix}mp3 (video to audio)
│ ${config.prefix}todoc
│ ${config.prefix}tourl
└──────────────

┌──「 🎮 *FUN* 」
│ ${config.prefix}8ball <question>
│ ${config.prefix}rate <thing>
│ ${config.prefix}ship
│ ${config.prefix}dare
│ ${config.prefix}truth
│ ${config.prefix}joke
│ ${config.prefix}fact
│ ${config.prefix}quote
│ ${config.prefix}flip
│ ${config.prefix}dice
│ ${config.prefix}random <min> <max>
│ ${config.prefix}choose <opt1|opt2>
│ ${config.prefix}wyr
│ ${config.prefix}ttt <@user>
│ ${config.prefix}rps <rock/paper/scissors>
│ ${config.prefix}slot
│ ${config.prefix}roast
│ ${config.prefix}compliment
│ ${config.prefix}slap / hug / pat / kiss
│ ${config.prefix}mock <text>
│ ${config.prefix}reverse <text>
│ ${config.prefix}emojify <text>
└──────────────

┌──「 👥 *GROUP* 」
│ ${config.prefix}kick @user
│ ${config.prefix}add <number>
│ ${config.prefix}promote @user
│ ${config.prefix}demote @user
│ ${config.prefix}mute
│ ${config.prefix}unmute
│ ${config.prefix}lock
│ ${config.prefix}unlock
│ ${config.prefix}tagall
│ ${config.prefix}hidetag <msg>
│ ${config.prefix}groupinfo
│ ${config.prefix}invite
│ ${config.prefix}revoke
│ ${config.prefix}setgname <name>
│ ${config.prefix}setgdesc <desc>
│ ${config.prefix}setgpp
│ ${config.prefix}admins
│ ${config.prefix}warn @user
│ ${config.prefix}resetwarn @user
│ ${config.prefix}poll Q|opt1|opt2
└──────────────

┌──「 🎌 *ANIME* 」
│ ${config.prefix}anime <name>
│ ${config.prefix}manga <name>
│ ${config.prefix}character <name>
│ ${config.prefix}animequote
│ ${config.prefix}waifu
│ ${config.prefix}neko
│ ${config.prefix}shinobu
│ ${config.prefix}megumin
│ ${config.prefix}cuddle / cry / hug
│ ${config.prefix}awoo / kiss / lick
│ ${config.prefix}pat / smug / bonk
│ ${config.prefix}blush / smile / wave
└──────────────

┌──「 ℹ️ *INFO* 」
│ ${config.prefix}menu
│ ${config.prefix}owner
│ ${config.prefix}botinfo
│ ${config.prefix}runtime
│ ${config.prefix}speed
└──────────────

┌──「 👑 *OWNER* 」
│ ${config.prefix}eval <code>
│ ${config.prefix}shell <command>
│ ${config.prefix}broadcast <msg>
│ ${config.prefix}block @user
│ ${config.prefix}unblock @user
│ ${config.prefix}join <link>
│ ${config.prefix}leave
│ ${config.prefix}public / private
│ ${config.prefix}setprefix <prefix>
│ ${config.prefix}setbotname <name>
│ ${config.prefix}antilink
│ ${config.prefix}antidelete
│ ${config.prefix}anticall
│ ${config.prefix}autoread
│ ${config.prefix}autostatus
│ ${config.prefix}setpp
│ ${config.prefix}setbio <text>
│ ${config.prefix}restart
└──────────────

╚═══════════════════════╝

${config.footer}`;

    await ctx.sock.sendMessage(ctx.from, {
        text: menuText
    }, { quoted: ctx.msg });
};

// Owner info
commands['owner'] = commands['creator'] = async (ctx) => {
    const ownerNumber = config.ownerNumber[0];
    const vcard = 'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        `FN:${config.ownerName} (GODFATHER XMD)\n` +
        `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` +
        'END:VCARD';
    
    await ctx.sock.sendMessage(ctx.from, {
        contacts: {
            displayName: config.ownerName,
            contacts: [{ vcard }]
        }
    }, { quoted: ctx.msg });
    
    await ctx.reply(
        `👑 *BOT OWNER*\n\n` +
        `👤 *Name:* ${config.ownerName}\n` +
        `📱 *Number:* +${ownerNumber}\n` +
        `🤖 *Bot:* ${config.botName}\n\n` +
        `${config.footer}`
    );
};

// Bot info
commands['botinfo'] = commands['info'] = async (ctx) => {
    const uptime = runtime(process.uptime());
    
    await ctx.reply(
        `╔══════════════════════════════╗\n` +
        `║      🤖 *BOT INFO*           ║\n` +
        `╠══════════════════════════════╣\n` +
        `║                              ║\n` +
        `║ 📛 *Name:* ${config.botName}\n` +
        `║ 👑 *Owner:* ${config.ownerName}\n` +
        `║ 📌 *Prefix:* ${config.prefix}\n` +
        `║ 🔧 *Mode:* ${config.mode}\n` +
        `║ ⏱️ *Uptime:* ${uptime}\n` +
        `║ 📦 *Version:* 2.0.0\n` +
        `║ 🛡️ *Platform:* ${os.platform()}\n` +
        `║ 💾 *RAM:* ${formatBytes(os.freemem())}/${formatBytes(os.totalmem())}\n` +
        `║ 📡 *Node:* ${process.version}\n` +
        `║                              ║\n` +
        `║ 🔐 *Anti-Link:* ${config.antiLink ? '✅' : '❌'}\n` +
        `║ 🗑️ *Anti-Delete:* ${config.antiDelete ? '✅' : '❌'}\n` +
        `║ 📞 *Anti-Call:* ${config.antiCall ? '✅' : '❌'}\n` +
        `║ 👁️ *Auto-Read:* ${config.autoRead ? '✅' : '❌'}\n` +
        `║ 📊 *Auto-Status:* ${config.autoStatusView ? '✅' : '❌'}\n` +
        `║                              ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `${config.footer}`
    );
};

// Speed test
commands['speed'] = async (ctx) => {
    const start = Date.now();
    await ctx.reply('🏃 *Testing speed...*');
    const end = Date.now();
    
    await ctx.reply(
        `⚡ *SPEED TEST*\n\n` +
        `📊 Response Time: *${end - start}ms*\n` +
        `🏓 Latency: *${end - start}ms*\n\n` +
        `${config.footer}`
    );
};

// Alive check
commands['alive'] = async (ctx) => {
    await ctx.reply(
        `╔══════════════════════════════╗\n` +
        `║     🤖 *GODFATHER XMD*       ║\n` +
        `║     I'm alive and running!   ║\n` +
        `╠══════════════════════════════╣\n` +
        `║ ⏱️ Uptime: ${runtime(process.uptime())}\n` +
        `║ 👑 Owner: ${config.ownerName}\n` +
        `║ 📌 Prefix: ${config.prefix}\n` +
        `╚══════════════════════════════╝\n\n` +
        `${config.footer}`
    );
};

// Report / Feedback
commands['report'] = commands['feedback'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}report <your message>`);
    
    const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
    
    await ctx.sock.sendMessage(ownerJid, {
        text: `📩 *NEW REPORT/FEEDBACK*\n\n` +
            `👤 *From:* @${ctx.senderNumber}\n` +
            `📌 *Name:* ${ctx.pushName}\n` +
            `📍 *Chat:* ${ctx.isGroup ? ctx.groupName : 'Private'}\n\n` +
            `💬 *Message:*\n${ctx.text}\n\n` +
            `${config.footer}`,
        mentions: [ctx.sender]
    });
    
    await ctx.reply('✅ Your report/feedback has been sent to the owner! Thank you. 🙏');
};

// Runtime
commands['runtime'] = async (ctx) => {
    await ctx.reply(
        `⏱️ *RUNTIME*\n\n` +
        `🕐 ${runtime(process.uptime())}\n\n` +
        `${config.footer}`
    );
};

module.exports = commands;