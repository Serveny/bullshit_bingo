'use strict';
const bb_Room = require('./bb-room'),
  debug = require('debug')('wb');

// Events Input
exports.addEvents = socket => {
  socket.on('recoverRoom', data => {
    debug(` --- Recovering room for client ${data.oldId}/${socket.id} --- `);
    //bb_Room.recoverGame(socket, data.room, data.oldId);
  });

  socket.on('joinRoom', roomId => {
    bb_Room.joinRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    debug(` --- ${socket.id} disconnected --- `);
    bb_Room.removePlayerAndCloseRoomIfEmpty(socket);
  });

  socket.on('changeName', newName => {
    debug(` --- ${socket.id} change name to ${newName} --- `);
    bb_Room.setCustomName(socket, newName);
  });

  socket.on('toggleReady', () => {
    debug(` --- ${socket.id} toggle IsReady --- `);
    bb_Room.togglePlayerIsReady(socket);
  });

  socket.on('needAutofill', () => {
    debug(` --- ${socket.id} need autofill --- `);
    bb_Room.autofill(socket);
  });

  socket.on('setCard', data => {
    debug(` --- ${socket.id} set card ${data.cardId} to ${data.cardText} --- `);
    bb_Room.setCardAsync(socket, data.cardId, data.cardText);
  });

  socket.on('cardHit', cardId => {
    debug(` --- ${socket.id} Word said, cardId: ${cardId} --- `);
    bb_Room.cardHit(socket, cardId);
  });
};
