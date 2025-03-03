import { Assets, Sprite } from 'pixi.js';

export class BalloonSprite extends Sprite {
  constructor() {
    super({
      anchor: 0.5,
    });

    this.loadTexture();
  }

  private async loadTexture() {
    this.texture = await Assets.load('balloon');
  }
}
