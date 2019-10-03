import { GameCache } from './bb-cl-game-cache';
import { Player } from './bb-cl-player';

export class Room {
  public id: string;
  public playerMap: Map<string, Player>;

  private _countdownId: any;
  
  constructor(room: any) {
    this.id = room.id;
    this.playerMap = new Map<string, Player>();

    const _self = this;
    room.playerMap.forEach((player: any) => {
      _self.playerMap.set(player[0], new Player(player[1]));
    });
  }

  roomAddPlayer(playerMap: Map<string, Player>) {
    const _self = this;
    playerMap.forEach((player) => {
      _self.roomAddPlayerHTML(player);
    });
  }

  roomAddPlayerHTML(player: Player) {
    const _self = this;
    const isReadyStyle =
      player.isReady === true ? 'style="display: block;"' : '';

    if (player.id === GameCache.socket.id) {
      $('#bb_lobbyContainer').append(
        '<div id="bb_thisUserField" class="bb_userField bb_userSelected" data-id="' +
          player.id +
          '"><img id="bb_thisUserPic" src="' +
          player.avatar.picUrl +
          '" class="bb_userPic" alt="Profilbild" />' +
          '<input id="bb_thisUserInput" class="bb_userName" type="text" value="' +
          player.avatar.name +
          '"><button id="bb_thisUserReady" class="btn bb_userReady">' +
          '<i class="mi">done</i></button><div class="bb_userFieldPointer"></div></div>'
      );

      $('#bb_thisUserInput').change((el: any) => {
        GameCache.socket.emit('changeName', $(el.target).val());
      });

      $('#bb_thisUserReady').click(() => {
        GameCache.socket.emit('toggleReady');
      });
    } else {
      $('#bb_lobbyContainer').append(
        '<div class="bb_userField" data-id="' +
          player.id +
          '"><i class="mi bb_userReady" ' +
          isReadyStyle +
          '>done</i>' +
          '<img src="' +
          player.avatar.picUrl +
          '" class="bb_userPic" alt="Profilbild" />' +
          '<div class="bb_userName">' +
          player.avatar.name +
          '</div><div class="bb_userFieldPointer"></div></div>'
      );
    }
  }

  roomRemovePlayerHTML(playerId: string) {
    $('.bb_userField[data-id=' + playerId + ']').remove();
  }

  roomPlayerChangeName(playerId: string, name: string) {
    $('.bb_userField[data-id=' + playerId + ']')
      .find('.bb_userName')
      .text(name);
  }

  roomSetPlayerReadyHTML(playerId: string, isReady: boolean) {
    if (playerId === GameCache.socket.id) {
      if (isReady === true) {
        $('#bb_thisUserReady').css({ color: 'green' });
      } else {
        $('#bb_thisUserReady').css({ color: 'gray' });
      }
    } else {
      let player = $('.bb_userField[data-id=' + playerId + ']');
      if (player != null) {
        if (isReady === true) {
          player.find('.bb_userReady').show();
        } else {
          player.find('.bb_userReady').hide();
        }
      }
    }
  }

  roomStartCountdown(timeMS: number) {
    $('#bb_countdownContainer').fadeIn(300);
    const counterEl = $('#bb_countdownCounter');

    this._countdownId = null;

    const countDown = (timeMS: number) => {
      counterEl.text(Math.floor(timeMS / 1000));
      this._countdownId = setTimeout(() => {
        counterEl.text(Math.floor(timeMS / 1000));

        if (timeMS > 0) {
          timeMS = timeMS - 1000;
          countDown(timeMS);
        }
      }, 1000);
    };

    countDown(timeMS);
  }

  roomStopCountdown() {
    clearTimeout(this._countdownId);
    $('#bb_countdownContainer').fadeOut(800);
  }

  roomUnreadyPlayer(playerMap: Map<string, Player>) {
    if (this.roomIsBingoPhase() === false) {
      for (const player of playerMap.values()) {
        console.log('roomUnreadyPlayer', player);
        this.roomSetPlayerReadyHTML(player.id, false);
        player.isReady = false;
      }
    }
  }

  roomIsBingoPhase() {
    for (const player of this.playerMap.values()) {
      if (player.phase === 2) {
        return true;
      }
    }
    return false;
  }

  roomBuildOtherFieldsHTML() {
    let fieldsHtml = '';
    for (const player of this.playerMap.values()) {
      if (player.id !== GameCache.thisPlayerId) {
        fieldsHtml +=
          '<div class="bb_cardsGrid" data-selected="false" data-playerid="' +
          player.id +
          '" style="display: none;">' +
          GameCache.matchfield.matchfieldBuildHTML(player.cardMap) +
          '</div>';
      }
    }
    return fieldsHtml;
  }

  roomShowCardField(playerId: string) {
    console.log('Hide old selected: ', GameCache.selectedCardsGrid);
    GameCache.selectedCardsGrid.attr('data-selected', 'false');
    const newSelected = $(
      '.bb_cardsGrid[data-playerid="' + playerId + '"]'
    ).attr('data-selected', 'true');
    GameCache.matchfield.showFieldSwitchAnimation(GameCache.selectedCardsGrid, newSelected);
    GameCache.selectedCardsGrid = newSelected;
  }

  getThisPlayer() {
    return this.playerMap.get(GameCache.socket.id);
  }
}