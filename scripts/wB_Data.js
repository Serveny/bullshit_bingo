// Interface for data storage

// Maybe I will use a real database instead of js-Objects in future
// But for the moment this is all I need to test the game

"use strict";

class dbKey {
    constructor(primaryIndex, keyObj) {
        this.primaryIndex = primaryIndex;
        this.keyObj = keyObj;
    }    
}

class dbTable {
    constructor(type) {
        this.type = type;
        this.rows = new Map();
    }

    get rowById(rowId) {

    }

    get rowByKey(keyObj) {

    }

    set row(row) {
        if (typeof(row) === this.type) {

        } else {
            new TypeError('Need ' + this.type + ', but ' + typeof(row) + ' given');
        }
    }
}

const pseudoDB = new Map();
pseudoDB.set('room', new dbTable(typeof(dbRoom)));
pseudoDB.set('player', new dbTable(typeof(dbPlayer)));
pseudoDB.set('card', new dbTable(typeof(dbCard)));


getRow = function() {

}

class dbRoom {
    constructor(roomId) {
        this.roomId = roomId;
    }
}

class dbPlayer {
    constructor(playerId, roomId, avatarId) {
        this.playerId = playerId;
        this.playerRoomId = roomId;
        this.playerAvatarId = avatarId;
    }
}

class dbCard {
    constructor(params, keycardId, playerId, roomId, text, posX, posY) {
        this.cardId = cardId;
        this.cardPlayerId = playerId;
        this.cardRoomId = roomId;
        this.cardText = text;
        this.playerRoomId = roomId;
        this.playerAvatarId = avatarId;
        this.cardPosX = posX;
        this.cardPosY = posY;
    }
}