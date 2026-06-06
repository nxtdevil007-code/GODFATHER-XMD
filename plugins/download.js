const config = require('../config');
const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');

const commands = {};

// YouTube audio download
commands['play'] = commands['song'] = commands['ytmp3'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}play song name or YouTube URL`);
    
    try {
        let videoUrl = ctx.text;
        let videoInfo;
        
        // If not a URL, search for it
        if (!ctx.text.includes('youtube.com') && !ctx.text.includes('youtu.be')) {
            const search = await yts(ctx.text);
            if (!search.videos.length) return ctx.reply('❌ No results found!');
            
            const video = search.videos[0];
            videoUrl = video.url;
            videoInfo = video;
        }
        
        // Send info first
        const info = videoInfo || (await yts({ videoId: ytdl.getURLVideoID(videoUrl) }));
        
        await ctx.sock.sendMessage(ctx.from, {
            text: `🎵 *Downloading Audio...*\n\n` +
                `📌 *Title:* ${info.title || 'Unknown'}\n` +
                `👤 *Channel:* ${info.author?.name || 'Unknown'}\n` +
                `⏱️ *Duration:* ${info.timestamp || 'Unknown'}\n\n` +
                `⏳ Please wait...`
        }, { quoted: ctx.msg });
        
        // Download using ytdl-core
        try {
            const stream = ytdl(videoUrl, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });
            
            const tempFile = path.join(__dirname, '..', 'temp', `${Date.now()}.mp3`);
            await fs.ensureDir(path.join(__dirname, '..', 'temp'));
            
            const writeStream = fs.createWriteStream(tempFile);
            stream.pipe(writeStream);
            
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            await ctx.sock.sendMessage(ctx.from, {
                audio: fs.readFileSync(tempFile),
                mimetype: 'audio/mpeg',
                fileName: `${info.title || 'audio'}.mp3`
            }, { quoted: ctx.msg });
            
            await fs.remove(tempFile);
        } catch (dlErr) {
            // Fallback API
            const apiUrl = `https://api.lolhuman.xyz/api/ytaudio?apikey=YOUR_KEY&url=${videoUrl}`;
            await ctx.sock.sendMessage(ctx.from, {
                audio: { url: apiUrl },
                mimetype: 'audio/mpeg'
            }, { quoted: ctx.msg });
        }
    } catch (err) {
        await ctx.reply(`❌ Download failed: ${err.message}`);
    }
};

// YouTube video download
commands['video'] = commands['ytmp4'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}video song name or YouTube URL`);
    
    try {
        let videoUrl = ctx.text;
        
        if (!ctx.text.includes('youtube.com') && !ctx.text.includes('youtu.be')) {
            const search = await yts(ctx.text);
            if (!search.videos.length) return ctx.reply('❌ No results found!');
            videoUrl = search.videos[0].url;
        }
        
        await ctx.reply('🎬 *Downloading Video...*\n\n⏳ Please wait...');
        
        try {
            const stream = ytdl(videoUrl, {
                filter: 'videoandaudio',
                quality: 'highest'
            });
            
            const tempFile = path.join(__dirname, '..', 'temp', `${Date.now()}.mp4`);
            await fs.ensureDir(path.join(__dirname, '..', 'temp'));
            
            const writeStream = fs.createWriteStream(tempFile);
            stream.pipe(writeStream);
            
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            const stats = await fs.stat(tempFile);
            if (stats.size > config.downloadLimit * 1024 * 1024) {
                await fs.remove(tempFile);
                return ctx.reply(`❌ File too large! Limit is ${config.downloadLimit}MB`);
            }
            
            await ctx.sock.sendMessage(ctx.from, {
                video: fs.readFileSync(tempFile),
                caption: `🎬 *Downloaded!*\n\n${config.footer}`
            }, { quoted: ctx.msg });
            
            await fs.remove(tempFile);
        } catch (dlErr) {
            await ctx.reply(`❌ Download failed: ${dlErr.message}`);
        }
    } catch (err) {
        await ctx.reply(`❌ Error: ${err.message}`);
    }
};

// Instagram download
commands['ig'] = commands['instagram'] = commands['igdl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}ig <instagram URL>`);
    if (!ctx.text.includes('instagram.com')) return ctx.reply('❌ Invalid Instagram URL!');
    
    try {
        await ctx.reply('📥 *Downloading from Instagram...*\n\n⏳ Please wait...');
        
        const response = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=YOUR_KEY&url=${ctx.text}`);
        
        if (response.data?.result) {
            for (const url of response.data.result) {
                await ctx.sock.sendMessage(ctx.from, {
                    video: { url },
                    caption: `📸 *Instagram Download*\n\n${config.footer}`
                }, { quoted: ctx.msg });
            }
        } else {
            await ctx.reply('❌ Could not download from Instagram!');
        }
    } catch (err) {
        await ctx.reply('❌ Instagram download failed!');
    }
};

// TikTok download
commands['tiktok'] = commands['tt'] = commands['ttdl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}tiktok <tiktok URL>`);
    if (!ctx.text.includes('tiktok.com')) return ctx.reply('❌ Invalid TikTok URL!');
    
    try {
        await ctx.reply('📥 *Downloading from TikTok...*\n\n⏳ Please wait...');
        
        const response = await axios.get(`https://api.lolhuman.xyz/api/tiktok?apikey=YOUR_KEY&url=${ctx.text}`);
        
        if (response.data?.result?.link) {
            await ctx.sock.sendMessage(ctx.from, {
                video: { url: response.data.result.link },
                caption: `🎵 *TikTok Download*\n\n📌 ${response.data.result.title || ''}\n\n${config.footer}`
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply('❌ Could not download from TikTok!');
        }
    } catch (err) {
        await ctx.reply('❌ TikTok download failed!');
    }
};

// Facebook download
commands['fb'] = commands['facebook'] = commands['fbdl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}fb <facebook video URL>`);
    
    try {
        await ctx.reply('📥 *Downloading from Facebook...*\n\n⏳ Please wait...');
        
        const response = await axios.get(`https://api.lolhuman.xyz/api/facebook?apikey=YOUR_KEY&url=${ctx.text}`);
        
        if (response.data?.result) {
            await ctx.sock.sendMessage(ctx.from, {
                video: { url: response.data.result },
                caption: `📘 *Facebook Download*\n\n${config.footer}`
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply('❌ Could not download from Facebook!');
        }
    } catch (err) {
        await ctx.reply('❌ Facebook download failed!');
    }
};

// Twitter download
commands['twitter'] = commands['twdl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}twitter <twitter URL>`);
    
    try {
        await ctx.reply('📥 *Downloading from Twitter...*\n\n⏳ Please wait...');
        
        const response = await axios.get(`https://api.lolhuman.xyz/api/twitter?apikey=YOUR_KEY&url=${ctx.text}`);
        
        if (response.data?.result) {
            for (const media of response.data.result) {
                await ctx.sock.sendMessage(ctx.from, {
                    video: { url: media.url || media },
                    caption: `🐦 *Twitter Download*\n\n${config.footer}`
                }, { quoted: ctx.msg });
            }
        } else {
            await ctx.reply('❌ Could not download from Twitter!');
        }
    } catch (err) {
        await ctx.reply('❌ Twitter download failed!');
    }
};

// Media file download from URL
commands['fetch'] = commands['get'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}fetch <URL>`);
    
    try {
        const response = await axios.head(ctx.text);
        const contentType = response.headers['content-type'];
        
        if (contentType.includes('image')) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: ctx.text },
                caption: `📥 *Fetched Image*\n\n${config.footer}`
            }, { quoted: ctx.msg });
        } else if (contentType.includes('video')) {
            await ctx.sock.sendMessage(ctx.from, {
                video: { url: ctx.text },
                caption: `📥 *Fetched Video*\n\n${config.footer}`
            }, { quoted: ctx.msg });
        } else if (contentType.includes('audio')) {
            await ctx.sock.sendMessage(ctx.from, {
                audio: { url: ctx.text },
                mimetype: 'audio/mpeg'
            }, { quoted: ctx.msg });
        } else {
            const data = await axios.get(ctx.text);
            const text = typeof data.data === 'object' ? JSON.stringify(data.data, null, 2) : data.data;
            await ctx.reply(`📥 *Fetched Data:*\n\n${text.substring(0, 4000)}`);
        }
    } catch (err) {
        await ctx.reply(`❌ Fetch failed: ${err.message}`);
    }
};

module.exports = commands;