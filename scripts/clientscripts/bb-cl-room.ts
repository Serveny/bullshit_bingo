import { Player } from './bb-cl-player';

export class Room {
  public id: string;
  public playerMap: Map<string, Player>;
  
  constructor(room: any) {
    this.id = room.id;
    this.playerMap = new Map<string, Player>();

    const _self = this;
    room.playerMap.forEach(function(player: any) {
      _self.playerMap.set(player[0], new Player(player[1]));
    });
  }
}