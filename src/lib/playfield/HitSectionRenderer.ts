import {
  HitCircleJudgement,
  type HitObjectJudgement,
} from '../gameplay/judgements';
import { Assets, Container, Graphics, Sprite } from 'pixi.js';

export class HitSectionRenderer extends Container {
  private _currentJudgementIndex = 0;
  private _judgements: HitObjectJudgement[] = [];
  private _time = 0;

  private _toggleJudgementFlash = false;

  private _mainSprite = new Sprite({ anchor: 0.5 });
  private _judgementBurst = new Graphics({ scale: 0 })
    .circle(0, 0, 75)
    .fill('white');

  constructor() {
    super();

    this.addChild(this._mainSprite, this._judgementBurst);
    this._loadTextures();
  }

  private async _loadTextures() {
    this._mainSprite.texture = await Assets.load('hit_section');
  }

  private _render() {
    const record =
      this._judgements[Math.max(0, this._currentJudgementIndex - 1)];

    if (!(record instanceof HitCircleJudgement) || !record.input) {
      this._judgementBurst.alpha = 0;
      this._judgementBurst.scale = 0;
      return;
    }

    // TODO: Finalize animation timing
    const dt = this._time - record.input.time;
    this._judgementBurst.alpha = 1 - Math.min(1, dt / 80);
    this._judgementBurst.scale = Math.min(1.15, dt / 75 + 0.5);

    if (record.judgement === 'great') {
      this._judgementBurst.tint = 'yellow';
    } else if (record.judgement === 'good') {
      if (this._toggleJudgementFlash) {
        if (record.hitDelta! > 0) {
          this._judgementBurst.tint = 'lightgreen';
        } else {
          this._judgementBurst.tint = 'orange';
        }
      } else {
        this._judgementBurst.tint = 'white';
      }
    } else {
      this._judgementBurst.tint = 'red';
    }
  }

  updateColoredJudgements(newColoredJudgements: boolean) {
    this._toggleJudgementFlash = newColoredJudgements;
  }

  updateCurrentJudgementIndex(newCurrentJudgementIndex: number) {
    this._currentJudgementIndex = newCurrentJudgementIndex;
  }
  updateJudgements(newJudgements: HitObjectJudgement[]) {
    this._judgements = newJudgements;
  }

  updateTime(newTime: number) {
    this._time = newTime;
    this._render();
  }
}
