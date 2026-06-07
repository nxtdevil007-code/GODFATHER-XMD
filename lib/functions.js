const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Runtime calculation
function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(d + ' day(s)');
    if (h > 0) parts.push(h + ' hour(s)');
    if (m > 0) parts.push(m + ' minute(s)');
    if (s > 0) parts.push(s + ' second(s)');
    return parts.join(', ') || '0 seconds';
}

// Format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Get buffer from URL
async function getBuffer(url, options = {}) {
    try {
        const response = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (err) {
        throw new Error(`Failed to get buffer: ${err.message}`);
    }
}

// Fetch JSON
async function fetchJson(url, options = {}) {
    try {
        const response = await axios.get(url, options);
        return response.data;
    } catch (err) {
        throw new Error(`Failed to fetch JSON: ${err.message}`);
    }
}

// Random element from array
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if URL
function isUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
}

// Generate random string
function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Styled text generators
const styleText = {
    bold: (text) => {
        const chars = {
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
            'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
            'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
            'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
            'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
            'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
            'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        };
        return text.split('').map(c => chars[c] || c).join('');
    },
    
    mono: (text) => '```' + text + '```',
    
    italic: (text) => {
        const chars = {
            'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨',
            'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯',
            'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶',
            'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
        };
        return text.split('').map(c => chars[c.toLowerCase()] || c).join('');
    }
};

// TicTacToe game class
class TicTacToe {
    constructor() {
        this.board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.currentPlayer = 'X';
    }
    
    display() {
        let display = '';
        for (let i = 0; i < 9; i += 3) {
            display += `${this.getIcon(i)} │ ${this.getIcon(i+1)} │ ${this.getIcon(i+2)}\n`;
            if (i < 6) display += `──┼───┼──\n`;
        }
        return display;
    }
    
    getIcon(i) {
        if (this.board[i] === 'X') return '❌';
        if (this.board[i] === 'O') return '⭕';
        return this.board[i] + '️⃣';
    }
    
    play(position) {
        if (position < 1 || position > 9) return 'invalid';
        if (this.board[position - 1] === 'X' || this.board[position - 1] === 'O') return 'taken';
        this.board[position - 1] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return 'ok';
    }
    
    checkWinner() {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const [a,b,c] of lines) {
            if (this.board[a] === this.board[b] && this.board[b] === this.board[c]) {
                return this.board[a];
            }
        }
        if (this.board.every(c => c === 'X' || c === 'O')) return 'draw';
        return null;
    }
}

module.exports = {
    runtime,
    formatBytes,
    getBuffer,
    fetchJson,
    pickRandom,
    sleep,
    isUrl,
    randomString,
    formatNumber,
    styleText,
    TicTacToe
}; 