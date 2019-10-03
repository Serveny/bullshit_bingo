import { GameCache } from './bb-cl-game-cache';
import { Card } from './bb-cl-card';
import { Room } from './bb-cl-room';
export class CollectPhase {
  private _gameCache: GameCache;

  private _countdownId: string;
  get countdownId() {
    return this._countdownId;
  }

  constructor(gameCache: GameCache) {
    this._gameCache = gameCache;
    
  }

  startCollectPhase(room: any) {
    this._gameCache.room = new Room(room);
    this._gameCache.room.gameCache = this._gameCache;
    console.debug('RoomJoinedCache: ', this._gameCache.room);

    // Brobbaties
    const urlWithoutParams = location.protocol + '//' + location.host;
    this._gameCache.nextFocusCardId = null;

    // Lobby
    history.pushState(null, '', urlWithoutParams + '?r=' + this._gameCache.room.id);

    this._gameCache.barButtons.createRoomBtn.hide();
    $('#bb_lobbyContainer').fadeIn(1600);

    this._gameCache.room.roomAddPlayer(this._gameCache.room.playerMap);

    // Hadde Arbeit
    this._gameCache.selectedCardsGrid.attr('data-playerid', this._gameCache.socket.id);
    this._gameCache.selectedCardsGrid.html(
      this._gameCache.matchfield.matchfieldBuildHTML(this._gameCache.room.playerMap.get(this._gameCache.socket.id).cardMap)
    );

    const removeEventsCollectPhase = this.addEventsCollectPhase();
    this.socketAddEventsCollectPhase(removeEventsCollectPhase);
    
    this._gameCache.darkMode.repaint();

    $('#bb_cardsContainer').fadeIn(800);
    this._gameCache.barButtons.leaveRoomBtn.fadeIn(800);
    this._gameCache.barButtons.autofillBtn.fadeIn(800);
  }

  // Returns function to remove in function setted eventhandler
  addEventsCollectPhase() {
    const _self = this,
      keydownHandler = function(e: any) {
        let keyCode = e.keyCode || e.which;

        // Key: Tab
        if (keyCode == 9) {
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            let number = parseInt(_self._gameCache.matchfield.cardChangeEl.attr('data-id'));

            if (e.shiftKey) {
              number--;
            } else {
              number++;
            }

            _self._gameCache.nextFocusCardId = number;
            _self._gameCache.matchfield.matchfieldSetNewTextToCard(_self._gameCache.matchfield.cardChangeEl);
          }
        }

        // Key: Enter
        if (keyCode == 13) {
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            _self._gameCache.matchfield.matchfieldSetNewTextToCard(_self._gameCache.matchfield.cardChangeEl);
          }
        }

        // Key: Esc
        if (keyCode == 27) {
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            e.preventDefault();
            _self._gameCache.matchfield.matchfieldRevertCard(_self._gameCache.matchfield.cardChangeEl);
          }
          if (_self._gameCache.matchfield.isInfoOpen === true) {
            _self._gameCache.matchfield.toggleInfo();
          }
        }
      },
      documentClickHandler = (e: any) => {
        let target = $(e.target);
        target =
          target.hasClass('bb_card_text') === true ? target.parent() : target;

        if (target.hasClass('bb_card') === true) {
          const id = parseInt(target.attr('data-id'));
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            if (id !== parseInt(_self._gameCache.matchfield.cardChangeEl.attr('data-id'))) {
              _self._gameCache.nextFocusCardId = id;
              _self._gameCache.matchfield.matchfieldSetNewTextToCard(_self._gameCache.matchfield.cardChangeEl);
            }
          } else {
            _self._gameCache.matchfield.matchfieldAddTextAreaToCard(target);
          }
        } else {
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            _self._gameCache.matchfield.matchfieldSetNewTextToCard(_self._gameCache.matchfield.cardChangeEl);
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
        _self._gameCache.room.roomSetPlayerReadyHTML(data.playerId, data.isReady);

        if (data.isReady === false) {
          _self._gameCache.room.roomStopCountdown();
        }
      },
      autofillResultHandler = (changedCardsArr: Array<any>) => {
        _self._gameCache.matchfield.cardsAutofill(_self._gameCache.matchfield.arrToCardMap(changedCardsArr));
      },
      cardValidationResultHandler = function(card: any) {
        if (card != null) {
          _self._gameCache.matchfield.matchfieldSetCard(new Card(card));
        } else {
          _self._gameCache.matchfield.shakeAndStay(_self._gameCache.matchfield.cardChangeEl);
        }
      },
      startCountdownHandler = (timeMS: number) => {
        _self._gameCache.room.roomStartCountdown(timeMS);
      },
      phaseChangedToBingoHandler = (playRoom: Room) => {
        removeEventsCollectPhaseFunc();

        // Sogge uffräume
        _self._gameCache.socket.off('playerIsReadyChanged', playerIsReadyChangedHandler);
        _self._gameCache.socket.off('autofillResult', autofillResultHandler);
        _self._gameCache.socket.off('cardValidationResult', cardValidationResultHandler);
        _self._gameCache.socket.off('startCountdown', startCountdownHandler);
        _self._gameCache.socket.off('phaseChangedToBingo', phaseChangedToBingoHandler);

        _self._gameCache.bingoPhase.startBingoPhase(playRoom);
      };

    _self._gameCache.socket.on('playerIsReadyChanged', playerIsReadyChangedHandler);
    _self._gameCache.socket.on('autofillResult', autofillResultHandler);
    _self._gameCache.socket.on('cardValidationResult', cardValidationResultHandler);
    _self._gameCache.socket.on('startCountdown', startCountdownHandler);
    _self._gameCache.socket.on('phaseChangedBingo', phaseChangedToBingoHandler);
  }
}
