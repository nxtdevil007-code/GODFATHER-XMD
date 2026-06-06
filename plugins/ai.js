const config = require('../config');
const axios = require('axios');

const commands = {};

// ChatGPT / AI
commands['ai'] = commands['gpt'] = commands['chatgpt'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}ai What is the meaning of life?`);
    
    try {
        // Try OpenAI API first
        if (config.apiKeys.openai) {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are GODFATHER XMD, a helpful WhatsApp bot created by Soham. Be friendly, helpful, and concise.`
                    },
                    { role: 'user', content: ctx.text }
                ],
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${config.apiKeys.openai}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const reply = response.data.choices[0].message.content;
            await ctx.reply(`🤖 *GODFATHER AI*\n\n${reply}\n\n${config.footer}`);
        } else {
            // Free alternatives
            const response = await axios.get(
                `https://api.lolhuman.xyz/api/openai?apikey=YOUR_KEY&text=${encodeURIComponent(ctx.text)}`
            );
            
            if (response.data?.result) {
                await ctx.reply(`🤖 *GODFATHER AI*\n\n${response.data.result}\n\n${config.footer}`);
            } else {
                // Another fallback
                const fallback = await axios.post('https://free.churchless.tech/v1/chat/completions', {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are GODFATHER XMD, a helpful WhatsApp bot created by Soham.' },
                        { role: 'user', content: ctx.text }
                    ]
                });
                
                const reply = fallback.data?.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';
                await ctx.reply(`🤖 *GODFATHER AI*\n\n${reply}\n\n${config.footer}`);
            }
        }
    } catch (err) {
        await ctx.reply(`❌ AI Error: ${err.message}\n\nTry again later.`);
    }
};

// AI Image Generation
commands['imagine'] = commands['dall-e'] = commands['aiimage'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}imagine A cat wearing a top hat`);
    
    try {
        await ctx.reply('🎨 *Generating image...*\n\n⏳ Please wait...');
        
        // Try various free AI image generation APIs
        const response = await axios.get(
            `https://image.pollinations.ai/prompt/${encodeURIComponent(ctx.text)}`,
            { responseType: 'arraybuffer' }
        );
        
        await ctx.sock.sendMessage(ctx.from, {
            image: Buffer.from(response.data),
            caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${ctx.text}\n\n${config.footer}`
        }, { quoted: ctx.msg });
    } catch (err) {
        await ctx.reply('❌ Image generation failed!');
    }
};

// Gemini AI
commands['gemini'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}gemini What is quantum computing?`);
    
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY',
            {
                contents: [{
                    parts: [{ text: ctx.text }]
                }]
            }
        );
        
        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        await ctx.reply(`🤖 *Gemini AI*\n\n${reply}\n\n${config.footer}`);
    } catch (err) {
        await ctx.reply('❌ Gemini AI failed! Try .ai command instead.');
    }
};

// AI Programming help
commands['code'] = async (ctx) => {
    if (!ctx.text) return ctx.reply(`❌ Usage: ${ctx.prefix}code Write a Python function to reverse a string`);
    
    try {
        const prompt = `You are a coding assistant. Provide clean, well-commented code. Question: ${ctx.text}`;
        
        const response = await axios.post('https://free.churchless.tech/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a coding assistant. Only provide code with brief explanation.' },
                { role: 'user', content: ctx.text }
            ]
        });
        
        const reply = response.data?.choices?.[0]?.message?.content || 'Sorry, could not generate code.';
        await ctx.reply(`💻 *AI Code Assistant*\n\n${reply}\n\n${config.footer}`);
    } catch (err) {
        await ctx.reply('❌ Code generation failed!');
    }
};

// AI Summary
commands['summarize'] = commands['summary'] = async (ctx) => {
    const text = ctx.text || (ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text || '');
    if (!text) return ctx.reply('❌ Provide or reply to text to summarize!');
    
    try {
        const response = await axios.post('https://free.churchless.tech/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Summarize the following text concisely.' },
                { role: 'user', content: text }
            ]
        });
        
        const reply = response.data?.choices?.[0]?.message?.content || 'Could not summarize.';
        await ctx.reply(`📝 *AI Summary*\n\n${reply}\n\n${config.footer}`);
    } catch (err) {
        await ctx.reply('❌ Summarization failed!');
    }
};

module.exports = commands;