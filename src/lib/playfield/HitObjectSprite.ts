import { Assets, Sprite } from 'pixi.js';

export class HitCircleSprite extends Sprite {
  constructor() {
    super({
      anchor: 0.5,
    });
  }

  async setType(isKa: boolean, isBig: boolean) {
    if (isKa) {
      this.texture = await Assets.load('hitcircle_ka' + (isBig ? '_big' : ''));
    } else {
      this.texture = await Assets.load('hitcircle_don' + (isBig ? '_big' : ''));
    }
  }
}
