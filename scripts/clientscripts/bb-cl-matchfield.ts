import { WinLine } from './bb-cl-win-line';
import { GameCache } from './bb-cl-game-cache';
import { Card } from './bb-cl-card';
import { Confetti } from './bb-cl-confetti';

export class Matchfield {
  private _cardChangeEl: JQuery<HTMLElement>;
  get cardChangeEl(): JQuery<HTMLElement> {
    return this._cardChangeEl;
  }

  private _isInfoOpen: boolean = false;
  get isInfoOpen(): boolean {
    return this._isInfoOpen;
  }

  private _confetti: Confetti;

  constructor() {}

  matchfieldBuildHTML(cardMap: Map<number, Card>) {
    let fieldHTML = '';
    for (const card of cardMap.values()) {
      const word = card.word != null ? card.word.text : '';
      fieldHTML +=
        '<div class="bb_card" data-card-id="' +
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

  // Should only triggered after server validation
  matchfieldSetCard(card: Card) {
    GameCache.room.getThisPlayer().cardMap.set(parseInt(card.id), card);
    GameCache.matchfield.matchfieldSetCardTextHTML(
      GameCache.selectedCardsGrid.find('[data-card-id=' + card.id + ']'),
      card.word != null ? card.word.text : ''
    );
  }

  matchfieldSetCardTextHTML(element: JQuery<HTMLElement>, text: string) {
    element.removeClass('bb_card_focus');
    element.html('<span class="bb_card_text"></span>');
    element.find('.bb_card_text').text(text);

    this._cardChangeEl = null;
    this.matchfieldCheckAllCardsFilled();
    this.matchfieldFocusNextCard();
  }

  matchfieldFocusNextCard() {
    if (GameCache.nextFocusCardId != null) {
      this.matchfieldAddTextAreaToCard(
        GameCache.selectedCardsGrid.find(
          '[data-card-id=' + +GameCache.nextFocusCardId + ']'
        )
      );
      GameCache.nextFocusCardId = null;
    }
  }

  matchfieldDoesCardTextExist(text: string) {
    if (text == null || text === '') {
      return false;
    }

    for (let card of GameCache.room.playerMap
      .get(GameCache.socket.id)
      .cardMap.values()) {
      if (card.word != null && card.word.text === text) {
        return true;
      }
    }
    return false;
  }

  matchfieldCheckAllCardsFilled() {
    let areAllCardsFilled = true;
    const cardMap = GameCache.room.playerMap.get(GameCache.socket.id).cardMap;

    for (let card of cardMap.values()) {
      if (card.word == null || card.word.text === '') {
        this.revertReady();
        areAllCardsFilled = false;
        break;
      }
    }

    this.readyBtnVisible(areAllCardsFilled);
  }

  // matchfieldGetTextArr() {
  //   let words = [];
  //   for (let i = 0; i < GameCache.room.length; i++) {
  //     if (this.cards[i] != null && this.cards[i].text != '') {
  //       words.push(this.cards[i].text);
  //     }
  //   }
  //   return words;
  // }

  matchfieldAddTextAreaToCard(element: JQuery<HTMLElement>) {
    this._cardChangeEl = element;
    let text = element.find('span').text();
    let dark = GameCache.darkMode.isDarkMode === true ? 'dark' : '';

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

  matchfieldSetNewTextToCard(element: JQuery<HTMLElement>) {
    let text = element.find('textarea').val();
    return this.matchfieldValidateCard(
      element,
      text != null ? text.toString() : ''
    );
  }

  matchfieldRevertCard(element: JQuery<HTMLElement>) {
    const word = GameCache.room
      .getThisPlayer()
      .cardMap.get(parseInt(element.attr('data-card-id'))).word;
    return this.matchfieldValidateCard(element, word != null ? word.text : '');
  }

  matchfieldValidateCard(element: JQuery<HTMLElement>, text: string) {
    text = text.trim();
    const card = GameCache.room
      .getThisPlayer()
      .cardMap.get(parseInt(element.attr('data-card-id')));

    // Check if no change
    if (
      (card.word == null && text === '') ||
      (card.word != null && card.word.text === text)
    ) {
      this.matchfieldSetCardTextHTML(this._cardChangeEl, text);
      return true;
    }

    // Check if valid
    if (this.matchfieldDoesCardTextExist(text) === false) {
      GameCache.socket.emit('setCard', {
        cardId: element.attr('data-card-id'),
        cardText: text
      });
      return true;
    } else {
      this.shakeAndStay(element);
      return false;
    }
  }

  revertReady() {
    if (GameCache.room.getThisPlayer().isReady === true) {
      GameCache.socket.emit('toggleReady');
      $('bb_thisUserReady').hide();
    }
    GameCache.room.getThisPlayer().isReady = false;
  }

  shakeAndStay(element: JQuery<HTMLElement>) {
    element.find('textarea').focus();
    element.removeClass('bb_card_focus').addClass('shake_short');

    setTimeout(function() {
      element.removeClass('shake_short').addClass('bb_card_focus');
    }, 820);
  }

  cardsAutofill(changedCardMap: Map<number, Card>) {
    const cardMap = GameCache.room.getThisPlayer().cardMap;
    let time = 0;
    for (const cardItem of changedCardMap.values()) {
      cardMap.set(parseInt(cardItem.id), cardItem);
      const cardEl = GameCache.selectedCardsGrid.find(
        '[data-card-id=' + cardItem.id + ']'
      );
      this.matchfieldSetCardTextHTML(cardEl, cardItem.word.text);

      // Animation
      const cardSpan = cardEl.find('span');
      cardSpan.hide();
      setTimeout(function() {
        cardSpan.fadeIn(800);
      }, time);
      time += 50;
    }
  }

  cardsFlipAnimation() {
    return new Promise<void>(resolve => {
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

  cardsAddConfirmBox(cardEl: JQuery<HTMLElement>) {
    const _self = this;
    const dark = GameCache.darkMode.isDarkMode === true ? ' cardBtnDark' : '';

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

    $('#bb_cardSubmit').on('click', () => {
      GameCache.socket.emit(
        'cardWordSaid',
        _self._cardChangeEl.attr('data-card-id')
      );
      GameCache.socket.emit(
        'cardHit',
        _self._cardChangeEl.attr('data-card-id')
      );
    });
    $('#bb_cardCancel').on('click', () => {
      _self.cardsRemoveConfirmBox(_self.cardChangeEl);
    });

    this._cardChangeEl = cardEl;
  }

  cardsRemoveConfirmBox(cardEl: JQuery<HTMLElement>) {
    cardEl.find('.bb_card_text').attr('style', '');
    cardEl
      .removeClass('bb_card_focus')
      .find('.bb_cardConfirmBox')
      .remove();
    this._cardChangeEl = null;
  }

  cardsSetHit(playerId: string, cardId: string, isHit: boolean): void {
    console.log(playerId, cardId, isHit);
    const card = GameCache.room.playerMap
      .get(playerId)
      .cardMap.get(parseInt(cardId));
    card.isHit = isHit;
    this.cardsHittedShowUserFieldToast(playerId, card);
    const cardEl = $('.bb_cardsGrid[data-player-id="' + playerId + '"]').find(
      '[data-card-id=' + cardId + ']'
    );
    const bgColor =
      GameCache.darkMode.isDarkMode === true
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

  cardsHittedShowUserFieldToast(playerId: string, card: Card) {
    const userField = $('.bb_userField[data-player-id=' + playerId + ']');
    const $toast = $(
      `<span class="bb_userFieldToast fadeUp">${card.word.text}</span>`
    );
    userField.append($toast);
    setTimeout(() => {
      $toast.fadeOut(900);
    }, 3000);
    setTimeout(() => {
      $toast.remove();
    }, 4000);
  }

  cardsHittedCutBorder() {
    console.log('cardsHittedCutBorder');
    const _self = this;
    $('.bb_cardHit').each((_i: number, element: HTMLElement) => {
      const el = $(element),
        x = parseInt(el.attr('data-x')),
        y = parseInt(el.attr('data-y')),
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

  /* --------------------- 
       Other Functions
       --------------------- */

  showFieldSwitchAnimation(
    fieldHide: JQuery<HTMLElement>,
    fieldShow: JQuery<HTMLElement>
  ) {
    fieldHide.fadeOut(400);
    fieldShow.fadeIn(200);
  }

  toggleInfo() {
    this._isInfoOpen = !this._isInfoOpen;
    $('#bb_info').fadeToggle(400);
  }

  getUrlParam(param: string) {
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

  readyBtnVisible(isVisible: boolean) {
    if (isVisible === true) {
      $('#bb_thisUserField').addClass('pulse');
      $('#bb_thisUserReady').show();
    } else {
      $('#bb_thisUserField').removeClass('pulse');
      $('#bb_thisUserReady').hide();
    }
  }

  arrToCardMap(cardArr: Array<any>) {
    const cardMap = new Map();
    for (let i = 0; i < cardArr.length; i++) {
      cardMap.set(cardArr[i][0], new Card(cardArr[i][1]));
    }
    return cardMap;
  }

  showErrorToast(errorStr: string) {
    $('#bb_errorToast')
      .finish()
      .text(errorStr)
      .fadeIn(300)
      .delay(4000)
      .fadeOut(800);
  }

  // TODO
  // makeScrollableX() {
  //   const _self = this,
  //     elements = $('.bb_scrollX');

  //   if (elements.length > 0) {
  //     elements.forEach((el: JQuery<HTMLElement>) => {
  //       el.append('<div class="bb_scrollbar"></div>');
  //     });

  //     $(window).resize(function() {});
  //   }
  // }

  // sizeScrollbarsX(elements) {
  //   elements.forEach(function(el) {
  //     el.prop('scrollWidth');
  //   });
  // }

  playWinAnimation() {
    this._confetti = new Confetti($('#confettiContainer'));
    this._confetti.start(50);
    const cardsContainer = $('#bb_cardsContainer').addClass('implode'),
      bigText = $('#bb_bigText')
        .addClass('bb_bigTextCenter')
        .text('Elitehäider')
        .addClass('implodeRev')
        .show();

    setTimeout(() => {
      bigText
        .hide()
        .removeClass('bb_bigTextCenter')
        .text('')
        .removeClass('implodeRev');
      cardsContainer.addClass('pulse');
    }, 8000);
  }

  playOtherPlayerWinAnimation(playerWinId: string) {
    const playerWin = GameCache.room.playerMap.get(playerWinId),
      bigText = $('#bb_bigText')
        .addClass('bb_bigTextCenter')
        .text(`${playerWin.avatar.name} gewinnt!`)
        .addClass('implodeRev')
        .show();

    setTimeout(() => {
      bigText
        .hide()
        .removeClass('bb_bigTextCenter')
        .text('')
        .removeClass('implodeRev');
    }, 8000);
  }

  borderNone(el: JQuery<HTMLElement>, side: string) {
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

  drawWinLine(winLine: WinLine) {
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
      canvasEl = $('#bb_cardsContainerCanvas').get(0) as HTMLCanvasElement,
      ctx = canvasEl.getContext('2d');
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
