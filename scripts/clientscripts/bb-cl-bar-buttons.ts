export class BarButtons {
  public leaveRoomBtn: JQuery<HTMLElement>;
  public autofillBtn: JQuery<HTMLElement>;
  public createRoomBtn: JQuery<HTMLElement>;

  constructor(
    leaveRoomBtn: JQuery<HTMLElement>, 
    autofillBtn: JQuery<HTMLElement>, 
    createRoomBtn: JQuery<HTMLElement>,
  ) {
    this.leaveRoomBtn = leaveRoomBtn;
    this.autofillBtn = autofillBtn;
    this.createRoomBtn = createRoomBtn;
  }
};