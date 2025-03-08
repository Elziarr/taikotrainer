import type { GameInput } from './input.svelte';

export type Judgement = 'great' | 'good' | 'early_miss' | 'late_miss';
export type HitObjectJudgement =
  | BalloonJudgement
  | DrumrollJudgement
  | HitCircleJudgement;

export class BalloonJudgement {
  inputs: GameInput[] = [];
  targetCount: number;

  constructor(targetCount: number) {
    this.targetCount = targetCount;
  }
}

export class DrumrollJudgement {
  inputs: GameInput[] = [];
}

export class HitCircleJudgement {
  input: GameInput | null = null;
  judgement: Judgement | null = null;
  hitBigCorrectly: boolean = false;

  hitDelta: number | null = null;
}
