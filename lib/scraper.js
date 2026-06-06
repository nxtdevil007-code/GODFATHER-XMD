const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Wikipedia search
async function wikipedia(query) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        return {
            title: response.data.title,
            extract: response.data.extract,
            thumbnail: response.data.thumbnail?.source || null,
            url: response.data.content_urls?.desktop?.page || null
        };
    } catch (err) {
        throw new Error('Wikipedia article not found');
    }
}

// Weather
async function getWeather(city) {
    try {
        const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        const data = response.data;
        const current = data.current_condition[0];
        return {
            city: data.nearest_area[0].areaName[0].value,
            country: data.nearest_area[0].country[0].value,
            temp_C: current.temp_C,
            temp_F: current.temp_F,
            humidity: current.humidity,
            windSpeed: current.windspeedKmph,
            description: current.weatherDesc[0].value,
            feelsLike: current.FeelsLikeC,
            visibility: current.visibility,
            pressure: current.pressure,
        };
    } catch (err) {
        throw new Error('Could not fetch weather data');
    }
}

// Lyrics search
async function getLyrics(query) {
    try {
        const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.split('-')[0]?.trim())}/${encodeURIComponent(query.split('-')[1]?.trim() || query)}`);
        return response.data.lyrics || 'Lyrics not found';
    } catch (err) {
        // Fallback
        try {
            const search = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
            return {
                title: search.data.title,
                artist: search.data.author,
                lyrics: search.data.lyrics,
                thumbnail: search.data.thumbnail?.genius
            };
        } catch (e) {
            throw new Error('Lyrics not found');
        }
    }
}

// Quote of the day
async function getQuote() {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        return {
            quote: response.data.content,
            author: response.data.author
        };
    } catch (err) {
        // Fallback quotes
        const quotes = [
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

// Fact
async function getFact() {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
        return response.data.text;
    } catch (err) {
        const facts = [
            "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs.",
            "A group of flamingos is called a 'flamboyance'.",
            "The shortest war in history lasted 38 minutes.",
            "Octopuses have three hearts and blue blood.",
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }
}

// Joke
async function getJoke() {
    try {
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?safe-mode');
        if (response.data.type === 'single') {
            return response.data.joke;
        }
        return `${response.data.setup}\n\n${response.data.delivery}`;
    } catch (err) {
        return "Why do programmers prefer dark mode? Because light attracts bugs! 🐛";
    }
}

// Anime quote
async function getAnimeQuote() {
    try {
        const response = await axios.get('https://animechan.xyz/api/random');
        return {
            quote: response.data.quote,
            character: response.data.character,
            anime: response.data.anime
        };
    } catch (err) {
        return {
            quote: "People's lives don't end when they die. It ends when they lose faith.",
            character: "Itachi Uchiha",
            anime: "Naruto"
        };
    }
}

// Define word
async function defineWord(word) {
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = response.data[0];
        return {
            word: data.word,
            phonetic: data.phonetic || 'N/A',
            meanings: data.meanings.map(m => ({
                partOfSpeech: m.partOfSpeech,
                definition: m.definitions[0].definition,
                example: m.definitions[0].example || 'N/A'
            }))
        };
    } catch (err) {
        throw new Error('Word not found in dictionary');
    }
}

// GitHub user info
async function githubUser(username) {
    try {
        const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`);
        return response.data;
    } catch (err) {
        throw new Error('GitHub user not found');
    }
}

// Truth or Dare
const truths = [
    "What's the most embarrassing thing you've ever done?",
    "What's your biggest fear?",
    "What's the last lie you told?",
    "What's your most annoying habit?",
    "Who was your first crush?",
    "What's the most childish thing you still do?",
    "What's your guilty pleasure?",
    "Have you ever cheated on a test?",
    "What's the worst gift you've ever received?",
    "What's the most embarrassing thing in your phone?",
    "What's the weirdest dream you've ever had?",
    "What's the most embarrassing thing your parents caught you doing?",
    "If you could be invisible for a day, what would you do?",
    "What's the longest you've gone without showering?",
    "What's the most useless talent you have?"
];

const dares = [
    "Send a screenshot of your last Google search",
    "Change your profile picture to something funny for 1 hour",
    "Send a voice note singing your favorite song",
    "Text your crush 'I like you'",
    "Post an embarrassing photo on your status for 1 hour",
    "Let someone write a status on your behalf",
    "Send a voice note doing a celebrity impression",
    "Change your name to something funny for 1 hour",
    "Send the last photo in your gallery",
    "Do 10 pushups and send a video",
    "Speak in an accent for the next 5 messages",
    "Send a screenshot of your battery percentage",
    "Text your mom 'I love you' and send screenshot",
    "Record yourself doing a silly dance",
    "Let the group choose your profile picture for 24 hours"
];

function getTruth() {
    return truths[Math.floor(Math.random() * truths.length)];
}

function getDare() {
    return dares[Math.floor(Math.random() * dares.length)];
}

module.exports = {
    wikipedia,
    getWeather,
    getLyrics,
    getQuote,
    getFact,
    getJoke,
    getAnimeQuote,
    defineWord,
    githubUser,
    getTruth,
    getDare
};