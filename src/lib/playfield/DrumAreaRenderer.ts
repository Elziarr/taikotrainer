import type { GameInputType } from '../gameplay/input.svelte';
import { Assets, BitmapText, Container, Sprite } from 'pixi.js';

const INPUT_DISPLAY_DURATION = 100;

export class DrumAreaRenderer extends Container {
  private _background = new Sprite();
  private _drumBody = new Sprite({ anchor: 0.5 });
  private _leftKa = new Sprite({ anchor: 0.5, alpha: 0 });
  private _leftDon = new Sprite({ anchor: 0.5, alpha: 0 });
  private _rightDon = new Sprite({ anchor: 0.5, alpha: 0 });
  private _rightKa = new Sprite({ anchor: 0.5, alpha: 0 });
  private _comboText = new BitmapText({
    anchor: 0.5,
    style: { fontFamily: 'Sour Gummy', fontSize: 30, fill: 0x333333 },
  });

  constructor() {
    super();

    this.addChild(
      this._background,
      this._drumBody,
      this._leftKa,
      this._leftDon,
      this._rightDon,
      this._rightKa,
      this._comboText,
    );
    this._loadTextures();

    const centerX = this._background.width / 2;
    const centerY = this._background.height / 2;
    this._drumBody.position.set(centerX, centerY);
    this._leftKa.position.set(centerX, centerY);
    this._leftDon.position.set(centerX, centerY);
    this._rightDon.position.set(centerX, centerY);
    this._rightKa.position.set(centerX, centerY);
    this._comboText.position.set(centerX, centerY);
  }

  private _loadTextures() {
    this._background.texture = Assets.get('playfield_left');

    this._drumBody.texture = Assets.get('drum');

    this._leftKa.texture = Assets.get('drum_left_ka');
    this._rightKa.texture = Assets.get('drum_left_ka');
    this._rightKa.scale.x = -1;

    this._leftDon.texture = Assets.get('drum_left_don');
    this._rightDon.texture = Assets.get('drum_left_don');
    this._rightDon.scale.x = -1;
  }

  displayInput(type: GameInputType) {
    switch (type) {
      case 'left_ka':
        this._leftKa.alpha = 1;
        setTimeout(() => (this._leftKa.alpha = 0), INPUT_DISPLAY_DURATION);
        break;

      case 'left_don':
        this._leftDon.alpha = 1;
        setTimeout(() => (this._leftDon.alpha = 0), INPUT_DISPLAY_DURATION);
        break;

      case 'right_don':
        this._rightDon.alpha = 1;
        setTimeout(() => (this._rightDon.alpha = 0), INPUT_DISPLAY_DURATION);
        break;

      case 'right_ka':
        this._rightKa.alpha = 1;
        setTimeout(() => (this._rightKa.alpha = 0), INPUT_DISPLAY_DURATION);
        break;
    }
  }

  updateCombo(combo: number) {
    this._comboText.text = combo;
  }
}
