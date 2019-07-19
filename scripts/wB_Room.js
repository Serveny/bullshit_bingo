"use strict";
const
    debug = require('debug')('wb'),
    shortid = require('shortid'),
    avatars = require('./wB_Avatars'),
    wB_cards = require('./wB_cards'),
    out = require('./wB_Socket_Out'),
    helper = require('./wB_Helper'),
    roomMap = global.wb.roomMap = new Map();

const gamePhase = {
    werkel: 0,
    bingo: 2
};

const errorText = {
    roomNotExist: 'Aktion nicht möglich, Raum existiert nicht mehr.',
    cardNotExist: 'Aktion nicht möglich, Karte existiert nicht.',
    wrongPhase: 'Aktion nicht möglich, Spieler ist in falscher Spiel-Phase.'
}

class Room {
    constructor(id, playerMap, countdown) { 
        this.id = id; 
        this.playerMap = playerMap;
        this.countdown = countdown;
    }
}

class Player {
    constructor(id, avatar, isReady, cardMap, phase) {
        this.id = id;
        this.avatar = avatar;
        this.isReady = isReady;
        this.cardMap = cardMap;
        
        // 0 = Werkelphase, 2 = Bingophase
        this.phase = phase;
    }
}

//#region public
exports.joinRoom = (socket, roomId) => {
    // Create new room
    if (roomId == null) {
        out.emitRoomJoined(socket, createRoom(socket));
        return;
    }

    const room = roomMap.get(roomId);
    // Inexistent room
    if (room == null) {
        out.emitRoomJoined(socket, null);
        return;
    }  

    const newUser = createPlayer(room.playerMap, socket);
    // Join Room
    socket.join(roomId);
    room.playerMap.set(newUser.id, newUser);
    
    if (isBingoPhase(room.playerMap) === false) {
        unreadyPlayer(room.playerMap);
        startStopCountdown(room);
    }

    out.emitRoomJoined(socket, room);
    return;
};

exports.removePlayerAndCloseRoomIfEmpty = (socket) => {
    let room = getRoomByPlayerId(socket.id);

    if (room == null) {
        return;
    }
    
    if (isBingoPhase(room.playerMap) === false) {
        unreadyPlayer(room.playerMap);
        startStopCountdown(room);
    }

    // Remove room if empty
    if (room.playerMap.size <= 1) {
        debug(`Room ${room.id} closed`);
        roomMap.delete(room.id);
    } 
    // Remove player out of room only
    else {
        room.playerMap.delete(socket.id);
        unreadyPlayer(room.playerMap);
        out.emitPlayerDisconnected(socket, room);
    }
};

exports.togglePlayerIsReady = (socket) => {
    const room = getRoomByPlayerId(socket.id);
    if (room == null) {
        out.emitError(socket, errorText.roomNotExist);
        return;
    }   
        
    const player = room.playerMap.get(socket.id);
    if (player.phase !== gamePhase.werkel) {
        out.emitError(socket, errorText.wrongPhase);
        return;
    }

    if ((player.isReady === true) || (player.isReady === false && wB_cards.areCardsFilledAndValid(player.cardMap) === true)) {
        player.isReady = !player.isReady;
    }
    
    // If the game already started, player ca join without countdown
    if (isBingoPhase(room.playerMap) === true) {
        startPlayerBingoPhase(player);
        out.emitPlayerLaterBingoPhase(socket, room, player.isReady);
    } else {
        startStopCountdown(room);
        out.emitPlayerIsReadyChange(socket, room, player.isReady);
    }
};

exports.setCustomName = (socket, newName) => {
    const room = getRoomByPlayerId(socket.id);

    if(room != null && helper.isValidName(newName) === true) {
        room.playerMap.get(socket.id).avatar.name = newName;
        out.emitNameChange(socket, room, newName);
    }
};

exports.setCardAsync = async (socket, cardId, newText) => {
    newText = helper.defuseUserInput(newText).toLowerCase();

    const room = getRoomByPlayerId(socket.id);
    if (room == null) {
        out.emitError(socket, errorText.roomNotExist);
        return;
    }
    const player = room.playerMap.get(socket.id);
    if (player.phase !== gamePhase.werkel) {
        out.emitError(socket, errorText.wrongPhase);
        return;
    }

    const cardMap = player.cardMap;
    const card = cardMap.get(parseInt(cardId));

    // Check if no change
    if (card.word != null && card.word.text === newText) {
        out.emitSetCardResult(socket, card);
        return;
    }

    // Check if valid
    if (wB_cards.isValidCard(cardMap, newText) === false) {
        out.emitSetCardResult(socket, card);
        return;
    }
    
    const newWord = await wB_cards.getWordAsync(newText);
    if(newWord != null) {
        card.word = newWord;
    }
    
    out.emitSetCardResult(socket, card);
};

exports.autofill = async (socket) => {
    const room = getRoomByPlayerId(socket.id);
    if (room == null) {
        out.emitError(socket, errorText.roomNotExist);
        return;
    }
    const player = room.playerMap.get(socket.id);
    if (player.phase !== gamePhase.werkel) {
        out.emitError(socket, errorText.wrongPhase);
        return;
    }
    
    const cardMap = player.cardMap;
    const newWordsMap = await wB_cards.getUntakenWordsMap(wB_cards.getTakenWordsMap(cardMap));
    let changedMap = null;

    if (newWordsMap.size > 0) {
        changedMap = wB_cards.fillEmptyWordsCardMap(cardMap, newWordsMap);
    }
    
    out.emitAutofillResult(socket, changedMap);
};

exports.cardHit = (socket, cardId) => {
    const room = getRoomByPlayerId(socket.id);
    if (room == null) {
        out.emitError(socket, errorText.roomNotExist);
        return;
    }
    const player = room.playerMap.get(socket.id);
    if (player.phase !== gamePhase.bingo) {
        out.emitError(socket, errorText.wrongPhase);
        return;
    }
    const card = player.cardMap.get(parseInt(cardId));
    if (card == null) {
        out.emitError(socket, errorText.cardNotExist);
        return;
    }
    card.isHit = true;
    out.emitCardHit(socket, room, cardId, card.isHit);

    if (wB_cards.checkWin(player.cardMap) === true) {
        out.emitWin(socket, room);
    }
}
//#endregion

//#region private
const createRoom = (socket) => {
    const newPlayer = createPlayer(null, socket);
    const roomId = shortid.generate();
    const room = new Room(roomId, new Map([[newPlayer.id, newPlayer]]), null);
    
    socket.join(roomId);
    roomMap.set(roomId, room);
    return room;
};

const createPlayer = (playerMap, socket) => {
    const avatar = avatars.getRandomAvatar(playerMap);
    return new Player(socket.id, avatar, false, wB_cards.generateEmptyCardMap(), gamePhase.werkel);
};

const getRoomByPlayerId = (id) => {
    for (const room of roomMap.values()) {
        if (room.playerMap.has(id) === true) {
            return room;
        }
    }
    return null;
};

const startStopCountdown = (room) => {
    const allReady = areAllPlayerReady(room.playerMap);
    
    // Start countdown
    if (allReady === true && room.countdown == null) {
        const countdownTime = 3000;

        room.countdown = setTimeout(() => {
            debug('start', room.countdown);
            startBingoPhase(room);
        }, 
        // 100ms tolerance
        (countdownTime + 100));
        out.emitStartCountdown(room, countdownTime);
    } 
    // Stop countdown
    else if (allReady === false && room.countdown != null) {
        clearTimeout(room.countdown);
        room.countdown = null;
    }
};

const areAllPlayerReady = (playerMap) => {
    for (const player of playerMap.values()) {
        if (player.isReady === false) {
            return false;
        }
    }
    return true;
};

const unreadyPlayer = (playerMap) => {
    for (const player of playerMap.values()) {
        player.isReady = false;
    }
};

const startBingoPhase = (room) => {
    for (const player of room.playerMap.values()) {
        startPlayerBingoPhase(player);
    }
    out.emitPhaseChangedBingo(room);
}

const startPlayerBingoPhase = (player) => {
    if (player.isReady === true && player.phase === gamePhase.werkel) {
        player.phase = gamePhase.bingo;
        wB_cards.wordCountUp(player.cardMap, 'Guessed');
    }
} 

const isBingoPhase = (playerMap) => {
    for(const player of playerMap.values()) {
        if(player.phase === gamePhase.bingo) {
            return true;
        }
    }
    return false;
}
//#endregion