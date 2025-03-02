import type { ChartDiff, ChartInfo } from '../chart/metadata';
import type { ChartFiles } from './uploading';
import TJAParser from 'tja';

// NOTE: Ura onis seem to be registered as 'Edit' for some reason, so that has
// to be taken into account.

export async function loadTjaChartMetadata(
  chartFiles: ChartFiles,
): Promise<ChartInfo> {
  const chartText = await chartFiles.diffs[0].text();
  const chart = TJAParser.parse(chartText);

  const diffs: ChartDiff[] = chart.courses.map(course => {
    const name =
      course.difficulty.toString() === 'Edit'
        ? 'Inner Oni'
        : course.difficulty.toString();

    return {
      name,
      file: chartFiles.diffs[0],
      starRating: course.stars,
      isConvert: false,
    };
  });

  // Already sorted by difficulty by default, the order just needs to be
  // reversed.
  diffs.reverse();

  return {
    audioFile: chartFiles.audio,
    title: chart.title,
    artist: chart.subtitle || null,
    creator: null,
    type: 'tja',
    diffs,
  };
}
