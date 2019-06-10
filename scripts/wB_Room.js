"use strict";
const
    debug = require('debug')('wb'),
    shortid = require('shortid'),
    avatars = require('./wB_Avatars'),
    wB_cards = require('./wB_cards'),
    out = require('./wB_Socket_Out'),
    helper = require('./wB_Helper'),
    roomMap = global.wb.roomMap = new Map();

class Room {
    constructor(id, playerMap) {  
        this.id = id; 
        this.playerMap = playerMap;
    }
}

class Player {
    constructor(id, avatar, isReady, cardMap) {
        this.id = id;
        this.avatar = avatar;
        this.isReady = isReady;
        this.cardMap = cardMap;
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
    
    out.emitRoomJoined(socket, room);
    return;
};

exports.removePlayerAndCloseRoomIfEmpty = (socket) => {
    let room = getRoomByPlayerId(socket.id);

    if (room == null) {
        return;
    }

    // Remove room if empty
    if (room.playerMap.size <= 1) {
        debug(`Room ${room.id} closed`);
        roomMap.delete(room.id);
    } 
    // Remove player out of room only
    else {
        room.playerMap.delete(socket.id);
        out.emitPlayerDisconnected(socket, room);
    }
};

exports.togglePlayerIsReady = (socket) => {
    const room = getRoomByPlayerId(socket.id);
    if (room == null) {
        return;
    }
        
    const player = room.playerMap.get(socket.id);
    if (player.isReady === false && wB_cards.areCardsFilledAndValid(player.cardMap) === false) { 
        return;
    }

    player.isReady = !player.isReady;
    out.emitPlayerIsReadyChange(socket, room, player.isReady);
};

exports.setCustomName = (socket, newName) => {
    const room = getRoomByPlayerId(socket.id);

    if(room != null && helper.isValidName(newName) === true) {
        room.playerMap.get(socket.id).avatar.name = newName;
        out.emitNameChange(socket, room, newName);
    }
};

exports.setCardAsync = async (socket, cardId, newText) => {
    cardText = helper.defuseUserInput(newText);

    const room = getRoomByPlayerId(socket.id);
    if (room == null) { 
        return;
    }

    const cardMap = room.playerMap.get(socket.id).cardMap;
    if (wB_cards.isValidCard(cardMap, cardText) === false) {
        out.emitSetCardResult(socket, null);
        return;
    }
    
    const newWord = await wB_cards.getWordAsync(newText);

    const card = cardMap.get(parseInt(cardId));
    card.word = newWord;

    out.emitSetCardResult(socket, card);
};

exports.autofill = (socket) => {
    const room = getRoomByPlayerId(socket.id);
    if (room == null) { 
        return;
    }
    
    const cardMap = room.playerMap.get(socket.id).cardMap;
    const newWordsMap = wB_cards.getUntakenWordsMap(wB_cards.getTakenWordsMap(cardMap));
    let changedMap = null;

    if (newWordsMap.size > 0) {
        changedMap = wB_cards.fillEmptyWordsCardMap(cardMap, newWordsMap);
    }
    
    out.emitAutofillResult(socket, changedMap);
};
//#endregion

//#region private
const createRoom = (socket) => {
    const newPlayer = createPlayer(null, socket);
    const roomId = shortid.generate();
    const room = new Room(roomId, new Map([[newPlayer.id, newPlayer]]));
    
    socket.join(roomId);
    roomMap.set(roomId, room);
    return room;
};

const createPlayer = (playerMap, socket) => {
    const avatar = avatars.getRandomAvatar(playerMap);
    return new Player(socket.id, avatar, false, wB_cards.generateEmptyCardMap());
};

const getRoomByPlayerId = (id) => {
    for (const room of roomMap.values()) {
        if (room.playerMap.has(id) === true) {
            return room;
        }
    }
    return null;
}
//#endregion