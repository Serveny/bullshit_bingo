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
}