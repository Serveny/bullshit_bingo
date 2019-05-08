// Diejenichen, die den Code schreiben:
// Serveny & MaikMitAi

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor (container) {

        // Brobbaties
        this.Container = container;
        this.fieldChange = null;
        this.isDarkMode = false;
        
        // Hadde Arbeit
        this.buildHTML();
        this.registerEvents();

        // Dark Mode
        if (this.getDarkModeSetting() === true) {
            this.toggleDarkMode();
        }
    }
    
    // HTML-Code positionieren
    buildHTML() {
        let fieldsHTML = '';
        let count = 0;
        
        for (let i = 1; i < 6; i++) {
            for (let u = 1; u < 6; u++) {
                fieldsHTML += '<div id="wB_' + ++count + '" class="wB_field" data-x="' + i + '" data-y="' + u + '" data-count="' + count + '">' +
                '<span class="wB_field_text"></span>' +
                '</div>';
            }
        }

        this.Container.html(fieldsHTML);
    }

    // 20.08 Schanzenfest
    registerEvents() {
        const _self = this;

        this.addTextFieldEvents();

        $('#toggleDarkBtn').click(function(e) {
            _self.toggleDarkMode(e);    
        });
    }

    addTextFieldEvents() {
        const _self = this;

        $('.wB_field').click(function() {
            if (_self.fieldChange != null) {
                if ($(this).attr('id') == _self.fieldChange.attr('id')) {
                    return;
                } else {
                    _self.setTextToField(_self.fieldChange);
                }
            }
            _self.addTextArea($(this));
        });

        $(document).on('keydown', function(e) {
            let keyCode = e.keyCode || e.which;

            // Key: Tab
            if (keyCode == 9) { 
                e.preventDefault();
                if (_self.fieldChange != null) { 
                    let number = _self.fieldChange.attr('data-count');
                    _self.setTextToField(_self.fieldChange);
                    
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
                e.preventDefault();
                if (_self.fieldChange != null) {
                    _self.setTextToField(_self.fieldChange);
                }
            }
        });

        $(document).click(function(e) {
            if (_self.fieldChange != null) {
                let target = $(e.target);
                if (target.hasClass('wB_field') === true || target.hasClass('wB_field_text') === true) {
                    return;
                } else {
                    _self.setTextToField(_self.fieldChange);
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
            .html('<textarea id="wB_fieldTextArea" class="wB_field_text ' + dark + '"></textarea>');
        
        $('#wB_fieldTextArea').focus().val(text);
    }

    setTextToField(element) {
        let text = element.find('textarea').val().trim();
        element.removeClass('wB_field_focus');
        element.html('<span class="wB_field_text">' + text + '</span>');
        this.fieldChange = null;
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;

        if (this.isDarkMode === true) {
            this.setDarkModeSetting(true);
            $('body').addClass('dark');
            $('.wB_field').addClass('dark');
        } else {
            this.setDarkModeSetting(false);
            $('body').removeClass('dark');
            $('.wB_field').removeClass('dark');
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

    checkDouble() {

    }
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo($('#wB_container'));
});