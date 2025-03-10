import { Container, Graphics, GraphicsContext, Ticker } from 'pixi.js';

const AVG_INDICATOR_COLOR = 0xffffff;
const AVG_INDICATOR_MARGIN = 15;
const AVG_INDICATOR_HEIGHT = 20;
const AVG_INDICATOR_WIDTH = 15;
const BAR_HEIGHT = 12;
const BAR_WIDTH = 570;
const GREAT_BAR_COLOR = 0x0000ff;
const INDICATOR_LERP_FACTOR = 0.007;
const JUDGEMENT_LINE_HEIGHT = BAR_HEIGHT * 2;
const MIDDLE_LINE_COLOR = 0xffffff;
const MIDDLE_LINE_HEIGHT = BAR_HEIGHT * 2.5;
const OK_BAR_COLOR = 0x00ff00;
const USE_COUNT = 15;

const JUDGEMENT_LINE_CTX = new GraphicsContext()
  .lineTo(0, JUDGEMENT_LINE_HEIGHT)
  .stroke({
    color: MIDDLE_LINE_COLOR,
    width: 2,
  });

export class URBar extends Container {
  private _goodWindow = 75;
  private _greatWindow = 25;
  private _lastHitDelta = 0;

  private _okBar = new Graphics().rect(0, 0, 1, BAR_HEIGHT).fill(OK_BAR_COLOR);
  private _greatBar = new Graphics()
    .rect(0, 0, 1, BAR_HEIGHT)
    .fill(GREAT_BAR_COLOR);

  private _judgementLines = new Container();

  private _middleLine = new Graphics({
    x: BAR_WIDTH / 2,
    y: BAR_HEIGHT / 2 - MIDDLE_LINE_HEIGHT / 2,
  })
    .lineTo(0, MIDDLE_LINE_HEIGHT)
    .stroke({
      color: MIDDLE_LINE_COLOR,
      width: 2,
    });
  private _latestIndicator = new Graphics({
    x: BAR_WIDTH / 2,
    y: -AVG_INDICATOR_MARGIN,
  })
    .lineTo(-AVG_INDICATOR_WIDTH / 2, -AVG_INDICATOR_HEIGHT)
    .lineTo(AVG_INDICATOR_WIDTH / 2, -AVG_INDICATOR_HEIGHT)
    .lineTo(0, 0)
    .fill(AVG_INDICATOR_COLOR);

  constructor() {
    super();

    this._scaleBars();

    this.addChild(
      this._okBar,
      this._greatBar,
      this._judgementLines,
      this._middleLine,
      this._latestIndicator,
    );

    Ticker.shared.add(this._loop);
    Ticker.shared.start();
  }

  private _getXByDelta(dt: number) {
    return BAR_WIDTH / 2 + (dt / this._goodWindow) * (BAR_WIDTH / 2);
  }

  private _loop = () => {
    const dt = Ticker.shared.deltaMS;

    const nextX = this._getXByDelta(this._lastHitDelta);
    this._latestIndicator.x +=
      (nextX - this._latestIndicator.x) * dt * INDICATOR_LERP_FACTOR;
  };

  private _scaleBars() {
    this._okBar.width = BAR_WIDTH;
    this._greatBar.width = (BAR_WIDTH * this._greatWindow) / this._goodWindow;
    this._greatBar.x = BAR_WIDTH / 2 - this._greatBar.width / 2;
  }

  displayHitDelta(dt: number) {
    if (this._judgementLines.children.length >= USE_COUNT) {
      this._judgementLines.removeChildAt(0);
    }

    const judgementLine = new Graphics({
      context: JUDGEMENT_LINE_CTX,
      x: this._getXByDelta(dt),
      y: BAR_HEIGHT / 2 - JUDGEMENT_LINE_HEIGHT / 2,
    });

    this._judgementLines.addChild(judgementLine);
    this._lastHitDelta = dt;
  }

  resetJudgements() {
    this._judgementLines.removeChildren();
    this._lastHitDelta = 0;
  }

  updateGoodWindow(newGoodWindow: number) {
    this._goodWindow = newGoodWindow;
    this._scaleBars();
  }

  updateGreatWindow(newGreatWindow: number) {
    this._greatWindow = newGreatWindow;
    this._scaleBars();
  }
}
