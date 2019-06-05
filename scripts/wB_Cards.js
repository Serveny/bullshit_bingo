"use strict";
const db = require('./wB_DB');

let wordCache = new Map();
let lastActualized = new Date('August 2, 1989 15:10:00');

class Card {
    constructor(id, text, posX, posY, meta) {
        this.id = id;
        this.text = text;
        this.posX = posX;
        this.posY = posY;
        this.meta = meta;
    }
}

class WordMetaData {
    constructor(id, countGuessed, countUsed, createdAt, changedAt) {
        this.id = id;
        this.countGuessed = countGuessed;
        this.countUsed = countUsed;
        this.createdAt = createdAt;
        this.changedAt = changedAt;
    }
}

const actualizeWordCache = async () => {
    console.debug('[wB_Cards] Actualize Word Cache');
    db.word.getRowsByValue([['changedAt', '>', lastActualized]]).then((res) => {
        for(const word of res) {
            const meta = new WordMetaData(
                word.wordId,
                word.wordCountGuessed,
                word.wordCountUsed,
                word.createdAt,
                word.changedAt,
            );
            let thisWord = wordCache.get(word);

            if (thisWord == null) {
                wordCache.set(word.wordText, meta);
            } else {
                thisWord = meta;
            }
        }
    });
    lastActualized = new Date();
} 

const getUntakenWords = (taken) => {
    taken = Array.isArray(taken) === true ? taken : [];
    let needCount = 25 - taken.length;
    let usedCount = 0;
    let wordsCount = wordCache.size;
    let newWords = [];
    
    do {
        let newWord = getRandomKey(wordCache);

        if (isTaken(newWord, taken) === false) {
            newWords.push(newWord);
            needCount--;
        }

        usedCount++;
        taken.push(newWord);

        if (usedCount >= wordsCount) {
            return newWords; 
        }
    } while (needCount > 0);
    return newWords;
}

const isTaken = (word, taken) => {
    for (let i = 0; i < taken.length; i++) {
        if(similarity(word, taken[i]) >= 0.8) {
            return true;
        }
    }
    return false;
}

const similarity = (s1, s2) => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    const val = (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    return val;
}

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
        if (i == 0)
            costs[j] = j;
        else {
            if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
                newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
            }
        }
        }
        if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

const getRandomKey = (map) => {
    let keys = Array.from(map.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}

// 
const areCardsFilledAndValid = (cards) => {
    let words = [];

    try {
        for (let i = 0; i < cards.length; i++) {
            if(cards[i] != null && cards[i].text != '') {
                words.push(cards[i].text);
            }
        }
        return words;
    } catch (err) { throw err; }
}

exports.getUntakenWords = getUntakenWords;
exports.areCardsFilledAndValid = areCardsFilledAndValid;

exports.Card = Card;
exports.WordMetaData = WordMetaData;

// Start
actualizeWordCache();

// just here to remember
// const getRandomBetween = (min, max) => {
//     return Math.floor(Math.random() * max) + min;  
// }