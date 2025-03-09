import type { GameInputType } from '../gameplay/input.svelte';
import { Assets, BitmapText, Container, Sprite } from 'pixi.js';
import { Ticker } from 'pixi.js';

const DRUM_HIT_FADE_VEL = 0.004;

export class DrumAreaRenderer extends Container {
  private _background = new Sprite();
  private _drumBody = new Sprite({ anchor: 0.5 });
  private _leftKa = new Sprite({ anchor: 0.5, alpha: 0 });
  private _leftDon = new Sprite({ anchor: 0.5, alpha: 0 });
  private _rightDon = new Sprite({ anchor: 0.5, alpha: 0 });
  private _rightKa = new Sprite({ anchor: 0.5, alpha: 0 });
  private _comboText = new BitmapText({
    anchor: 0.5,
    style: { fontFamily: 'Sour Gummy', fontSize: 30, fill: 0x000000 },
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

    // Workaround; can't await font loading via pixi's loader for some reason
    document.fonts.onloadingdone = () => {
      this._comboText.text = '0';
    };

    Ticker.shared.add(this._loop);
    Ticker.shared.start();
  }

  private _loadTextures() {
    this._background.texture = Assets.get('playfield_left');

    this._drumBody.texture = Assets.get('drum');
    this._leftKa.texture = Assets.get('drum_left_ka');
    this._leftDon.texture = Assets.get('drum_left_don');
    this._rightDon.texture = Assets.get('drum_right_don');
    this._rightKa.texture = Assets.get('drum_right_ka');
  }

  private _loop = () => {
    const dt = Ticker.shared.deltaMS;

    this._leftKa.alpha = Math.max(
      0,
      this._leftKa.alpha - DRUM_HIT_FADE_VEL * dt,
    );
    this._leftDon.alpha = Math.max(
      0,
      this._leftDon.alpha - DRUM_HIT_FADE_VEL * dt,
    );
    this._rightDon.alpha = Math.max(
      0,
      this._rightDon.alpha - DRUM_HIT_FADE_VEL * dt,
    );
    this._rightKa.alpha = Math.max(
      0,
      this._rightKa.alpha - DRUM_HIT_FADE_VEL * dt,
    );
  };

  displayInput(type: GameInputType) {
    switch (type) {
      case 'left_ka':
        this._leftKa.alpha = 1;
        break;

      case 'left_don':
        this._leftDon.alpha = 1;
        break;

      case 'right_don':
        this._rightDon.alpha = 1;
        break;

      case 'right_ka':
        this._rightKa.alpha = 1;
        break;
    }
  }

  updateCombo(combo: number) {
    this._comboText.text = combo;
  }
}
