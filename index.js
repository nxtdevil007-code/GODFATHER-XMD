const { startBot } = require('./lib/connection');
const chalk = require('chalk');
const figlet = require('figlet');
const config = require('./config');
const express = require('express');

// ASCII Art Banner
console.log(chalk.bold.red(`
╔══════════════════════════════════════════╗
║                                          ║
║        GODFATHER XMD WhatsApp Bot        ║
║           Created by Soham               ║
║                                          ║
╠══════════════════════════════════════════╣
║  Bot Name  : ${config.botName.padEnd(25)}║
║  Owner     : ${config.ownerName.padEnd(25)}║
║  Prefix    : ${config.prefix.padEnd(25)}║
║  Mode      : ${config.mode.padEnd(25)}║
║  Version   : 2.0.0${' '.repeat(20)}║
╚══════════════════════════════════════════╝
`));

// Keep-alive server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>GODFATHER XMD</title></head>
        <body style="background:#000;color:#0f0;text-align:center;font-family:monospace;padding-top:100px">
            <h1>🤖 GODFATHER XMD is Running!</h1>
            <h3>Created by Soham</h3>
            <p>Bot Status: Active ✅</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(chalk.green(`[SERVER] Running on port ${PORT}`));
});

// Start the bot
startBot();

// Error handling
process.on('uncaughtException', (err) => {
    console.error(chalk.red('[ERROR] Uncaught Exception:'), err);
});

process.on('unhandledRejection', (err) => {
    console.error(chalk.red('[ERROR] Unhandled Rejection:'), err);
});