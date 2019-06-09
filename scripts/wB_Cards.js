"use strict";
const
    debug = require('debug')('wb'),
    db = require('./wB_DB'),
    helper = require('./wB_Helper');

let wordCache = global.wb.wordMap = new Map();
let lastActualized = new Date('August 2, 1989 15:10:00');

class Card {
    constructor(id, word, posX, posY) {
        this.id = id;
        this.word = word;
        this.posX = posX;
        this.posY = posY;
    }
}

class Word {
    constructor(id, text, countGuessed, countUsed, createdAt, changedAt) {
        this.id = id;
        this.text = text;
        this.countGuessed = countGuessed;
        this.countUsed = countUsed;
        this.createdAt = createdAt;
        this.changedAt = changedAt;
    }
}

//#region public
exports.Card = Card;
exports.Word = Word;

exports.isValidCard = (cardMap, cardId, cardText) => {
    // TODO
    return true;
};

exports.areCardsFilledAndValid = (cardMap) => {
    if (cardMap.size > 25 || helper.hasDoubleValuesMap(cardMap, ['text']) === false) {
        return true;
    } else {
        return false;
    }
}

exports.getTakenWordsMap = (cardMap) => {
    let takenMap = new Map();
    for (const card of cardMap.values()) {
        if (card.word != null) {
            takenMap.set(card.word.text, card.word);
        }
    }
    debug('getTakenWordsMap: ', takenMap);
    return takenMap;
};

exports.getUntakenWordsMap = (takenMap) => {
    let needCount = 25 - takenMap.size;
    let usedCount = 0;
    let wordsCount = wordCache.size;
    let newWordMap = new Map();
    
    do {
        let newWordItem = getRandomMapItem(wordCache);
        debug('newWordItem', newWordItem);

        if (isTaken(newWordItem, takenMap) === false) {
            newWordMap.set(newWordItem.text, newWordItem);
            needCount--;
        }

        usedCount++;
        takenMap.set(newWordItem.text, newWordItem);

        if (usedCount >= wordsCount) {
            return newWordMap; 
        }
    } while (needCount > 0);
    debug('getUntakenWords: ', newWordMap);
    return newWordMap;
};

exports.fillEmptyWordsCardMap = (cardMap, newWordsMap) => {
    const newWordsMapIterator = newWordsMap.values();
    const changedMap = new Map();
    const countMax = newWordsMap.size;
    let countUsed = 0;
    
    for (const card of cardMap.values()) {
        if (card.word == null) {
            card.word = newWordsMapIterator.next().value;
            changedMap.set(card.id, card);
        }
        if (countUsed >= countMax) {
            break;
        }
    }
    
    return changedMap;
};


exports.generateEmptyCardMap = () => {
    const cardMap = new Map();
    let id = 0;
    for (let x = 1; x < 6; x++) {
        for (let y = 1; y < 6; y++) {
            cardMap.set(++id, new Card(id, null, x, y, null));
        }
    }
    return cardMap;
};

//#endregion

//#region private
const actualizeWordCache = async () => {
    debug('Actualize Word Cache');
    db.word.getRowsByValue([['changedAt', '>', lastActualized]]).then((res) => {
        for(const word of res) {
            const meta = new Word(
                word.wordId,
                word.wordText,
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
};

const isTaken = (wordItem, takenMap) => {
    debug('takenMap', takenMap);
    debug('wordItem', wordItem);
    // TODO Mit befüllter takenMap testen
    for (const takenWord of takenMap.keys()) {
        debug('----------------------');
        debug(wordItem.text, takenWord);
        debug('----------------------');
        if (helper.similarity(wordItem.text, takenWord) >= 0.8) {
            return true;
        }
    }
    return false;
};
//#endregion
const getRandomMapItem = (map) => {
    return map.get(getRandomKey(map));
}

const getRandomKey = (map) => {
    let keys = Array.from(map.keys());
    return keys[Math.floor(Math.random() * keys.length)];
};

// TODO Actualization-Service
actualizeWordCache();