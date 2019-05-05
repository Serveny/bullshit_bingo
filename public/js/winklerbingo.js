// Diejenichen, die den Code schreiben:
// Serveny & MaikMitAi

class WinklerBingo {

    // A bisl wergeln & rumwuseln
    constructor (container) {

        // Brobbaties
        this.Container = container;
        this.fieldChange = null;
        
        // Hadde Arbeit
        this.buildHTML();
        this.registerEvents();
    }
    
    // HTML-Code positionieren
    buildHTML() {
        let fieldsHTML = '';
        
        for (let i = 1; i < 6; i++) {
            for (let u = 1; u < 6; u++) {
                fieldsHTML += '<div id="wB_' + i + '-' + u + '" class="wB_field">' +
                '<span></span>' +
                '</div>';
            }
        }

        this.Container.html(fieldsHTML);
    }

    // 20.08 Schanzenfest
    registerEvents() {
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

        this.addTextCloseEvent();
    }

    addTextCloseEvent() {
        const _self = this;
        $(document).on('keypress',function(e) {
            // Keypress: Enter
            if(e.which == 13) {
                if (_self.fieldChange != null) {
                    _self.setTextToField(_self.fieldChange);
                }
            }
        });
    }

    addTextArea(element) {
        this.fieldChange = element;
        let text = element.find('span').text();
        element.html('<textarea id="wB_fieldTextArea">' + text + '</textarea>');
        $('#wB_fieldTextArea').focus();
    }

    

    setTextToField(element) {
        let text = element.find('textarea').val().trim();
        element.html('<span>' + text + '</span>');
        this.fieldChange = null;
    }
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo($('#wB_container'));
});