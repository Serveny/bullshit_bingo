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
    constructor(id, text, countGuessed, countUsed, createdAt, changedAt, flagUseForAutofill) {
        this.id = id;
        this.text = text;
        this.countGuessed = countGuessed;
        this.countUsed = countUsed;
        this.createdAt = createdAt;
        this.changedAt = changedAt;
        this.flagUseForAutofill = flagUseForAutofill === 1 ? true : false;
    }
}

//#region public
exports.Card = Card;
exports.Word = Word;

exports.getWordAsync = async (text) => {
    if (text == null || text === '') {
        return null;
    }
    //await db.word.getRowsByValue([['wordText', '=', text]]);
    let word = wordCache.get(text);

    if (word == null) {
        let res = await db.word.createRow({wordText: text});
        res = await db.word.getRowById(res.insertId);
        res = res[0];

        word = new Word(
            res.wordId, 
            res.wordText,
            res.wordCountGuessed,
            res.wordCountUsed,
            res.wordFlagUseForAutofill,
            res.createdAt,
            res.changedAt
        );
        wordCache.set(word.text, word);
    }
    debug('getWordAsync: ', word);
    return word;
}

exports.isValidCard = (cardMap, cardText) => {
    debug('isValidCard', cardMap, cardText);
    for (const card of cardMap.values()) {
        debug('isValidCardSchleife', card.word != null ? card.word.text : null, cardText);
        if (card.word != null && card.word.text === cardText) {
            return false;
        }
    }

    return true;
};

exports.areCardsFilledAndValid = (cardMap) => {
    if (areCardsFilled(cardMap) && helper.hasDoubleValuesMap(cardMap, ['text']) === false) {
        return true;
    } else {
        return false;
    }
}

const areCardsFilled = (cardMap) => {
    for (const card of cardMap.values()) {
        if (card.word == null || card.word.text == null || card.word.text === '') {
            return false;
        }
    }
    return true;
}

exports.getTakenWordsMap = (cardMap) => {
    let takenMap = new Map();
    for (const card of cardMap.values()) {
        if (card.word != null) {
            takenMap.set(card.word.text, card.word);
        }
    }
    return takenMap;
};

exports.getUntakenWordsMap = (takenMap) => {
    let needCount = 25 - takenMap.size;
    let usedCount = 0;
    let wordsCount = wordCache.size;
    let newWordMap = new Map();
    
    do {
        let newWordItem = getRandomMapItem(wordCache);

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
const actualizeWordCacheAsync = async () => {
    debug('Actualize Word Cache');
    let res = await db.word.getRowsByValue([['changedAt', '>', lastActualized]]);
    
    for(const word of res) {
        const meta = new Word(
            word.wordId,
            word.wordText,
            word.wordCountGuessed,
            word.wordCountUsed,
            word.createdAt,
            word.changedAt,
            word.wordFlagUseForAutofill
        );
        let thisWord = wordCache.get(word);

        if (thisWord == null) {
            wordCache.set(word.wordText, meta);
        } else {
            thisWord = meta;
        }
    }
    lastActualized = new Date();
};

const isTaken = (wordItem, takenMap) => {
    // TODO Mit befüllter takenMap testen
    for (const takenWord of takenMap.keys()) {
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
    const keyArr = [];
    for (const item of map.values()) {
        if (item.flagUseForAutofill === true) {
            keyArr.push(item.text);
        }
    }
    //let keys = Array.from(mapFiltered.keys());
    return keyArr[Math.floor(Math.random() * keyArr.length)];
};

// TODO Actualization-Service
actualizeWordCacheAsync();