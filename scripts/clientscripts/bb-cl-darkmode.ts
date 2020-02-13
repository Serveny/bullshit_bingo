export class DarkMode {
  private _isDarkMode: boolean = false;
  get isDarkMode(): boolean {
    return this._isDarkMode;
  }

  private ToggleDarkBtn: any;

  constructor() {
    const _self = this;
    this.ToggleDarkBtn = $('#bb_toggleDarkBtn'),
    this.ToggleDarkBtn.click(() => {
      _self.toggle();
    });

    if (this.getDarkModeSetting() === true) {
      this.toggle();
    } else {
      $('body').css({ background: '#F2E2C4' });
    }
  }
  
  public toggle(force: boolean = null) {
    this._isDarkMode = force == null ? this._isDarkMode === false : force;

    if (this._isDarkMode === true) {
      this.setDarkModeSetting(true);
      $('body').addClass('darkI');
      $('.bb_card').addClass('dark');
      $('#bb_info').addClass('darkI');
      $('#bodyOverlay').css('opacity', 0.6);
      $('.bb_cardBtn').addClass('cardBtnDark');
    } else {
      this.setDarkModeSetting(false);
      $('body')
        .css({ background: '#F2E2C4' })
        .removeClass('darkI');
      $('.bb_card').removeClass('dark');
      $('#bb_info').removeClass('darkI');
      $('#bodyOverlay').css('opacity', 0.1);
      $('.bb_cardBtn').removeClass('cardBtnDark');
    }

    // Hitted Cards
    const bgColor =
      this._isDarkMode === true
        ? 'rgb(34, 34, 34, 0.8)'
        : 'rgb(242, 226, 196, 0.8)';
    $('.bb_cardHit').each((i: number, element: HTMLElement) => {
      $(element).css({
        background:
          "url('../img/cardBG.png'), radial-gradient(rgb(152, 166, 123, 1), " +
          bgColor +
          ')'
      });
    });
  }

  public repaint() {
    this.toggle(this._isDarkMode);
  }

  private getDarkModeSetting() {
    let isDark = localStorage.getItem('_isDarkMode');

    if (isDark == 'true') {
      return true;
    } else {
      return false;
    }
  }

  private setDarkModeSetting(value: boolean) {
    localStorage.setItem('_isDarkMode', value === true ? 'true' : 'false');
  }
}