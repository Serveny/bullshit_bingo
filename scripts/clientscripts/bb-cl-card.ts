import { Word } from './bb-cl-word';

export class Card {
  public id: string;
  public word: Word;
  public posX: number;
  public posY: number;

  constructor(card: any) {
    this.id = card.id;
    this.word = card.word == null ? null : new Word(card.word);
    this.posX = card.posX;
    this.posY = card.posY;
  }

  // HTML-Code positionieren, so a richtig geilen DOM
  public static cardsBuildHTML(cardMap: Map<string, Card>) {
    let fieldHTML = '';
    for (const card of cardMap.values()) {
      const word = card.word != null ? card.word.text : '';
      fieldHTML +=
        '<div class="bb_card" data-id="' +
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
}