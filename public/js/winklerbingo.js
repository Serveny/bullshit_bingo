// Derjeniche, der bis dato den Code schreibt:
// Serveny

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor (container) {

        // Brobbaties
        this.Container = container;
        this.fieldChange = null;
        this.isDarkMode = false;
        this.isInfoOpen = false;
        this.cards = {};
        
        // Hadde Arbeit
        this.buildHTML();
        this.registerEvents();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }
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
    registerEvents() {
        const _self = this;

        this.addCardEvents();

        $('#toggleDarkBtn').click(function(e) {
            _self.toggleDarkMode(e);    
        });

        $('.toggleInfoBtn').click(function() {
            _self.toggleInfo();    
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
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo($('#wB_container'));
});