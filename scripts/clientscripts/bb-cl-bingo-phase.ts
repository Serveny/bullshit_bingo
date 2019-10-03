import { GameCache } from './bb-cl-game-cache';
import { Room } from './bb-cl-room';

export class BingoPhase {
  private _gameCache: GameCache;

  constructor(gameCache: GameCache) {
    this._gameCache = gameCache;
  }

  startBingoPhase(roomArr: any) {
    const _self = this;
    this._gameCache.matchfield.cardsFlipAnimation().then(function() {
      _self.addEventsBingoPhase();
      _self.socketAddEventsBingoPhase();
    });
    this._gameCache.barButtons.autofillBtn.hide();
    this._gameCache.room = new Room(roomArr);

    $('#bb_cardsContainer').append(
      this._gameCache.room.roomBuildOtherFieldsHTML()
    );
    $('#bb_countdownContainer').fadeOut(800);
    $('.bb_userReady').hide();
    $('.bb_userField').addClass('bb_userField_Clickable');
    this._gameCache.darkMode.repaint();
  }
  
  addEventsBingoPhase() {
    const _self = this,
      documentClickHandler = function(e: any) {
        let target = $(e.target);

        // Userfield Click Handler
        target =
          target.parent().hasClass('bb_userField') === true
            ? target.parent()
            : target;
        if (target.hasClass('bb_userField') === true) {
          if (target.hasClass('bb_userSelected') === false) {
            $('.bb_userSelected').removeClass('bb_userSelected');
            target.addClass('bb_userSelected');
            _self._gameCache.room.roomShowCardField(target.attr('data-id'));
          }
          return;
        }

        // Card Click Handler
        target =
          target.hasClass('bb_card_text') === true ? target.parent() : target;
        if (target.hasClass('bb_cardHit') === true) {
          return;
        }
        if (target.hasClass('bb_card') === true) {
          const id = target.attr('data-id');
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            if (id !== _self._gameCache.matchfield.cardChangeEl.attr('data-id')) {
              _self._gameCache.matchfield.cardsRemoveConfirmBox(_self._gameCache.matchfield.cardChangeEl);
              _self._gameCache.matchfield.cardsAddConfirmBox(target);
            }
          } else {
            _self._gameCache.matchfield.cardsAddConfirmBox(target);
          }
        } else {
          if (_self._gameCache.matchfield.cardChangeEl != null) {
            _self._gameCache.matchfield.cardsRemoveConfirmBox(_self._gameCache.matchfield.cardChangeEl);
          }
        }
      };

    $(document).on('click', documentClickHandler);
  }

  socketAddEventsBingoPhase() {
    const _self = this,
      cardHitHandler = function(data: any) {
        _self._gameCache.matchfield.cardsSetHit(data.playerId, data.cardId, data.isHit);
      },
      playerLaterBingoPhase = function(data: any) {
        // TODO
      };

    _self._gameCache.socket.on('cardHit', cardHitHandler);

    _self._gameCache.socket.on('playerLaterBingoPhase', playerLaterBingoPhase);

    _self._gameCache.socket.on('playerWin', winData => {
      console.log(
        '[GAME END] ',
        winData.playerId,
        $('.bb_cardsGrid[data-selected="true"]').attr('data-playerid')
      );
      if (
        winData.playerId ===
        $('.bb_cardsGrid[data-selected="true"]').attr('data-playerid')
      ) {
        _self._gameCache.matchfield.drawWinLine(winData.winLine);
        _self._gameCache.matchfield.playWinAnimation();
        _self._gameCache.socket.off('cardHit', cardHitHandler);
      } else {
        console.log('Other player won');
      }
    });
  }
}