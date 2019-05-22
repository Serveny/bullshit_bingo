// Derjeniche, der den Code schreibt:
// Serveny

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor () {
        this.socket = io.connect(window.location.host);
        this.roomId = this.getUrlParam('r');
        this.socketAddEvents();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }

        this.addEvents();

        if (this.roomId != null) {
            this.socket.emit('joinRoom', { roomId: this.roomId });
        }
    }

    startWergelPhase(roomData) {
        // Brobbaties
        const urlWithoutParams =  location.protocol + '//' + location.host;
        this.fieldChange = null;
        this.isDarkMode = false;
        this.isInfoOpen = false;
        this.cards = {};
        this.phase = 0;

        // Lobby
        console.log('roomJoined', roomData);
        history.pushState(null, '', urlWithoutParams + '?r=' + roomData.roomId);

        $('#wB_createRoomBtn').hide();
        $('#wB_lobbyContainer').show();

        const thisUser = this.getThisUserInRoom(roomData.players);
        $('#wB_thisUserPic').attr({ "src": thisUser.urlPic });
        $('#wB_thisUserInput').val(thisUser.name);

        this.roomAddOtherPlayer(roomData.players);

        // Hadde Arbeit
        this.buildCardsHTML();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }

        this.addCardEvents();
        $('#wB_cardsContainer').show();
    }

    getThisUserInRoom(players) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id == this.socket.id) {
                return players[i];
            }
        }
        return null;
    }

    // Wie wohl Wingls Socken riechen?
    socketAddEvents() {
        const _self = this;

        _self.socket.on('roomJoined', function (roomData) {
            if (roomData == null) {
                history.pushState(null, '', location.protocol + '//' + location.host);
            } else {
                _self.startWergelPhase(roomData);
            }
        });

        _self.socket.on('playerJoined', function (newPlayer) {
            console.log('playerJoined', newPlayer);
            _self.roomAddPlayerHTML(newPlayer);
        });

        _self.socket.on('playerDisconnected', function (playerId) {
            console.log('playerDisconnected', playerId);
            _self.roomRemovePlayerHTML(playerId);
        });

        _self.socket.on('nameChanged', function (data) {
            _self.roomPlayerChangeName(data.playerId, data.name);
        });

        _self.socket.on('playerReadyStatusChanged', function (data) {
            _self.roomSetPlayerReady(data.playerId, data.isReady);
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
                fieldsHTML += '<div id="wB_' + count + '" class="wB_field" data-x="' + i + '" data-y="' + u + '" data-count="' + count + '">' +
                '<span class="wB_field_text"></span>' +
                '</div>';
            }
        }

        $('#wB_cardsContainer').html(fieldsHTML);
    }

    // 20.08 Schanzenfest
    addEvents() {
        const _self = this;

        $('#wB_createRoomBtn').click(function() {
            _self.socket.emit('joinRoom', { roomId: null }); 
        });

        $('#toggleDarkBtn').click(function() {
            _self.toggleDarkMode();    
        });

        $('.toggleInfoBtn').click(function() {
            _self.toggleInfo();    
        });

        $('#wB_thisUserInput').change(function() {
            _self.socket.emit('customName', $(this).val()); 
        });

        $('#wB_thisUserReady').click(function() {
            _self.socket.emit('toggleReady'); 
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
                    if(_self.setNewTextToCard(_self.fieldChange) === false) {
                        return;
                    };
                }
            }
            _self.addTextArea($(this));
        });

        $(document).on('keydown', function(e) {
            let keyCode = e.keyCode || e.which;

            // Key: Tab
            if (keyCode == 9) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    let number = _self.fieldChange.attr('data-count');
                    if(_self.setNewTextToCard(_self.fieldChange) === false) {
                        return;
                    };
                    
                    if(e.shiftKey) {
                        number--;
                    } else {
                        number++;
                    }

                    let nextEl = $('#wB_' + number);
                    if (nextEl.length >= 1) {
                        _self.addTextArea(nextEl);
                    } else {
                        this.fieldChange = null;
                    }
                }
            } 
            
            // Key: Enter
            if(e.which == 13) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    _self.setNewTextToCard(_self.fieldChange);
                }
            }

            // Key: Esc
            if (e.which == 27) {
                if (_self.fieldChange != null) {
                    e.preventDefault();
                    _self.revertCard(_self.fieldChange);
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
                    _self.setNewTextToCard(_self.fieldChange);
                }
            }
        });
    }

    // Neuer Blockeindrag wird gerendert
    addTextArea(element) {
        this.fieldChange = element;
        let text = element.find('span').text();
        let dark = this.isDarkMode === true ? 'dark' : '';

        element
            .addClass('wB_field_focus')
            .html('<textarea id="wB_fieldTextArea" class="wB_field_text ' + dark + '" maxlength="32"></textarea>');
        
        $('#wB_fieldTextArea').focus().val(text);
    }

    setNewTextToCard(element) {
        let text = element.find('textarea').val().trim();
        return this.setTextToField(element, text);
    }

    revertCard(element) {
        let text = this.cards[element.attr('data-count')].text;
        return this.setTextToField(element, text);
    }

    setTextToField(element, text) {
        text = text.trim();
        if (this.cardsDoesTextExist(text) === false) {
            element.removeClass('wB_field_focus');
            element.html('<span class="wB_field_text">' + text + '</span>');
            this.fieldChange = null;
            this.cards[element.attr('data-count')].text = text;
            this.cardsCheckAllFilled();
            return true;
        } else {
            this.shakeAndStay(element);
            return false;
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;

        if (this.isDarkMode === true) {
            this.setDarkModeSetting(true);
            $('body').addClass('dark');
            $('.wB_field').addClass('dark');
            $('#wB_info').addClass('dark');
        } else {
            this.setDarkModeSetting(false);
            $('body').removeClass('dark');
            $('.wB_field').removeClass('dark');
            $('#wB_info').removeClass('dark');
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

    cardsDoesTextExist(text) {
        if(text == null || text === '') {
            return false;
        }
        
        let doesTextAlreadyExist = false;

        for(let id in this.cards) {
            
            if (this.cards[id].text === text) {
                doesTextAlreadyExist = true;
            }
        }
        
        return doesTextAlreadyExist;
    }

    cardsCheckAllFilled() {
        let areAllCardsFilled = true;

        for(let id in this.cards) { 
            if (this.cards[id].text === '') {
                areAllCardsFilled = false;
                break;
            }
        }

        this.readyBtnVisible(areAllCardsFilled);
    }

    async shakeAndStay(element) {
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

    toggleInfo() {
        this.isInfoOpen = !this.isInfoOpen;
        $('#wB_info').toggle(200);
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

    roomAddOtherPlayer(players) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id !== this.socket.id) {
                this.roomAddPlayerHTML(players[i]);
            }
        }
    }
    
    roomAddPlayerHTML(player) {
        const name = player.customName != null ? player.customName : player.name;
        $('#wB_lobbyContainer')
            .append('<div class="wB_userField" data-id="' + player.id + '"><i class="mi wB_userReady">done</i>' + 
            '<img src="' + player.urlPic + '" id="wB_thisUserPic" class="wB_userPic" alt="Profilbild" />' + 
            '<div class="wB_userName">' + name + '</div></div>');
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
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo();
});