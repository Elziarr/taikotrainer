import { BASE_HEIGHT } from './Playfield';
import { Assets, TilingSprite } from 'pixi.js';

export class TrackRenderer extends TilingSprite {
  constructor() {
    super({ height: BASE_HEIGHT });

    this._loadTextures();
  }

  private async _loadTextures() {
    this.texture = await Assets.load('playfield_track');
  }

  updateWidth(newWidth: number) {
    // This apparently needs to be the case for the thing to render properly
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(newWidth)) + 1);
    this.width = nextPowerOf2 + 1;
  }
}
