"use strict";
const
    wB_Room = require('./wB_Room'),
    debug = require('debug')('wb');

// Events Input
exports.addEvents = (socket) => {

    socket.on('joinRoom', (roomId) => {
      wB_Room.joinRoom(socket, roomId);
    });
    
    socket.on('disconnect', () => {
      debug(`${socket.id} disconnected`);
      wB_Room.removePlayerAndCloseRoomIfEmpty(socket);
    });
    
    socket.on('changeName', (newName) => {
      debug(`${socket.id} change name to ${newName}`);
      wB_Room.setCustomName(socket, newName);
    });

    socket.on('toggleReady', () => {
      debug(`${socket.id} toggle IsReady`);
      wB_Room.togglePlayerIsReady(socket);
    });

    socket.on('needAutofill', () => {
      debug(`${socket.id} need autofill`);
      wB_Room.autofill(socket);
    });

    socket.on('setCard', (data) => {
      debug(`${socket.id} set card ${data.cardId} to ${data.cardText}`);
      wB_Room.setCardAsync(socket, data.cardId, data.cardText);
    });
}