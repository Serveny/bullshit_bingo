export class Word {
  public id: string;
  public text: string;
  public countGuessed: number;
  public countUsed: number;
  public createdAt: Date;
  public changedAt: Date;

  constructor(word: any) {
    this.id = word.id;
    this.text = word.text;
    this.countGuessed = word.countGuessed;
    this.countUsed = word.countUsed;
    this.createdAt = word.createdAt;
    this.changedAt = word.changedAt;
  }
}