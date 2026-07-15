import { GanttDay, GanttSegment, SegmentActivity, StateSegment, ToolEvent, ToolState } from '../models/models';

/**
 * The Activity Gantt bars and the Event Details rows are both derived
 * from the same raw StateSegment[] feed (getAllStateSegments) rather
 * than being separately mocked/fetched — a single source of truth.
 * Production windows are further enriched from the correlated
 * SegmentActivity[] feed (getSegmentActivities) when available.
 */

const STATE_NAME_MAP: Record<string, ToolState> = {
  production: 'Production',
  engineering: 'Engineering',
  standby: 'Standby',
  'scheduled downtime': 'Scheduled Downtime',
  'unscheduled downtime': 'Unscheduled Downtime',
  gap: 'Gap'
};

function mapStateName(raw: string): ToolState {
  return STATE_NAME_MAP[raw.toLowerCase()] ?? 'Gap';
}

function fmtHms(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function activitiesWithin(activities: SegmentActivity[], seg: StateSegment): SegmentActivity[] {
  return activities.filter(a => a.eventStart >= seg.start && a.eventStart < seg.end);
}

function isFailedActivity(a: SegmentActivity): boolean {
  return String(a.params['Error Code'] ?? '0x0') !== '0x0';
}

function activityDetail(matches: SegmentActivity[]): string | undefined {
  if (!matches.length) return undefined;
  const failed = matches.find(isFailedActivity);
  return failed
    ? `${failed.SegmentName} · Fail (${failed.params['Error Code']})`
    : `${matches[0].SegmentName} · Pass`;
}

function toGanttSegments(segments: StateSegment[], activities: SegmentActivity[]): GanttSegment[] {
  return segments
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start))
    .map(s => {
      const start = new Date(s.start);
      const startHour = Math.round((start.getHours() + start.getMinutes() / 60) * 100) / 100;
      const endHour = Math.round(Math.min(24, startHour + s.segmentDurationHrs) * 100) / 100;
      const matches = mapStateName(s.stateName) === 'Production' ? activitiesWithin(activities, s) : [];
      const hasFailure = matches.some(isFailedActivity);
      return {
        state: mapStateName(s.stateName),
        startHour,
        endHour,
        label: s.segmentDurationHrs >= 1 ? `${s.segmentDurationHrs.toFixed(1)}h${hasFailure ? ' ⚠' : ''}` : undefined,
        detail: activityDetail(matches)
      };
    });
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function deriveGantt(segments: StateSegment[], activities: SegmentActivity[] = []): GanttDay[] {
  const byDate = new Map<string, { day: Date; sys: StateSegment[]; tool: StateSegment[] }>();
  for (const s of segments) {
    const start = new Date(s.start);
    const dateKey = `${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const bucket = byDate.get(dateKey) ?? { day: start, sys: [], tool: [] };
    (s.sourceName === 'system' ? bucket.sys : bucket.tool).push(s);
    byDate.set(dateKey, bucket);
  }

  const days: GanttDay[] = Array.from(byDate.entries()).map(([dateKey, { day, sys, tool }]) => {
    const sysRow = toGanttSegments(sys, activities);
    const downtimeHrs = sysRow
      .filter(g => g.state === 'Scheduled Downtime' || g.state === 'Unscheduled Downtime')
      .reduce((sum, g) => sum + (g.endHour - g.startHour), 0);
    return {
      day: DAY_NAMES[day.getDay()],
      date: dateKey,
      availabilityPct: Math.round(Math.max(0, 100 - (downtimeHrs / 24) * 100)),
      downtimeHrs: Math.round(downtimeHrs * 100) / 100,
      sysRow,
      toolRow: toGanttSegments(tool, activities)
    };
  });

  return days.sort((a, b) => b.date.localeCompare(a.date));
}

export function deriveGanttSummary(gantt: GanttDay[]): { avgProductionPct: number; totalDowntimeHrs: number } {
  if (!gantt.length) return { avgProductionPct: 0, totalDowntimeHrs: 0 };
  const totalDowntimeHrs = Math.round(gantt.reduce((sum, d) => sum + d.downtimeHrs, 0) * 10) / 10;
  const avgProductionPct = Math.round((gantt.reduce((sum, d) => sum + d.availabilityPct, 0) / gantt.length) * 10) / 10;
  return { avgProductionPct, totalDowntimeHrs };
}

export function deriveEvents(segments: StateSegment[], activities: SegmentActivity[] = []): ToolEvent[] {
  return segments
    .slice()
    .sort((a, b) => b.start.localeCompare(a.start))
    .map(s => {
      const start = new Date(s.start);
      const end = new Date(s.end);
      const state = mapStateName(s.stateName);
      const matches = state === 'Production' ? activitiesWithin(activities, s) : [];
      return {
        id: s.segmentId,
        date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
        startTime: fmtHms(start),
        endTime: fmtHms(end),
        durationHrs: s.segmentDurationHrs,
        source: s.sourceName === 'system' ? 'Auto' : 'Manual',
        state,
        details: activityDetail(matches) ?? (state === 'Production' ? 'JobStatus: Pass' : '')
      };
    });
}
