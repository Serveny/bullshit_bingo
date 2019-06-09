const 
    debug = require('debug')('wb'),
    helper = require('./wB_Helper');
    

exports.emitRoomJoined = (socket, thisRoom) => {
    if (thisRoom != null) {
        socket.to(thisRoom.id).emit('playerJoined', helper.mapEx(thisRoom.playerMap.get(socket.id)));
        socket.emit('roomJoined', helper.mapEx(thisRoom));
        debug(`${thisRoom.playerMap.get(socket.id).avatar.name} joined room ${thisRoom.id}`);
      } else {
        socket.emit('roomJoined', null);
      }
};
  
exports.emitPlayerDisconnected = (socket, thisRoom) => {
    socket.to(thisRoom.id).emit('playerDisconnected', socket.id);
    debug(`Player ${socket.id} disconnected.`);
};
  
exports.emitNameChange = (socket, thisRoom, newName) => {
    global.wb.io.in(thisRoom.id).emit('nameChanged', { playerId: socket.id, name: newName});
    debug(`Player ${socket.id} in room ${thisRoom.id} changed name to ${newName}`);
};

exports.emitPlayerIsReadyChange = (socket, thisRoom, isReady) => {
    global.wb.io.in(thisRoom.id).emit('playerReadyStatusChanged', { playerId: socket.id, isReady: isReady });
    debug(`Player ${socket.id} toggled isReady to ${isReady}`);
};

exports.emitAutofillResult = (socket, cardMapChanged) => {
    socket.emit('autofillResult', helper.mapEx(cardMapChanged));
    debug(`emitAutofillResult. Changed: ${ cardMapChanged == null ? 0 : cardMapChanged.size }`);
};

exports.emitSetCardResult = (socket, card) => {
    socket.emit('cardValidationResult', helper.mapEx(card));
    debug(`emitCardValidationResult for card ${card}`);
};
