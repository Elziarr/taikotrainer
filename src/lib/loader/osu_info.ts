import {
  type ChartMetadata,
  type ChartDiff,
  type ChartInfo,
} from '../chart/metadata';
import { readFileAsArrayBuffer } from '../files';
import { BeatmapDecoder } from 'osu-parsers';
// @ts-expect-error Complains about no index.d.ts even though there is one...
import { TaikoRuleset } from 'osu-taiko-stable';

const decoder = new BeatmapDecoder();

export async function loadOsuChartMetadata(
  diffFiles: File[],
): Promise<ChartInfo | null> {
  const { title, artist, creator, type } = await parseOsuBeatmapMetadata(
    diffFiles[0],
  );
  const diffs = await parseOsuBeatmapDiffs(diffFiles);

  if (diffs.length === 0) {
    return null;
  }

  return {
    title,
    artist,
    creator,
    type,
    diffs,
  };
}

async function parseOsuBeatmapMetadata(diffFile: File): Promise<ChartMetadata> {
  const readDiff = await readFileAsArrayBuffer(diffFile);

  const diff = decoder.decodeFromBuffer(readDiff.data, {
    parseGeneral: false,
    parseEditor: false,
    parseMetadata: true,
    parseDifficulty: false,
    parseEvents: false,
    parseTimingPoints: false,
    parseHitObjects: false,
    parseStoryboard: false,
    parseColours: false,
  });

  return {
    title: diff.metadata.title,
    artist: diff.metadata.artist,
    creator: diff.metadata.creator,
    type: 'osu',
  };
}

async function parseOsuBeatmapDiffs(diffFiles: File[]): Promise<ChartDiff[]> {
  const diffMetadata = (
    await Promise.all(
      diffFiles.map(async diffFile => {
        const readDiff = await readFileAsArrayBuffer(diffFile);

        const diff = decoder.decodeFromBuffer(readDiff.data);

        // TODO: Library isn't updated so star rating is not 100% accurate.
        const ruleset = new TaikoRuleset();
        const difficultyCalculator = ruleset.createDifficultyCalculator(diff);
        const { starRating } = difficultyCalculator.calculate();

        if (diff.mode !== 0 && diff.mode !== 1) {
          return null;
        }

        return {
          name: diff.metadata.version,
          file: diffFile,
          isConvert: diff.mode === 0,
          starRating,
        };
      }, []),
    )
  ).filter(diff => diff !== null);

  diffMetadata.sort((a, b) => {
    if (a.isConvert === b.isConvert) {
      return a.starRating - b.starRating;
    }
    return a.isConvert ? 1 : -1;
  });

  return diffMetadata;
}
