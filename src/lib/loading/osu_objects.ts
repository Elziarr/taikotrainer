import { ChartObjects } from '../chart/ChartObjects';
import { DifficultyEvent, KiaiTimeEvent, TimingEvent } from '../chart/events';
import { Balloon, Drumroll, HitCircle } from '../chart/hitobjects';
import type { ChartDiff } from '../chart/metadata';
import { readFileAsArrayBuffer } from './file_util';
import {
  BeatmapDecoder,
  HittableObject,
  SlidableObject,
  SpinnableObject,
} from 'osu-parsers';

type DecodedBeatmap = ReturnType<BeatmapDecoder['decodeFromBuffer']>;

enum HitSound {
  None = 0,
  Normal = 1,
  Whistle = 2,
  Finish = 4,
  Clap = 8,
}

enum HitType {
  Normal = 1,
  Slider = 2,
  NewCombo = 4,
  Spinner = 8,
  ComboSkip1 = 16,
  ComboSkip2 = 32,
  ComboSkip3 = 64,
  ComboOffset = 112,
  Hold = 128,
}

const decoder = new BeatmapDecoder();

export async function parseOsuChartObjects(diff: ChartDiff) {
  const readDiff = await readFileAsArrayBuffer(diff.file);
  const beatmap = decoder.decodeFromBuffer(readDiff.data);

  return new ChartObjects({
    diff,
    hitObjects: getHitObjects(beatmap),
    difficultyEvents: getDifficultyEvents(beatmap),
    timingEvents: getTimingEvents(beatmap),
    kiaiTimeEvents: getKiaiTimeEvents(beatmap),
  });
}

function difficultyRange(od: number, min: number, mid: number, max: number) {
  const normOd = (od - 5) / 5;

  if (od > 5) {
    return mid + (max - mid) * normOd;
  }

  if (od < 5) {
    return mid + (mid - min) * normOd;
  }

  return mid;
}

function getBalloonHitCount(duration: number, od: number) {
  // Per https://github.com/ppy/osu/blob/b0e2462400251e4d576bf1d1958f2b329198c3c0/osu.Game.Rulesets.Taiko/Beatmaps/TaikoBeatmapConverter.cs#L156
  const hitMultiplier = difficultyRange(od, 3, 5, 7.5);
  return Math.floor(Math.max(1, (duration / 1000) * hitMultiplier * 1.65));
}

function getDifficultyEvents(beatmap: DecodedBeatmap) {
  const baseSV = beatmap.difficulty.sliderMultiplier;

  return [
    new DifficultyEvent(0, baseSV),
    ...beatmap.controlPoints.difficultyPoints.map(
      dp => new DifficultyEvent(dp.startTime, dp.sliderVelocity * baseSV),
    ),
  ];
}

function getHitObjects(beatmap: DecodedBeatmap) {
  return beatmap.hitObjects.map((ho, i) => {
    if (ho.hitType & HitType.Normal) {
      return processHitCircle(i, ho as HittableObject);
    }

    if (ho.hitType & HitType.Slider) {
      return processDrumroll(i, ho as SlidableObject);
    }

    if (ho.hitType & HitType.Spinner) {
      return processBalloon(
        i,
        ho as SpinnableObject,
        beatmap.difficulty.overallDifficulty,
      );
    }

    throw new Error('Encountered unknown hit object type.');
  });
}

function getKiaiTimeEvents(beatmap: DecodedBeatmap) {
  return beatmap.controlPoints.effectPoints.reduce((evts, ep) => {
    if (evts.length > 0 && evts.at(-1)!.kiai === ep.kiai) {
      return evts;
    }

    return evts.concat(new KiaiTimeEvent(ep.startTime, ep.kiai));
  }, [] as KiaiTimeEvent[]);
}

function getTimingEvents(beatmap: DecodedBeatmap) {
  return beatmap.controlPoints.timingPoints.map(
    tp => new TimingEvent(tp.startTime, tp.beatLength, tp.timeSignature),
  );
}

function processBalloon(i: number, ho: SpinnableObject, od: number) {
  const time = ho.startTime;
  const duration = ho.duration;
  const hitCount = getBalloonHitCount(ho.duration, od);

  return new Balloon(i, time, duration, hitCount);
}

function processDrumroll(i: number, ho: SlidableObject) {
  const time = ho.startTime;
  const duration = ho.duration;
  const isBig = Boolean(ho.hitSound & HitSound.Finish);

  return new Drumroll(i, time, duration, isBig);
}

function processHitCircle(i: number, ho: HittableObject) {
  const time = ho.startTime;
  const isKa = Boolean(
    ho.hitSound & HitSound.Whistle || ho.hitSound & HitSound.Clap,
  );
  const isBig = Boolean(ho.hitSound & HitSound.Finish);

  return new HitCircle(i, time, isKa, isBig);
}
