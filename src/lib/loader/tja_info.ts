import type { ChartDiff, ChartInfo } from '../chart/metadata';
import TJAParser from 'tja';

// NOTE: Ura onis seem to be registered as 'Edit' for some reason, so that has
// to be taken into account.

export async function loadTjaChartMetadata(diffFile: File): Promise<ChartInfo> {
  const chartText = await diffFile.text();
  const chart = TJAParser.parse(chartText);

  const diffs: ChartDiff[] = chart.courses.map(course => {
    const name =
      course.difficulty.toString() === 'Edit'
        ? 'Inner Oni'
        : course.difficulty.toString();

    return {
      name,
      file: diffFile,
      starRating: course.stars,
      isConvert: false,
    };
  });

  // Already sorted by difficulty by default, the order just needs to be
  // reversed.
  diffs.reverse();

  return {
    title: chart.title,
    artist: chart.subtitle || null,
    creator: null,
    type: 'tja',
    diffs,
  };
}
