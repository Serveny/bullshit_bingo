// Derjeniche, der den Code schreibt:
// Serveny

class Room {
    constructor(room) {
        this.id = room.id;
        this.playerMap = new Map();
        this.phase = room.phase;

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

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor () {
        this.socket = io.connect(window.location.host);
        this.roomId = this.getUrlParam('r');
        this.room = {};
        this.socketAddEvents();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        } else {
            $('body').css({'background': '#F2E2C4'});
        }

        this.addEvents();

        if (this.roomId != null) {
            this.socket.emit('joinRoom', this.roomId);
        } else {
            $('#wB_createRoomBtn').show();
        }
    }

    startWergelPhase(room) {
        this.room = new Room(room);
        console.debug('RoomJoinedCache: ', this.room);

        // Brobbaties
        const urlWithoutParams =  location.protocol + '//' + location.host;
        this.fieldChange = null;
        this.nextFocusCardId = null;
        this.isDarkMode = false;
        this.isInfoOpen = false;
        this.cards = [];
        this.phase = 0;

        // Lobby
        history.pushState(null, '', urlWithoutParams + '?r=' + this.room.id);

        $('#wB_createRoomBtn').fadeOut(100);
        $('#wB_lobbyContainer').fadeIn(1600);

        this.roomAddPlayer(this.room.playerMap);

        // Hadde Arbeit
        this.buildCardsHTML();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }

        const removeCardEventsWerkelPhase = this.addCardEventsWerkelPhase();
        this.socketAddEventsWerkelPhase(removeCardEventsWerkelPhase);

        $('#wB_cardsContainer').fadeIn(800);
        $('#wB_leaveRoomBtn').fadeIn(800);
        $('#wB_autofillBtn').fadeIn(800);
    }

    // 20.08 Schanzenfest
    addEvents() {
        const _self = this;

        $('#wB_createRoomBtn').click(function() {
            _self.socket.emit('joinRoom', null);
        });

        $('#wB_toggleDarkBtn').click(function() {
            _self.toggleDarkMode();    
        });

        $('.wB_toggleInfoBtn').click(function() {
            _self.toggleInfo();    
        });

        $('#wB_leaveRoomBtn').click(function() {
            _self.socket.disconnect();
            history.pushState(null, '', location.protocol + '//' + location.host);
            location.reload();
        });

        $('#wB_autofillBtn').click(function() {
            _self.socket.emit('needAutofill', _self.cardsGetTextArr());
        });
    }

    socketAddEvents() {
        const _self = this;

        _self.socket.on('gameError', function(errorStr) {
            console.log('[SERVERERROR] ' + errorStr);
            _self.showErrorToast(errorStr);
        });

        _self.socket.on('disconnect', function() {
            // TODO Connection lost handling
            console.log(_self.socket.id + ' disconnected');
        });

        _self.socket.on('roomJoined', function (roomData) {
            if (roomData == null) {
                history.pushState(null, '', location.protocol + '//' + location.host);
                $('#wB_createRoomBtn').show();
            } else {
                _self.startWergelPhase(roomData);
            }
        });

        _self.socket.on('playerJoined', function (newPlayer) {
            _self.roomUnreadyPlayer(_self.room.playerMap);
            newPlayer = new Player(newPlayer);
            _self.room.playerMap.set(newPlayer.id, newPlayer);
            _self.roomAddPlayerHTML(newPlayer);

            if (_self.countdownId != null) {
                _self.roomStopCountdown();
            }
        });

        _self.socket.on('playerDisconnected', function (playerId) {
            _self.roomUnreadyPlayer(_self.room.playerMap);
            _self.roomRemovePlayerHTML(playerId);
        });

        _self.socket.on('nameChanged', function (data) {
            _self.roomPlayerChangeName(data.playerId, data.name);
        });
    }    

    socketAddEventsWerkelPhase(removeCardEventsWerkelPhaseFunc) {
        const _self = this,
        playerIsReadyChangedHandler = function (data) {
            _self.roomSetPlayerReadyHTML(data.playerId, data.isReady);

            if (data.isReady === false) {
                _self.roomStopCountdown();
            }
        },
        autofillResultHandler = function (changedCardsArr) {
            _self.cardsAutofill(_self.arrToCardMap(changedCardsArr));
        },
        cardValidationResultHandler = function (card) {
            if (card != null) {
                _self.cardsSetCard(new Card(card));
            } else {
                _self.shakeAndStay(_self.fieldChange);
            }
        },
        startCountdownHandler = function (timeMS) {
            _self.roomStartCountdown(timeMS);
        },
        phaseChangedToWuselHandler = function (room) {
            console.log('phaseChangedToWuselHandler');
            removeCardEventsWerkelPhaseFunc();

            // Sogge uffräume
            _self.socket.off('playerIsReadyChanged', playerIsReadyChangedHandler);
            _self.socket.off('autofillResult', autofillResultHandler);
            _self.socket.off('cardValidationResult', cardValidationResultHandler);
            _self.socket.off('startCountdown', startCountdownHandler);
            _self.socket.off('phaseChangedToWusel', phaseChangedToWuselHandler);
        }

        _self.socket.on('playerIsReadyChanged', playerIsReadyChangedHandler);
        _self.socket.on('autofillResult', autofillResultHandler);
        _self.socket.on('cardValidationResult', cardValidationResultHandler);
        _self.socket.on('startCountdown', startCountdownHandler);
        _self.socket.on('phaseChangedToWusel', phaseChangedToWuselHandler);
    }

    // Returns function to remove in function setted eventhandler
    addCardEventsWerkelPhase() {
        const _self = this,
        keydownHandler = function(e) {
            let keyCode = e.keyCode || e.which;

            // Key: Tab
            if (keyCode == 9) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    let number = _self.fieldChange.attr('data-id');
                    
                    if(e.shiftKey) {
                        number--;
                    } else {
                        number++;
                    }

                    _self.nextFocusCardId = number;
                    _self.cardsSetNewTextToCard(_self.fieldChange);
                }
            } 
            
            // Key: Enter
            if(keyCode == 13) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    _self.cardsSetNewTextToCard(_self.fieldChange);
                }
            }

            // Key: Esc
            if (keyCode == 27) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    _self.cardsRevertCard(_self.fieldChange);
                }
                if (_self.isInfoOpen === true) {
                    _self.toggleInfo();
                }
            }
        },
        documentClickHandler = function(e) {
            let target = $(e.target);
            target = target.hasClass('wB_field_text') === true ? target.parent() : target;

            if (target.hasClass('wB_field') === true) {
                const id = target.attr('data-id');
                if (_self.fieldChange != null) {
                    if (id !== _self.fieldChange.attr('data-id')) {
                        _self.nextFocusCardId = id;
                        _self.cardsSetNewTextToCard(_self.fieldChange);
                    }
                } else {
                    _self.cardsAddTextArea(target);
                }
            } else {
                if (_self.fieldChange != null) {
                    _self.cardsSetNewTextToCard(_self.fieldChange);
                }
            }
        },
        removeCardEventsWerkelPhase = function() {
            $(document).off('keydown', keydownHandler);
            $(document).off('click', documentClickHandler);
        };

        $(document).on('keydown', keydownHandler);
        $(document).on('click', documentClickHandler);
        return removeCardEventsWerkelPhase;
    }

    // HTML-Code positionieren, so a richtig geilen DOM
    buildCardsHTML() {
        let fieldsHTML = '';
        let count = 0;
        
        for (let i = 1; i < 6; i++) {
            for (let u = 1; u < 6; u++) {
                this.cards[++count] = {
                    text: '',
                    x: i,
                    y: u
                };
                fieldsHTML += '<div id="wB_card_' + count + '" class="wB_field" data-x="' + i + '" data-y="' + u + '" data-id="' + count + '" style="grid-row: ' + i + '; grid-column: ' + u + ';">' +
                '<span class="wB_field_text"></span>' +
                '</div>';
            }
        }

        $('#wB_cardsGrid').html(fieldsHTML);
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;

        if (this.isDarkMode === true) {
            this.setDarkModeSetting(true);
            $('body').addClass('dark');
            $('.wB_field').addClass('dark');
            $('#wB_info').addClass('dark');
            $('#bodyOverlay').css('opacity', 0.6);
        } else {
            this.setDarkModeSetting(false);
            $('body').css({'background': '#F2E2C4'}).removeClass('dark');
            $('.wB_field').removeClass('dark');
            $('#wB_info').removeClass('dark');
            $('#bodyOverlay').css('opacity', 0.1);
        }
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

    cardsAddTextArea(element) {
        this.fieldChange = element;
        let text = element.find('span').text();
        let dark = this.isDarkMode === true ? 'dark' : '';

        element
            .addClass('wB_field_focus')
            .html('<textarea id="wB_fieldTextArea" class="wB_field_text ' + dark + '" maxlength="32"></textarea>');
        
        $('#wB_fieldTextArea').focus().val(text);
    }

    cardsSetNewTextToCard(element) {
        let text = element.find('textarea').val();
        return this.cardsValidateCard(element, text);
    }

    cardsRevertCard(element) {
        let text = this.cards[element.attr('data-id')].text;
        return this.cardsValidateCard(element, text);
    }

    cardsValidateCard(element, text) {
        text = text.trim();
        const card = this.getThisPlayer().cardMap.get(parseInt(element.attr('data-id')));
        
        // Check if no change
        if ((card.word == null && text === '') || (card.word != null && card.word.text === text)) {
            this.cardsSetTextHTML(this.fieldChange, text);
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
        this.cardsSetTextHTML($('#wB_card_' + card.id), card.word != null ? card.word.text : '');
    }

    cardsSetTextHTML(element, text) {
        element.removeClass('wB_field_focus');
        element.html('<span class="wB_field_text"></span>');
        element.find('.wB_field_text').text(text);
        
        this.fieldChange = null;
        this.cardsCheckAllFilled();
        this.cardsFocusNext();
    }

    cardsFocusNext() {
        if (this.nextFocusCardId != null) {
            this.cardsAddTextArea($('#wB_card_' + this.nextFocusCardId));
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

        for(let card of cardMap.values()) { 
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
            if(this.cards[i] != null && this.cards[i].text != '') {
                words.push(this.cards[i].text);
            }
        }
        return words;
    }

    revertReady() {
        if (this.isReady === true) {
            this.socket.emit('toggleReady');
            $('wB_thisUserReady').hide();
        }
        this.isReady = false;
    }

    shakeAndStay(element) {
        element.find('textarea').focus();
        element
            .removeClass('wB_field_focus')
            .addClass('shake_short');

        setTimeout(function() {
            element
                .removeClass('shake_short')
                .addClass('wB_field_focus');
        }, 820);
    }

    cardsAutofill(changedCardMap) {
        const cardMap = this.room.playerMap.get(this.socket.id).cardMap;
        let time = 0;
        for (const cardItem of changedCardMap.values()) {
            cardMap.set(cardItem.id, cardItem);
            const cardEl = $('#wB_card_' + cardItem.id);
            this.cardsSetTextHTML(cardEl, cardItem.word.text);

            // Animation
            const cardSpan = cardEl.find('span');
            cardSpan.hide();
            setTimeout(function () { cardSpan.fadeIn(800) }, time);
            time += 50;
        }
    }

    /* --------------------- 
       Room Functions
       --------------------- */

    roomAddPlayer(playerMap) {
        const _self = this;
        playerMap.forEach(function(player) {
            _self.roomAddPlayerHTML(player);
        });
    }
    
    roomAddPlayerHTML(player) {
        const _self = this;
        const isReadyStyle = player.isReady === true ? 'style="display: block;"' : '';

        if (player.id === _self.socket.id) { 
            $('#wB_lobbyContainer')
                .append('<div id="wB_thisUserField" class="wB_userField" data-id="' + player.id + '"><img id="wB_thisUserPic" src="' + player.avatar.picUrl + '" class="wB_userPic" alt="Profilbild" />' + 
                '<input id="wB_thisUserInput" class="wB_userName" type="text" value="' + player.avatar.name + '"><button id="wB_thisUserReady" class="btn wB_userReady">' + 
                '<i class="mi">done</i></button></div>');
            
            $('#wB_thisUserInput').change(function() {
                _self.socket.emit('changeName', $(this).val()); 
            });
    
            $('#wB_thisUserReady').click(function() {
                _self.socket.emit('toggleReady'); 
            });
        } else {
            $('#wB_lobbyContainer')
                .append('<div class="wB_userField" data-id="' + player.id + '"><i class="mi wB_userReady" ' + isReadyStyle + '>done</i>' + 
                '<img src="' + player.avatar.picUrl + '" class="wB_userPic" alt="Profilbild" />' + 
                '<div class="wB_userName">' + player.avatar.name + '</div></div>');
        }
    }

    roomRemovePlayerHTML(playerId) {
        $('div[data-id=' + playerId + ']').remove();
    }

    roomPlayerChangeName(playerId, name) {
        $('div[data-id=' + playerId + ']').find('.wB_userName').text(name);
    }

    roomSetPlayerReadyHTML(playerId, isReady) {
        console.log('roomSetPlayerReadyHTML', playerId, isReady);
        if (playerId === this.socket.id) {
            if (isReady === true) {
                $('#wB_thisUserReady').css({'color': 'green'});
            } else {
                $('#wB_thisUserReady').css({'color': 'gray'});
            }
        } else {
            let player = $('div[data-id=' + playerId + ']');
            if (player != null) {
                if (isReady === true) {
                    player.find('.wB_userReady').show();
                } else {
                    player.find('.wB_userReady').hide();
                }
            }
        }
    }

    roomStartCountdown(timeMS) {
        $('#wB_countdownContainer').fadeIn(300);
        const counterEl = $('#wB_countdownCounter');

        this.countdownId = null;
        
        const countDown = (timeMS) => {
            counterEl.text(Math.floor(timeMS / 1000));
            this.countdownId = setTimeout(() => {
                counterEl.text(Math.floor(timeMS / 1000));

                if (timeMS > 0) {
                    timeMS = timeMS - 1000;
                    countDown(timeMS);
                }
            }, 1000);
        }

        countDown(timeMS);
    }

    roomStopCountdown() {
        clearTimeout(this.countdownId);
        $('#wB_countdownContainer').fadeOut(800);
    }

    roomUnreadyPlayer(playerMap) {
        for (const player of playerMap.values()) {
            console.log('roomUnreadyPlayer', player);
            if (player.isReady === true) {
                this.roomSetPlayerReadyHTML(player, false);
            }
            player.isReady = false;
        }
    }

    /* --------------------- 
       Other Functions
       --------------------- */

    toggleInfo() {
        this.isInfoOpen = !this.isInfoOpen;
        $('#wB_info').fadeToggle(400);
    }

    getUrlParam(param)
    {
       let query = window.location.search.substring(1);
       let vars = query.split("&");
       for (let i=0;i<vars.length;i++) {
               let pair = vars[i].split("=");
               if(pair[0] == param) {
                   return pair[1];
                }
       }
       return null;
    }

    readyBtnVisible(isVisible) {
        if (isVisible === true) {
            $('#wB_thisUserReady').show();
        } else {
            $('#wB_thisUserReady').hide();
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
        $('#wB_errorToast').finish().text(errorStr).fadeIn(300).delay(4000).fadeOut(800);
    }
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo();
    $('body').fadeIn(1600);
});