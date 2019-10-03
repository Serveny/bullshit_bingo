import { Card } from './bb-cl-card';

export class Player {
  public id: string;
  public avatar: any;
  public isReady: boolean;
  public cardMap: Map<number, Card>;
  public phase: number;
  public status: number;

  constructor(player: any) {
    this.id = player.id;
    this.avatar = player.avatar;
    this.isReady = player.isReady;
    this.cardMap = new Map<number, Card>();
    this.phase = player.phase;
    this.status = player.status;

    const _self = this;
    player.cardMap.forEach(function(card: any) {
      _self.cardMap.set(card[0], new Card(card[1]));
    });
  }
}