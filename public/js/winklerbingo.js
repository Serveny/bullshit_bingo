class WinklerBingo {

    constructor (container) {
        this.Container = container;
        this.buildHTML();
    }

    buildHTML() {
        let fieldsHTML = '';
        
        for (let i = 1; i < 6; i++) {
            for (let u = 1; u < 6; u++) {
                fieldsHTML += '<div id="wB-' + i + '-' + u + '" class="wB_field"></div>';        
            }
        }

        this.Container.html(fieldsHTML);
    }
}

$(document).ready(function() {
    winklerBingo = new WinklerBingo($('#wB_container'));
});