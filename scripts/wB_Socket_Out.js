const 
    debug = require('debug')('wb'),
    helper = require('./wB_Helper');
    

exports.emitRoomJoined = (socket, thisRoom) => {
    if (thisRoom != null) {
        socket.to(thisRoom.id).emit('playerJoined', helper.mapEx(thisRoom.playerMap.get(socket.id)));
        socket.emit('roomJoined', helper.mapEx(thisRoom));
        debug(` --- ${thisRoom.playerMap.get(socket.id).avatar.name} joined room ${thisRoom.id} --- `);
        
    } else {
    socket.emit('roomJoined', null);
    }
    console.log('');
};
  
exports.emitPlayerDisconnected = (socket, thisRoom) => {
    socket.to(thisRoom.id).emit('playerDisconnected', socket.id);
    debug(` --- Player ${socket.id} disconnected. --- `);
    console.log('');
};
  
exports.emitNameChange = (socket, thisRoom, newName) => {
    global.wb.io.in(thisRoom.id).emit('nameChanged', { playerId: socket.id, name: newName});
    debug(` --- Player ${socket.id} in room ${thisRoom.id} changed name to ${newName} --- `);
    console.log('');
};

exports.emitPlayerIsReadyChange = (socket, thisRoom, isReady) => {
    global.wb.io.in(thisRoom.id).emit('playerIsReadyChanged', { playerId: socket.id, isReady: isReady });
    debug(` --- Player ${socket.id} toggled isReady to ${isReady} --- `);
    console.log('');
};

exports.emitAutofillResult = (socket, changedCardMap) => {
    socket.emit('autofillResult', helper.mapToArr(changedCardMap));
    debug(` --- emitAutofillResult. Changed: ${ changedCardMap == null ? 0 : changedCardMap.size } --- `);
    console.log('');
};

exports.emitSetCardResult = (socket, card) => {
    socket.emit('cardValidationResult', helper.mapEx(card));
    debug(` --- emitCardValidationResult for card ${card.id}:${card.word != null ? card.word.text : ''} --- `);
    console.log('');
};

exports.emitStartCountdown = (thisRoom, countdownMilliSec) => {
    global.wb.io.in(thisRoom.id).emit('startCountdown', countdownMilliSec);
    debug(` --- emitStartCountdown: ${countdownMilliSec} --- `);
    console.log('');
};
