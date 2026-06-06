const config = require('../config');
const chalk = require('chalk');
const { getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

// Import all plugins
const ownerPlugin = require('../plugins/owner');
const groupPlugin = require('../plugins/group');
const funPlugin = require('../plugins/fun');
const toolsPlugin = require('../plugins/tools');
const searchPlugin = require('../plugins/search');
const downloadPlugin = require('../plugins/download');
const aiPlugin = require('../plugins/ai');
const stickerPlugin = require('../plugins/sticker');
const converterPlugin = require('../plugins/converter');
const infoPlugin = require('../plugins/info');
const animePlugin = require('../plugins/anime');

// Merge all commands
const allPlugins = {
    ...ownerPlugin,
    ...groupPlugin,
    ...funPlugin,
    ...toolsPlugin,
    ...searchPlugin,
    ...downloadPlugin,
    ...aiPlugin,
    ...stickerPlugin,
    ...converterPlugin,
    ...infoPlugin,
    ...animePlugin,
};

// Anti-spam tracker
const spamTracker = {};

async function handleMessage(sock, msg, messageStore) {
    try {
        const messageType = getContentType(msg.message);
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? msg.key.participant : from;
        const senderNumber = sender.split('@')[0];
        const pushName = msg.pushName || 'Unknown';
        const isOwner = config.ownerNumber.includes(senderNumber);
        
        // Get message body
        let body = '';
        if (messageType === 'conversation') {
            body = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage.text;
        } else if (messageType === 'imageMessage') {
            body = msg.message.imageMessage.caption || '';
        } else if (messageType === 'videoMessage') {
            body = msg.message.videoMessage.caption || '';
        } else if (messageType === 'buttonsResponseMessage') {
            body = msg.message.buttonsResponseMessage.selectedButtonId;
        } else if (messageType === 'listResponseMessage') {
            body = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
        } else if (messageType === 'templateButtonReplyMessage') {
            body = msg.message.templateButtonReplyMessage.selectedId;
        }
        
        if (!body) return;
        
        // Check prefix
        const isCmd = body.startsWith(config.prefix);
        if (!isCmd) return;
        
        const fullCmd = body.slice(config.prefix.length).trim();
        const args = fullCmd.split(/\s+/);
        const command = args.shift().toLowerCase();
        const text = args.join(' ');
        
        // Mode check
        if (config.mode === 'private' && !isOwner) return;
        
        // Anti-spam
        if (config.antiSpam && !isOwner) {
            const now = Date.now();
            if (!spamTracker[sender]) spamTracker[sender] = [];
            spamTracker[sender].push(now);
            spamTracker[sender] = spamTracker[sender].filter(t => now - t < 5000);
            if (spamTracker[sender].length > 5) {
                await sock.sendMessage(from, {
                    text: '⚠️ *Anti-Spam!*\nYou are sending commands too fast. Please slow down.'
                }, { quoted: msg });
                return;
            }
        }
        
        // Group metadata
        let groupMetadata = null;
        let groupName = '';
        let isAdmin = false;
        let isBotAdmin = false;
        let participants = [];
        
        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);
            groupName = groupMetadata.subject;
            participants = groupMetadata.participants;
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            isAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
            isBotAdmin = participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
        }
        
        // Anti-link check
        if (config.antiLink && isGroup && !isAdmin && !isOwner) {
            const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
            if (linkRegex.test(body)) {
                if (isBotAdmin) {
                    await sock.sendMessage(from, {
                        text: '🔗 *Anti-Link Detected!*\n\n@' + senderNumber + ' links are not allowed here!',
                        mentions: [sender]
                    });
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                }
                return;
            }
        }
        
        // Typing indicator
        if (config.autoTyping) {
            await sock.sendPresenceUpdate('composing', from);
        }
        
        // Log command
        console.log(chalk.cyan(`[CMD] ${pushName} (${senderNumber}) => ${config.prefix}${command} ${text}`));
        
        // Context object for plugins
        const ctx = {
            sock,
            msg,
            from,
            sender,
            senderNumber,
            pushName,
            isGroup,
            isOwner,
            isAdmin,
            isBotAdmin,
            groupMetadata,
            groupName,
            participants,
            command,
            args,
            text,
            prefix: config.prefix,
            config,
            messageType,
            messageStore,
            body,
            quoted: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
                message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
                sender: msg.message.extendedTextMessage.contextInfo.participant,
                key: {
                    remoteJid: from,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                }
            } : null,
            reply: async (text) => {
                await sock.sendMessage(from, { text }, { quoted: msg });
            },
            react: async (emoji) => {
                await sock.sendMessage(from, {
                    react: { text: emoji, key: msg.key }
                });
            }
        };
        
        // Find and execute command
        if (allPlugins[command]) {
            try {
                await ctx.react('⏳');
                await allPlugins[command](ctx);
                await ctx.react('✅');
            } catch (err) {
                console.error(chalk.red(`[ERROR] Command ${command}:`), err);
                await ctx.react('❌');
                await ctx.reply(`❌ *Error executing command!*\n\n${err.message}`);
            }
        } else {
            // Command not found
            await ctx.reply(`❓ *Command not found!*\n\nUse *${config.prefix}menu* to see available commands.\n\n${config.footer}`);
        }
        
    } catch (err) {
        console.error(chalk.red('[ERROR] Message handler:'), err);
    }
}

module.exports = { handleMessage };