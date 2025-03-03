import type { ChartObjects } from '../chart/ChartObjects';
import {
  Balloon,
  Drumroll,
  HitCircle,
  type HitObject,
} from '../chart/hitobjects';
import { BalloonSprite } from './BalloonSprite';
import { DrumrollSprite } from './DrumrollSprite';
import { HitCircleSprite } from './HitObjectSprite';
import { BASE_HEIGHT, BASE_WIDTH } from './Playfield';
import { Container } from 'pixi.js';

/**
 * Start rendering objects this many pixels off the playfield's right edge.
 */
const APPEAR_RENDER_OFFSET = 100;

export class HitObjectsRenderer extends Container {
  private _chartObjects: ChartObjects | null = null;
  private _time: number = 0;

  private _leftMargin = 0;
  private _playfieldHeight = BASE_HEIGHT;
  private _playfieldWidth = BASE_WIDTH;

  private _hitObjectsByAppearTime: HitObject[] = [];
  private _latestStartIndex = 0;

  /**
   * The width from the hit section to the rightmost edge of the playfield.
   */
  private get _widthToHitSection() {
    return this._playfieldWidth - this._leftMargin;
  }

  /**
   * Returns the time that a hit object would start to appear on screen (i.e.
   * be rendered).
   * @param ho
   */
  private _getAppearTime(ho: HitObject) {
    const vel = this._getVelocity(ho.time);
    return ho.time - this._widthToHitSection / vel;
  }

  /**
   * Accounts for how the balloon should stay in place on the hit section for a
   * given time
   * @param ho
   */
  private _getBalloonXPos(ho: Balloon) {
    if (this._time < ho.time) {
      const dt = ho.time - this._time;
      return this._getVelocity(ho.time) * dt + this._leftMargin;
    }

    if (this._time >= ho.time && this._time < ho.endTime) {
      return this._leftMargin;
    }

    const dt = ho.endTime - this._time;
    return this._getVelocity(ho.time) * dt + this._leftMargin;
  }

  private _getSortedHitObjectsByAppearTime() {
    if (!this._chartObjects) {
      return [];
    }

    return this._chartObjects.hitObjects.toSorted((a, b) => {
      return this._getAppearTime(a) - this._getAppearTime(b);
    });
  }

  /**
   * Returns the hit object velocity at a given time.
   * @param time
   */
  private _getVelocity(time: number) {
    if (!this._chartObjects) {
      return 0;
    }

    return BASE_WIDTH * this._chartObjects.getVelocityFactor(time);
  }

  private _render() {
    this.removeChildren();

    if (!this._chartObjects) {
      return;
    }

    // Distinguish appear time index and hit time index.
    for (
      let appearI = this._latestStartIndex;
      appearI < this._hitObjectsByAppearTime.length;
      appearI++
    ) {
      const ho = this._hitObjectsByAppearTime[appearI];
      let outOfRightmostBounds = false;

      if (ho instanceof HitCircle) {
        outOfRightmostBounds = this._renderHitCircle(ho, appearI);
      } else if (ho instanceof Drumroll) {
        outOfRightmostBounds = this._renderDrumroll(ho, appearI);
      } else if (ho instanceof Balloon) {
        outOfRightmostBounds = this._renderBalloon(ho, appearI);
      }

      if (outOfRightmostBounds) {
        break;
      }
    }
  }

  private _renderBalloon(ho: Balloon, appearI: number) {
    const xPos = this._getBalloonXPos(ho);

    if (xPos < 0) {
      this._updateLatestStartIndex(appearI);
      return false;
    }

    if (xPos > this._playfieldWidth + APPEAR_RENDER_OFFSET) {
      return true;
    }

    const sprite = new BalloonSprite();
    sprite.x = xPos;
    sprite.y = this._playfieldHeight / 2;

    this.addChild(sprite);
    return false;
  }

  private _renderDrumroll(ho: Drumroll, appearI: number) {
    const headXPos =
      this._getVelocity(ho.time) * (ho.time - this._time) + this._leftMargin;
    const tailXPos =
      this._getVelocity(ho.time) * (ho.endTime - this._time) + this._leftMargin;

    if (tailXPos < 0) {
      this._updateLatestStartIndex(appearI);
      return false;
    }

    if (headXPos > this._playfieldWidth + APPEAR_RENDER_OFFSET) {
      return true;
    }

    const sprite = new DrumrollSprite();
    sprite.x = headXPos;
    sprite.y = this._playfieldHeight / 2;
    sprite.setLength(this._getVelocity(ho.time) * ho.duration);
    sprite.setIsBig(ho.isBig);

    this.addChild(sprite);
    return false;
  }

  private _renderHitCircle(ho: HitCircle, appearI: number) {
    const dt = ho.time - this._time;
    const defaultXPos = this._getVelocity(ho.time) * dt + this._leftMargin;

    if (defaultXPos < 0) {
      this._updateLatestStartIndex(appearI);
      return false;
    }

    if (defaultXPos > this._playfieldWidth + APPEAR_RENDER_OFFSET) {
      return true;
    }

    const sprite = new HitCircleSprite();
    sprite.zIndex = -Math.floor(ho.time);
    sprite.setType(ho.isKa, ho.isBig);

    sprite.x = defaultXPos;
    sprite.y = this._playfieldHeight / 2;

    this.addChild(sprite);
    return false;
  }

  private _updateLatestStartIndex(i: number) {
    if (i - this._latestStartIndex === 1) {
      this._latestStartIndex += 1;
    }
  }

  setLeftMargin(leftMargin: number) {
    this._leftMargin = leftMargin;
  }

  setPlayfieldHeight(height: number) {
    this._playfieldHeight = height;
  }

  updateChartObjects(newChartObjects: ChartObjects | null) {
    this._chartObjects = newChartObjects;

    this._hitObjectsByAppearTime = this._getSortedHitObjectsByAppearTime();
    this._latestStartIndex = 0;

    this._render();
  }

  updateTime(newTime: number) {
    // Consider passed/already done hit objects when rewinding.
    if (newTime < this._time) {
      this._latestStartIndex = 0;
    }

    this._time = newTime;

    this._render();
  }

  updatePlayfieldWidth(newWidth: number) {
    this._playfieldWidth = newWidth;
  }
}
