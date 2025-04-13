import { Assets, Container, Sprite, TilingSprite } from 'pixi.js';

export class DrumrollSprite extends Container {
  head: Sprite;
  body: TilingSprite;
  tail: Sprite;

  constructor() {
    super();

    this.head = new Sprite({ anchor: 0.5 });
    this.body = new TilingSprite({ anchor: { x: 0, y: 0.5 } });
    this.tail = new Sprite({ anchor: { x: 0.5, y: 0.5 } });

    this.addChild(this.tail, this.body, this.head);
    this._loadTexture();
  }

  private async _loadTexture() {
    this.body.texture = await Assets.load('drumroll_body');
    this.tail.texture = await Assets.get('drumroll_tail');
  }

  async setIsBig(isBig: boolean) {
    this.head.texture = await Assets.load(
      'drumroll_head' + (isBig ? '_big' : ''),
    );
    this.body.height = this.head.height;
    this.tail.height = this.head.height;
  }

  setLength(length: number) {
    this.body.width = length;
    this.tail.x = length;
  }
}
