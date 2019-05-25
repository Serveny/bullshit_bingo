"use strict";
const getUntakenWords = function (taken) {
    taken = Array.isArray(taken) === true ? taken : [];
    let needCount = 25 - taken.length;
    let usedCount = 0;
    let wordsCount = words.length;
    let newWords = [];
    
    do {
        let newWord = words[getRandomBetween(0, words.length - 1)];

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

const isTaken = function(word, taken) {
    for (let i = 0; i < taken.length; i++) {
        if(similarity(word, taken[i]) >= 0.8) {
            return true;
        }
    }
    return false;
}

const similarity = function(s1, s2) {
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

const editDistance = function(s1, s2) {
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

const getRandomBetween = function(min, max) {
    return Math.floor(Math.random() * max) + min;  
}

const areCardsFilledAndValid = function(cards) {
    let words = [];
    for (let i = 0; i < _self.cards.length; i++) {
        if(_self.cards[i] != null && _self.cards[i].text != '') {
            words.push(_self.cards[i].text);
        }
    }
    return words;
}

exports.getUntakenWords = getUntakenWords;

const words = [
    'Hä?',
    'Meddl',
    'Ich bin nicht derjeniche',
    'Was?',
    'Häider',
    'Du Wahnsinnicher',
    'Haut der wieder voll raus',
    'assi',
    'Ledsblay',
    'ey',
    'Ich bin ein Mensch, der..',
    'Juhtub',
    'Junau',
    'Stream',
    'schneiden',
    'rendern',
    'hochladen',
    'Barren',
    'Likes',
    'Abonnentne',
    'Willkommen bei den Drachis',
    'Deutschland',
    'Scheiße bauen',
    'BLM',
    'Nadsi',
    'alder',
    'dumm',
    'Ich mach nur mei Zeuch',
    'Mobbing',
    'Wichser',
    'So',
    'Arsch aufreißne',
    'Wadd de Hell',
    'Ohne Scheiß',
    'Glasfaser',
    'Und des Geilste is..',
    'Schanze',
    'Ihr seid die Assis hier',
    'Abo-Tschädd',
    'Erdbeerchen',
    'ferddich machne',
    'Vollidiodne',
    'Hass',
    'Emotion',
    'Mett',
    'Zedla',
    'dumm',
    'meine Gehirnzellen schmelzne',
    'Opfer',
    'Grundstück',
    'Radeln',
    '4 Drachne und der Meddl',
    'Brovogation',
    'Allegser',
    'Zeig mir die Einfahrt',
    'fotzn',
    'Brügel',
    'geblockt',
    'müde',
    '*gähnt*',
    'Arschloch',
    'im Gegensatz zu dir..',
    '*Song gegen Mobbing*',
    '*Lesbenschlager*',
    'Gesichtskrappfne'
];