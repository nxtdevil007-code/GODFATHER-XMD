const config = require('../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const commands = {};

// Image/Video to Sticker
commands['sticker'] = commands['s'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isImage = ctx.messageType === 'imageMessage' || quotedType === 'imageMessage';
    const isVideo = ctx.messageType === 'videoMessage' || quotedType === 'videoMessage';
    
    if (!isImage && !isVideo) {
        return ctx.reply(`❌ Send or reply to an image/video with ${ctx.prefix}sticker`);
    }
    
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
        
        const sticker = new Sticker(buffer, {
            pack: ctx.args[0] || config.packname,
            author: ctx.args[1] || config.author,
            type: StickerTypes.FULL,
            categories: ['🤖'],
            quality: 70
        });
        
        const stickerBuffer = await sticker.toBuffer();
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: stickerBuffer
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply(`❌ Sticker creation failed: ${err.message}`);
    }
};

// Circular sticker
commands['scircle'] = commands['circle'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isImage = ctx.messageType === 'imageMessage' || quotedType === 'imageMessage';
    
    if (!isImage) return ctx.reply(`❌ Send or reply to an image with ${ctx.prefix}scircle`);
    
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
        
        const sticker = new Sticker(buffer, {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.CIRCLE,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Sticker creation failed!');
    }
};

// Rounded sticker
commands['srounded'] = commands['rounded'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isImage = ctx.messageType === 'imageMessage' || quotedType === 'imageMessage';
    
    if (!isImage) return ctx.reply(`❌ Send or reply to an image with ${ctx.prefix}srounded`);
    
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
        
        const sticker = new Sticker(buffer, {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.ROUNDED,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Sticker creation failed!');
    }
};

// Crop sticker
commands['scrop'] = commands['crop'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isImage = ctx.messageType === 'imageMessage' || quotedType === 'imageMessage';
    
    if (!isImage) return ctx.reply(`❌ Send or reply to an image with ${ctx.prefix}scrop`);
    
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
        
        const sticker = new Sticker(buffer, {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.CROPPED,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Sticker creation failed!');
    }
};

// Sticker to Image
commands['toimg'] = commands['stickertoimage'] = commands['toimage'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isSticker = ctx.messageType === 'stickerMessage' || quotedType === 'stickerMessage';
    
    if (!isSticker) return ctx.reply(`❌ Reply to a sticker with ${ctx.prefix}toimg`);
    
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
        
        const sharp = require('sharp');
        const pngBuffer = await sharp(buffer).png().toBuffer();
        
        await ctx.sock.sendMessage(ctx.from, {
            image: pngBuffer,
            caption: `🖼️ *Sticker to Image*\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Conversion failed!');
    }
};

// Text to sticker
commands['tsticker'] = commands['textsticker'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}tsticker Hello World`);
    
    try {
        // Create text image
        const Jimp = require('jimp');
        const image = new Jimp(512, 512, 0x00000000);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        
        image.print(
            font, 0, 0,
            {
                text: ctx.text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            512, 512
        );
        
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        
        const sticker = new Sticker(buffer, {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.FULL,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Text sticker creation failed!');
    }
};

// URL to sticker
commands['surl'] = commands['stickurl'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}surl <image URL>`);
    
    try {
        const response = await axios.get(ctx.text, { responseType: 'arraybuffer' });
        
        const sticker = new Sticker(Buffer.from(response.data), {
            pack: config.packname,
            author: config.author,
            type: StickerTypes.FULL,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ URL sticker creation failed!');
    }
};

// Change sticker pack info
commands['steal'] = commands['take'] = async (ctx) => {
    const quotedType = ctx.quoted?.message ? Object.keys(ctx.quoted.message)[0] : null;
    const isSticker = ctx.messageType === 'stickerMessage' || quotedType === 'stickerMessage';
    
    if (!isSticker) return ctx.reply(`❌ Reply to a sticker with ${ctx.prefix}steal pack|author`);
    
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
        
        const [pack, author] = (ctx.text || '').split('|').map(s => s?.trim());
        
        const sticker = new Sticker(buffer, {
            pack: pack || config.packname,
            author: author || config.author,
            type: StickerTypes.FULL,
            quality: 70
        });
        
        await ctx.sock.sendMessage(ctx.from, {
            sticker: await sticker.toBuffer()
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Steal sticker failed!');
    }
};

module.exports = commands;