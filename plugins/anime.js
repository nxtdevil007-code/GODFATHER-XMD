const config = require('../config');
const axios = require('axios');
const { getAnimeQuote } = require('../lib/scraper');
const { pickRandom } = require('../lib/functions');

const commands = {};

// Anime search
commands['anime'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}anime Naruto`);
    
    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query: `
                query ($search: String) {
                    Media (search: $search, type: ANIME) {
                        id
                        title { romaji english native }
                        description
                        episodes
                        status
                        averageScore
                        genres
                        coverImage { large }
                        startDate { year month day }
                        endDate { year month day }
                        season
                        studios { nodes { name } }
                    }
                }
            `,
            variables: { search: ctx.text }
        });
        
        const anime = response.data.data.Media;
        if (!anime) return ctx.reply('❌ Anime not found!');
        
        const desc = anime.description?.replace(/<[^>]*>/g, '') || 'No description';
        
        const text = `🎌 *ANIME INFO*\n\n` +
            `📌 *Title:* ${anime.title.english || anime.title.romaji}\n` +
            `🇯🇵 *Japanese:* ${anime.title.native || 'N/A'}\n` +
            `📊 *Score:* ${anime.averageScore}/100 ⭐\n` +
            `📺 *Episodes:* ${anime.episodes || 'N/A'}\n` +
            `📡 *Status:* ${anime.status}\n` +
            `🎭 *Genres:* ${anime.genres.join(', ')}\n` +
            `🏢 *Studio:* ${anime.studios.nodes[0]?.name || 'N/A'}\n` +
            `📅 *Start:* ${anime.startDate?.year || 'N/A'}\n` +
            `🌸 *Season:* ${anime.season || 'N/A'}\n\n` +
            `📝 *Synopsis:*\n${desc.substring(0, 500)}...\n\n` +
            `${config.footer}`;
        
        if (anime.coverImage?.large) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: anime.coverImage.large },
                caption: text
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply(text);
        }
    } catch (err) {
        await ctx.reply('❌ Anime search failed!');
    }
};

// Manga search
commands['manga'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}manga One Piece`);
    
    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query: `
                query ($search: String) {
                    Media (search: $search, type: MANGA) {
                        id
                        title { romaji english native }
                        description
                        chapters
                        volumes
                        status
                        averageScore
                        genres
                        coverImage { large }
                        startDate { year }
                    }
                }
            `,
            variables: { search: ctx.text }
        });
        
        const manga = response.data.data.Media;
        if (!manga) return ctx.reply('❌ Manga not found!');
        
        const desc = manga.description?.replace(/<[^>]*>/g, '') || 'No description';
        
        const text = `📚 *MANGA INFO*\n\n` +
            `📌 *Title:* ${manga.title.english || manga.title.romaji}\n` +
            `🇯🇵 *Japanese:* ${manga.title.native || 'N/A'}\n` +
            `📊 *Score:* ${manga.averageScore}/100 ⭐\n` +
            `📖 *Chapters:* ${manga.chapters || 'N/A'}\n` +
            `📚 *Volumes:* ${manga.volumes || 'N/A'}\n` +
            `📡 *Status:* ${manga.status}\n` +
            `🎭 *Genres:* ${manga.genres.join(', ')}\n` +
            `📅 *Year:* ${manga.startDate?.year || 'N/A'}\n\n` +
            `📝 *Synopsis:*\n${desc.substring(0, 500)}...\n\n` +
            `${config.footer}`;
        
        if (manga.coverImage?.large) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: manga.coverImage.large },
                caption: text
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply(text);
        }
    } catch (err) {
        await ctx.reply('❌ Manga search failed!');
    }
};

// Character search
commands['character'] = commands['char'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}character Naruto Uzumaki`);
    
    try {
        const response = await axios.post('https://graphql.anilist.co', {
            query: `
                query ($search: String) {
                    Character (search: $search) {
                        id
                        name { full native }
                        description
                        image { large }
                        favourites
                        media { nodes { title { romaji } } }
                    }
                }
            `,
            variables: { search: ctx.text }
        });
        
        const char = response.data.data.Character;
        if (!char) return ctx.reply('❌ Character not found!');
        
        const desc = char.description?.replace(/<[^>]*>/g, '').replace(/~!.*!~/g, '') || 'No description';
        const animeList = char.media.nodes.map(n => n.title.romaji).slice(0, 5).join(', ');
        
        const text = `👤 *CHARACTER INFO*\n\n` +
            `📌 *Name:* ${char.name.full}\n` +
            `🇯🇵 *Native:* ${char.name.native || 'N/A'}\n` +
            `❤️ *Favorites:* ${char.favourites}\n` +
            `🎌 *Appears in:* ${animeList}\n\n` +
            `📝 *Description:*\n${desc.substring(0, 500)}...\n\n` +
            `${config.footer}`;
        
        if (char.image?.large) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: char.image.large },
                caption: text
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply(text);
        }
    } catch (err) {
        await ctx.reply('❌ Character search failed!');
    }
};

// Anime quote
commands['animequote'] = commands['aq'] = async (ctx) => {
    try {
        const quote = await getAnimeQuote();
        await ctx.reply(
            `🎌 *ANIME QUOTE*\n\n` +
            `"${quote.quote}"\n\n` +
            `👤 *Character:* ${quote.character}\n` +
            `🎬 *Anime:* ${quote.anime}\n\n` +
            `${config.footer}`
        );
    } catch (err) {
        await ctx.reply('❌ Failed to get anime quote!');
    }
};

// Waifu.pics API based commands
const waifuCategories = {
    'waifu': 'sfw/waifu',
    'neko': 'sfw/neko',
    'shinobu': 'sfw/shinobu',
    'megumin': 'sfw/megumin',
    'awoo': 'sfw/awoo',
    'cry': 'sfw/cry',
    'blush': 'sfw/blush',
    'smile': 'sfw/smile',
    'wave': 'sfw/wave',
    'smug': 'sfw/smug',
    'bonk': 'sfw/bonk',
    'lick': 'sfw/lick',
    'happy': 'sfw/happy',
    'wink': 'sfw/wink',
    'poke': 'sfw/poke',
    'dance': 'sfw/dance',
    'cringe': 'sfw/cringe',
    'highfive': 'sfw/highfive',
    'handhold': 'sfw/handhold',
    'nom': 'sfw/nom',
    'bite': 'sfw/bite',
    'glomp': 'sfw/glomp',
    'yeet': 'sfw/yeet',
};

for (const [cmd, category] of Object.entries(waifuCategories)) {
    commands[cmd] = async (ctx) => {
        try {
            const response = await axios.get(`https://api.waifu.pics/${category}`);
            
            if (response.data?.url) {
                await ctx.sock.sendMessage(ctx.from, {
                    image: { url: response.data.url },
                    caption: `🎌 *${cmd.toUpperCase()}*\n\n${config.footer}`
                }, { quoted: ctx.msg });
            } else {
                await ctx.reply('❌ Failed to fetch image!');
            }
        } catch (err) {
            await ctx.reply(`❌ Failed to fetch ${cmd} image!`);
        }
    };
}

// Random anime wallpaper
commands['animewallpaper'] = commands['animewall'] = async (ctx) => {
    try {
        const response = await axios.get('https://api.waifu.pics/sfw/waifu');
        
        if (response.data?.url) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: response.data.url },
                caption: `🖼️ *Anime Wallpaper*\n\n${config.footer}`
            }, { quoted: ctx.msg });
        }
    } catch (err) {
        await ctx.reply('❌ Failed to fetch wallpaper!');
    }
};

// Anime Action GIFs (using nekos.life)
const animeActions = ['tickle', 'feed', 'gecg', 'poke', 'slap', 'goose', 'avatar', 'fox_girl', 'lizard', 'meow'];

for (const action of animeActions) {
    if (!commands[action]) {
        commands[`anime${action}`] = async (ctx) => {
            try {
                const response = await axios.get(`https://nekos.life/api/v2/img/${action}`);
                
                if (response.data?.url) {
                    await ctx.sock.sendMessage(ctx.from, {
                        image: { url: response.data.url },
                        caption: `🎌 *${action.toUpperCase()}*\n\n${config.footer}`
                    }, { quoted: ctx.msg });
                }
            } catch (err) {
                await ctx.reply(`❌ Failed to fetch ${action}!`);
            }
        };
    }
}

module.exports = commands;