"use strict";
const 
    uniqid = require('uniqid'),
    avatars = require('./wB_Avatars');
    // var_dump = require('var_dump');

let roomList = global.roomList = [];

let joinRoom = function(roomId, socket) {
    const roomIndex = getRoomIndex(roomId);

    // Inexistent room
    if (roomId != null && roomIndex === -1) {
        return null;
    }
    console.log('roomIndex: ', roomIndex);
    if (roomIndex >= 0) {
        socket.join(roomId);
        roomList[roomIndex].players.push(createUser(roomList[roomIndex].players, socket));
        return roomList[roomIndex];
    } else {
        return createRoom(socket);
    };
};

let createRoom = function(socket) {
    const roomId = uniqid();
    socket.join(roomId);

    const room = {
        roomId: roomId,
        players: [
            createUser(null, socket)
        ],
    };

    roomList.push(room);
    return room;
};

let createUser = function(players, socket) {
    let user = avatars.getRandomAvatar(players);
    user.id = socket.id;
    user.customName = null;
    user.isReady = false;
    return user;
};

let getRoomIndex = function(roomId) {
    for (let i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId === roomId) {
            return i;
        }
    }
    return -1;
}

// Returns room
let removePlayerAndCloseRoomIfEmpty = function(id) {
    let roPlIndex = getRoomAndPlayerById(id);

    if(roPlIndex != null) {
        // Remove room if empty
        if (roomList[roPlIndex.roomIndex].players.length <= 1) {
            console.log('Close Room - ', roPlIndex.roomIndex);
            roomList.splice(roPlIndex.roomIndex);
            return null;
        } 
        // Remove player out of room only
        else {
            roomList[roPlIndex.roomIndex].players.splice(roPlIndex.playerIndex);
            return roomList[roPlIndex.roomIndex];
        }
    }
}

let getRoomAndPlayerById = function(id) {
    for (let i = 0; i < roomList.length; i++) {
        for (let u = 0; u < roomList[i].players.length; u++) {
            if (roomList[i].players[u].id == id) {
                return { 
                    roomIndex: i,
                    playerIndex: u
                };
            }
        }
    }
    return null;
}

let setCustomName = function(id, name) {
    let roPlIndex = getRoomAndPlayerById(id);

    if(roPlIndex != null) {
        roomList[roPlIndex.roomIndex].players[roPlIndex.playerIndex].customName = name;
        return roomList[roPlIndex.roomIndex];
    }
}

let togglePlayerReadyStatus = function(id) {
    let roPlIndex = getRoomAndPlayerById(id);

    if (roPlIndex != null) {
        const newStatus = !roomList[roPlIndex.roomIndex].players[roPlIndex.playerIndex].isReady;
        roomList[roPlIndex.roomIndex].players[roPlIndex.playerIndex].isReady = newStatus;
        return { room: roomList[roPlIndex.roomIndex], isReady: newStatus};
    } else {
        return null;
    }
}

exports.joinRoom = joinRoom;
exports.removePlayer = removePlayerAndCloseRoomIfEmpty;
exports.setCustomName = setCustomName;
exports.togglePlayerReadyStatus = togglePlayerReadyStatus;