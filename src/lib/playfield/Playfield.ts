import type { ChartObjects } from '../chart/ChartObjects';
import type { GameInputType } from '../gameplay/input.svelte';
import type { HitObjectJudgement } from '../gameplay/judgements';
import { DrumAreaRenderer } from './DrumAreaRenderer';
import { HitObjectsRenderer } from './HitObjectsRenderer';
import { HitSectionRenderer } from './HitSectionRenderer';
import { LineRenderer } from './LineRenderer';
import { TrackRenderer } from './TrackRenderer';
import { URBar } from './URBar.svelte';
import { Assets, Container } from 'pixi.js';

export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 260;

const HIT_SECTION_MARGIN = 52;
const UR_BAR_Y_MARGIN = 15;

export class Playfield extends Container {
  private _drumArea = new DrumAreaRenderer();
  private _hitObjects = new HitObjectsRenderer();
  private _hitSection = new HitSectionRenderer();
  private _lines = new LineRenderer();
  private _track = new TrackRenderer();
  private _urBar = new URBar();

  constructor() {
    super();

    this.addChild(
      this._track,
      this._hitSection,
      this._lines,
      this._hitObjects,
      this._drumArea,
      this._urBar,
    );

    // Enclose in setTimeout() to wait for textures to load in children.
    setTimeout(async () => {
      const mainHeight = (await Assets.load('playfield_left')).height;
      this._track.height = mainHeight * 0.95;
      this._track.y = (mainHeight - this._track.height) / 2;

      this._hitSection.x =
        this._drumArea.width + this._hitSection.width / 2 + HIT_SECTION_MARGIN;
      this._hitSection.y = mainHeight / 2;

      this._hitObjects.setLeftMargin(this._hitSection.x);
      this._hitObjects.setPlayfieldHeight(mainHeight);
      this._hitObjects.height = 100;

      this._lines.y = this._track.y;
      this._lines.setLeftMargin(this._hitSection.x);
      this._lines.setPlayfieldHeight(this._track.height);
    }, 0);
  }

  displayDrumInput(type: GameInputType) {
    this._drumArea.displayInput(type);
  }

  displayHitDelta(dt: number) {
    this._urBar.displayHitDelta(dt);
  }

  resetJudgements() {
    this._urBar.resetJudgements();
  }

  updateChartObjects(newChartObjects: ChartObjects | null) {
    this._hitObjects.updateChartObjects(newChartObjects);
    this._lines.updateChartObjects(newChartObjects);
  }

  updateCheckpointTime(newCheckpointTime: number | null) {
    this._lines.updateCheckpointTime(newCheckpointTime);
  }

  updateColoredJudgements(newColoredJudgements: boolean) {
    this._hitSection.updateColoredJudgements(newColoredJudgements);
  }

  updateCombo(newCombo: number) {
    this._drumArea.updateCombo(newCombo);
  }

  updateConstantDensity(newConstantDensity: boolean) {
    this._hitObjects.updateConstantDensity(newConstantDensity);
    this._lines.updateConstantDensity(newConstantDensity);
  }

  updateCurrentJudgementIndex(newCurrentJudgementIndex: number) {
    this._hitSection.updateCurrentJudgementIndex(newCurrentJudgementIndex);
  }

  updateDensityMultiplier(newDensityMultiplier: number) {
    this._hitObjects.updateDensityMultiplier(newDensityMultiplier);
    this._lines.updateDensityMultiplier(newDensityMultiplier);
  }

  updateDuration(newDuration: number) {
    this._lines.updateDuration(newDuration);
  }

  updateGoodWindow(newGoodWindow: number) {
    this._urBar.updateGoodWindow(newGoodWindow);
  }

  updateGreatWindow(newGreatWindow: number) {
    this._urBar.updateGreatWindow(newGreatWindow);
  }

  updateJudgements(newJudgements: HitObjectJudgement[]) {
    this._hitObjects.updateJudgements(newJudgements);
    this._hitSection.updateJudgements(newJudgements);
  }

  updateTime(newTime: number) {
    this._hitObjects.updateTime(newTime);
    this._hitSection.updateTime(newTime);
    this._lines.updateTime(newTime);
  }

  updateWidth(newWidth: number) {
    this._urBar.x = newWidth / 2 - this._urBar.width / 2;
    this._urBar.y =
      this._drumArea.height + this._urBar.height / 2 + UR_BAR_Y_MARGIN;

    this._track.updateWidth(newWidth);
    this._hitObjects.updatePlayfieldWidth(newWidth);
    this._lines.updatePlayfieldWidth(newWidth);
  }
}
