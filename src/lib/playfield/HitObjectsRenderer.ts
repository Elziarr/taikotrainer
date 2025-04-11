import type { ChartObjects } from '../chart/ChartObjects';
import {
  Balloon,
  Drumroll,
  HitCircle,
  type HitObject,
} from '../chart/hitobjects';
import type {
  BalloonJudgement,
  DrumrollJudgement,
  HitCircleJudgement,
  HitObjectJudgement,
} from '../gameplay/judgements';
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
  private _judgements: HitObjectJudgement[] = [];
  private _time: number = 0;

  private _leftMargin = 0;
  private _playfieldHeight = BASE_HEIGHT;
  private _playfieldWidth = BASE_WIDTH;

  private _hitObjectsByAppearTime: HitObject[] = [];
  private _latestStartIndex = 0;

  private _constantDensity = false;
  private _densityMultiplier = 1;

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

    return (
      BASE_WIDTH *
      this._chartObjects.getVelocityFactor(this._constantDensity ? 0 : time) *
      this._densityMultiplier
    );
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

    const record = this._judgements[ho.index] as BalloonJudgement;

    if (record && record.inputs.length === record.targetCount) {
      const dt = this._time - record.inputs.at(-1)!.time;

      sprite.scale = 0.03 * dt;
      sprite.alpha = 1 - Math.min(1, 0.006 * dt);
    }

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

    const record = this._judgements[ho.index] as DrumrollJudgement;

    for (const input of record.inputs) {
      const hitSprite = new HitCircleSprite();
      hitSprite.setType(
        input.type === 'left_ka' || input.type === 'right_ka',
        ho.isBig,
      );

      hitSprite.x = -1 * (input.time - this._time) + this._leftMargin;
      hitSprite.y = 1 * (input.time - this._time) + this._playfieldHeight / 2;
      hitSprite.alpha = 0.008 * (input.time - this._time) + 1;

      this.addChild(hitSprite);
    }

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

    const record = this._judgements[ho.index] as HitCircleJudgement;

    if (
      record &&
      record.input !== null &&
      record.judgement !== 'late_miss' &&
      record.judgement !== 'early_miss'
    ) {
      const xPos =
        this._getVelocity(ho.time) * (ho.time - record.input.time) +
        this._leftMargin;

      sprite.x = xPos + (this._time - record.input.time);
      sprite.y = this._playfieldHeight / 2 - (this._time - record.input.time);
      sprite.alpha = 0.008 * (record.input.time - this._time) + 1;
    } else if (
      record &&
      (record.input === null || record.judgement === 'late_miss')
    ) {
      sprite.x = defaultXPos;
      sprite.y = this._playfieldHeight / 2;
    }

    this.addChild(sprite);
    return false;
  }

  private _updateLatestStartIndex(i: number) {
    if (i - this._latestStartIndex === 1) {
      this._latestStartIndex += 1;
    }
  }

  updateChartObjects(newChartObjects: ChartObjects | null) {
    this._chartObjects = newChartObjects;

    this._hitObjectsByAppearTime = this._getSortedHitObjectsByAppearTime();
    this._latestStartIndex = 0;

    this._render();
  }

  updateConstantDensity(newConstantDensity: boolean) {
    this._constantDensity = newConstantDensity;

    this._hitObjectsByAppearTime = this._getSortedHitObjectsByAppearTime();
    this._render();
  }

  updateDensityMultiplier(newDensityMultiplier: number) {
    this._densityMultiplier = newDensityMultiplier;

    this._hitObjectsByAppearTime = this._getSortedHitObjectsByAppearTime();
    this._render();
  }

  updateJudgements(newJudgements: HitObjectJudgement[]) {
    this._judgements = newJudgements;
  }

  setLeftMargin(leftMargin: number) {
    this._leftMargin = leftMargin;
  }

  setPlayfieldHeight(height: number) {
    this._playfieldHeight = height;
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
    this._render();
  }
}
