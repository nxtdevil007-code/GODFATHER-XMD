const config = require('../config');
const { runtime, formatBytes, formatNumber } = require('../lib/functions');
const { getWeather, defineWord, getLyrics } = require('../lib/scraper');
const axios = require('axios');
const { evaluate } = require('mathjs');
const moment = require('moment-timezone');
const os = require('os');

const commands = {};

// Calculator
commands['calc'] = commands['math'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}calc 2+2*3`);
    
    try {
        const result = evaluate(ctx.text);
        await ctx.reply(`🔢 *Calculator*\n\n📝 Expression: ${ctx.text}\n📊 Result: *${result}*\n\n${config.footer}`);
    } catch (err) {
        await ctx.reply('❌ Invalid mathematical expression!');
    }
};

// Weather
commands['weather'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}weather London`);
    
    try {
        const weather = await getWeather(ctx.text);
        await ctx.reply(
            `🌤️ *WEATHER INFO*\n\n` +
            `📍 *City:* ${weather.city}, ${weather.country}\n` +
            `🌡️ *Temperature:* ${weather.temp_C}°C (${weather.temp_F}°F)\n` +
            `🤔 *Feels Like:* ${weather.feelsLike}°C\n` +
            `💧 *Humidity:* ${weather.humidity}%\n` +
            `💨 *Wind:* ${weather.windSpeed} km/h\n` +
            `👁️ *Visibility:* ${weather.visibility} km\n` +
            `🔄 *Pressure:* ${weather.pressure} mb\n` +
            `☁️ *Condition:* ${weather.description}\n\n` +
            `${config.footer}`
        );
    } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
    }
};

// Dictionary
commands['define'] = commands['dictionary'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}define hello`);
    
    try {
        const def = await defineWord(ctx.text);
        let text = `📖 *DICTIONARY*\n\n` +
            `📝 *Word:* ${def.word}\n` +
            `🗣️ *Phonetic:* ${def.phonetic}\n\n`;
        
        def.meanings.forEach((m, i) => {
            text += `${i + 1}. *(${m.partOfSpeech})*\n`;
            text += `   📌 ${m.definition}\n`;
            text += `   💡 Example: ${m.example}\n\n`;
        });
        
        text += config.footer;
        await ctx.reply(text);
    } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
    }
};

// Translate
commands['translate'] = commands['tr'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}tr en hello\n${ctx.prefix}tr hi hello`);
    
    const lang = ctx.args[0];
    const text = ctx.args.slice(1).join(' ') || 
                 (ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text || '');
    
    if (!text) return ctx.reply('❌ Provide text to translate!');
    
    try {
        const response = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
        );
        
        const translated = response.data.responseData.translatedText;
        await ctx.reply(
            `🌐 *TRANSLATOR*\n\n` +
            `📝 *Original:* ${text}\n` +
            `🔄 *Translated (${lang}):* ${translated}\n\n` +
            `${config.footer}`
        );
    } catch (err) {
        await ctx.reply('❌ Translation failed!');
    }
};

// TTS (Text to Speech)
commands['tts'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}tts en Hello World`);
    
    const lang = ctx.args[0] || 'en';
    const text = ctx.args.slice(1).join(' ') || ctx.text;
    
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
        
        await ctx.sock.sendMessage(ctx.from, {
            audio: { url },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ TTS failed!');
    }
};

// Shorten URL
commands['shorten'] = commands['shorturl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}shorten https://example.com`);
    
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(ctx.text)}`);
        await ctx.reply(`🔗 *URL Shortener*\n\n📎 *Original:* ${ctx.text}\n🔗 *Shortened:* ${response.data}\n\n${config.footer}`);
    } catch (err) {
        await ctx.reply('❌ Failed to shorten URL!');
    }
};

// QR Code generator
commands['qr'] = commands['qrcode'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}qr your text here`);
    
    try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(ctx.text)}`;
        await ctx.sock.sendMessage(ctx.from, {
            image: { url },
            caption: `📱 *QR Code*\n\n📝 Data: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Failed to generate QR code!');
    }
};

// Screenshot website
commands['ss'] = commands['screenshot'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}ss https://google.com`);
    
    try {
        const url = `https://image.thum.io/get/width/1920/crop/1080/fullpage/${ctx.text}`;
        await ctx.sock.sendMessage(ctx.from, {
            image: { url },
            caption: `📸 *Screenshot*\n\n🌐 URL: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Failed to take screenshot!');
    }
};

// Lyrics
commands['lyrics'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}lyrics Shape of You`);
    
    try {
        const result = await getLyrics(ctx.text);
        
        if (typeof result === 'object') {
            await ctx.reply(
                `🎵 *LYRICS*\n\n` +
                `🎤 *Title:* ${result.title}\n` +
                `👤 *Artist:* ${result.artist}\n\n` +
                `${result.lyrics}\n\n${config.footer}`
            );
        } else {
            await ctx.reply(`🎵 *LYRICS*\n\n${result}\n\n${config.footer}`);
        }
    } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
    }
};

// Time zones
commands['time'] = async (ctx) => {
    const timezone = ctx.text || 'Asia/Kolkata';
    
    try {
        const time = moment().tz(timezone);
        await ctx.reply(
            `🕐 *TIME*\n\n` +
            `📍 *Timezone:* ${timezone}\n` +
            `📅 *Date:* ${time.format('dddd, MMMM Do YYYY')}\n` +
            `⏰ *Time:* ${time.format('hh:mm:ss A')}\n\n` +
            `${config.footer}`
        );
    } catch (err) {
        await ctx.reply('❌ Invalid timezone! Example: Asia/Kolkata, America/New_York');
    }
};

// Ping
commands['ping'] = async (ctx) => {
    const start = Date.now();
    await ctx.reply('🏓 Pinging...');
    const end = Date.now();
    
    await ctx.reply(
        `🏓 *PONG!*\n\n` +
        `📊 Response: *${end - start}ms*\n` +
        `⏱️ Uptime: *${runtime(process.uptime())}*\n\n` +
        `${config.footer}`
    );
};

// Uptime
commands['uptime'] = async (ctx) => {
    await ctx.reply(
        `⏱️ *BOT UPTIME*\n\n` +
        `🕐 ${runtime(process.uptime())}\n\n` +
        `${config.footer}`
    );
};

// System info
commands['sysinfo'] = commands['system'] = async (ctx) => {
    const used = process.memoryUsage();
    
    await ctx.reply(
        `💻 *SYSTEM INFO*\n\n` +
        `🖥️ *Platform:* ${os.platform()}\n` +
        `🏗️ *Architecture:* ${os.arch()}\n` +
        `💾 *Total RAM:* ${formatBytes(os.totalmem())}\n` +
        `📊 *Free RAM:* ${formatBytes(os.freemem())}\n` +
        `🔧 *CPU:* ${os.cpus()[0].model}\n` +
        `📈 *CPU Cores:* ${os.cpus().length}\n` +
        `⏱️ *System Uptime:* ${runtime(os.uptime())}\n` +
        `📦 *Node.js:* ${process.version}\n` +
        `🗃️ *Heap Used:* ${formatBytes(used.heapUsed)}\n` +
        `🗃️ *RSS:* ${formatBytes(used.rss)}\n\n` +
        `${config.footer}`
    );
};

// IP lookup
commands['ip'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}ip 8.8.8.8`);
    
    try {
        const response = await axios.get(`http://ip-api.com/json/${ctx.text}`);
        const data = response.data;
        
        await ctx.reply(
            `🌐 *IP LOOKUP*\n\n` +
            `📍 *IP:* ${data.query}\n` +
            `🏷️ *ISP:* ${data.isp}\n` +
            `🏢 *Organization:* ${data.org}\n` +
            `🌍 *Country:* ${data.country}\n` +
            `🏙️ *City:* ${data.city}\n` +
            `📮 *Zip:* ${data.zip}\n` +
            `🗺️ *Lat/Lon:* ${data.lat}, ${data.lon}\n` +
            `⏰ *Timezone:* ${data.timezone}\n\n` +
            `${config.footer}`
        );
    } catch (err) {
        await ctx.reply('❌ Failed to lookup IP!');
    }
};

// Base64 encode/decode
commands['base64encode'] = commands['b64e'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide text to encode!');
    const encoded = Buffer.from(ctx.text).toString('base64');
    await ctx.reply(`🔐 *Base64 Encoded:*\n\n${encoded}`);
};

commands['base64decode'] = commands['b64d'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide base64 text to decode!');
    try {
        const decoded = Buffer.from(ctx.text, 'base64').toString('utf-8');
        await ctx.reply(`🔓 *Base64 Decoded:*\n\n${decoded}`);
    } catch {
        await ctx.reply('❌ Invalid base64 text!');
    }
};

// Binary encode/decode
commands['binary'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide text!');
    const binary = ctx.text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    await ctx.reply(`💻 *Binary:*\n\n${binary}`);
};

commands['frombinary'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide binary text!');
    try {
        const text = ctx.text.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        await ctx.reply(`📝 *Decoded:*\n\n${text}`);
    } catch {
        await ctx.reply('❌ Invalid binary!');
    }
};

// Text counter
commands['count'] = async (ctx) => {
    const text = ctx.text || (ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text || '');
    if (!text) return ctx.reply('❌ Provide or reply to text!');
    
    const chars = text.length;
    const words = text.split(/\s+/).filter(w => w).length;
    const lines = text.split('\n').length;
    const spaces = (text.match(/ /g) || []).length;
    
    await ctx.reply(
        `📊 *TEXT COUNTER*\n\n` +
        `📝 Characters: ${chars}\n` +
        `📖 Words: ${words}\n` +
        `📄 Lines: ${lines}\n` +
        `⬜ Spaces: ${spaces}\n\n` +
        `${config.footer}`
    );
};

// Remind / Timer
const reminders = {};

commands['remind'] = commands['timer'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}remind 5m Take medicine`);
    
    const match = ctx.text.match(/^(\d+)(s|m|h)\s+(.*)/);
    if (!match) return ctx.reply('❌ Format: [number][s/m/h] [message]\nExample: 5m Take medicine');
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    const message = match[3];
    
    const multiplier = { s: 1000, m: 60000, h: 3600000 };
    const unitName = { s: 'second(s)', m: 'minute(s)', h: 'hour(s)' };
    const ms = amount * multiplier[unit];
    
    await ctx.reply(`⏰ *Reminder Set!*\n\n📝 ${message}\n⏱️ In ${amount} ${unitName[unit]}\n\n${config.footer}`);
    
    setTimeout(async () => {
        await ctx.sock.sendMessage(ctx.from, {
            text: `⏰ *REMINDER!*\n\n@${ctx.senderNumber}, you asked me to remind you:\n\n📝 ${message}\n\n${config.footer}`,
            mentions: [ctx.sender]
        });
    }, ms);
};

// Carbon (code screenshot)
commands['carbon'] = async (ctx) => {
    const text = ctx.text || (ctx.quoted?.message?.conversation || '');
    if (!text) return ctx.reply('❌ Provide code text!');
    
    try {
        const response = await axios.post('https://carbonara.solopov.dev/api/cook', {
            code: text,
            backgroundColor: '#1F1F1F',
            theme: 'dracula',
            language: 'auto'
        }, { responseType: 'arraybuffer' });
        
        await ctx.sock.sendMessage(ctx.from, {
            image: Buffer.from(response.data),
            caption: `💻 *Carbon Code*\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Failed to generate carbon image!');
    }
};

module.exports = commands;