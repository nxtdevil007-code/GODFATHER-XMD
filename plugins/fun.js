const config = require('../config');
const { pickRandom, TicTacToe } = require('../lib/functions');
const { getTruth, getDare, getJoke, getFact, getQuote } = require('../lib/scraper');

const commands = {};
const tttGames = {};

// 8ball
commands['8ball'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Ask a question!');
    
    const responses = [
        '🎱 It is certain.', '🎱 It is decidedly so.', '🎱 Without a doubt.',
        '🎱 Yes, definitely.', '🎱 You may rely on it.', '🎱 As I see it, yes.',
        '🎱 Most likely.', '🎱 Outlook good.', '🎱 Yes.', '🎱 Signs point to yes.',
        '🎱 Reply hazy, try again.', '🎱 Ask again later.', '🎱 Better not tell you now.',
        '🎱 Cannot predict now.', '🎱 Concentrate and ask again.',
        '🎱 Don\'t count on it.', '🎱 My reply is no.', '🎱 My sources say no.',
        '🎱 Outlook not so good.', '🎱 Very doubtful.'
    ];
    
    await ctx.reply(`❓ *Question:* ${ctx.text}\n\n${pickRandom(responses)}\n\n${config.footer}`);
};

// Rate
commands['rate'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide something to rate!');
    
    const rating = Math.floor(Math.random() * 101);
    const stars = '⭐'.repeat(Math.ceil(rating / 20));
    
    await ctx.reply(`📊 *Rating:* ${ctx.text}\n\n${stars}\n*Score:* ${rating}/100\n\n${config.footer}`);
};

// Ship (compatibility)
commands['ship'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    
    const members = ctx.participants.map(p => p.id);
    let user1, user2;
    
    if (ctx.args.length >= 2) {
        user1 = ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        user2 = ctx.args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    } else {
        user1 = ctx.sender;
        user2 = pickRandom(members.filter(m => m !== ctx.sender));
    }
    
    const compatibility = Math.floor(Math.random() * 101);
    const hearts = compatibility > 80 ? '💕💕💕💕💕' :
                   compatibility > 60 ? '💕💕💕💕' :
                   compatibility > 40 ? '💕💕💕' :
                   compatibility > 20 ? '💕💕' : '💕';
    
    await ctx.sock.sendMessage(ctx.from, {
        text: `💘 *LOVE SHIP*\n\n` +
            `👤 @${user1.split('@')[0]}\n` +
            `❤️ x ❤️\n` +
            `👤 @${user2.split('@')[0]}\n\n` +
            `${hearts}\n` +
            `*Compatibility:* ${compatibility}%\n\n` +
            `${config.footer}`,
        mentions: [user1, user2]
    });
};

// Dare
commands['dare'] = async (ctx) => {
    const dare = getDare();
    await ctx.reply(`🔥 *DARE*\n\n${dare}\n\n${config.footer}`);
};

// Truth
commands['truth'] = async (ctx) => {
    const truth = getTruth();
    await ctx.reply(`🤔 *TRUTH*\n\n${truth}\n\n${config.footer}`);
};

// Joke
commands['joke'] = async (ctx) => {
    const joke = await getJoke();
    await ctx.reply(`😂 *JOKE*\n\n${joke}\n\n${config.footer}`);
};

// Fact
commands['fact'] = async (ctx) => {
    const fact = await getFact();
    await ctx.reply(`📚 *RANDOM FACT*\n\n${fact}\n\n${config.footer}`);
};

// Quote
commands['quote'] = async (ctx) => {
    const quote = await getQuote();
    await ctx.reply(`💭 *QUOTE OF THE DAY*\n\n"${quote.quote}"\n\n— *${quote.author}*\n\n${config.footer}`);
};

// Flip coin
commands['flip'] = commands['coinflip'] = async (ctx) => {
    const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
    await ctx.reply(`🪙 *Coin Flip*\n\nResult: *${result}*\n\n${config.footer}`);
};

// Roll dice
commands['dice'] = commands['roll'] = async (ctx) => {
    const sides = parseInt(ctx.args[0]) || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await ctx.reply(`🎲 *Dice Roll (d${sides})*\n\nResult: *${result}*\n\n${config.footer}`);
};

// Random number
commands['random'] = async (ctx) => {
    const min = parseInt(ctx.args[0]) || 1;
    const max = parseInt(ctx.args[1]) || 100;
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    await ctx.reply(`🔢 *Random Number (${min}-${max})*\n\nResult: *${result}*\n\n${config.footer}`);
};

// Choose
commands['choose'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}choose option1 | option2 | option3`);
    
    const options = ctx.text.split('|').map(s => s.trim()).filter(s => s);
    if (options.length < 2) return ctx.reply('❌ Provide at least 2 options separated by |');
    
    const chosen = pickRandom(options);
    await ctx.reply(`🤔 *CHOOSE*\n\n📋 Options: ${options.join(', ')}\n\n✅ I choose: *${chosen}*\n\n${config.footer}`);
};

// Would you rather
const wyrQuestions = [
    "Would you rather be able to fly or be invisible?",
    "Would you rather live without music or without TV?",
    "Would you rather be the funniest person or the smartest person?",
    "Would you rather have unlimited money or unlimited power?",
    "Would you rather live in the past or the future?",
    "Would you rather be able to read minds or predict the future?",
    "Would you rather never age or never get sick?",
    "Would you rather have super strength or super speed?",
    "Would you rather live without internet or without AC?",
    "Would you rather be famous or rich?"
];

commands['wyr'] = commands['wouldyourather'] = async (ctx) => {
    const question = pickRandom(wyrQuestions);
    await ctx.reply(`🤷 *WOULD YOU RATHER*\n\n${question}\n\n${config.footer}`);
};

// TicTacToe
commands['ttt'] = commands['tictactoe'] = async (ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only command!');
    
    const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
    if (!target) return ctx.reply('❌ Reply to or mention someone to play with!');
    if (target === ctx.sender) return ctx.reply('❌ You can\'t play with yourself!');
    
    const gameId = ctx.from;
    tttGames[gameId] = {
        game: new TicTacToe(),
        player1: ctx.sender,
        player2: target,
        currentTurn: ctx.sender
    };
    
    await ctx.sock.sendMessage(ctx.from, {
        text: `🎮 *TIC TAC TOE*\n\n` +
            `❌ @${ctx.sender.split('@')[0]} vs ⭕ @${target.split('@')[0]}\n\n` +
            `${tttGames[gameId].game.display()}\n\n` +
            `@${ctx.sender.split('@')[0]}'s turn (❌)\n` +
            `Reply with a number (1-9) to play!\n\n${config.footer}`,
        mentions: [ctx.sender, target]
    });
};

commands['tttmove'] = async (ctx) => {
    const gameId = ctx.from;
    if (!tttGames[gameId]) return ctx.reply('❌ No active game! Start one with .ttt');
    
    const game = tttGames[gameId];
    if (ctx.sender !== game.currentTurn) return ctx.reply('❌ Not your turn!');
    
    const position = parseInt(ctx.args[0]);
    if (!position) return ctx.reply('❌ Provide a number (1-9)!');
    
    const result = game.game.play(position);
    if (result === 'invalid') return ctx.reply('❌ Invalid position!');
    if (result === 'taken') return ctx.reply('❌ That position is already taken!');
    
    const winner = game.game.checkWinner();
    
    if (winner) {
        let resultText;
        if (winner === 'draw') {
            resultText = `🤝 *It's a DRAW!*`;
        } else {
            const winnerPlayer = winner === 'X' ? game.player1 : game.player2;
            resultText = `🎉 @${winnerPlayer.split('@')[0]} *WINS!*`;
        }
        
        await ctx.sock.sendMessage(ctx.from, {
            text: `🎮 *TIC TAC TOE*\n\n${game.game.display()}\n\n${resultText}\n\n${config.footer}`,
            mentions: [game.player1, game.player2]
        });
        delete tttGames[gameId];
    } else {
        game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
        const symbol = game.currentTurn === game.player1 ? '❌' : '⭕';
        
        await ctx.sock.sendMessage(ctx.from, {
            text: `🎮 *TIC TAC TOE*\n\n${game.game.display()}\n\n` +
                `@${game.currentTurn.split('@')[0]}'s turn (${symbol})\n\n${config.footer}`,
            mentions: [game.player1, game.player2]
        });
    }
};

// Roast
const roasts = [
    "You're the reason God created the middle finger. 🖕",
    "If I wanted to kill myself, I'd climb your ego and jump to your IQ. 😂",
    "You're not stupid; you just have bad luck thinking. 🤷",
    "I'd agree with you but then we'd both be wrong. 💀",
    "You bring everyone so much joy... when you leave. 😭",
    "If laughter is the best medicine, your face must be curing the world. 💊",
    "You're like a cloud. When you disappear, it's a beautiful day. ☁️",
    "I'm not saying you're ugly, but you'd make a good before picture. 📸",
    "Your secrets are always safe with me. I never even listen when you tell me them. 🤫",
    "You're proof that even God makes mistakes sometimes. 😬"
];

commands['roast'] = async (ctx) => {
    const target = ctx.quoted?.sender || ctx.sender;
    await ctx.sock.sendMessage(ctx.from, {
        text: `🔥 *ROAST*\n\n@${target.split('@')[0]}, ${pickRandom(roasts)}\n\n${config.footer}`,
        mentions: [target]
    });
};

// Compliment
const compliments = [
    "You're an amazing person! 🌟",
    "You light up the room! ✨",
    "Your smile is contagious! 😊",
    "You're stronger than you think! 💪",
    "The world is better because you're in it! 🌍",
    "You have a heart of gold! 💛",
    "You're one of a kind! 🦄",
    "You inspire others by being yourself! 🌺",
    "You make everyone around you happier! 😄",
    "You're absolutely wonderful! 🌈"
];

commands['compliment'] = async (ctx) => {
    const target = ctx.quoted?.sender || ctx.sender;
    await ctx.sock.sendMessage(ctx.from, {
        text: `💝 *COMPLIMENT*\n\n@${target.split('@')[0]}, ${pickRandom(compliments)}\n\n${config.footer}`,
        mentions: [target]
    });
};

// Slap, hug, pat, etc.
const actions = ['slap', 'hug', 'pat', 'kiss', 'punch', 'poke', 'cuddle', 'bite', 'kill'];
const actionEmojis = {
    slap: '👋', hug: '🤗', pat: '✋', kiss: '😘',
    punch: '👊', poke: '👉', cuddle: '🥰', bite: '😬', kill: '💀'
};

actions.forEach(action => {
    commands[action] = async (ctx) => {
        const target = ctx.quoted?.sender || (ctx.args[0] ? ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        if (!target) return ctx.reply(`❌ Reply to or mention someone to ${action}!`);
        
        await ctx.sock.sendMessage(ctx.from, {
            text: `${actionEmojis[action]} @${ctx.sender.split('@')[0]} *${action}s* @${target.split('@')[0]}!\n\n${config.footer}`,
            mentions: [ctx.sender, target]
        });
    };
});

// RPS (Rock Paper Scissors)
commands['rps'] = async (ctx) => {
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    
    if (!ctx.text || !choices.includes(ctx.text.toLowerCase())) {
        return ctx.reply(`❌ Choose: rock, paper, or scissors\n\nUsage: ${ctx.prefix}rps rock`);
    }
    
    const userChoice = ctx.text.toLowerCase();
    const botChoice = pickRandom(choices);
    
    let result;
    if (userChoice === botChoice) {
        result = "🤝 It's a *TIE!*";
    } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "🎉 You *WIN!*";
    } else {
        result = "😢 You *LOSE!*";
    }
    
    await ctx.reply(
        `🎮 *ROCK PAPER SCISSORS*\n\n` +
        `You: ${emojis[userChoice]} ${userChoice}\n` +
        `Bot: ${emojis[botChoice]} ${botChoice}\n\n` +
        `${result}\n\n${config.footer}`
    );
};

// Slot machine
commands['slot'] = commands['slots'] = async (ctx) => {
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '🍀'];
    const s1 = pickRandom(symbols);
    const s2 = pickRandom(symbols);
    const s3 = pickRandom(symbols);
    
    let result;
    if (s1 === s2 && s2 === s3) {
        result = '🎉 *JACKPOT!* You win big!';
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        result = '🎊 *Nice!* You got a pair!';
    } else {
        result = '😢 *No luck!* Try again!';
    }
    
    await ctx.reply(
        `🎰 *SLOT MACHINE*\n\n` +
        `╔═══════════╗\n` +
        `║ ${s1} │ ${s2} │ ${s3} ║\n` +
        `╚═══════════╝\n\n` +
        `${result}\n\n${config.footer}`
    );
};

// Meme text
commands['mock'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide text to mock!');
    
    const mocked = ctx.text.split('').map((c, i) => 
        i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
    ).join('');
    
    await ctx.reply(`🤪 ${mocked}`);
};

// Reverse text
commands['reverse'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide text to reverse!');
    await ctx.reply(`🔄 ${ctx.text.split('').reverse().join('')}`);
};

// Emojify
commands['emojify'] = async (ctx) => {
    if (!ctx.text) return ctx.reply('❌ Provide text!');
    
    const emojiMap = {
        'a': '🅰️', 'b': '🅱️', 'c': '©️', 'd': '🇩', 'e': '📧', 'f': '🎏',
        'g': '🇬', 'h': '🏨', 'i': 'ℹ️', 'j': '🎷', 'k': '🎋', 'l': '🕒',
        'm': 'Ⓜ️', 'n': '🇳', 'o': '🅾️', 'p': '🅿️', 'q': '🇶', 'r': '®️',
        's': '💲', 't': '✝️', 'u': '🇺', 'v': '🔽', 'w': '🇼', 'x': '❌',
        'y': '💴', 'z': '💤', ' ': '  '
    };
    
    const emojified = ctx.text.toLowerCase().split('').map(c => emojiMap[c] || c).join(' ');
    await ctx.reply(emojified);
};

module.exports = commands;