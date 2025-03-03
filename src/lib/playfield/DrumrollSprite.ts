import { Assets, Container, Sprite, TilingSprite } from 'pixi.js';

export class DrumrollSprite extends Container {
  head: Sprite;
  tail: TilingSprite;

  constructor() {
    super();

    this.head = new Sprite({ anchor: 0.5 });
    this.tail = new TilingSprite({ anchor: { x: 0, y: 0.5 } });

    this.addChild(this.tail, this.head);
    this.loadTexture();
  }

  private async loadTexture() {
    this.tail.texture = await Assets.load('drumroll_tail');
  }

  async setIsBig(isBig: boolean) {
    this.head.texture = await Assets.load(
      'drumroll_head' + (isBig ? '_big' : ''),
    );
    this.tail.height = this.head.height;
  }

  setLength(length: number) {
    this.tail.width = length;
  }
}
