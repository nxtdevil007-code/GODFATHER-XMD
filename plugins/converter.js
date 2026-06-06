const config = require('../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

const commands = {};

// Audio to PTT (Voice Note)
commands['toptt'] = commands['tovn'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isAudio = ctx.messageType === 'audioMessage' || quotedType === 'audioMessage';
    
    if (!isAudio) return ctx.reply(`❌ Reply to an audio with ${ctx.prefix}toptt`);
    
    try {
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        await ctx.sock.sendMessage(ctx.from, {
            audio: buffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Conversion failed!');
    }
};

// PTT to Audio
commands['toaudio'] = commands['tomp3'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isAudio = ctx.messageType === 'audioMessage' || quotedType === 'audioMessage';
    
    if (!isAudio) return ctx.reply(`❌ Reply to a voice note with ${ctx.prefix}toaudio`);
    
    try {
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        await ctx.sock.sendMessage(ctx.from, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Conversion failed!');
    }
};

// Video to audio
commands['toaudiofromvideo'] = commands['mp3'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isVideo = ctx.messageType === 'videoMessage' || quotedType === 'videoMessage';
    
    if (!isVideo) return ctx.reply(`❌ Reply to a video with ${ctx.prefix}mp3`);
    
    try {
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        const tempDir = path.join(__dirname, '..', 'temp');
        await fs.ensureDir(tempDir);
        
        const inputFile = path.join(tempDir, `${Date.now()}.mp4`);
        const outputFile = path.join(tempDir, `${Date.now()}.mp3`);
        
        await fs.writeFile(inputFile, buffer);
        
        // Use ffmpeg for conversion
        const ffmpeg = require('fluent-ffmpeg');
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(outputFile);
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            audio: fs.readFileSync(outputFile),
            mimetype: 'audio/mpeg'
        }, { quoted: ctx.msg });
        
        await fs.remove(inputFile);
        await fs.remove(outputFile);
    } catch (err) {
        await ctx.reply(`❌ Conversion failed: ${err.message}`);
    }
};

// Document to Image/Video
commands['todoc'] = commands['todocument'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isMedia = ['imageMessage', 'videoMessage', 'audioMessage'].includes(ctx.messageType) || 
                    ['imageMessage', 'videoMessage', 'audioMessage'].includes(quotedType);
    
    if (!isMedia) return ctx.reply(`❌ Reply to media with ${ctx.prefix}todoc`);
    
    try {
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        const mediaType = quotedType || ctx.messageType;
        const mimeMap = {
            'imageMessage': { mime: 'image/jpeg', ext: 'jpg' },
            'videoMessage': { mime: 'video/mp4', ext: 'mp4' },
            'audioMessage': { mime: 'audio/mpeg', ext: 'mp3' }
        };
        
        const { mime, ext } = mimeMap[mediaType] || { mime: 'application/octet-stream', ext: 'bin' };
        
        await ctx.sock.sendMessage(ctx.from, {
            document: buffer,
            mimetype: mime,
            fileName: `GODFATHER_XMD_${Date.now()}.${ext}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Conversion failed!');
    }
};

// Image to URL
commands['tourl'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isImage = ctx.messageType === 'imageMessage' || quotedType === 'imageMessage';
    
    if (!isImage) return ctx.reply(`❌ Reply to an image with ${ctx.prefix}tourl`);
    
    try {
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        const axios = require('axios');
        const FormData = require('form-data') || null;
        
        // Upload to telegraph or imgbb
        const form = new (require('form-data'))();
        form.append('image', buffer.toString('base64'));
        
        const response = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_KEY', form, {
            headers: form.getHeaders()
        });
        
        if (response.data?.data?.url) {
            await ctx.reply(`🔗 *Image URL:*\n\n${response.data.data.url}\n\n${config.footer}`);
        } else {
            // Fallback: telegraph
            await ctx.reply('❌ Upload failed!');
        }
    } catch (err) {
        await ctx.reply('❌ Upload failed!');
    }
};

// GIF to sticker
commands['gifsticker'] = commands['sgif'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isVideo = ctx.messageType === 'videoMessage' || quotedType === 'videoMessage';
    
    if (!isVideo) return ctx.reply(`❌ Reply to a GIF/short video with ${ctx.prefix}sgif`);
    
    try {
        const { Sticker, StickerTypes } = require('wa-sticker-formatter');
        
        let buffer;
        if (quotedType) {
            buffer = await downloadMediaMessage(
                { key: ctx.quoted.key, message: ctx.quoted.message },
                'buffer'
            );
        } else {
            buffer = await downloadMediaMessage(ctx.msg, 'buffer');
        }
        
        const sticker = new Sticker(buffer, {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.FULL,
            quality: 50
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ GIF sticker creation failed!');
    }
};

module.exports = commands;