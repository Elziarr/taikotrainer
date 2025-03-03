import { Assets, Container, Sprite } from 'pixi.js';

export class HitSectionRenderer extends Container {
  private _sprite = new Sprite({ anchor: 0.5 });

  constructor() {
    super();

    this.addChild(this._sprite);
    this._loadTextures();
  }

  private async _loadTextures() {
    this._sprite.texture = await Assets.load('hit_section');
  }
}
