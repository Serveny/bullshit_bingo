// Derjeniche, der den Code schreibt:
// Serveny

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
        console.log('RoomJoinedCache: ', this.room);

        // Brobbaties
        const urlWithoutParams =  location.protocol + '//' + location.host;
        this.fieldChange = null;
        this.isDarkMode = false;
        this.isInfoOpen = false;
        this.cards = [];
        this.phase = 0;

        // Lobby
        history.pushState(null, '', urlWithoutParams + '?r=' + this.room.id);

        $('#wB_createRoomBtn').fadeOut(100);
        $('#wB_lobbyContainer').fadeIn(1600);

        const thisUser = this.room.playerMap.get(this.socket.id);
        $('#wB_thisUserPic').attr({ "src": thisUser.avatar.picUrl });
        $('#wB_thisUserInput').val(thisUser.avatar.name);

        this.roomAddOtherPlayer(this.room.playerMap);

        // Hadde Arbeit
        this.buildCardsHTML();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }

        this.addCardEvents();
        $('#wB_cardsContainer').fadeIn(800);
        $('#wB_leaveRoomBtn').fadeIn(1600);
        $('#wB_autofillBtn').fadeIn(1600);
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

        $('#wB_thisUserInput').change(function() {
            _self.socket.emit('changeName', $(this).val()); 
        });

        $('#wB_thisUserReady').click(function() {
            _self.socket.emit('toggleReady'); 
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

        _self.socket.on('roomJoined', function (roomData) {
            if (roomData == null) {
                history.pushState(null, '', location.protocol + '//' + location.host);
                $('#wB_createRoomBtn').show();
            } else {
                _self.startWergelPhase(roomData);
            }
        });

        _self.socket.on('playerJoined', function (newPlayer) {
            newPlayer = new Player(newPlayer);
            _self.room.playerMap.set(newPlayer.id, newPlayer);
            _self.roomAddPlayerHTML(newPlayer);
        });

        _self.socket.on('playerDisconnected', function (playerId) {
            _self.roomRemovePlayerHTML(playerId);
        });

        _self.socket.on('nameChanged', function (data) {
            _self.roomPlayerChangeName(data.playerId, data.name);
        });

        _self.socket.on('playerIsReadyChanged', function (data) {
            _self.roomSetPlayerReady(data.playerId, data.isReady);
        });

        _self.socket.on('autofillResult', function (changedCardsArr) {
            _self.cardsAutofill(_self.arrToCardMap(changedCardsArr));
        });

        _self.socket.on('cardValidationResult', function (card) {
            if (card != null) {
                _self.cardsSetCard(new Card(card));
            } else {
                _self.shakeAndStay(_self.fieldChange);
            }
        });
    }    

    // Ferdammt, wie gonndest du mich bedrügen?
    addCardEvents() {
        const _self = this;

        $('.wB_field').click(function() {
            if (_self.fieldChange != null) {
                if ($(this).attr('id') == _self.fieldChange.attr('id')) {
                    return;
                } else {
                    if(_self.cardsSetNewTextToCard(_self.fieldChange) === false) {
                        return;
                    };
                }
            }
            _self.cardsAddTextArea($(this));
        });

        $(document).on('keydown', function(e) {
            let keyCode = e.keyCode || e.which;

            // Key: Tab
            if (keyCode == 9) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    let number = _self.fieldChange.attr('data-id');
                    if(_self.cardsSetNewTextToCard(_self.fieldChange) === false) {
                        return;
                    };
                    
                    if(e.shiftKey) {
                        number--;
                    } else {
                        number++;
                    }

                    let nextEl = $('#wB_card_' + number);
                    if (nextEl.length >= 1) {
                        _self.cardsAddTextArea(nextEl);
                    } else {
                        this.fieldChange = null;
                    }
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
        });

        $(document).click(function(e) {
            if (_self.fieldChange != null) {
                let target = $(e.target);
                if (target.hasClass('wB_field') === true || target.hasClass('wB_field_text') === true) {
                    return;
                } else {
                    _self.cardsSetNewTextToCard(_self.fieldChange);
                }
            }
        });
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
                fieldsHTML += '<div id="wB_card_' + count + '" class="wB_field" data-x="' + i + '" data-y="' + u + '" data-id="' + count + '">' +
                '<span class="wB_field_text"></span>' +
                '</div>';
            }
        }

        $('#wB_cardsContainer').html(fieldsHTML);
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
    *  Cards Functions
       --------------------- */

    // Neuer Blockeindrag wird gerendert etzadla
    cardsAddTextArea(element) {
        console.log('cardsAddTextArea', element);
        this.fieldChange = element;
        let text = element.find('span').text();
        let dark = this.isDarkMode === true ? 'dark' : '';

        element
            .addClass('wB_field_focus')
            .html('<textarea id="wB_fieldTextArea" class="wB_field_text ' + dark + '" maxlength="32"></textarea>');
        
        $('#wB_fieldTextArea').focus().val(text);
    }

    cardsSetNewTextToCard(element) {
        console.log('cardsSetNewTextToCard', element);
        let text = element.find('textarea').val();
        
        return this.validateCard(element, text);
    }

    cardsRevertCard(element) {
        console.log('cardsRevertCard', element);
        let text = this.cards[element.attr('data-id')].text;
        return this.validateCard(element, text);
    }

    validateCard(element, text) {
        text = text.trim();
        console.log('text', text);
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
        console.log('card', card);
        this.room.playerMap.get(this.socket.id).cardMap.set(card.id, card);
        console.log('cardId', card.id);
        this.cardsSetTextHTML($('#wB_card_' + card.id), card.word.text);
    }

    cardsSetTextHTML(element, text) {
        console.log('cardsSetTextHTML', element, text);
        element.removeClass('wB_field_focus');
        element.html('<span class="wB_field_text">' + text + '</span>');
        
        this.cardsTextFadeIn();
        this.fieldChange = null;
        this.cardsCheckAllFilled();
    }

    cardsTextFadeIn() {
        let time = 0;
        $('.wB_field_text').hide().each(function () {
            let field = $(this);
            
            setTimeout( function (){ field.fadeIn(600); }, time);
            time += 100;
        });

    }

    cardsDoesTextExist(text) {
        if (text == null || text === '') {
            return false;
        }
        console.log('lel2', this.room.playerMap.get(this.socket.id).cardMap);
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

        for(let word of cardMap.values()) { 
            if (word.text === '') {
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
        console.log('shakeAndStay', element);
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

        for (const cardItem of changedCardMap.values()) {
            cardMap.set(cardItem.id, cardItem);
            this.cardsSetTextHTML($('#wB_card_' + cardItem.id), cardItem.word.text);
        }
        
        this.readyBtnVisible(true);
    }

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

    roomAddOtherPlayer(playerMap) {
        const _self = this;
        playerMap.forEach(function(player) {
            if (player.id !== _self.socket.id) {
                _self.roomAddPlayerHTML(player);
            }
        });
    }
    
    roomAddPlayerHTML(player) {
        console.log('Add new player: ', player);
        $('#wB_lobbyContainer')
            .append('<div class="wB_userField" data-id="' + player.id + '"><i class="mi wB_userReady">done</i>' + 
            '<img src="' + player.avatar.picUrl + '" id="wB_thisUserPic" class="wB_userPic" alt="Profilbild" />' + 
            '<div class="wB_userName">' + player.avatar.name + '</div></div>');
    }

    roomRemovePlayerHTML(playerId) {
        $('div[data-id=' + playerId + ']').remove();
    }

    roomPlayerChangeName(playerId, name) {
        $('div[data-id=' + playerId + ']').find('.wB_userName').text(name);
    }

    roomSetPlayerReady(playerId, isReady) {
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
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo();
    $('body').fadeIn(1600);
});