import { BingoPhase } from './bb-cl-bingo-phase';
import { CollectPhase } from './bb-cl-collect-phase';
import { DarkMode } from './bb-cl-darkmode';
import { Socket } from 'socket.io';
import { Room } from './bb-cl-room';
import { Matchfield } from './bb-cl-matchfield';
import { BarButtons } from './bb-cl-bar-buttons';

export class GameCache {
  public socket: Socket;
  public darkMode: DarkMode;
  public thisPlayerId: string;

  public roomId: string;
  public room: Room;
  public matchfield: Matchfield;

  public selectedCardsGrid: JQuery<HTMLElement>;
  public nextFocusCardId: number;

  public collectPhase: CollectPhase;
  public bingoPhase: BingoPhase;

  public barButtons: BarButtons;

  constructor(
    socket: Socket,
    darkMode: DarkMode,
    matchfield: Matchfield,
    collectPhase: CollectPhase,
    bingoPhase: BingoPhase,
    barButtons: BarButtons,
    roomId: string,
    selectedCardsGrid: JQuery<HTMLElement>
  ) {
    this.socket = socket;
    this.darkMode = darkMode;
    this.roomId = roomId;
    this.matchfield = matchfield;
    this.selectedCardsGrid = selectedCardsGrid;
    this.collectPhase = collectPhase;
    this.bingoPhase = bingoPhase;
    this.barButtons = barButtons;
  }
}
