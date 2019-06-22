"use strict";
const
    debug = require('debug')('wb'),
    db = require('./wB_DB'),
    helper = require('./wB_Helper');

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
        this.text = text == null ? '' : text;
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
    
    let res = await db.word.getRowsByValue([['wordText', '=', text]]);
    debug('Res: ', res);

    if (res.length <= 0) {
        res = await db.word.createRow({wordText: text});
        res = await db.word.getRowById(res.insertId);

        if (res.length <= 0) { 
            debug(`[ERROR] getWordAsync: Can not find/create word in database.`);
            return null;
        }
    }
    res = res[0];

    return new Word(
        res.wordId, 
        res.wordText,
        res.wordCountGuessed,
        res.wordCountUsed,
        res.wordFlagUseForAutofill,
        res.createdAt,
        res.changedAt
    );
}

exports.isValidCard = (cardMap, cardText) => {
    if (cardText == null || cardText === '') {
        return true;
    }
    cardText = cardText.toLowerCase();
    for (const card of cardMap.values()) {
        if (card.word != null && card.word.text.toLowerCase() === cardText) {
            return false;
        }
    }

    return true;
};

exports.areCardsFilledAndValid = (cardMap) => {
    if (areCardsFilled(cardMap) === true && helper.hasDoubleValuesMap(cardMap, ['text']) === false) {
        return true;
    } else {
        return false;
    }
}

exports.getTakenWordsMap = (cardMap) => {
    let takenMap = new Map();
    for (const card of cardMap.values()) {
        if (card.word != null) {
            takenMap.set(card.word.id, card.word);
        }
    }
    return takenMap;
};

exports.getUntakenWordsMap = async (takenMap) => {
    const needCount = 25 - takenMap.size;
    const wordsMap = new Map();
    let filterArr = [['wordFlagUseForAutofill', '=', 1]];

    if (takenMap.size > 0) {
        for (const takenWord of takenMap.values()) {
            filterArr.push('AND');
            filterArr.push(['wordText', '!=', takenWord.text]);
        }
    }
    
    const res = await db.word.getRandomRowsByValue(filterArr, needCount);
    if (res.length > 0) {
        for(let i = 0; i < res.length; i++) {
            wordsMap.set(
                res[i].wordId, 
                new Word(
                    res[i].wordId, 
                    res[i].wordText,
                    res[i].wordCountGuessed,
                    res[i].wordCountUsed,
                    res[i].wordFlagUseForAutofill,
                    res[i].createdAt,
                    res[i].changedAt
            ));
        }
    }
    return wordsMap;
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
            cardMap.set(++id, new Card(id, null, x, y));
        }
    }
    return cardMap;
};

exports.wordCountUp = async (cardMap, type = 'Guessed') => {
    let stmt = `UPDATE ${db.word.fullName} SET wordCount${type} = wordCount${type} + 1 WHERE `;
    for (const card of cardMap.values()) {
        stmt += `wordId = ${card.word.id} OR `;
    }
    stmt = stmt.slice(0, -3);
    stmt += ';';

    db.word.query(stmt);
}

//#endregion

//#region private
const areCardsFilled = (cardMap) => {
    for (const card of cardMap.values()) {
        if (card.word == null || card.word.text == null || card.word.text === '') {
            return false;
        }
    }
    return true;
}
//#endregion
