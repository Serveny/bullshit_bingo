import { Socket } from 'socket.io';
import { CollectPhase } from './bb-cl-collect-phase';
import { Player } from './bb-cl-player';
import { DarkMode } from './bb-cl-darkmode';
import { GameCache } from './bb-cl-game-cache';
import { Matchfield } from './bb-cl-matchfield';
import { BarButtons } from './bb-cl-bar-buttons';
import { BingoPhase } from './bb-cl-bingo-phase';

declare var io : {
  connect(url: string): Socket;
};

// Author: Serveny
class BullshitBingo {

  constructor() {
    GameCache.socket = io.connect(window.location.host);
    GameCache.darkMode = new DarkMode();
    GameCache.matchfield = new Matchfield();
    GameCache.collectPhase = new CollectPhase();
    GameCache.bingoPhase = new BingoPhase();
    GameCache.barButtons = new BarButtons(
        $('#bb_leaveRoomBtn'),
        $('#bb_autofillBtn'),
        $('#bb_createRoomBtn'),
        $('.bb_toggleInfoBtn')
      );
    GameCache.selectedCardsGrid = $('.bb_cardsGrid[data-selected=true]');
    GameCache.roomId = GameCache.matchfield.getUrlParam('r');
    this.socketAddEvents();

    this.addEvents();

    if (GameCache.roomId != null) {
      GameCache.socket.emit('joinRoom', GameCache.roomId);
    }
  }

  addEvents() {
    const _self = this;

    $('#bb_createRoomBtn').click(() => {
      GameCache.socket.emit('joinRoom', null);
    });

    GameCache.barButtons.toggleInfoBtn.click(() => {
      GameCache.matchfield.toggleInfo();
    });

    GameCache.barButtons.leaveRoomBtn.click(() => {
      GameCache.socket.disconnect();
      history.pushState(null, '', location.protocol + '//' + location.host);
      location.reload();
    });

    GameCache.barButtons.autofillBtn.click(() => {
      GameCache.socket.emit('needAutofill');
    });
  }

  socketAddEvents() {
    const _self = this;

    GameCache.socket.on('connect', () => {
      GameCache.thisPlayerId = GameCache.socket.id;
    });

    GameCache.socket.on('gameError', function(error) {
      console.log('[ERROR] ', error);
      GameCache.matchfield.showErrorToast(typeof(error) === 'object' ? JSON.stringify(error) : error);
    });

    GameCache.socket.on('disconnect', () => {
      // TODO Connection lost handling
      console.log(GameCache.socket + ' disconnected');
    });

    GameCache.socket.on('roomJoined', (roomData) => {
      if (roomData == null) {
        history.pushState(null, '', location.protocol + '//' + location.host);
        $('#bb_createRoomBtn').show();
      } else {
        GameCache.collectPhase.startCollectPhase(roomData);
      }
    });

    GameCache.socket.on('playerJoined', (newPlayer) => {
      GameCache.room.roomUnreadyPlayer(GameCache.room.playerMap);
      newPlayer = new Player(newPlayer);
      GameCache.room.playerMap.set(newPlayer.id, newPlayer);
      GameCache.room.roomAddPlayerHTML(newPlayer);

      if (GameCache.collectPhase.countdownId != null) {
        GameCache.room.roomStopCountdown();
      }
    });

    GameCache.socket.on('playerDisconnected', (playerId) => {
      GameCache.room.roomUnreadyPlayer(GameCache.room.playerMap);
      GameCache.room.roomRemovePlayerHTML(playerId);
    });

    GameCache.socket.on('nameChanged', (data) => {
      GameCache.room.roomPlayerChangeName(data.playerId, data.name);
    });

    GameCache.socket.on('reconnect', () => {
      console.log('Reconnected: ', GameCache.thisPlayerId, GameCache.socket.id);
      if (GameCache.room != null) {
        GameCache.socket.emit('recoverRoom', {
          room: GameCache.room,
          oldId: GameCache.thisPlayerId
        });
      }
    });

    GameCache.socket.on('gameRecovered', () => {
      // TODO
    });
  }
}

$(document).ready(() => {
  const bullshitBingo = new BullshitBingo();
  $('body').fadeIn(1600);
});
