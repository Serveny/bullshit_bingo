'use strict';
const debug = require('debug')('bb'),
  db = require('./bb-db'),
  helper = require('./bb-helper');

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
  constructor(
    id,
    text,
    countGuessed,
    countUsed,
    createdAt,
    changedAt,
    flagUseForAutofill
  ) {
    this.id = id;
    this.text = text == null ? '' : text;
    this.countGuessed = countGuessed;
    this.countUsed = countUsed;
    this.createdAt = createdAt;
    this.changedAt = changedAt;
    this.flagUseForAutofill = flagUseForAutofill === 1 ? true : false;
  }
}

class WinLine {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }
}

//#region public
exports.Card = Card;
exports.Word = Word;

exports.getWordAsync = async (text) => {
  if (text == null || text === '') {
    return null;
  }

  //  let res = await db.word.getRowsByValue([['wordText', '=', text]]);

  //if (res.length <= 0) {
  //res = await db.word.createRow({ wordText: text });
  //res = await db.word.getRowsByValue([['wordText', '=', text]]);

  //if (res.length <= 0) {
  //debug(`[ERROR] getWordAsync: Can not find/create word in database.`);
  //return null;
  //}
  //}
  //debug('ResCreate: ', res);
  //res = res[0];

  //return new Word(
  //res.wordId,
  //res.wordText,
  //res.wordCountGuessed,
  //res.wordCountUsed,
  //res.wordFlagUseForAutofill,
  //res.createdAt,
  //res.changedAt
  //);
  return new Word(Math.random(), text, 0, 0, false, new Date(), new Date());
};

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
  if (
    areCardsFilled(cardMap) === true &&
    helper.hasDoubleValuesMap(cardMap, ['text']) === false
  ) {
    return true;
  } else {
    return false;
  }
};

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
  let filterArr = [['wordFlagUseForAutofill', '=', true]];

  if (takenMap.size > 0) {
    for (const takenWord of takenMap.values()) {
      filterArr.push('AND');
      filterArr.push(['wordText', '!=', takenWord.text]);
    }
  }

  const resRaw = await db.word.getRandomRowsByValue(filterArr, needCount);
  let res = resRaw.rows;

  if (res.length > 0) {
    for (let i = 0; i < res.length; i++) {
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
        )
      );
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
  for (let y = 1; y < 6; y++) {
    for (let x = 1; x < 6; x++) {
      cardMap.set(++id, new Card(id, null, x, y, false));
    }
  }
  return cardMap;
};

exports.wordCountUp = async (cardMapOrCard, type = 'Guessed') => {
  try {
    const wordCountColName =
      type === 'Used' ? 'wordCountUsed' : 'wordCountGuessed';
    let stmt = `UPDATE ${db.word.fullName} SET "${wordCountColName}" = "${wordCountColName}" + 1 WHERE `;

    if (typeof cardMapOrCard.word !== 'undefined') {
      stmt += `"wordId" = ${cardMapOrCard.word.id} OR `;
    } else {
      for (const card of cardMapOrCard.values()) {
        stmt += `"wordId" = ${card.word.id} OR `;
      }
    }

    stmt = stmt.slice(0, -3);
    stmt += ';';

    db.word.query(stmt);
  } catch (error) {
    debug(error);
  }
};

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
      return new WinLine(1, y + 1, 5, y + 1);
    }
  }

  // vertical
  for (let x = 0; x < 5; x++) {
    let countV = 0;
    for (let y = 0; y < 5; y++) {
      if (mtx[y][x] === true) {
        countV++;
      } else {
        break;
      }
    }
    if (countV >= 5) {
      return new WinLine(x + 1, 1, x + 1, 5);
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
    return new WinLine(1, 1, 5, 5);
  }

  // diagonal2
  let countD2 = 0;
  for (let i = 0; i < 5; i++) {
    if (mtx[i][4 - i] === true) {
      countD2++;
    } else {
      break;
    }
  }
  if (countD2 >= 5) {
    return new WinLine(1, 5, 5, 1);
  }
  return null;
};
//#endregion

//#region private
const areCardsFilled = (cardMap) => {
  for (const card of cardMap.values()) {
    if (card.word == null || card.word.text == null || card.word.text === '') {
      return false;
    }
  }
  return true;
};

const emptyMatrix = () => {
  return [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ];
};

const createCardHitMatrix = (cardMap) => {
  const matrixArr = emptyMatrix();
  for (const card of cardMap.values()) {
    matrixArr[parseInt(card.posY) - 1][parseInt(card.posX) - 1] = card.isHit;
  }
  return matrixArr;
};
//#endregion
