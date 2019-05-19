const 
    uniqid = require('uniqid'),
    avatars = require('./avatars'),
    var_dump = require('var_dump');

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

let removePlayerAndCloseRoomIfEmpty = function(id) {
    for (let i = 0; i < roomList.length; i++) {
        for (let u = 0; u < roomList[i].players.length; u++) {
            if (roomList[i].players[u].id == id) {
                // Remove room if empty
                if (roomList[i].players.length <= 1) {
                    roomList.splice(i);
                } 
                // Remove player out of room only
                else {
                    roomList[i].players.splice(u);
                }
                return;
            }
        }
    }   
}

exports.joinRoom = joinRoom;
exports.removePlayer = removePlayerAndCloseRoomIfEmpty;