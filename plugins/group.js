const config = require('../config');

const commands = {};

// Kick member
commands['kick'] = commands['remove'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone!');
    
    await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
    await ctx.reply(`✅ @${target.split('@')[0]} has been removed!`, { mentions: [target] });
};

// Add member
commands['add'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    if (!ctx.args[0]) return ctx.reply('❌ Provide a phone number!');
    const number = ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    try {
        await ctx.sock.groupParticipantsUpdate(ctx.from, [number], 'add');
        await ctx.reply(`✅ @${number.split('@')[0]} has been added!`, { mentions: [number] });
    } catch (err) {
        await ctx.reply(`❌ Failed to add: ${err.message}`);
    }
};

// Promote
commands['promote'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone!');
    
    await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'promote');
    await ctx.reply(`✅ @${target.split('@')[0]} has been promoted to admin!`, { mentions: [target] });
};

// Demote
commands['demote'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone!');
    
    await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'demote');
    await ctx.reply(`✅ @${target.split('@')[0]} has been demoted!`, { mentions: [target] });
};

// Mute group (only admins can send messages)
commands['mute'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    await ctx.sock.groupSettingUpdate(ctx.from, 'announcement');
    await ctx.reply('🔇 Group has been *muted*! Only admins can send messages.');
};

// Unmute group
commands['unmute'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement');
    await ctx.reply('🔊 Group has been *unmuted*! Everyone can send messages.');
};

// Lock group (only admins can edit settings)
commands['lock'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    await ctx.sock.groupSettingUpdate(ctx.from, 'locked');
    await ctx.reply('🔒 Group has been *locked*! Only admins can edit group info.');
};

// Unlock group
commands['unlock'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    await ctx.sock.groupSettingUpdate(ctx.from, 'unlocked');
    await ctx.reply('🔓 Group has been *unlocked*! Everyone can edit group info.');
};

// Tag all
commands['tagall'] = commands['everyone'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    
    let text = `╔══════════════════════╗\n║ 📢 *TAG ALL*         ║\n╚══════════════════════╝\n\n`;
    text += ctx.text ? `📝 *Message:* ${ctx.text}\n\n` : '';
    
    const mentions = [];
    for (const participant of ctx.participants) {
        text += `│ 👤 @${participant.id.split('@')[0]}\n`;
        mentions.push(participant.id);
    }
    
    text += `\n👥 *Total:* ${ctx.participants.length} members\n\n${config.footer}`;
    
    await ctx.sock.sendMessage(ctx.from, { text, mentions });
};

// Hidetag
commands['hidetag'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.text) return ctx.reply('❌ Provide a message!');
    
    const mentions = ctx.participants.map(p => p.id);
    await ctx.sock.sendMessage(ctx.from, { text: ctx.text, mentions });
};

// Group info
commands['groupinfo'] = commands['ginfo'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    
    const metadata = ctx.groupMetadata;
    const admins = metadata.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`);
    const adminMentions = metadata.participants.filter(p => p.admin).map(p => p.id);
    
    const text = `╔══════════════════════╗\n` +
        `║ 📋 *GROUP INFO*      ║\n` +
        `╚══════════════════════╝\n\n` +
        `📌 *Name:* ${metadata.subject}\n` +
        `🆔 *ID:* ${metadata.id}\n` +
        `👥 *Members:* ${metadata.participants.length}\n` +
        `👑 *Admins:* ${admins.length}\n` +
        `📜 *Description:*\n${metadata.desc || 'No description'}\n\n` +
        `👑 *Admin List:*\n${admins.join('\n')}\n\n` +
        `${config.footer}`;
    
    await ctx.sock.sendMessage(ctx.from, { text, mentions: adminMentions });
};

// Get invite link
commands['invite'] = commands['grouplink'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    const code = await ctx.sock.groupInviteCode(ctx.from);
    await ctx.reply(`🔗 *Group Invite Link:*\n\nhttps://chat.whatsapp.com/${code}\n\n${config.footer}`);
};

// Revoke invite link
commands['revoke'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    
    await ctx.sock.groupRevokeInvite(ctx.from);
    await ctx.reply('✅ Group invite link has been revoked!');
};

// Set group name
commands['setgname'] = commands['setsubject'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    if (!ctx.text) return ctx.reply('❌ Provide new group name!');
    
    await ctx.sock.groupUpdateSubject(ctx.from, ctx.text);
    await ctx.reply(`✅ Group name changed to: *${ctx.text}*`);
};

// Set group description
commands['setgdesc'] = commands['setdesc'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    if (!ctx.text) return ctx.reply('❌ Provide new description!');
    
    await ctx.sock.groupUpdateDescription(ctx.from, ctx.text);
    await ctx.reply('✅ Group description updated!');
};

// Set group profile picture
commands['setgpp'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    if (!ctx.isBotAdmin) return ctx.reply('❌ Bot must be admin!');
    if (!ctx.quoted?.message?.imageMessage) return ctx.reply('❌ Reply to an image!');
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
        { key: ctx.quoted.key, message: ctx.quoted.message },
        'buffer'
    );
    
    await ctx.sock.updateProfilePicture(ctx.from, buffer);
    await ctx.reply('✅ Group profile picture updated!');
};

// List admins
commands['admins'] = commands['listadmins'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    
    const admins = ctx.participants.filter(p => p.admin);
    const mentions = admins.map(a => a.id);
    
    let text = `╔══════════════════════╗\n` +
        `║ 👑 *ADMIN LIST*      ║\n` +
        `╚══════════════════════╝\n\n` +
        `📌 *Group:* ${ctx.groupName}\n\n`;
    
    admins.forEach((admin, i) => {
        const role = admin.admin === 'superadmin' ? '🌟 Super Admin' : '👑 Admin';
        text += `${i + 1}. @${admin.id.split('@')[0]} (${role})\n`;
    });
    
    text += `\n👑 *Total Admins:* ${admins.length}\n\n${config.footer}`;
    
    await ctx.sock.sendMessage(ctx.from, { text, mentions });
};

// Warn user
const warnings = {};

commands['warn'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone!');
    
    const groupId = ctx.from;
    if (!warnings[groupId]) warnings[groupId] = {};
    if (!warnings[groupId][target]) warnings[groupId][target] = 0;
    
    warnings[groupId][target]++;
    const warnCount = warnings[groupId][target];
    
    if (warnCount >= 3) {
        if (ctx.isBotAdmin) {
            await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
            delete warnings[groupId][target];
            await ctx.sock.sendMessage(ctx.from, {
                text: `⚠️ @${target.split('@')[0]} has been removed after 3 warnings!`,
                mentions: [target]
            });
        }
    } else {
        await ctx.sock.sendMessage(ctx.from, {
            text: `⚠️ *WARNING ${warnCount}/3*\n\n@${target.split('@')[0]} has been warned!\n\n${3 - warnCount} more warning(s) before removal.\n\n${config.footer}`,
            mentions: [target]
        });
    }
};

commands['resetwarn'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply('❌ Admin only command!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone!');
    
    if (warnings[ctx.from]?.[target]) {
        delete warnings[ctx.from][target];
    }
    
    await ctx.sock.sendMessage(ctx.from, {
        text: `✅ Warnings reset for @${target.split('@')[0]}`,
        mentions: [target]
    });
};

// Poll
commands['poll'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}poll Question|Option1|Option2|...`);
    
    const parts = ctx.text.split('|').map(s => s.trim());
    if (parts.length < 3) return ctx.reply('❌ Need at least a question and 2 options!');
    
    const question = parts[0];
    const options = parts.slice(1);
    
    await ctx.sock.sendMessage(ctx.from, {
        poll: {
            name: question,
            values: options,
            selectableCount: 1
        }
    });
};

module.exports = commands;