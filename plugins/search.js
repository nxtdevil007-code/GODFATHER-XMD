const config = require('../config');
const axios = require('axios');
const { wikipedia, githubUser } = require('../lib/scraper');

const commands = {};

// Google search
commands['google'] = commands['gsearch'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}google what is Node.js`);
    
    try {
        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(ctx.text)}&key=YOUR_API_KEY&cx=YOUR_CX`
        );
        
        // Fallback using scraping
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(ctx.text)}`;
        const html = await axios.get(searchUrl);
        const cheerio = require('cheerio');
        const $ = cheerio.load(html.data);
        
        let results = `🔍 *GOOGLE SEARCH*\n\n📝 *Query:* ${ctx.text}\n\n`;
        let count = 0;
        
        $('.result').each((i, el) => {
            if (count >= 5) return;
            const title = $(el).find('.result__a').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const url = $(el).find('.result__a').attr('href');
            
            if (title && snippet) {
                results += `${count + 1}. *${title}*\n${snippet}\n${url || ''}\n\n`;
                count++;
            }
        });
        
        if (count === 0) results += 'No results found.';
        results += config.footer;
        
        await ctx.reply(results);
    } catch (err) {
        await ctx.reply('❌ Search failed!');
    }
};

// Wikipedia
commands['wiki'] = commands['wikipedia'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}wiki Albert Einstein`);
    
    try {
        const result = await wikipedia(ctx.text);
        
        let msg = `📚 *WIKIPEDIA*\n\n` +
            `📌 *${result.title}*\n\n` +
            `${result.extract}\n\n` +
            `🔗 ${result.url}\n\n${config.footer}`;
        
        if (result.thumbnail) {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: result.thumbnail },
                caption: msg
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply(msg);
        }
    } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
    }
};

// GitHub user
commands['github'] = commands['git'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}github username`);
    
    try {
        const user = await githubUser(ctx.text);
        
        await ctx.sock.sendMessage(ctx.from, {
            image: { url: user.avatar_url },
            caption: `🐙 *GITHUB USER*\n\n` +
                `👤 *Name:* ${user.name || 'N/A'}\n` +
                `📛 *Username:* ${user.login}\n` +
                `📝 *Bio:* ${user.bio || 'N/A'}\n` +
                `📍 *Location:* ${user.location || 'N/A'}\n` +
                `🏢 *Company:* ${user.company || 'N/A'}\n` +
                `📦 *Repos:* ${user.public_repos}\n` +
                `👥 *Followers:* ${user.followers}\n` +
                `👤 *Following:* ${user.following}\n` +
                `🔗 *URL:* ${user.html_url}\n` +
                `📅 *Joined:* ${new Date(user.created_at).toLocaleDateString()}\n\n` +
                `${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
    }
};

// Image search
commands['image'] = commands['img'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}image cute cats`);
    
    try {
        const response = await axios.get(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(ctx.text)}&per_page=5`,
            { headers: { 'Authorization': 'Client-ID YOUR_UNSPLASH_KEY' } }
        );
        
        // Fallback
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(ctx.text)}`;
        
        await ctx.sock.sendMessage(ctx.from, {
            image: { url },
            caption: `🖼️ *Image Search*\n\n📝 Query: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Image search failed!');
    }
};

// Pinterest search
commands['pinterest'] = commands['pin'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}pinterest anime wallpaper`);
    
    try {
        const response = await axios.get(
            `https://api.lolhuman.xyz/api/pinterest?apikey=YOUR_KEY&query=${encodeURIComponent(ctx.text)}`
        );
        
        // Alternative approach
        const url = `https://source.unsplash.com/featured/?${encodeURIComponent(ctx.text)}`;
        
        await ctx.sock.sendMessage(ctx.from, {
            image: { url },
            caption: `📌 *Pinterest*\n\n📝 Query: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Pinterest search failed!');
    }
};

// Wallpaper
commands['wallpaper'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}wallpaper nature`);
    
    try {
        const url = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(ctx.text)}`;
        
        await ctx.sock.sendMessage(ctx.from, {
            image: { url },
            caption: `🖼️ *Wallpaper*\n\n📝 Query: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Wallpaper search failed!');
    }
};

// YouTube search
commands['ytsearch'] = commands['yts'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}ytsearch never gonna give you up`);
    
    try {
        const yts = require('yt-search');
        const results = await yts(ctx.text);
        const videos = results.videos.slice(0, 10);
        
        if (videos.length === 0) return ctx.reply('❌ No results found!');
        
        let text = `🎬 *YOUTUBE SEARCH*\n\n📝 Query: ${ctx.text}\n\n`;
        
        videos.forEach((v, i) => {
            text += `${i + 1}. *${v.title}*\n` +
                `👤 ${v.author.name}\n` +
                `⏱️ ${v.timestamp} | 👁️ ${v.views}\n` +
                `🔗 ${v.url}\n\n`;
        });
        
        text += config.footer;
        await ctx.reply(text);
    } catch (err) {
        await ctx.reply('❌ YouTube search failed!');
    }
};

// News
commands['news'] = async (ctx) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_KEY');
        
        // Fallback with RSS
        const rss = await axios.get('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
        const cheerio = require('cheerio');
        const $ = cheerio.load(rss.data, { xmlMode: true });
        
        let text = `📰 *TOP NEWS*\n\n`;
        let count = 0;
        
        $('item').each((i, el) => {
            if (count >= 5) return;
            const title = $(el).find('title').text();
            const desc = $(el).find('description').text();
            const link = $(el).find('link').text();
            
            text += `${count + 1}. *${title}*\n${desc.substring(0, 100)}...\n🔗 ${link}\n\n`;
            count++;
        });
        
        text += config.footer;
        await ctx.reply(text);
    } catch (err) {
        await ctx.reply('❌ Failed to fetch news!');
    }
};

// Movie/Show search
commands['movie'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}movie Inception`);
    
    try {
        const response = await axios.get(
            `https://www.omdbapi.com/?t=${encodeURIComponent(ctx.text)}&apikey=YOUR_KEY`
        );
        
        // Fallback
        const fallback = await axios.get(
            `https://www.omdbapi.com/?t=${encodeURIComponent(ctx.text)}&apikey=trilogy`
        );
        
        const data = fallback.data;
        if (data.Response === 'False') return ctx.reply('❌ Movie not found!');
        
        const text = `🎬 *MOVIE INFO*\n\n` +
            `📌 *Title:* ${data.Title}\n` +
            `📅 *Year:* ${data.Year}\n` +
            `🎭 *Genre:* ${data.Genre}\n` +
            `⭐ *Rating:* ${data.imdbRating}/10\n` +
            `🕐 *Runtime:* ${data.Runtime}\n` +
            `🎬 *Director:* ${data.Director}\n` +
            `🎭 *Actors:* ${data.Actors}\n` +
            `📝 *Plot:* ${data.Plot}\n` +
            `🏆 *Awards:* ${data.Awards}\n` +
            `🌍 *Country:* ${data.Country}\n\n` +
            `${config.footer}`;
        
        if (data.Poster && data.Poster !== 'N/A') {
            await ctx.sock.sendMessage(ctx.from, {
                image: { url: data.Poster },
                caption: text
            }, { quoted: ctx.msg });
        } else {
            await ctx.reply(text);
        }
    } catch (err) {
        await ctx.reply('❌ Movie search failed!');
    }
};

module.exports = commands;