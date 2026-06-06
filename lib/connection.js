const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const NodeCache = require('node-cache');
const config = require('../config');
const { handleMessage } = require('./message-handler');

const msgRetryCounterCache = new NodeCache();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.join(__dirname, '..', 'auth', config.sessionName)
    );
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(chalk.cyan(`[INFO] Using WA v${version.join('.')}, isLatest: ${isLatest}`));
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        browser: Browsers.macOS('GODFATHER XMD'),
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: config.alwaysOnline,
    });
    
    // Store for anti-delete
    const messageStore = {};
    
    // Connection update handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            
            if (reason === DisconnectReason.badSession) {
                console.log(chalk.red('[ERROR] Bad session, please delete auth folder and scan again'));
                await fs.remove(path.join(__dirname, '..', 'auth'));
                startBot();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(chalk.yellow('[WARN] Connection closed, reconnecting...'));
                startBot();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(chalk.yellow('[WARN] Connection lost, reconnecting...'));
                startBot();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(chalk.red('[ERROR] Connection replaced, please close other session'));
                process.exit(1);
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('[ERROR] Logged out, please scan again'));
                await fs.remove(path.join(__dirname, '..', 'auth'));
                startBot();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(chalk.yellow('[INFO] Restart required, restarting...'));
                startBot();
            } else if (reason === DisconnectReason.timedOut) {
                console.log(chalk.yellow('[WARN] Connection timed out, reconnecting...'));
                startBot();
            } else {
                console.log(chalk.red(`[ERROR] Unknown disconnect reason: ${reason}`));
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('[SUCCESS] GODFATHER XMD Connected Successfully! ✅'));
            console.log(chalk.green(`[INFO] Bot created by ${config.ownerName}`));
            
            // Send connected message to owner
            const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
            await sock.sendMessage(ownerJid, {
                text: `╔══════════════════════╗\n║  *GODFATHER XMD*     ║\n║  Bot Connected! ✅   ║\n║  Created by Soham    ║\n╚══════════════════════╝\n\n🤖 *Bot Status:* Active\n📅 *Date:* ${new Date().toLocaleDateString()}\n⏰ *Time:* ${new Date().toLocaleTimeString()}\n🔧 *Mode:* ${config.mode}\n📌 *Prefix:* ${config.prefix}`
            });
        }
    });
    
    // Credentials update
    sock.ev.on('creds.update', saveCreds);
    
    // Message handler
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        
        const msg = m.messages[0];
        if (!msg.message) return;
        if (msg.key.fromMe && !config.selfMode) return;
        
        // Store messages for anti-delete
        if (config.antiDelete) {
            messageStore[msg.key.id] = msg;
        }
        
        // Auto read
        if (config.autoRead) {
            await sock.readMessages([msg.key]);
        }
        
        // Auto status view
        if (config.autoStatusView && msg.key.remoteJid === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            return;
        }
        
        // Handle the message
        try {
            await handleMessage(sock, msg, messageStore);
        } catch (err) {
            console.error(chalk.red('[ERROR] Message handling:'), err);
        }
    });
    
    // Group participants update (Welcome/Goodbye)
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        try {
            const metadata = await sock.groupMetadata(id);
            
            for (const participant of participants) {
                const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => 
                    'https://i.ibb.co/sVSqsGF/default-avatar.jpg'
                );
                
                if (action === 'add' && config.welcome) {
                    const welcomeMsg = `╔══════════════════════╗\n` +
                        `║  🎉 *WELCOME!*       ║\n` +
                        `╚══════════════════════╝\n\n` +
                        `👋 Hello @${participant.split('@')[0]}!\n\n` +
                        `📌 *Group:* ${metadata.subject}\n` +
                        `👥 *Members:* ${metadata.participants.length}\n` +
                        `📜 *Description:*\n${metadata.desc || 'No description'}\n\n` +
                        `_Enjoy your stay! 🤖_\n\n` +
                        `${config.footer}`;
                    
                    await sock.sendMessage(id, {
                        image: { url: ppUrl },
                        caption: welcomeMsg,
                        mentions: [participant]
                    });
                }
                
                if (action === 'remove' && config.goodbye) {
                    const goodbyeMsg = `╔══════════════════════╗\n` +
                        `║  👋 *GOODBYE!*       ║\n` +
                        `╚══════════════════════╝\n\n` +
                        `😢 @${participant.split('@')[0]} has left\n\n` +
                        `📌 *Group:* ${metadata.subject}\n` +
                        `👥 *Remaining:* ${metadata.participants.length}\n\n` +
                        `_We'll miss you! 💔_\n\n` +
                        `${config.footer}`;
                    
                    await sock.sendMessage(id, {
                        image: { url: ppUrl },
                        caption: goodbyeMsg,
                        mentions: [participant]
                    });
                }
                
                if (action === 'promote') {
                    await sock.sendMessage(id, {
                        text: `╔══════════════════════╗\n║  ⬆️ *PROMOTED!*      ║\n╚══════════════════════╝\n\n👑 @${participant.split('@')[0]} is now an admin!\n\n${config.footer}`,
                        mentions: [participant]
                    });
                }
                
                if (action === 'demote') {
                    await sock.sendMessage(id, {
                        text: `╔══════════════════════╗\n║  ⬇️ *DEMOTED!*       ║\n╚══════════════════════╝\n\n📉 @${participant.split('@')[0]} is no longer an admin!\n\n${config.footer}`,
                        mentions: [participant]
                    });
                }
            }
        } catch (err) {
            console.error(chalk.red('[ERROR] Group update:'), err);
        }
    });
    
    // Anti-call
    if (config.antiCall) {
        sock.ev.on('call', async (calls) => {
            for (const call of calls) {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: '🚫 *Auto-Reject Call*\n\nSorry, this bot does not accept calls. Please send a message instead.\n\n' + config.footer
                    });
                }
            }
        });
    }
    
    // Message delete detection
    if (config.antiDelete) {
        sock.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                if (update.update.messageStubType === 68) { // Message deleted
                    const deletedMsg = messageStore[update.key.id];
                    if (deletedMsg) {
                        const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
                        await sock.sendMessage(ownerJid, {
                            text: `🗑️ *Anti-Delete Detected!*\n\n👤 *From:* @${deletedMsg.key.participant?.split('@')[0] || deletedMsg.key.remoteJid.split('@')[0]}\n📍 *In:* ${deletedMsg.key.remoteJid}\n\n💬 *Message:* ${deletedMsg.message?.conversation || deletedMsg.message?.extendedTextMessage?.text || 'Media message'}`,
                            mentions: [deletedMsg.key.participant || deletedMsg.key.remoteJid]
                        });
                    }
                }
            }
        });
    }
    
    return sock;
}

module.exports = { startBot };