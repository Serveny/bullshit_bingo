export class Confetti {
  private _el: JQuery<HTMLElement>;

  constructor(targetEl: JQuery<HTMLElement>) {
    this._el = targetEl;
  }

  start(value: number) {
    this._el.show();
    for (let i = 0; i < value; i++) {
      this.create(i);
    }
  }

  create(i: number) {
    let width = Math.random() * 40;
    let height = width * 0.4;
    let colourIdx = Math.ceil(Math.random() * 3);
    let colour = 'red';

    switch (colourIdx) {
      case 1:
        colour = 'orange';
        break;
      case 2:
        colour = 'cyan';
        break;
      case 3:
        colour = 'yellow';
      default:
        colour = 'red';
    }
    $('<div class="confetti-' + i + ' ' + colour + ' snip"></div>')
      .css({
        width: width + 'px',
        height: height + 'px',
        top: -Math.random() * 20 + '%',
        left: Math.random() * 100 + '%',
        opacity: Math.random() + 0.5,
        transform: 'rotate(' + Math.random() * 360 + 'deg)'
      })
      .appendTo(this._el);

    this.drop(i);
  }

  drop(x: number) {
    const _self = this;
    $('.confetti-' + x).animate(
      {
        top: '100%',
        left: '+=' + Math.random() * 15 + '%'
      },
      Math.random() * 3000 + 3000,
      function() {
        _self.reset(x);
      }
    );
  }

  reset(x: number) {
    const _self = this;
    $('.confetti-' + x).animate(
      {
        top: -Math.random() * 20 + '%',
        left: '-=' + Math.random() * 15 + '%'
      },
      0,
      function() {
        _self.drop(x);
      }
    );
  }
}