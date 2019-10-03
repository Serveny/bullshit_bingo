/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./scripts/clientscripts/bullshit-bingo.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./scripts/clientscripts/bb-cl-card.ts":
/*!*********************************************!*\
  !*** ./scripts/clientscripts/bb-cl-card.ts ***!
  \*********************************************/
/*! exports provided: Card */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Card\", function() { return Card; });\n/* harmony import */ var _bb_cl_word__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bb-cl-word */ \"./scripts/clientscripts/bb-cl-word.ts\");\n\r\nclass Card {\r\n    constructor(card) {\r\n        this.id = card.id;\r\n        this.word = card.word == null ? null : new _bb_cl_word__WEBPACK_IMPORTED_MODULE_0__[\"Word\"](card.word);\r\n        this.posX = card.posX;\r\n        this.posY = card.posY;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-card.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-confetti.ts":
/*!*************************************************!*\
  !*** ./scripts/clientscripts/bb-cl-confetti.ts ***!
  \*************************************************/
/*! exports provided: Confetti */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Confetti\", function() { return Confetti; });\nclass Confetti {\r\n    constructor(targetEl) {\r\n        this._el = targetEl;\r\n    }\r\n    start(value) {\r\n        this._el.show();\r\n        for (let i = 0; i < value; i++) {\r\n            this.create(i);\r\n        }\r\n    }\r\n    create(i) {\r\n        let width = Math.random() * 40;\r\n        let height = width * 0.4;\r\n        let colourIdx = Math.ceil(Math.random() * 3);\r\n        let colour = 'red';\r\n        switch (colourIdx) {\r\n            case 1:\r\n                colour = 'orange';\r\n                break;\r\n            case 2:\r\n                colour = 'cyan';\r\n                break;\r\n            case 3:\r\n                colour = 'yellow';\r\n            default:\r\n                colour = 'red';\r\n        }\r\n        $('<div class=\"confetti-' + i + ' ' + colour + ' snip\"></div>')\r\n            .css({\r\n            width: width + 'px',\r\n            height: height + 'px',\r\n            top: -Math.random() * 20 + '%',\r\n            left: Math.random() * 100 + '%',\r\n            opacity: Math.random() + 0.5,\r\n            transform: 'rotate(' + Math.random() * 360 + 'deg)'\r\n        })\r\n            .appendTo(this._el);\r\n        this.drop(i);\r\n    }\r\n    drop(x) {\r\n        const _self = this;\r\n        $('.confetti-' + x).animate({\r\n            top: '100%',\r\n            left: '+=' + Math.random() * 15 + '%'\r\n        }, Math.random() * 3000 + 3000, function () {\r\n            _self.reset(x);\r\n        });\r\n    }\r\n    reset(x) {\r\n        const _self = this;\r\n        $('.confetti-' + x).animate({\r\n            top: -Math.random() * 20 + '%',\r\n            left: '-=' + Math.random() * 15 + '%'\r\n        }, 0, function () {\r\n            _self.drop(x);\r\n        });\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-confetti.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-darkmode.ts":
/*!*************************************************!*\
  !*** ./scripts/clientscripts/bb-cl-darkmode.ts ***!
  \*************************************************/
/*! exports provided: DarkMode */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"DarkMode\", function() { return DarkMode; });\nclass DarkMode {\r\n    constructor() {\r\n        const _self = this;\r\n        this.ToggleDarkBtn = $('#bb_toggleDarkBtn'),\r\n            this.ToggleDarkBtn.click(() => {\r\n                _self.toggle();\r\n            });\r\n        if (this.getDarkModeSetting() === true) {\r\n            this.toggle();\r\n        }\r\n        else {\r\n            $('body').css({ background: '#F2E2C4' });\r\n        }\r\n    }\r\n    get isDarkMode() {\r\n        return this._isDarkMode;\r\n    }\r\n    toggle(force = null) {\r\n        this._isDarkMode = force == null ? !this._isDarkMode : force;\r\n        if (this._isDarkMode === true) {\r\n            this.setDarkModeSetting(true);\r\n            $('body').addClass('darkI');\r\n            $('.bb_card').addClass('dark');\r\n            $('#bb_info').addClass('darkI');\r\n            $('#bodyOverlay').css('opacity', 0.6);\r\n            $('.bb_cardBtn').addClass('cardBtnDark');\r\n        }\r\n        else {\r\n            this.setDarkModeSetting(false);\r\n            $('body')\r\n                .css({ background: '#F2E2C4' })\r\n                .removeClass('darkI');\r\n            $('.bb_card').removeClass('dark');\r\n            $('#bb_info').removeClass('darkI');\r\n            $('#bodyOverlay').css('opacity', 0.1);\r\n            $('.bb_cardBtn').removeClass('cardBtnDark');\r\n        }\r\n        // Hitted Cards\r\n        const bgColor = this._isDarkMode === true\r\n            ? 'rgb(34, 34, 34, 0.8)'\r\n            : 'rgb(242, 226, 196, 0.8)';\r\n        $('.bb_cardHit').each(function () {\r\n            $(this).css({\r\n                background: \"url('../img/cardBG.png'), radial-gradient(rgb(152, 166, 123, 1), \" +\r\n                    bgColor +\r\n                    ')'\r\n            });\r\n        });\r\n    }\r\n    repaint() {\r\n        this.toggle(this._isDarkMode);\r\n    }\r\n    getDarkModeSetting() {\r\n        let isDark = localStorage.getItem('_isDarkMode');\r\n        if (isDark == 'true') {\r\n            return true;\r\n        }\r\n        else {\r\n            return false;\r\n        }\r\n    }\r\n    setDarkModeSetting(value) {\r\n        localStorage.setItem('_isDarkMode', value === true ? 'true' : 'false');\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-darkmode.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-game-cache.ts":
/*!***************************************************!*\
  !*** ./scripts/clientscripts/bb-cl-game-cache.ts ***!
  \***************************************************/
/*! exports provided: GameCache */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GameCache\", function() { return GameCache; });\nclass GameCache {\r\n    constructor(socket, darkMode, matchfield, collectPhase, bingoPhase, barButtons, roomId, selectedCardsGrid) {\r\n        this.socket = socket;\r\n        this.darkMode = darkMode;\r\n        this.roomId = roomId;\r\n        this.matchfield = matchfield;\r\n        this.selectedCardsGrid = selectedCardsGrid;\r\n        this.collectPhase = collectPhase;\r\n        this.bingoPhase = bingoPhase;\r\n        this.barButtons = barButtons;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-game-cache.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-matchfield.ts":
/*!***************************************************!*\
  !*** ./scripts/clientscripts/bb-cl-matchfield.ts ***!
  \***************************************************/
/*! exports provided: Matchfield */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Matchfield\", function() { return Matchfield; });\n/* harmony import */ var _bb_cl_card__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bb-cl-card */ \"./scripts/clientscripts/bb-cl-card.ts\");\n/* harmony import */ var _bb_cl_confetti__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bb-cl-confetti */ \"./scripts/clientscripts/bb-cl-confetti.ts\");\n\r\n\r\nclass Matchfield {\r\n    constructor(gameCache) {\r\n        this._isInfoOpen = false;\r\n        this._gameCache = gameCache;\r\n    }\r\n    get cardChangeEl() {\r\n        return this._cardChangeEl;\r\n    }\r\n    get isInfoOpen() {\r\n        return this._isInfoOpen;\r\n    }\r\n    matchfieldBuildHTML(cardMap) {\r\n        let fieldHTML = '';\r\n        for (const card of cardMap.values()) {\r\n            const word = card.word != null ? card.word.text : '';\r\n            fieldHTML +=\r\n                '<div class=\"bb_card\" data-id=\"' +\r\n                    card.id +\r\n                    '\" data-x=\"' +\r\n                    card.posX +\r\n                    '\" data-y=\"' +\r\n                    card.posY +\r\n                    '\" style=\"grid-column: ' +\r\n                    card.posX +\r\n                    '; grid-row: ' +\r\n                    card.posY +\r\n                    ';\">' +\r\n                    '<span class=\"bb_card_text\">' +\r\n                    word +\r\n                    '</span>' +\r\n                    '</div>';\r\n        }\r\n        return fieldHTML;\r\n    }\r\n    // Should only triggered after server validation\r\n    matchfieldSetCard(card) {\r\n        this._gameCache.room.getThisPlayer().cardMap.set(parseInt(card.id), card);\r\n        this._gameCache.matchfield.matchfieldSetCardTextHTML(this._gameCache.selectedCardsGrid.find('[data-id=' + card.id + ']'), card.word != null ? card.word.text : '');\r\n    }\r\n    matchfieldSetCardTextHTML(element, text) {\r\n        element.removeClass('bb_card_focus');\r\n        element.html('<span class=\"bb_card_text\"></span>');\r\n        element.find('.bb_card_text').text(text);\r\n        this._cardChangeEl = null;\r\n        this.matchfieldCheckAllCardsFilled();\r\n        this.matchfieldFocusNextCard();\r\n    }\r\n    matchfieldFocusNextCard() {\r\n        if (this._gameCache.nextFocusCardId != null) {\r\n            this.matchfieldAddTextAreaToCard(this._gameCache.selectedCardsGrid.find('[data-id=' + +this._gameCache.nextFocusCardId + ']'));\r\n            this._gameCache.nextFocusCardId = null;\r\n        }\r\n    }\r\n    matchfieldDoesCardTextExist(text) {\r\n        if (text == null || text === '') {\r\n            return false;\r\n        }\r\n        for (let card of this._gameCache.room.playerMap\r\n            .get(this._gameCache.socket.id)\r\n            .cardMap.values()) {\r\n            if (card.word != null && card.word.text === text) {\r\n                return true;\r\n            }\r\n        }\r\n        return false;\r\n    }\r\n    matchfieldCheckAllCardsFilled() {\r\n        let areAllCardsFilled = true;\r\n        const cardMap = this._gameCache.room.playerMap.get(this._gameCache.socket.id).cardMap;\r\n        for (let card of cardMap.values()) {\r\n            if (card.word == null || card.word.text === '') {\r\n                this.revertReady();\r\n                areAllCardsFilled = false;\r\n                break;\r\n            }\r\n        }\r\n        this.readyBtnVisible(areAllCardsFilled);\r\n    }\r\n    // matchfieldGetTextArr() {\r\n    //   let words = [];\r\n    //   for (let i = 0; i < this._gameCache.room.length; i++) {\r\n    //     if (this.cards[i] != null && this.cards[i].text != '') {\r\n    //       words.push(this.cards[i].text);\r\n    //     }\r\n    //   }\r\n    //   return words;\r\n    // }\r\n    matchfieldAddTextAreaToCard(element) {\r\n        this._cardChangeEl = element;\r\n        let text = element.find('span').text();\r\n        let dark = this._gameCache.darkMode.isDarkMode === true ? 'dark' : '';\r\n        element\r\n            .addClass('bb_card_focus')\r\n            .html('<textarea id=\"bb_cardTextArea\" class=\"bb_card_text ' +\r\n            dark +\r\n            '\" maxlength=\"32\"></textarea>');\r\n        $('#bb_cardTextArea')\r\n            .focus()\r\n            .val(text);\r\n    }\r\n    matchfieldSetNewTextToCard(element) {\r\n        let text = element.find('textarea').val();\r\n        return this.matchfieldValidateCard(element, text != null ? text.toString() : '');\r\n    }\r\n    matchfieldRevertCard(element) {\r\n        const word = this._gameCache.room\r\n            .getThisPlayer()\r\n            .cardMap.get(parseInt(element.attr('data-id'))).word;\r\n        return this.matchfieldValidateCard(element, word != null ? word.text : '');\r\n    }\r\n    matchfieldValidateCard(element, text) {\r\n        text = text.trim();\r\n        const card = this._gameCache.room\r\n            .getThisPlayer()\r\n            .cardMap.get(parseInt(element.attr('data-id')));\r\n        // Check if no change\r\n        if ((card.word == null && text === '') ||\r\n            (card.word != null && card.word.text === text)) {\r\n            this.matchfieldSetCardTextHTML(this._cardChangeEl, text);\r\n            return true;\r\n        }\r\n        // Check if valid\r\n        if (this.matchfieldDoesCardTextExist(text) === false) {\r\n            this._gameCache.socket.emit('setCard', {\r\n                cardId: element.attr('data-id'),\r\n                cardText: text\r\n            });\r\n            return true;\r\n        }\r\n        else {\r\n            this.shakeAndStay(element);\r\n            return false;\r\n        }\r\n    }\r\n    revertReady() {\r\n        if (this._gameCache.room.getThisPlayer().isReady === true) {\r\n            this._gameCache.socket.emit('toggleReady');\r\n            $('bb_thisUserReady').hide();\r\n        }\r\n        this._gameCache.room.getThisPlayer().isReady = false;\r\n    }\r\n    shakeAndStay(element) {\r\n        element.find('textarea').focus();\r\n        element.removeClass('bb_card_focus').addClass('shake_short');\r\n        setTimeout(function () {\r\n            element.removeClass('shake_short').addClass('bb_card_focus');\r\n        }, 820);\r\n    }\r\n    cardsAutofill(changedCardMap) {\r\n        const cardMap = this._gameCache.room.getThisPlayer().cardMap;\r\n        let time = 0;\r\n        for (const cardItem of changedCardMap.values()) {\r\n            cardMap.set(parseInt(cardItem.id), cardItem);\r\n            const cardEl = this._gameCache.selectedCardsGrid.find('[data-id=' + cardItem.id + ']');\r\n            this.matchfieldSetCardTextHTML(cardEl, cardItem.word.text);\r\n            // Animation\r\n            const cardSpan = cardEl.find('span');\r\n            cardSpan.hide();\r\n            setTimeout(function () {\r\n                cardSpan.fadeIn(800);\r\n            }, time);\r\n            time += 50;\r\n        }\r\n    }\r\n    cardsFlipAnimation() {\r\n        return new Promise(resolve => {\r\n            const bigText = $('#bb_bigText')\r\n                .text('bingo')\r\n                .addClass('fadeLeftToRight')\r\n                .show();\r\n            const cardsText = $('.bb_card_text').addClass('mirror');\r\n            const cardsContainer = $('#bb_cardsContainer').addClass('flip');\r\n            setTimeout(function () {\r\n                bigText.hide().removeClass('fadeLeftToRight');\r\n                cardsText.removeClass('mirror');\r\n                cardsContainer.removeClass('flip');\r\n                resolve();\r\n            }, 2500);\r\n        });\r\n    }\r\n    cardsAddConfirmBox(cardEl) {\r\n        const _self = this;\r\n        const dark = this._gameCache.darkMode.isDarkMode === true ? ' cardBtnDark' : '';\r\n        cardEl.find('.bb_card_text').css({ margin: '0 auto' });\r\n        cardEl\r\n            .append('<div class=\"bb_cardConfirmBox\"><button id=\"bb_cardSubmit\" class=\"bb_cardBtn' +\r\n            dark +\r\n            '\"><i class=\"mi\">done</i>' +\r\n            '</button><button id=\"bb_cardCancel\" class=\"bb_cardBtn' +\r\n            dark +\r\n            '\"><i class=\"mi\">close</i></button></div>')\r\n            .addClass('bb_card_focus');\r\n        $('#bb_cardSubmit').on('click', () => {\r\n            _self._gameCache.socket.emit('cardWordSaid', _self._cardChangeEl.attr('data-id'));\r\n            _self._gameCache.socket.emit('cardHit', _self._cardChangeEl.attr('data-id'));\r\n        });\r\n        $('#bb_cardCancel').on('click', () => {\r\n            _self.cardsRemoveConfirmBox(_self.cardChangeEl);\r\n        });\r\n        this._cardChangeEl = cardEl;\r\n    }\r\n    cardsRemoveConfirmBox(cardEl) {\r\n        cardEl.find('.bb_card_text').attr('style', '');\r\n        cardEl\r\n            .removeClass('bb_card_focus')\r\n            .find('.bb_cardConfirmBox')\r\n            .remove();\r\n        this._cardChangeEl = null;\r\n    }\r\n    cardsSetHit(playerId, cardId, isHit) {\r\n        console.log(playerId, cardId, isHit);\r\n        this._gameCache.room.playerMap\r\n            .get(playerId)\r\n            .cardMap.get(parseInt(cardId)).isHit = isHit;\r\n        if (playerId === this._gameCache.selectedCardsGrid.attr('data-playerid')) {\r\n            const cardEl = this._gameCache.selectedCardsGrid.find('[data-id=' + cardId + ']');\r\n            const bgColor = this._gameCache.darkMode.isDarkMode === true\r\n                ? 'rgb(34, 34, 34, 0.8)'\r\n                : 'rgb(242, 226, 196, 0.8)';\r\n            if (isHit === true) {\r\n                cardEl.addClass('bb_cardHit');\r\n                cardEl.css({\r\n                    background: \"url('../img/cardBG.png'), radial-gradient(rgb(152, 166, 123, 1), \" +\r\n                        bgColor +\r\n                        ')'\r\n                });\r\n            }\r\n            else {\r\n                cardEl.removeClass('bb_cardHit');\r\n                cardEl.attr('style', '');\r\n            }\r\n            this.cardsHittedCutBorder();\r\n        }\r\n    }\r\n    cardsHittedCutBorder() {\r\n        const _self = this;\r\n        $('.bb_cardHit').each(() => {\r\n            const el = $(this), x = parseInt(el.attr('data-x')), y = parseInt(el.attr('data-y')), upEl = el.siblings('[data-x=\"' + x + '\"][data-y=\"' + (y - 1) + '\"]'), rightEl = el.siblings('[data-x=\"' + (x + 1) + '\"][data-y=\"' + y + '\"]'), bottomEl = el.siblings('[data-x=\"' + x + '\"][data-y=\"' + (y + 1) + '\"]'), leftEl = el.siblings('[data-x=\"' + (x - 1) + '\"][data-y=\"' + y + '\"]');\r\n            if (upEl.hasClass('bb_cardHit') === true) {\r\n                _self.borderNone(el, 'top');\r\n                _self.borderNone(upEl, 'bottom');\r\n            }\r\n            if (rightEl.hasClass('bb_cardHit') === true) {\r\n                _self.borderNone(el, 'right');\r\n                _self.borderNone(rightEl, 'left');\r\n            }\r\n            if (bottomEl.hasClass('bb_cardHit') === true) {\r\n                _self.borderNone(el, 'bottom');\r\n                _self.borderNone(bottomEl, 'top');\r\n            }\r\n            if (leftEl.hasClass('bb_cardHit') === true) {\r\n                _self.borderNone(el, 'left');\r\n                _self.borderNone(leftEl, 'right');\r\n            }\r\n        });\r\n    }\r\n    /* ---------------------\r\n         Other Functions\r\n         --------------------- */\r\n    showFieldSwitchAnimation(fieldHide, fieldShow) {\r\n        fieldHide.hide();\r\n        fieldShow.show();\r\n    }\r\n    toggleInfo() {\r\n        this._isInfoOpen = !this._isInfoOpen;\r\n        $('#bb_info').fadeToggle(400);\r\n    }\r\n    getUrlParam(param) {\r\n        let query = window.location.search.substring(1);\r\n        let vars = query.split('&');\r\n        for (let i = 0; i < vars.length; i++) {\r\n            let pair = vars[i].split('=');\r\n            if (pair[0] == param) {\r\n                return pair[1];\r\n            }\r\n        }\r\n        return null;\r\n    }\r\n    readyBtnVisible(isVisible) {\r\n        if (isVisible === true) {\r\n            $('#bb_thisUserReady').show();\r\n        }\r\n        else {\r\n            $('#bb_thisUserReady').hide();\r\n        }\r\n    }\r\n    arrToCardMap(cardArr) {\r\n        const cardMap = new Map();\r\n        for (let i = 0; i < cardArr.length; i++) {\r\n            cardMap.set(cardArr[i][0], new _bb_cl_card__WEBPACK_IMPORTED_MODULE_0__[\"Card\"](cardArr[i][1]));\r\n        }\r\n        return cardMap;\r\n    }\r\n    showErrorToast(errorStr) {\r\n        $('#bb_errorToast')\r\n            .finish()\r\n            .text(errorStr)\r\n            .fadeIn(300)\r\n            .delay(4000)\r\n            .fadeOut(800);\r\n    }\r\n    // TODO\r\n    // makeScrollableX() {\r\n    //   const _self = this,\r\n    //     elements = $('.bb_scrollX');\r\n    //   if (elements.length > 0) {\r\n    //     elements.forEach((el: JQuery<HTMLElement>) => {\r\n    //       el.append('<div class=\"bb_scrollbar\"></div>');\r\n    //     });\r\n    //     $(window).resize(function() {});\r\n    //   }\r\n    // }\r\n    // sizeScrollbarsX(elements) {\r\n    //   elements.forEach(function(el) {\r\n    //     el.prop('scrollWidth');\r\n    //   });\r\n    // }\r\n    playWinAnimation() {\r\n        this._confetti = new _bb_cl_confetti__WEBPACK_IMPORTED_MODULE_1__[\"Confetti\"]($('#confettiContainer'));\r\n        this._confetti.start(50);\r\n        const cardsContainer = $('#bb_cardsContainer').addClass('implode'), bigText = $('#bb_bigText')\r\n            .addClass('bb_bigTextCenter')\r\n            .text('Elitehäider')\r\n            .addClass('implodeRev')\r\n            .show();\r\n        setTimeout(() => {\r\n            bigText\r\n                .hide()\r\n                .removeClass('bb_bigTextCenter')\r\n                .text('')\r\n                .removeClass('implodeRev');\r\n            cardsContainer.addClass('pulse');\r\n        }, 8000);\r\n    }\r\n    borderNone(el, side) {\r\n        switch (side) {\r\n            case 'top':\r\n                el.css({ 'border-top': 'none' });\r\n                break;\r\n            case 'right':\r\n                el.css({ 'border-right': 'none' });\r\n                break;\r\n            case 'bottom':\r\n                el.css({ 'border-bottom': 'none' });\r\n                break;\r\n            case 'left':\r\n                el.css({ 'border-left': 'none' });\r\n                break;\r\n        }\r\n    }\r\n    drawWinLine(winLine) {\r\n        const cardsContainer = $('#bb_cardsContainer');\r\n        cardsContainer.append('<canvas id=\"bb_cardsContainerCanvas\" height=\"' +\r\n            cardsContainer.height() +\r\n            '\" width=\"' +\r\n            cardsContainer.width() +\r\n            '\"></canvas>');\r\n        const cardHeightPx = cardsContainer.height() / 5, cardWidthPx = cardsContainer.width() / 5, heightHalfPx = cardHeightPx / 2, widthHalfPx = cardWidthPx / 2, canvasEl = $('#bb_cardsContainerCanvas').get(0), ctx = canvasEl.getContext('2d');\r\n        ctx.moveTo(winLine.startX * cardWidthPx - widthHalfPx, winLine.startY * cardHeightPx - heightHalfPx);\r\n        ctx.lineTo(winLine.endX * cardWidthPx - widthHalfPx, winLine.endY * cardHeightPx - heightHalfPx);\r\n        ctx.strokeStyle = `rgb(70, 137, 102, 0.5)`;\r\n        ctx.lineWidth = 10;\r\n        ctx.stroke();\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-matchfield.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-player.ts":
/*!***********************************************!*\
  !*** ./scripts/clientscripts/bb-cl-player.ts ***!
  \***********************************************/
/*! exports provided: Player */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Player\", function() { return Player; });\n/* harmony import */ var _bb_cl_card__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bb-cl-card */ \"./scripts/clientscripts/bb-cl-card.ts\");\n\r\nclass Player {\r\n    constructor(player) {\r\n        this.id = player.id;\r\n        this.avatar = player.avatar;\r\n        this.isReady = player.isReady;\r\n        this.cardMap = new Map();\r\n        this.phase = player.phase;\r\n        this.status = player.status;\r\n        const _self = this;\r\n        player.cardMap.forEach(function (card) {\r\n            _self.cardMap.set(card[0], new _bb_cl_card__WEBPACK_IMPORTED_MODULE_0__[\"Card\"](card[1]));\r\n        });\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-player.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bb-cl-word.ts":
/*!*********************************************!*\
  !*** ./scripts/clientscripts/bb-cl-word.ts ***!
  \*********************************************/
/*! exports provided: Word */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Word\", function() { return Word; });\nclass Word {\r\n    constructor(word) {\r\n        this.id = word.id;\r\n        this.text = word.text;\r\n        this.countGuessed = word.countGuessed;\r\n        this.countUsed = word.countUsed;\r\n        this.createdAt = word.createdAt;\r\n        this.changedAt = word.changedAt;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bb-cl-word.ts?");

/***/ }),

/***/ "./scripts/clientscripts/bullshit-bingo.js":
/*!*************************************************!*\
  !*** ./scripts/clientscripts/bullshit-bingo.js ***!
  \*************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _bb_cl_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bb-cl-player */ \"./scripts/clientscripts/bb-cl-player.ts\");\n/* harmony import */ var _bb_cl_darkmode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bb-cl-darkmode */ \"./scripts/clientscripts/bb-cl-darkmode.ts\");\n/* harmony import */ var _bb_cl_game_cache__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bb-cl-game-cache */ \"./scripts/clientscripts/bb-cl-game-cache.ts\");\n/* harmony import */ var _bb_cl_matchfield__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./bb-cl-matchfield */ \"./scripts/clientscripts/bb-cl-matchfield.ts\");\n\r\n\r\n\r\n\r\n// Author: Serveny\r\nclass BullshitBingo {\r\n    // A bisl wergeln & rumwuseln\r\n    constructor() {\r\n        this.gameCache = new _bb_cl_game_cache__WEBPACK_IMPORTED_MODULE_2__[\"GameCache\"]();\r\n        this.gameCache.socket = io.connect(window.location.host);\r\n        this.gameCache.darkMode = new _bb_cl_darkmode__WEBPACK_IMPORTED_MODULE_1__[\"DarkMode\"]();\r\n        this.gameCache.thisPlayerId = null;\r\n        this.gameCache.roomId = this.getUrlParam('r');\r\n        this.gameCache.matchfield = new _bb_cl_matchfield__WEBPACK_IMPORTED_MODULE_3__[\"Matchfield\"](this.gameCache);\r\n        this.barBtns = {\r\n            autofillBtn: $('#bb_autofillBtn'),\r\n            toggleInfoBtn: $('.bb_toggleInfoBtn'),\r\n            leaveRoomBtn: $('#bb_leaveRoomBtn')\r\n        };\r\n        this.gameCache.selectedCardsGrid = $('.bb_cardsGrid[data-selected=true]');\r\n        this.socketAddEvents();\r\n        this.addEvents();\r\n        if (this.gameCache.roomId != null) {\r\n            this.gameCache.socket.emit('joinRoom', this.gameCache.roomId);\r\n        }\r\n    }\r\n    addEvents() {\r\n        const _self = this;\r\n        $('#bb_createRoomBtn').click(function () {\r\n            _self.gameCache.socket.emit('joinRoom', null);\r\n        });\r\n        _self.barBtns.toggleInfoBtn.click(function () {\r\n            _self.toggleInfo();\r\n        });\r\n        this.barBtns.leaveRoomBtn.click(function () {\r\n            _self.gameCache.socket.disconnect();\r\n            history.pushState(null, '', location.protocol + '//' + location.host);\r\n            location.reload();\r\n        });\r\n        _self.barBtns.autofillBtn.click(function () {\r\n            _self.gameCache.socket.emit('needAutofill', _self.cardsGetTextArr());\r\n        });\r\n    }\r\n    socketAddEvents() {\r\n        const _self = this;\r\n        _self.gameCache.socket.on('connect', function () {\r\n            _self.gameCache.thisPlayerId = _self.gameCache.socket.id;\r\n        });\r\n        _self.gameCache.socket.on('gameError', function (errorStr) {\r\n            console.log('[ERROR] ' + errorStr);\r\n            _self.showErrorToast(errorStr);\r\n        });\r\n        _self.gameCache.socket.on('disconnect', function () {\r\n            // TODO Connection lost handling\r\n            console.log(_self.gameCache.socket + ' disconnected');\r\n        });\r\n        _self.gameCache.socket.on('roomJoined', function (roomData) {\r\n            if (roomData == null) {\r\n                history.pushState(null, '', location.protocol + '//' + location.host);\r\n                $('#bb_createRoomBtn').show();\r\n            }\r\n            else {\r\n                _self.startCollectPhase(roomData);\r\n            }\r\n        });\r\n        _self.gameCache.socket.on('playerJoined', function (newPlayer) {\r\n            _self.roomUnreadyPlayer(_self.room.playerMap);\r\n            newPlayer = new _bb_cl_player__WEBPACK_IMPORTED_MODULE_0__[\"Player\"](newPlayer);\r\n            _self.room.playerMap.set(newPlayer.id, newPlayer);\r\n            _self.room.roomAddPlayerHTML(newPlayer);\r\n            if (_self.countdownId != null) {\r\n                _self.room.roomStopCountdown();\r\n            }\r\n        });\r\n        _self.gameCache.socket.on('playerDisconnected', function (playerId) {\r\n            _self.roomUnreadyPlayer(_self.room.playerMap);\r\n            _self.room.roomRemovePlayerHTML(playerId);\r\n        });\r\n        _self.gameCache.socket.on('nameChanged', function (data) {\r\n            _self.room.roomPlayerChangeName(data.playerId, data.name);\r\n        });\r\n        _self.gameCache.socket.on('reconnect', function () {\r\n            console.log('Reconnected: ', _self.gameCache.thisPlayerId, _self.gameCache.socket.id);\r\n            if (_self.room != null) {\r\n                _self.gameCache.socket.emit('recoverRoom', {\r\n                    room: _self.room,\r\n                    oldId: _self.gameCache.thisPlayerId\r\n                });\r\n            }\r\n        });\r\n        _self.gameCache.socket.on('gameRecovered', function () {\r\n            // TODO\r\n        });\r\n    }\r\n}\r\n$(document).ready(function () {\r\n    var bullshitBingo = new BullshitBingo();\r\n    $('body').fadeIn(1600);\r\n});\r\n\n\n//# sourceURL=webpack:///./scripts/clientscripts/bullshit-bingo.js?");

/***/ })

/******/ });