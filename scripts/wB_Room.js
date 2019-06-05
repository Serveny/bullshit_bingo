"use strict";
const 
    uniqid = require('uniqid'),
    avatars = require('./wB_Avatars'),
    wB_cards = require('./wB_cards');
    // var_dump = require('var_dump');

let roomList = global.roomList = [];

class Room {
    constructor(id, playerList) {  
        this.id = id; 
        this.playerList = playerList;
    }
}

class Player {
    constructor(id, avatar, isReady, cardList) {
        this.id = id;
        this.avatar = avatar;
        this.isReady = isReady;
        this.cardList = cardList;
    }
}

const joinRoom = (roomId, socket) => {
    const roomIndex = getRoomIndex(roomId);

    // Inexistent room
    if (roomId != null && roomIndex === -1) {
        return null;
    }
    console.log('roomIndex: ', roomIndex);
    if (roomIndex >= 0) {
        socket.join(roomId);
        roomList[roomIndex].playerList.push(createPlayer(roomList[roomIndex].playerList, socket));
        return roomList[roomIndex];
    } else {
        return createRoom(socket);
    };
};

const createRoom = (socket) => {
    const room = new Room(uniqid(), [createPlayer(null, socket)]);
    
    socket.join(room.id);
    roomList.push(room);
    return room;
};

const createPlayer = (playerList, socket) => {
    let avatar = avatars.getRandomAvatar(playerList);
    return new Player(socket.id, avatar, false, []);
};

const getRoomIndex = (roomId) => {
    for (let i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId === roomId) {
            return i;
        }
    }
    return -1;
}

// Returns room
const removePlayerAndCloseRoomIfEmpty = function(id) {
    let roPlIndex = getRoomAndPlayerById(id);

    if(roPlIndex != null) {
        // Remove room if empty
        if (roomList[roPlIndex.roomIndex].playerList.length <= 1) {
            console.log('Close Room - ', roPlIndex.roomIndex);
            roomList.splice(roPlIndex.roomIndex);
            return null;
        } 
        // Remove player out of room only
        else {
            roomList[roPlIndex.roomIndex].playerList.splice(roPlIndex.playerIndex);
            return roomList[roPlIndex.roomIndex];
        }
    }
}

const getRoomAndPlayerById = function(id) {
    for (let i = 0; i < roomList.length; i++) {
        for (let u = 0; u < roomList[i].playerList.length; u++) {
            if (roomList[i].playerList[u].id == id) {
                return { 
                    roomIndex: i,
                    playerIndex: u
                };
            }
        }
    }
    return null;
}

const setCustomName = function(id, name) {
    let roPlIndex = getRoomAndPlayerById(id);

    if(roPlIndex != null) {
        roomList[roPlIndex.roomIndex].playerList[roPlIndex.playerIndex].customName = name;
        return roomList[roPlIndex.roomIndex];
    }
}

const togglePlayerReadyStatus = (id, cardList) => {
    let roPlIndex = getRoomAndPlayerById(id);

    if (roPlIndex != null && wB_cards.areCardsFilledAndValid(cardList)) {
        const newStatus = !(roomList[roPlIndex.roomIndex].playerList[roPlIndex.playerIndex].isReady);
        roomList[roPlIndex.roomIndex].playerList[roPlIndex.playerIndex].isReady = newStatus;
        return { room: roomList[roPlIndex.roomIndex], isReady: newStatus};
    } else {
        return null;
    }
}

// TODO Overthink using Maps instead of arrays

exports.joinRoom = joinRoom;
exports.removePlayer = removePlayerAndCloseRoomIfEmpty;
exports.setCustomName = setCustomName;
exports.togglePlayerReadyStatus = togglePlayerReadyStatus;