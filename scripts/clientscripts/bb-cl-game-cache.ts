import { BingoPhase } from './bb-cl-bingo-phase';
import { CollectPhase } from './bb-cl-collect-phase';
import { DarkMode } from './bb-cl-darkmode';
import { Socket } from 'socket.io';
import { Room } from './bb-cl-room';
import { Matchfield } from './bb-cl-matchfield';
import { BarButtons } from './bb-cl-bar-buttons';

export class GameCache {
  public static socket: Socket;
  public static darkMode: DarkMode;
  public static thisPlayerId: string;

  public static roomId: string;
  public static room: Room;
  public static matchfield: Matchfield;

  public static selectedCardsGrid: JQuery<HTMLElement>;
  public static nextFocusCardId: number;

  public static collectPhase: CollectPhase;
  public static bingoPhase: BingoPhase;

  public static barButtons: BarButtons;
}
