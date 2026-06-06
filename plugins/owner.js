const config = require('../config');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const commands = {};

// Eval command
commands['eval'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    
    try {
        let result = eval(ctx.text);
        if (typeof result === 'object') result = JSON.stringify(result, null, 2);
        await ctx.reply(`📝 *Eval Result:*\n\n${result}`);
    } catch (err) {
        await ctx.reply(`❌ *Error:*\n\n${err.message}`);
    }
};

// Shell command
commands['shell'] = commands['$'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide a command!');
    
    exec(ctx.text, (err, stdout, stderr) => {
        if (err) return ctx.reply(`❌ *Error:*\n${err.message}`);
        if (stderr) return ctx.reply(`⚠️ *Stderr:*\n${stderr}`);
        ctx.reply(`💻 *Output:*\n\n${stdout || 'No output'}`);
    });
};

// Set bot settings
commands['setprefix'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide new prefix!');
    
    config.prefix = ctx.text;
    await ctx.reply(`✅ Prefix changed to: *${ctx.text}*`);
};

commands['setbotname'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide new bot name!');
    
    config.botName = ctx.text;
    await ctx.reply(`✅ Bot name changed to: *${ctx.text}*`);
};

// Mode commands
commands['public'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.mode = 'public';
    await ctx.reply('✅ Bot is now in *Public* mode!');
};

commands['private'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.mode = 'private';
    await ctx.reply('✅ Bot is now in *Private* mode (owner only)!');
};

// Broadcast
commands['broadcast'] = commands['bc'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide broadcast message!');
    
    const groups = await ctx.sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    let success = 0;
    let failed = 0;
    
    for (const id of groupIds) {
        try {
            await ctx.sock.sendMessage(id, {
                text: `📢 *BROADCAST*\n\n${ctx.text}\n\n${config.footer}`
            });
            success++;
        } catch {
            failed++;
        }
    }
    
    await ctx.reply(`📢 *Broadcast Complete!*\n\n✅ Success: ${success}\n❌ Failed: ${failed}`);
};

// Block/Unblock
commands['block'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to a message or provide a number!');
    
    await ctx.sock.updateBlockStatus(target, 'block');
    await ctx.reply(`✅ @${target.split('@')[0]} has been blocked!`, { mentions: [target] });
};

commands['unblock'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to a message or provide a number!');
    
    await ctx.sock.updateBlockStatus(target, 'unblock');
    await ctx.reply(`✅ @${target.split('@')[0]} has been unblocked!`, { mentions: [target] });
};

// Join group
commands['join'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide group link!');
    
    const link = ctx.text.match(/chat.whatsapp.com\/([a-zA-Z0-9]+)/);
    if (!link) return ctx.reply('❌ Invalid group link!');
    
    try {
        await ctx.sock.groupAcceptInvite(link[1]);
        await ctx.reply('✅ Successfully joined the group!');
    } catch (err) {
        await ctx.reply(`❌ Failed to join: ${err.message}`);
    }
};

// Leave group
commands['leave'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.isGroup) return ctx.reply('❌ This command can only be used in groups!');
    
    await ctx.reply('👋 Goodbye!');
    await ctx.sock.groupLeave(ctx.from);
};

// Toggle settings
commands['antilink'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.antiLink = !config.antiLink;
    await ctx.reply(`✅ Anti-Link is now *${config.antiLink ? 'ON' : 'OFF'}*`);
};

commands['antidelete'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.antiDelete = !config.antiDelete;
    await ctx.reply(`✅ Anti-Delete is now *${config.antiDelete ? 'ON' : 'OFF'}*`);
};

commands['anticall'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.antiCall = !config.antiCall;
    await ctx.reply(`✅ Anti-Call is now *${config.antiCall ? 'ON' : 'OFF'}*`);
};

commands['autoread'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.autoRead = !config.autoRead;
    await ctx.reply(`✅ Auto-Read is now *${config.autoRead ? 'ON' : 'OFF'}*`);
};

commands['autostatus'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    config.autoStatusView = !config.autoStatusView;
    await ctx.reply(`✅ Auto-Status View is now *${config.autoStatusView ? 'ON' : 'OFF'}*`);
};

// Clear all chats
commands['clearchat'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    
    await ctx.sock.chatModify({ delete: true, lastMessages: [{ key: ctx.msg.key, messageTimestamp: ctx.msg.messageTimestamp }] }, ctx.from);
    await ctx.reply('✅ Chat cleared!');
};

// Set profile picture
commands['setpp'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.quoted || ctx.quoted.message?.imageMessage === undefined) {
        return ctx.reply('❌ Reply to an image!');
    }
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
        { key: ctx.quoted.key, message: ctx.quoted.message },
        'buffer'
    );
    
    await ctx.sock.updateProfilePicture(ctx.sock.user.id, buffer);
    await ctx.reply('✅ Profile picture updated!');
};

// Set bio
commands['setbio'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    if (!ctx.text) return ctx.reply('❌ Provide bio text!');
    
    await ctx.sock.updateProfileStatus(ctx.text);
    await ctx.reply(`✅ Bio updated to: ${ctx.text}`);
};

// Restart
commands['restart'] = async (ctx) => {
    if (!ctx.isOwner) return ctx.reply('❌ Owner only command!');
    await ctx.reply('🔄 Restarting bot...');
    process.exit(0);
};

module.exports = commands;