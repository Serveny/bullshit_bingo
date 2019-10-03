import { CollectPhase } from './bb-cl-collect-phase';
import { Room } from './bb-cl-room';
import { Player } from './bb-cl-player';
import { Card } from './bb-cl-card';
import { DarkMode } from './bb-cl-darkmode';
import { GameCache } from './bb-cl-game-cache';
import { Matchfield } from './bb-cl-matchfield';
import * as io from 'socket.io';
import { BarButtons } from './bb-cl-bar-buttons';
import { BingoPhase } from './bb-cl-bingo-phase';

// Author: Serveny
class BullshitBingo {
  private _gameCache: GameCache;
  public barBtns: any;

  // A bisl wergeln & rumwuseln
  constructor() {
    this._gameCache = new GameCache(
      io.prototype.connect(window.location.host),
      new DarkMode(),
      new Matchfield(this._gameCache),
      new CollectPhase(this._gameCache),
      new BingoPhase(this._gameCache),
      new BarButtons(
        $('#bb_leaveRoomBtn'),
        $('#bb_autofillBtn'),
        $('#bb_createRoomBtn')
      ),
      this._gameCache.matchfield.getUrlParam('r'),
      $('.bb_cardsGrid[data-selected=true]')
    );
    this.socketAddEvents();

    this.addEvents();

    if (this._gameCache.roomId != null) {
      this._gameCache.socket.emit('joinRoom', this._gameCache.roomId);
    }
  }

  addEvents() {
    const _self = this;

    $('#bb_createRoomBtn').click(() => {
      _self._gameCache.socket.emit('joinRoom', null);
    });

    _self.barBtns.toggleInfoBtn.click(() => {
      _self._gameCache.matchfield.toggleInfo();
    });

    this.barBtns.leaveRoomBtn.click(() => {
      _self._gameCache.socket.disconnect();
      history.pushState(null, '', location.protocol + '//' + location.host);
      location.reload();
    });

    _self.barBtns.autofillBtn.click(() => {
      _self._gameCache.socket.emit('needAutofill');
    });
  }

  socketAddEvents() {
    const _self = this;

    _self._gameCache.socket.on('connect', () => {
      _self._gameCache.thisPlayerId = _self._gameCache.socket.id;
    });

    _self._gameCache.socket.on('gameError', function(errorStr) {
      console.log('[ERROR] ' + errorStr);
      _self._gameCache.matchfield.showErrorToast(errorStr);
    });

    _self._gameCache.socket.on('disconnect', () => {
      // TODO Connection lost handling
      console.log(_self._gameCache.socket + ' disconnected');
    });

    _self._gameCache.socket.on('roomJoined', function(roomData) {
      if (roomData == null) {
        history.pushState(null, '', location.protocol + '//' + location.host);
        $('#bb_createRoomBtn').show();
      } else {
        _self._gameCache.collectPhase.startCollectPhase(roomData);
      }
    });

    _self._gameCache.socket.on('playerJoined', (newPlayer) => {
      _self._gameCache.room.roomUnreadyPlayer(_self._gameCache.room.playerMap);
      newPlayer = new Player(newPlayer);
      _self._gameCache.room.playerMap.set(newPlayer.id, newPlayer);
      _self._gameCache.room.roomAddPlayerHTML(newPlayer);

      if (_self._gameCache.collectPhase.countdownId != null) {
        _self._gameCache.room.roomStopCountdown();
      }
    });

    _self._gameCache.socket.on('playerDisconnected', (playerId) => {
      _self._gameCache.room.roomUnreadyPlayer(_self._gameCache.room.playerMap);
      _self._gameCache.room.roomRemovePlayerHTML(playerId);
    });

    _self._gameCache.socket.on('nameChanged', (data) => {
      _self._gameCache.room.roomPlayerChangeName(data.playerId, data.name);
    });

    _self._gameCache.socket.on('reconnect', () => {
      console.log('Reconnected: ', _self._gameCache.thisPlayerId, _self._gameCache.socket.id);
      if (_self._gameCache.room != null) {
        _self._gameCache.socket.emit('recoverRoom', {
          room: _self._gameCache.room,
          oldId: _self._gameCache.thisPlayerId
        });
      }
    });

    _self._gameCache.socket.on('gameRecovered', () => {
      // TODO
    });
  }
}

$(document).ready(() => {
  const bullshitBingo = new BullshitBingo();
  $('body').fadeIn(1600);
});
