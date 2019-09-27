// Author: Serveny

class Room {
  constructor(room) {
    this.id = room.id;
    this.playerMap = new Map();

    const _self = this;
    room.playerMap.forEach(function(player) {
      _self.playerMap.set(player[0], new Player(player[1]));
    });
  }
}

class Player {
  constructor(player) {
    this.id = player.id;
    this.avatar = player.avatar;
    this.isReady = player.isReady;
    this.cardMap = new Map();
    this.phase = player.phase;

    const _self = this;
    player.cardMap.forEach(function(card) {
      _self.cardMap.set(card[0], new Card(card[1]));
    });
  }
}

class Card {
  constructor(card) {
    this.id = card.id;
    this.word = card.word == null ? null : new Word(card.word);
    this.posX = card.posX;
    this.posY = card.posY;
  }
}

class Word {
  constructor(word) {
    this.id = word.id;
    this.text = word.text;
    this.countGuessed = word.countGuessed;
    this.countUsed = word.countUsed;
    this.createdAt = word.createdAt;
    this.changedAt = word.changedAt;
  }
}

class BullshitBingo {
  // A bisl wergeln & rumwuseln
  constructor() {
    this.socket = io.connect(window.location.host);
    this.thisPlayerId = null;

    this.roomId = this.getUrlParam('r');
    this.room = {};
    this.barBtns = {
      autofillBtn: $('#bb_autofillBtn'),
      toggleInfoBtn: $('.bb_toggleInfoBtn'),
      toggleDarkBtn: $('#bb_toggleDarkBtn'),
      leaveRoomBtn: $('#bb_leaveRoomBtn')
    };
    this.selectedCardsGrid = $('.bb_cardsGrid[data-selected=true]');
    this.socketAddEvents();

    // Dark Mode
    if (this.getDarkModeSetting() === true) {
      this.toggleDarkMode();
    } else {
      $('body').css({ background: '#F2E2C4' });
    }

    this.addEvents();

    if (this.roomId != null) {
      this.socket.emit('joinRoom', this.roomId);
    }
  }

  startWerkelPhase(room) {
    this.room = new Room(room);
    console.debug('RoomJoinedCache: ', this.room);

    // Brobbaties
    const urlWithoutParams = location.protocol + '//' + location.host;
    this.cardChange = null;
    this.nextFocusCardId = null;
    this.isDarkMode = false;
    this.isInfoOpen = false;
    this.cards = [];
    this.phase = 0;

    // Lobby
    history.pushState(null, '', urlWithoutParams + '?r=' + this.room.id);

    $('#bb_createRoomBtn').hide();
    $('#bb_lobbyContainer').fadeIn(1600);

    this.roomAddPlayer(this.room.playerMap);

    // Hadde Arbeit
    this.selectedCardsGrid.attr('data-playerid', this.socket.id);
    this.selectedCardsGrid.html(
      this.cardsBuildHTML(this.room.playerMap.get(this.socket.id).cardMap)
    );

    // Dark Mode
    if (this.getDarkModeSetting() === true) {
      this.toggleDarkMode();
    }

    const removeEventsWerkelPhase = this.addEventsWerkelPhase();
    this.socketAddEventsWerkelPhase(removeEventsWerkelPhase);

    $('#bb_cardsContainer').fadeIn(800);
    this.barBtns.leaveRoomBtn.fadeIn(800);
    this.barBtns.autofillBtn.fadeIn(800);
  }

  // 20.08 Schanzenfest
  addEvents() {
    const _self = this;

    $('#bb_createRoomBtn').click(function() {
      _self.socket.emit('joinRoom', null);
    });

    _self.barBtns.toggleDarkBtn.click(function() {
      _self.toggleDarkMode();
    });

    _self.barBtns.toggleInfoBtn.click(function() {
      _self.toggleInfo();
    });

    this.barBtns.leaveRoomBtn.click(function() {
      _self.socket.disconnect();
      history.pushState(null, '', location.protocol + '//' + location.host);
      location.reload();
    });

    _self.barBtns.autofillBtn.click(function() {
      _self.socket.emit('needAutofill', _self.cardsGetTextArr());
    });
  }

  socketAddEvents() {
    const _self = this;

    _self.socket.on('connect', function() {
      _self.thisPlayerId = _self.socket.id;
    });

    _self.socket.on('gameError', function(errorStr) {
      console.log('[ERROR] ' + errorStr);
      _self.showErrorToast(errorStr);
    });

    _self.socket.on('disconnect', function() {
      // TODO Connection lost handling
      console.log(_self.socket + ' disconnected');
    });

    _self.socket.on('roomJoined', function(roomData) {
      if (roomData == null) {
        history.pushState(null, '', location.protocol + '//' + location.host);
        $('#bb_createRoomBtn').show();
      } else {
        _self.startWerkelPhase(roomData);
      }
    });

    _self.socket.on('playerJoined', function(newPlayer) {
      _self.roomUnreadyPlayer(_self.room.playerMap);
      newPlayer = new Player(newPlayer);
      _self.room.playerMap.set(newPlayer.id, newPlayer);
      _self.roomAddPlayerHTML(newPlayer);

      if (_self.countdownId != null) {
        _self.roomStopCountdown();
      }
    });

    _self.socket.on('playerDisconnected', function(playerId) {
      _self.roomUnreadyPlayer(_self.room.playerMap);
      _self.roomRemovePlayerHTML(playerId);
    });

    _self.socket.on('nameChanged', function(data) {
      _self.roomPlayerChangeName(data.playerId, data.name);
    });

    _self.socket.on('reconnect', function() {
      console.log('Reconnected: ', _self.thisPlayerId, _self.socket.id);
      if (_self.room != null) {
        _self.socket.emit('recoverRoom', {
          room: _self.room,
          oldId: _self.thisPlayerId
        });
      }
    });

    _self.socket.on('gameRecovered', function() {
      // TODO
    });
  }

  socketAddEventsWerkelPhase(removeEventsWerkelPhaseFunc) {
    const _self = this,
      playerIsReadyChangedHandler = function(data) {
        _self.roomSetPlayerReadyHTML(data.playerId, data.isReady);

        if (data.isReady === false) {
          _self.roomStopCountdown();
        }
      },
      autofillResultHandler = function(changedCardsArr) {
        _self.cardsAutofill(_self.arrToCardMap(changedCardsArr));
      },
      cardValidationResultHandler = function(card) {
        if (card != null) {
          _self.cardsSetCard(new Card(card));
        } else {
          _self.shakeAndStay(_self.cardChange);
        }
      },
      startCountdownHandler = function(timeMS) {
        _self.roomStartCountdown(timeMS);
      },
      phaseChangedToBingoHandler = function(playRoom) {
        removeEventsWerkelPhaseFunc();

        // Sogge uffräume
        _self.socket.off('playerIsReadyChanged', playerIsReadyChangedHandler);
        _self.socket.off('autofillResult', autofillResultHandler);
        _self.socket.off('cardValidationResult', cardValidationResultHandler);
        _self.socket.off('startCountdown', startCountdownHandler);
        _self.socket.off('phaseChangedToBingo', phaseChangedToBingoHandler);

        _self.roomStartBingoPhase(playRoom);
      };

    _self.socket.on('playerIsReadyChanged', playerIsReadyChangedHandler);
    _self.socket.on('autofillResult', autofillResultHandler);
    _self.socket.on('cardValidationResult', cardValidationResultHandler);
    _self.socket.on('startCountdown', startCountdownHandler);
    _self.socket.on('phaseChangedBingo', phaseChangedToBingoHandler);
  }

  // Returns function to remove in function setted eventhandler
  addEventsWerkelPhase() {
    const _self = this,
      keydownHandler = function(e) {
        let keyCode = e.keyCode || e.which;

        // Key: Tab
        if (keyCode == 9) {
          if (_self.cardChange != null) {
            e.preventDefault();
            let number = _self.cardChange.attr('data-id');

            if (e.shiftKey) {
              number--;
            } else {
              number++;
            }

            _self.nextFocusCardId = number;
            _self.cardsSetNewTextToCard(_self.cardChange);
          }
        }

        // Key: Enter
        if (keyCode == 13) {
          if (_self.cardChange != null) {
            e.preventDefault();
            _self.cardsSetNewTextToCard(_self.cardChange);
          }
        }

        // Key: Esc
        if (keyCode == 27) {
          if (_self.cardChange != null) {
            e.preventDefault();
            _self.cardsRevertCard(_self.cardChange);
          }
          if (_self.isInfoOpen === true) {
            _self.toggleInfo();
          }
        }
      },
      documentClickHandler = function(e) {
        let target = $(e.target);
        target =
          target.hasClass('bb_card_text') === true ? target.parent() : target;

        if (target.hasClass('bb_card') === true) {
          const id = target.attr('data-id');
          if (_self.cardChange != null) {
            if (id !== _self.cardChange.attr('data-id')) {
              _self.nextFocusCardId = id;
              _self.cardsSetNewTextToCard(_self.cardChange);
            }
          } else {
            _self.cardsAddTextArea(target);
          }
        } else {
          if (_self.cardChange != null) {
            _self.cardsSetNewTextToCard(_self.cardChange);
          }
        }
      },
      removeEventsWerkelPhase = function() {
        $(document).off('keydown', keydownHandler);
        $(document).off('click', documentClickHandler);
      };

    $(document).on('keydown', keydownHandler);
    $(document).on('click', documentClickHandler);
    return removeEventsWerkelPhase;
  }

  addEventsBingoPhase() {
    const _self = this,
      documentClickHandler = function(e) {
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
            _self.roomShowCardField(target.attr('data-id'));
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
          if (_self.cardChange != null) {
            if (id !== _self.cardChange.attr('data-id')) {
              _self.cardsRemoveConfirmBox(_self.cardChange);
              _self.cardsAddConfirmBox(target);
            }
          } else {
            _self.cardsAddConfirmBox(target);
          }
        } else {
          if (_self.cardChange != null) {
            _self.cardsRemoveConfirmBox(_self.cardChange);
          }
        }
      };

    $(document).on('click', documentClickHandler);
  }

  socketAddEventsBingoPhase() {
    const _self = this,
      cardHitHandler = function(data) {
        _self.cardsSetHit(data.playerId, data.cardId, data.isHit);
      },
      playerLaterBingoPhase = function(data) {
        // TODO
      };

    _self.socket.on('cardHit', cardHitHandler);

    _self.socket.on('playerLaterBingoPhase', playerLaterBingoPhase);

    _self.socket.on('playerWin', winData => {
      console.log(
        '[GAME END] ',
        winData.playerId,
        $('.bb_cardsGrid[data-selected="true"]').attr('data-playerid')
      );
      if (
        winData.playerId ===
        $('.bb_cardsGrid[data-selected="true"]').attr('data-playerid')
      ) {
        _self.drawWinLine(winData.winLine);
        _self.playWinAnimation();
        _self.socket.off('cardHit', cardHitHandler);
      } else {
        console.log('Other player won');
      }
    });
  }

  toggleDarkMode(force = null) {
    this.isDarkMode = force == null ? !this.isDarkMode : force;

    if (this.isDarkMode === true) {
      this.setDarkModeSetting(true);
      $('body').addClass('darkI');
      $('.bb_card').addClass('dark');
      $('#bb_info').addClass('darkI');
      $('#bodyOverlay').css('opacity', 0.6);
      $('.bb_cardBtn').addClass('cardBtnDark');
    } else {
      this.setDarkModeSetting(false);
      $('body')
        .css({ background: '#F2E2C4' })
        .removeClass('darkI');
      $('.bb_card').removeClass('dark');
      $('#bb_info').removeClass('darkI');
      $('#bodyOverlay').css('opacity', 0.1);
      $('.bb_cardBtn').removeClass('cardBtnDark');
    }

    // Hitted Cards
    const bgColor =
      this.isDarkMode === true
        ? 'rgb(34, 34, 34, 0.8)'
        : 'rgb(242, 226, 196, 0.8)';
    $('.bb_cardHit').each(function() {
      $(this).css({
        background:
          "url('../img/cardBG.png'), radial-gradient(rgb(152, 166, 123, 1), " +
          bgColor +
          ')'
      });
    });
  }

  getDarkModeSetting() {
    let isDark = localStorage.getItem('isDarkMode');

    if (isDark == 'true') {
      return true;
    } else {
      return false;
    }
  }

  setDarkModeSetting(value) {
    localStorage.setItem('isDarkMode', value);
  }

  /* --------------------- 
       Cards Functions
       --------------------- */

  // HTML-Code positionieren, so a richtig geilen DOM
  cardsBuildHTML(cardMap) {
    let fieldHTML = '';
    for (const card of cardMap.values()) {
      const word = card.word != null ? card.word.text : '';
      fieldHTML +=
        '<div class="bb_card" data-id="' +
        card.id +
        '" data-x="' +
        card.posX +
        '" data-y="' +
        card.posY +
        '" style="grid-column: ' +
        card.posX +
        '; grid-row: ' +
        card.posY +
        ';">' +
        '<span class="bb_card_text">' +
        word +
        '</span>' +
        '</div>';
    }
    return fieldHTML;
  }

  cardsAddTextArea(element) {
    this.cardChange = element;
    let text = element.find('span').text();
    let dark = this.isDarkMode === true ? 'dark' : '';

    element
      .addClass('bb_card_focus')
      .html(
        '<textarea id="bb_cardTextArea" class="bb_card_text ' +
          dark +
          '" maxlength="32"></textarea>'
      );

    $('#bb_cardTextArea')
      .focus()
      .val(text);
  }

  cardsSetNewTextToCard(element) {
    let text = element.find('textarea').val();
    return this.cardsValidateCard(element, text);
  }

  cardsRevertCard(element) {
    const word = this.getThisPlayer().cardMap.get(
      parseInt(element.attr('data-id'))
    ).word;
    return this.cardsValidateCard(element, word != null ? word.text : '');
  }

  cardsValidateCard(element, text) {
    text = text.trim();
    const card = this.getThisPlayer().cardMap.get(
      parseInt(element.attr('data-id'))
    );

    // Check if no change
    if (
      (card.word == null && text === '') ||
      (card.word != null && card.word.text === text)
    ) {
      this.cardsSetTextHTML(this.cardChange, text);
      return true;
    }

    // Check if valid
    if (this.cardsDoesTextExist(text) === false) {
      this.socket.emit('setCard', {
        cardId: element.attr('data-id'),
        cardText: text
      });
      return true;
    } else {
      this.shakeAndStay(element);
      return false;
    }
  }

  // Should only triggered after server validation
  cardsSetCard(card) {
    this.getThisPlayer().cardMap.set(card.id, card);
    this.cardsSetTextHTML(
      this.selectedCardsGrid.find('[data-id=' + card.id + ']'),
      card.word != null ? card.word.text : ''
    );
  }

  cardsSetTextHTML(element, text) {
    element.removeClass('bb_card_focus');
    element.html('<span class="bb_card_text"></span>');
    element.find('.bb_card_text').text(text);

    this.cardChange = null;
    this.cardsCheckAllFilled();
    this.cardsFocusNext();
  }

  cardsFocusNext() {
    if (this.nextFocusCardId != null) {
      this.cardsAddTextArea(
        this.selectedCardsGrid.find('[data-id=' + +this.nextFocusCardId + ']')
      );
      this.nextFocusCardId = null;
    }
  }

  cardsDoesTextExist(text) {
    if (text == null || text === '') {
      return false;
    }

    for (let card of this.room.playerMap.get(this.socket.id).cardMap.values()) {
      if (card.word != null && card.word.text === text) {
        return true;
      }
    }
    return false;
  }

  cardsCheckAllFilled() {
    let areAllCardsFilled = true;
    const cardMap = this.room.playerMap.get(this.socket.id).cardMap;

    for (let card of cardMap.values()) {
      if (card.word == null || card.word.text === '') {
        this.revertReady();
        areAllCardsFilled = false;
        break;
      }
    }

    this.readyBtnVisible(areAllCardsFilled);
  }

  cardsGetTextArr() {
    let words = [];
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i] != null && this.cards[i].text != '') {
        words.push(this.cards[i].text);
      }
    }
    return words;
  }

  revertReady() {
    if (this.isReady === true) {
      this.socket.emit('toggleReady');
      $('bb_thisUserReady').hide();
    }
    this.isReady = false;
  }

  shakeAndStay(element) {
    element.find('textarea').focus();
    element.removeClass('bb_card_focus').addClass('shake_short');

    setTimeout(function() {
      element.removeClass('shake_short').addClass('bb_card_focus');
    }, 820);
  }

  cardsAutofill(changedCardMap) {
    const cardMap = this.room.playerMap.get(this.socket.id).cardMap;
    let time = 0;
    for (const cardItem of changedCardMap.values()) {
      cardMap.set(cardItem.id, cardItem);
      const cardEl = this.selectedCardsGrid.find(
        '[data-id=' + cardItem.id + ']'
      );
      this.cardsSetTextHTML(cardEl, cardItem.word.text);

      // Animation
      const cardSpan = cardEl.find('span');
      cardSpan.hide();
      setTimeout(function() {
        cardSpan.fadeIn(800);
      }, time);
      time += 50;
    }
  }

  // Rückwerts effekte kurz erklährung, lel
  cardsFlipAnimation() {
    return new Promise(resolve => {
      const bigText = $('#bb_bigText')
        .text('bingo')
        .addClass('fadeLeftToRight')
        .show();
      const cardsText = $('.bb_card_text').addClass('mirror');
      const cardsContainer = $('#bb_cardsContainer').addClass('flip');

      setTimeout(function() {
        bigText.hide().removeClass('fadeLeftToRight');
        cardsText.removeClass('mirror');
        cardsContainer.removeClass('flip');
        resolve();
      }, 2500);
    });
  }

  cardsAddConfirmBox(cardEl) {
    const _self = this;
    const dark = _self.isDarkMode === true ? ' cardBtnDark' : '';

    cardEl.find('.bb_card_text').css({ margin: '0 auto' });
    cardEl
      .append(
        '<div class="bb_cardConfirmBox"><button id="bb_cardSubmit" class="bb_cardBtn' +
          dark +
          '"><i class="mi">done</i>' +
          '</button><button id="bb_cardCancel" class="bb_cardBtn' +
          dark +
          '"><i class="mi">close</i></button></div>'
      )
      .addClass('bb_card_focus');

    $('#bb_cardSubmit').on('click', function() {
      _self.socket.emit('cardWordSaid', _self.cardChange.attr('data-id'));
      _self.socket.emit('cardHit', _self.cardChange.attr('data-id'));
    });
    $('#bb_cardCancel').on('click', function() {
      _self.cardsRemoveConfirmBox(_self.cardChange);
    });

    this.cardChange = cardEl;
  }

  cardsRemoveConfirmBox(cardEl) {
    cardEl.find('.bb_card_text').attr('style', '');
    cardEl
      .removeClass('bb_card_focus')
      .find('.bb_cardConfirmBox')
      .remove();
    this.cardChange = null;
  }

  cardsSetHit(playerId, cardId, isHit) {
    console.log(playerId, cardId, isHit);
    this.room.playerMap
      .get(playerId)
      .cardMap.get(parseInt(cardId)).isHit = isHit;

    if (playerId === this.selectedCardsGrid.attr('data-playerid')) {
      const cardEl = this.selectedCardsGrid.find('[data-id=' + cardId + ']');
      const bgColor =
        this.isDarkMode === true
          ? 'rgb(34, 34, 34, 0.8)'
          : 'rgb(242, 226, 196, 0.8)';
      if (isHit === true) {
        cardEl.addClass('bb_cardHit');
        cardEl.css({
          background:
            "url('../img/cardBG.png'), radial-gradient(rgb(152, 166, 123, 1), " +
            bgColor +
            ')'
        });
      } else {
        cardEl.removeClass('bb_cardHit');
        cardEl.attr('style', '');
      }
      this.cardsHittedCutBorder();
    }
  }

  cardsHittedCutBorder() {
    const _self = this;
    $('.bb_cardHit').each(function() {
      const el = $(this),
        x = el.attr('data-x'),
        y = el.attr('data-y'),
        upEl = el.siblings('[data-x="' + x + '"][data-y="' + (y - 1) + '"]'),
        rightEl = el.siblings('[data-x="' + (x + 1) + '"][data-y="' + y + '"]'),
        bottomEl = el.siblings(
          '[data-x="' + x + '"][data-y="' + (y + 1) + '"]'
        ),
        leftEl = el.siblings('[data-x="' + (x - 1) + '"][data-y="' + y + '"]');

      if (upEl.hasClass('bb_cardHit') === true) {
        _self.borderNone(el, 'top');
        _self.borderNone(upEl, 'bottom');
      }
      if (rightEl.hasClass('bb_cardHit') === true) {
        _self.borderNone(el, 'right');
        _self.borderNone(rightEl, 'left');
      }
      if (bottomEl.hasClass('bb_cardHit') === true) {
        _self.borderNone(el, 'bottom');
        _self.borderNone(bottomEl, 'top');
      }
      if (leftEl.hasClass('bb_cardHit') === true) {
        _self.borderNone(el, 'left');
        _self.borderNone(leftEl, 'right');
      }
    });
  }

  // ---------------------
  // Room Functions
  // ---------------------

  roomAddPlayer(playerMap) {
    const _self = this;
    playerMap.forEach(function(player) {
      _self.roomAddPlayerHTML(player);
    });
  }

  roomAddPlayerHTML(player) {
    const _self = this;
    const isReadyStyle =
      player.isReady === true ? 'style="display: block;"' : '';

    if (player.id === _self.socket.id) {
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

      $('#bb_thisUserInput').change(function() {
        _self.socket.emit('changeName', $(this).val());
      });

      $('#bb_thisUserReady').click(function() {
        _self.socket.emit('toggleReady');
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

  roomRemovePlayerHTML(playerId) {
    $('.bb_userField[data-id=' + playerId + ']').remove();
  }

  roomPlayerChangeName(playerId, name) {
    $('.bb_userField[data-id=' + playerId + ']')
      .find('.bb_userName')
      .text(name);
  }

  roomSetPlayerReadyHTML(playerId, isReady) {
    if (playerId === this.socket.id) {
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

  roomStartCountdown(timeMS) {
    $('#bb_countdownContainer').fadeIn(300);
    const counterEl = $('#bb_countdownCounter');

    this.countdownId = null;

    const countDown = timeMS => {
      counterEl.text(Math.floor(timeMS / 1000));
      this.countdownId = setTimeout(() => {
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
    clearTimeout(this.countdownId);
    $('#bb_countdownContainer').fadeOut(800);
  }

  roomUnreadyPlayer(playerMap) {
    if (this.roomIsBingoPhase() === false) {
      for (const player of playerMap.values()) {
        console.log('roomUnreadyPlayer', player);
        this.roomSetPlayerReadyHTML(player.id, false);
        player.isReady = false;
      }
    }
  }

  roomStartBingoPhase(roomArr) {
    const _self = this;
    this.cardsFlipAnimation().then(function() {
      _self.addEventsBingoPhase();
      _self.socketAddEventsBingoPhase();
    });
    this.barBtns.autofillBtn.hide();
    this.cardChange = null;
    this.room = new Room(roomArr);

    $('#bb_cardsContainer').append(
      this.roomBuildOtherFieldsHTML(this.room.playerMap)
    );
    $('#bb_countdownContainer').fadeOut(800);
    $('.bb_userReady').hide();
    $('.bb_userField').addClass('bb_userField_Clickable');
    this.toggleDarkMode(this.isDarkMode);
  }

  roomIsBingoPhase() {
    for (const player of this.room.playerMap.values()) {
      if (player.phase === 2) {
        return true;
      }
    }
    return false;
  }

  roomBuildOtherFieldsHTML(playerMap) {
    let fieldsHtml = '';
    for (const player of playerMap.values()) {
      if (player.id !== this.thisPlayerId) {
        fieldsHtml +=
          '<div class="bb_cardsGrid" data-selected="false" data-playerid="' +
          player.id +
          '" style="display: none;">' +
          this.cardsBuildHTML(player.cardMap) +
          '</div>';
      }
    }
    return fieldsHtml;
  }

  roomShowCardField(playerId) {
    console.log('Hide old selected: ', this.selectedCardsGrid);
    this.selectedCardsGrid.attr('data-selected', 'false');
    const newSelected = $(
      '.bb_cardsGrid[data-playerid="' + playerId + '"]'
    ).attr('data-selected', 'true');
    this.showFieldSwitchAnimation(this.selectedCardsGrid, newSelected);
    this.selectedCardsGrid = newSelected;
  }

  /* --------------------- 
       Other Functions
       --------------------- */

  showFieldSwitchAnimation(fieldHide, fieldShow) {
    fieldHide.hide();
    fieldShow.show();
  }

  toggleInfo() {
    this.isInfoOpen = !this.isInfoOpen;
    $('#bb_info').fadeToggle(400);
  }

  getUrlParam(param) {
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      if (pair[0] == param) {
        return pair[1];
      }
    }
    return null;
  }

  readyBtnVisible(isVisible) {
    if (isVisible === true) {
      $('#bb_thisUserReady').show();
    } else {
      $('#bb_thisUserReady').hide();
    }
  }

  arrToCardMap(cardArr) {
    const cardMap = new Map();
    for (let i = 0; i < cardArr.length; i++) {
      cardMap.set(cardArr[i][0], new Card(cardArr[i][1]));
    }
    return cardMap;
  }

  getThisPlayer() {
    return this.room.playerMap.get(this.socket.id);
  }

  showErrorToast(errorStr) {
    $('#bb_errorToast')
      .finish()
      .text(errorStr)
      .fadeIn(300)
      .delay(4000)
      .fadeOut(800);
  }

  // TODO
  makeScrollableX() {
    const _self = this,
      elements = $('.bb_scrollX');

    if (elements.length > 0) {
      elements.forEach(function(el) {
        el.append('<div class="bb_scrollbar"></div>');
      });

      $(window).resize(function() {});
    }
  }

  sizeScrollbarsX(elements) {
    elements.forEach(function(el) {
      el.prop('scrollWidth');
    });
  }

  playWinAnimation() {
    this.confetti = new Confetti($('#confettiContainer'));
    this.confetti.start(50);
    const cardsContainer = $('#bb_cardsContainer').addClass('implode'),
      bigText = $('#bb_bigText')
        .addClass('bb_bigTextCenter')
        .text('Elitehäider')
        .addClass('implodeRev')
        .show();

    setTimeout(function() {
      bigText
        .hide()
        .removeClass('bb_bigTextCenter')
        .text('')
        .removeClass('implodeRev');
      cardsContainer.addClass('pulse');
    }, 8000);
  }

  borderNone(el, side) {
    switch (side) {
      case 'top':
        el.css({ 'border-top': 'none' });
        break;
      case 'right':
        el.css({ 'border-right': 'none' });
        break;
      case 'bottom':
        el.css({ 'border-bottom': 'none' });
        break;
      case 'left':
        el.css({ 'border-left': 'none' });
        break;
    }
  }

  drawWinLine(winLine) {
    const cardsContainer = $('#bb_cardsContainer');
    cardsContainer.append(
      '<canvas id="bb_cardsContainerCanvas" height="' +
        cardsContainer.height() +
        '" width="' +
        cardsContainer.width() +
        '"></canvas>'
    );

    const cardHeightPx = cardsContainer.height() / 5,
      cardWidthPx = cardsContainer.width() / 5,
      heightHalfPx = cardHeightPx / 2,
      widthHalfPx = cardWidthPx / 2,
      ctx = $('#bb_cardsContainerCanvas')
        .get(0)
        .getContext('2d');
    ctx.moveTo(
      winLine.startX * cardWidthPx - widthHalfPx,
      winLine.startY * cardHeightPx - heightHalfPx
    );
    ctx.lineTo(
      winLine.endX * cardWidthPx - widthHalfPx,
      winLine.endY * cardHeightPx - heightHalfPx
    );
    ctx.strokeStyle = `rgb(70, 137, 102, 0.5)`;
    ctx.lineWidth = 10;
    ctx.stroke();
  }
}

class Confetti {
  constructor(targetEl) {
    this.el = targetEl;
  }

  start(value) {
    this.el.show();
    for (let i = 0; i < value; i++) {
      this.create(i);
    }
  }

  create(i) {
    let width = Math.random() * 40;
    let height = width * 0.4;
    let colourIdx = Math.ceil(Math.random() * 3);
    let colour = 'red';
    switch (colourIdx) {
      case 1:
        colour = 'orange';
        break;
      case 2:
        colour = 'cyan';
        break;
      case 3:
        colour = 'yellow';
      default:
        colour = 'red';
    }
    $('<div class="confetti-' + i + ' ' + colour + ' snip"></div>')
      .css({
        width: width + 'px',
        height: height + 'px',
        top: -Math.random() * 20 + '%',
        left: Math.random() * 100 + '%',
        opacity: Math.random() + 0.5,
        transform: 'rotate(' + Math.random() * 360 + 'deg)'
      })
      .appendTo(this.el);

    this.drop(i);
  }

  drop(x) {
    const _self = this;
    $('.confetti-' + x).animate(
      {
        top: '100%',
        left: '+=' + Math.random() * 15 + '%'
      },
      Math.random() * 3000 + 3000,
      function() {
        _self.reset(x);
      }
    );
  }

  reset(x) {
    const _self = this;
    $('.confetti-' + x).animate(
      {
        top: -Math.random() * 20 + '%',
        left: '-=' + Math.random() * 15 + '%'
      },
      0,
      function() {
        _self.drop(x);
      }
    );
  }
}

$(document).ready(function() {
  bullshitBingo = new BullshitBingo();
  $('body').fadeIn(1600);
});
