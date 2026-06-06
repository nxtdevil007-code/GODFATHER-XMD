const fs = require('fs');
const config = require('../config');

function getDatabase() {
    try {
        if (!fs.existsSync(config.database)) {
            const defaultDb = {
                users: {},
                groups: {},
                banned: [],
                premium: [],
                settings: {},
                notes: {},
                warnings: {}
            };
            fs.writeFileSync(config.database, JSON.stringify(defaultDb, null, 2));
            return defaultDb;
        }
        return JSON.parse(fs.readFileSync(config.database, 'utf-8'));
    } catch (err) {
        return {
            users: {},
            groups: {},
            banned: [],
            premium: [],
            settings: {},
            notes: {},
            warnings: {}
        };
    }
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(config.database, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.log('Database save error:', err.message);
        return false;
    }
}

function getUser(jid) {
    const db = getDatabase();
    return db.users[jid] || null;
}

function setUser(jid, data) {
    const db = getDatabase();
    db.users[jid] = { ...db.users[jid], ...data };
    saveDatabase(db);
}

function getGroup(jid) {
    const db = getDatabase();
    return db.groups[jid] || null;
}

function setGroup(jid, data) {
    const db = getDatabase();
    db.groups[jid] = { ...db.groups[jid], ...data };
    saveDatabase(db);
}

function banUser(jid) {
    const db = getDatabase();
    if (!db.banned.includes(jid)) {
        db.banned.push(jid);
        saveDatabase(db);
    }
}

function unbanUser(jid) {
    const db = getDatabase();
    db.banned = db.banned.filter(id => id !== jid);
    saveDatabase(db);
}

function isBanned(jid) {
    const db = getDatabase();
    return db.banned.includes(jid);
}

function addPremium(jid) {
    const db = getDatabase();
    if (!db.premium.includes(jid)) {
        db.premium.push(jid);
        saveDatabase(db);
    }
}

function removePremium(jid) {
    const db = getDatabase();
    db.premium = db.premium.filter(id => id !== jid);
    saveDatabase(db);
}

function isPremium(jid) {
    const db = getDatabase();
    return db.premium.includes(jid);
}

module.exports = {
    getDatabase,
    saveDatabase,
    getUser,
    setUser,
    getGroup,
    setGroup,
    banUser,
    unbanUser,
    isBanned,
    addPremium,
    removePremium,
    isPremium
};