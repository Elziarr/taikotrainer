import type { ChartDiff } from '../chart/metadata';
import { getFileExtension } from '../files';
import { loadOsuChartMetadata } from './osu_info';
import { parseOsuChartObjects } from './osu_objects';
import { loadTjaChartMetadata } from './tja_info';
import { parseTjaChartObjects } from './tja_objects';

export async function loadChartMetadata(diffFiles: File[]) {
  const type = getFileExtension(diffFiles[0]);

  if (type === 'osu') {
    return await loadOsuChartMetadata(diffFiles);
  } else if (type === 'tja') {
    return await loadTjaChartMetadata(diffFiles[0]);
  }

  throw new Error('Invalid chart files.');
}

export async function loadChartObjects(diff: ChartDiff) {
  const type = getFileExtension(diff.file);

  if (type === 'osu') {
    return await parseOsuChartObjects(diff);
  } else if (type === 'tja') {
    return await parseTjaChartObjects(diff);
  }

  throw new Error('Invalid chart files.');
}
