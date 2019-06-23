"use strict";
const
    debug = require('debug')('wb'),
    db = require('./wB_DB'),
    helper = require('./wB_Helper');

class Card {
    constructor(id, word, posX, posY, isHit) {
        this.id = id;
        this.word = word;
        this.posX = posX;
        this.posY = posY;
        this.isHit = isHit;
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
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            cardMap.set(++id, new Card(id, null, x, y, false));
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

exports.checkWin = (cardMap) => {
    const mtx = createCardHitMatrix(cardMap);
    
    // horizontal
    for (let y = 0; y < 5; y++) {
        let countH = 0;
        for (let x = 0; x < 5; x++) {
            if (mtx[y][x] === true) {
                countH++;
            } else {
                break;
            }
        }
        if (countH >= 5) {
            return true;
        }
    }

    // vertical
    for (let y = 0; y < 5; y++) {
        let countV = 0;
        for (let x = 0; x < 5; x++) {
            if (mtx[x][y] === true) {
                countV++;
            } else {
                break;
            }
        }
        if (countV >= 5) {
            return true;
        }
    }

    // diagonal1
    let countD1 = 0;
    for (let i = 0; i < 5; i++) {
        if (mtx[i][i] === true) {
            countD1++;
        } else {
            break;
        }
    }
    if (countD1 >= 5) {
        return true;
    }
    
    // diagonal2
    let countD2 = 0;
    for (let i = 0; i < 5; i++) {
        if (mtx[i][4-i] === true) {
            countD2++;
        } else {
            break;
        }
    }
    if (countD2 >= 5) {
        return true;
    }
    return false;
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

const emptyMatrix = () => {
    return [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ];
}

const createCardHitMatrix = (cardMap) => {
    const matrixArr = emptyMatrix();
    for(const card of cardMap.values()) {
        matrixArr[parseInt(card.posY)][parseInt(card.posX)] = card.isHit;
    }
    return matrixArr;
}
//#endregion
