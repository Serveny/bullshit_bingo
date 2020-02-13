import { GameCache } from './bb-cl-game-cache';
import { Card } from './bb-cl-card';
import { Room } from './bb-cl-room';
export class CollectPhase {


  private _countdownId: string;
  get countdownId() {
    return this._countdownId;
  }

  constructor() {
    
  }

  startCollectPhase(room: any) {
    console.debug('RoomJoinedCache: ', GameCache);
    GameCache.room = new Room(room);

    const urlWithoutParams = location.protocol + '//' + location.host;
    GameCache.nextFocusCardId = null;

    // Lobby
    history.pushState(null, '', urlWithoutParams + '?r=' + GameCache.room.id);

    GameCache.barButtons.createRoomBtn.hide();
    $('#bb_lobbyContainer').fadeIn(1600);

    GameCache.room.roomAddPlayer(GameCache.room.playerMap);

    GameCache.selectedCardsGrid.attr('data-playerid', GameCache.socket.id);
    GameCache.selectedCardsGrid.html(
      GameCache.matchfield.matchfieldBuildHTML(GameCache.room.playerMap.get(GameCache.socket.id).cardMap)
    );

    const removeEventsCollectPhase = this.addEventsCollectPhase();
    this.socketAddEventsCollectPhase(removeEventsCollectPhase);
    
    GameCache.darkMode.repaint();

    $('#bb_cardsContainer').fadeIn(800);
    GameCache.barButtons.leaveRoomBtn.fadeIn(800);
    GameCache.barButtons.autofillBtn.fadeIn(800);
  }

  // Returns function to remove in function setted eventhandler
  addEventsCollectPhase() {
    const _self = this,
      keydownHandler = function(e: any) {
        let keyCode = e.keyCode || e.which;

        // Key: Tab
        if (keyCode == 9) {
          if (GameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            let number = parseInt(GameCache.matchfield.cardChangeEl.attr('data-id'));

            if (e.shiftKey) {
              number--;
            } else {
              number++;
            }

            GameCache.nextFocusCardId = number;
            GameCache.matchfield.matchfieldSetNewTextToCard(GameCache.matchfield.cardChangeEl);
          }
        }

        // Key: Enter
        if (keyCode == 13) {
          if (GameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            GameCache.matchfield.matchfieldSetNewTextToCard(GameCache.matchfield.cardChangeEl);
          }
        }

        // Key: Esc
        if (keyCode == 27) {
          if (GameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            GameCache.matchfield.matchfieldRevertCard(GameCache.matchfield.cardChangeEl);
          }
          if (GameCache.matchfield.isInfoOpen === true) {
            GameCache.matchfield.toggleInfo();
          }
        }
      },
      documentClickHandler = (e: any) => {
        let target = $(e.target);
        target =
          target.hasClass('bb_card_text') === true ? target.parent() : target;

        if (target.hasClass('bb_card') === true) {
          const id = parseInt(target.attr('data-id'));
          if (GameCache.matchfield.cardChangeEl != null) {
            if (id !== parseInt(GameCache.matchfield.cardChangeEl.attr('data-id'))) {
              GameCache.nextFocusCardId = id;
              GameCache.matchfield.matchfieldSetNewTextToCard(GameCache.matchfield.cardChangeEl);
            }
          } else {
            GameCache.matchfield.matchfieldAddTextAreaToCard(target);
          }
        } else {
          if (GameCache.matchfield.cardChangeEl != null) {
            GameCache.matchfield.matchfieldSetNewTextToCard(GameCache.matchfield.cardChangeEl);
          }
        }
      },
      removeEventsCollectPhase = () => {
        $(document).off('keydown', keydownHandler);
        $(document).off('click', documentClickHandler);
      };

    $(document).on('keydown', keydownHandler);
    $(document).on('click', documentClickHandler);
    return removeEventsCollectPhase;
  }

  socketAddEventsCollectPhase(removeEventsCollectPhaseFunc: any) {
    const _self = this,
      playerIsReadyChangedHandler = (data: any) => {
        GameCache.room.roomSetPlayerReadyHTML(data.playerId, data.isReady);

        if (data.isReady === false) {
          GameCache.room.roomStopCountdown();
        }
      },
      autofillResultHandler = (changedCardsArr: Array<any>) => {
        GameCache.matchfield.cardsAutofill(GameCache.matchfield.arrToCardMap(changedCardsArr));
      },
      cardValidationResultHandler = function(card: any) {
        if (card != null) {
          GameCache.matchfield.matchfieldSetCard(new Card(card));
        } else {
          GameCache.matchfield.shakeAndStay(GameCache.matchfield.cardChangeEl);
        }
      },
      startCountdownHandler = (timeMS: number) => {
        GameCache.room.roomStartCountdown(timeMS);
      },
      phaseChangedToBingoHandler = (playRoom: Room) => {
        removeEventsCollectPhaseFunc();

        // Sogge uffräume
        GameCache.socket.off('playerIsReadyChanged', playerIsReadyChangedHandler);
        GameCache.socket.off('autofillResult', autofillResultHandler);
        GameCache.socket.off('cardValidationResult', cardValidationResultHandler);
        GameCache.socket.off('startCountdown', startCountdownHandler);
        GameCache.socket.off('phaseChangedToBingo', phaseChangedToBingoHandler);

        GameCache.bingoPhase.startBingoPhase(playRoom);
      };

    GameCache.socket.on('playerIsReadyChanged', playerIsReadyChangedHandler);
    GameCache.socket.on('autofillResult', autofillResultHandler);
    GameCache.socket.on('cardValidationResult', cardValidationResultHandler);
    GameCache.socket.on('startCountdown', startCountdownHandler);
    GameCache.socket.on('phaseChangedBingo', phaseChangedToBingoHandler);
  }
}
