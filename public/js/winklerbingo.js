// Derjeniche, der den Code schreibt:
// Serveny

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor (container) {
        this.container = container;
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

    start() {
        // Brobbaties
        this.fieldChange = null;
        this.isDarkMode = false;
        this.isInfoOpen = false;
        this.cards = {};
        this.phase = 0;

        // Hadde Arbeit
        this.buildHTML();
        this.registerEvents();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }

        this.addCardEvents();
        this.container.show();
    }

    getThisUserInRoom(players) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id == this.socket.id) {
                return players[i];
            }
        }
        return null;
    }

    socketAddEvents() {
        const _self = this;

        this.socket.on('roomJoined', function (roomData) {
            const urlWithoutParams =  location.protocol + '//' + location.host;
            if (roomData == null) {
                history.pushState(null, '', urlWithoutParams);
            } else {
                console.log('roomJoined', roomData);
                history.pushState(null, '', urlWithoutParams + '?r=' + roomData.roomId);
    
                $('#wB_createRoomBtn').hide();
                $('#wB_lobbyContainer').show();
    
                const thisUser = _self.getThisUserInRoom(roomData.players);
                $('#wB_thisUserPic').attr({ "src": thisUser.urlPic });
                $('#wB_thisUserInput').val(thisUser.name);
            }
        });
    }

    // HTML-Code positionieren, so a richtig geilen DOM
    buildHTML() {
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

        this.Container.html(fieldsHTML);
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
    }

    setUserPicWidthToHeight() {
        $('.wB_userPic').each(function() {
            $(this).css({'width': $(this).css('height')});
        });
    }

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

        if (this.doesCardTextExist(text) === false) {
            element.removeClass('wB_field_focus');
            element.html('<span class="wB_field_text">' + text + '</span>');
            this.fieldChange = null;
            this.cards[element.attr('data-count')].text = text;
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

    checkInput() {

    }

    doesCardTextExist(text) {
        if(text == null || text === '') {
            return false;
        }

        for(let id in this.cards) {
            if (this.cards[id].text === text) {
                return true;
            }
        }   
        return false;
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
    
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo($('wB_cardsContainer'));
});