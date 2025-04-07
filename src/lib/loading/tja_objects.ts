import type { ChartDiff } from '../chart/metadata';
import { TJACourseReader } from './TJACourseReader';
import TJAParser from 'tja';

export async function parseTjaChartObjects(diff: ChartDiff) {
  const chartText = await diff.file.text();
  const chart = TJAParser.parse(chartText);

  const course = chart.courses.find(
    course =>
      course.difficulty.toString() ===
      (diff.name === 'Inner Oni' ? 'Edit' : diff.name),
  )!;

  return new TJACourseReader(chart, course).read(diff);
}
