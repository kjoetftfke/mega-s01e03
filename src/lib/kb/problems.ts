// The problems inside a merged ticket, counted the way the desk's own view counts them
// (CauseTable): each report filed under its cause by tenant, and the reports the desk read as a
// one-day move (desk-notes.json) counted again as their own problem, footnoted under the cause
// they are filed in. This file is what runs; the #4471 problems page explains it.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For a problem counted inside another: where its reports are filed.
  filedUnder?: Problem;
};

function row(problem: Problem, rs: Report[], filedUnder?: Problem): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    filedUnder,
  };
}

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; reports: Report[]; problems: ProblemRow[] } {
  const merged = reports.filter((r) => r.mergedInto === ticket);
  const unique = uniqueById(merged);
  const groups = groupByCause(unique, tenantOf);
  const problems = groups.map((g) => row(g.cause, g.reports));
  for (const g of groups) {
    if (readAs(g, oneDayMove)) {
      problems.push(row('one-day-move', g.reports.filter((r) => oneDayMove.includes(r.id)), g.cause));
    }
  }
  return { rows: merged.length, reports: unique, problems };
}
