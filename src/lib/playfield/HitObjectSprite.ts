import { Assets, Sprite } from 'pixi.js';

export class HitCircleSprite extends Sprite {
  constructor() {
    super({
      anchor: 0.5,
    });
  }

  setType(isKa: boolean, isBig: boolean) {
    if (isKa) {
      this.texture = Assets.get('hitcircle_ka' + (isBig ? '_big' : ''));
    } else {
      this.texture = Assets.get('hitcircle_don' + (isBig ? '_big' : ''));
    }
  }
}
