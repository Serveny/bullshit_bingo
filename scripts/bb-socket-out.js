const debug = require('debug')('wb'),
  helper = require('./bb-helper');

exports.emitError = (socket, errorStr) => {
  socket.emit('gameError', errorStr);
  debug(` --- emitGameError: ${errorStr} --- `);
};

exports.emitRoomJoined = (socket, thisRoom) => {
  if (thisRoom != null) {
    socket
      .to(thisRoom.id)
      .emit('playerJoined', helper.mapEx(thisRoom.playerMap.get(socket.id)));
    socket.emit('roomJoined', helper.mapEx(thisRoom));
    debug(
      ` --- ${thisRoom.playerMap.get(socket.id).avatar.name} joined room ${
        thisRoom.id
      } --- `
    );
  } else {
    socket.emit('roomJoined', null);
  }
};

exports.emitPlayerDisconnected = (socket, thisRoom) => {
  socket.to(thisRoom.id).emit('playerDisconnected', socket.id);
  debug(` --- Player ${socket.id} disconnected. --- `);
};

exports.emitNameChange = (socket, thisRoom, newName) => {
  global.wb.io
    .in(thisRoom.id)
    .emit('nameChanged', { playerId: socket.id, name: newName });
  debug(
    ` --- Player ${socket.id} in room ${
      thisRoom.id
    } changed name to ${newName} --- `
  );
};

exports.emitPlayerIsReadyChange = (socket, thisRoom, isReady) => {
  global.wb.io
    .in(thisRoom.id)
    .emit('playerIsReadyChanged', { playerId: socket.id, isReady: isReady });
  debug(` --- Player ${socket.id} toggled isReady to ${isReady} --- `);
};

exports.emitAutofillResult = (socket, changedCardMap) => {
  socket.emit('autofillResult', helper.mapToArr(changedCardMap));
  debug(
    ` --- emitAutofillResult. Changed: ${
      changedCardMap == null ? 0 : changedCardMap.size
    } --- `
  );
};

exports.emitSetCardResult = (socket, card) => {
  socket.emit('cardValidationResult', helper.mapEx(card));
  debug(
    ` --- emitCardValidationResult for card ${card.id}:${
      card.word != null ? card.word.text : ''
    } --- `
  );
};

exports.emitStartCountdown = (thisRoom, countdownMilliSec) => {
  global.wb.io.in(thisRoom.id).emit('startCountdown', countdownMilliSec);
  debug(` --- emitStartCountdown: ${countdownMilliSec} --- `);
};

exports.emitPhaseChangedBingo = thisRoom => {
  global.wb.io
    .in(thisRoom.id)
    .emit('phaseChangedBingo', helper.mapEx(thisRoom));
  debug(` --- emitPhaseChangedBingo: ${thisRoom.id} --- `);
};

exports.emitPlayerLaterBingoPhase = (socket, thisRoom) => {
  socket
    .to(thisRoom.id)
    .emit(
      'playerLaterBingoPhase',
      helper.mapEx(thisRoom.playerMap.get(socket.id))
    );
  socket.emit('phaseChangedBingo', helper.mapEx(thisRoom));
  debug(` --- emitPlayerLaterBingoPhase for ${socket.id} --- `);
};

exports.emitCardHit = (socket, thisRoom, cardId, isHit) => {
  global.wb.io
    .in(thisRoom.id)
    .emit('cardHit', { playerId: socket.id, cardId: cardId, isHit: isHit });
  debug(
    ` --- emitCardHit in room ${thisRoom.id} (${
      socket.id
    } set ${cardId} to ${isHit} --- `
  );
};

exports.emitWin = (socket, thisRoom, winLine) => {
  global.wb.io
    .in(thisRoom.id)
    .emit('playerWin', { playerId: socket.id, winLine: winLine });
  debug(
    ` --- emitWin in room ${thisRoom.id} for player ${socket.id} (${
      winLine.startX
    }/${winLine.startY} to ${winLine.endX}/${winLine.endY}) --- `
  );
};
