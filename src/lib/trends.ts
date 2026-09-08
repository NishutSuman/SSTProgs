// ILLUSTRATIVE trend data for the Trends page ONLY.
// These prior-week points are dummy sample data for the demo and are NOT used anywhere
// in the real cohort computation or analytics. The latest "This week" point is replaced
// with the real current numbers at render time. Real history will accumulate as each
// weekly sheet sync is captured (see server/sync.ts snapshotting, future).

export interface TrendPoint {
  week: string;
  red: number;
  amber: number;
  green: number;
  avgAtt: number;
  avgGrade: number;
}

const SEEDED_PRIOR_WEEKS: TrendPoint[] = [
  { week: "Wk 1", red: 58, amber: 84, green: 157, avgAtt: 63.1, avgGrade: 57.2 },
  { week: "Wk 2", red: 52, amber: 88, green: 159, avgAtt: 64.8, avgGrade: 58.6 },
  { week: "Wk 3", red: 47, amber: 90, green: 162, avgAtt: 66.3, avgGrade: 59.5 },
  { week: "Wk 4", red: 43, amber: 92, green: 164, avgAtt: 67.9, avgGrade: 60.4 },
  { week: "Wk 5", red: 40, amber: 91, green: 168, avgAtt: 68.5, avgGrade: 61.0 },
];

/** Prior weeks are illustrative; the final point is the real current cohort. */
export function buildTrend(current: { red: number; amber: number; green: number; avgAtt: number; avgGrade: number }): TrendPoint[] {
  return [...SEEDED_PRIOR_WEEKS, { week: "This week", ...current }];
}
