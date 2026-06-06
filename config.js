const fs = require('fs');
const path = require('path');

const config = {
    // Bot Info
    botName: 'GODFATHER XMD',
    ownerName: 'Soham',
    ownerNumber: ['919876543210'], // Replace with your number
    prefix: '.',
    
    // Bot Settings
    autoRead: false,
    autoTyping: true,
    autoRecording: false,
    alwaysOnline: true,
    
    // Mode: 'public' or 'private'
    mode: 'public',
    
    // Anti Settings
    antiCall: true,
    antiSpam: true,
    antiLink: false,
    antiBadword: false,
    
    // Limits
    downloadLimit: 100, // MB
    
    // Session
    sessionName: 'godfather-session',
    
    // APIs
    apiKeys: {
        openai: '', // OpenAI API key
        removebg: '', // Remove.bg API key
    },
    
    // Sticker Pack Info
    packname: 'GODFATHER XMD',
    author: 'Soham',
    
    // Welcome & Goodbye
    welcome: true,
    goodbye: true,
    
    // Auto-status view
    autoStatusView: false,
    
    // Anti-delete
    antiDelete: false,
    
    // Bot footer
    footer: '© GODFATHER XMD | Made by Soham',
    
    // Thumbnail
    thumb: path.join(__dirname, 'assets', 'thumb.jpg'),
};

module.exports = config;