import type { ChartObjects } from '../chart/ChartObjects';
import type { GameInputType } from '../gameplay/input.svelte';
import type { HitObjectJudgement } from '../gameplay/judgements';
import { DrumAreaRenderer } from './DrumAreaRenderer';
import { HitObjectsRenderer } from './HitObjectsRenderer';
import { HitSectionRenderer } from './HitSectionRenderer';
import { TrackRenderer } from './TrackRenderer';
import { Assets, Container } from 'pixi.js';

export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 250;

const HIT_SECTION_MARGIN = 120;

export class Playfield extends Container {
  private _drumArea = new DrumAreaRenderer();
  private _hitObjects = new HitObjectsRenderer();
  private _hitSection = new HitSectionRenderer();
  private _track = new TrackRenderer();

  constructor() {
    super();

    this.addChild(
      this._track,
      // this.lines,
      this._hitSection,
      this._hitObjects,
      this._drumArea,
    );

    // Enclose in setTimeout() to wait for textures to load in children.
    setTimeout(async () => {
      this._updatePositions();

      const mainHeight = (await Assets.load('playfield_left')).height;
      this._track.height = mainHeight;

      this._hitSection.x = this._drumArea.width + HIT_SECTION_MARGIN;
      this._hitSection.y = this._track.height / 2;

      this._hitObjects.setLeftMargin(this._hitSection.x);
      this._hitObjects.setPlayfieldHeight(mainHeight);
      this._hitObjects.height = 100;
    }, 0);
  }

  private _updatePositions() {}

  displayDrumInput(type: GameInputType) {
    this._drumArea.displayInput(type);
  }

  updateChartObjects(newChartObjects: ChartObjects | null) {
    this._hitObjects.updateChartObjects(newChartObjects);
  }

  updateCurrentJudgementIndex(newCurrentJudgementIndex: number) {
    this._hitSection.updateCurrentJudgementIndex(newCurrentJudgementIndex);
  }

  updateJudgements(newJudgements: HitObjectJudgement[]) {
    this._hitObjects.updateJudgements(newJudgements);
    this._hitSection.updateJudgements(newJudgements);
  }

  updateTime(newTime: number) {
    this._hitObjects.updateTime(newTime);
    this._hitSection.updateTime(newTime);
  }

  updateWidth(newWidth: number) {
    this._track.updateWidth(newWidth);
    this._hitObjects.updatePlayfieldWidth(newWidth);
  }
}
