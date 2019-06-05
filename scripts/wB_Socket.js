"use strict";
const
    wB_Room = require('./wB_Room'),
    wB_Cards = require('./wB_Cards');

const addEvents = function(socket, io) {
  
    socket.on('joinRoom', function (data) {
      const thisRoom = wB_Room.joinRoom(data.roomId, socket);
      socket.emit('roomJoined', thisRoom);
      
      if (thisRoom != null) {
        socket.to(thisRoom.roomId).emit('playerJoined', thisRoom.playerList[thisRoom.playerList.length - 1]);
      }
      console.log('joinRoom');
    });
    
    socket.on('disconnect', function() {
      console.log(socket.id + ' disconnected!');
      const thisRoom = wB_Room.removePlayer(socket.id);

      if (thisRoom != null) {
        socket.to(thisRoom.roomId).emit('playerDisconnected', socket.id);
      }
      console.log('disconnect');
    });
    
    socket.on('customName', function (name) {
      const thisRoom = wB_Room.setCustomName(socket.id, name);
      socket.to(thisRoom.roomId).emit('nameChanged', { playerId: socket.id, name: name});
    });

    socket.on('toggleReady', function(cards) {
      try {
        const roomAndIsReady = wB_Room.togglePlayerReadyStatus(socket.id, cards);
      
        if (roomAndIsReady != null) {
          io.in(roomAndIsReady.room.roomId).emit('playerReadyStatusChanged', { playerId: socket.id, isReady: roomAndIsReady.isReady });
        }
      } catch(err) { 
        console.error(`[toggleReady] ${err}`); 
      }
    });

    socket.on('needAutofill', function (taken) {
      socket.emit('autofillResult', wB_Cards.getUntakenWords(taken));
    });
}


exports.addEvents = addEvents;