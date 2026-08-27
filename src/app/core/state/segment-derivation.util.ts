import { GanttDay, GanttSegment, SegmentActivity, StateSegment, ToolEvent, ToolState } from '../models/models';
import { BaseGanttRow, BaseGanttSegment } from '../../base';


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

/**
 * Row/segment data for a `base-gantt-timeline` view of task-level segment activities —
 * one row per distinct SegmentName (recipe step), one bar per occurrence, timestamped
 * on a real epoch-ms domain so the chart's drag-zoom and axis work down to the millisecond.
 */
export interface SegmentTimeline {
  rows: BaseGanttRow[];
  domainStart: number;
  domainSpan: number;
}

export function deriveSegmentTimeline(activities: SegmentActivity[]): SegmentTimeline {
  if (!activities.length) return { rows: [], domainStart: 0, domainSpan: 1 };

  const byName = new Map<string, BaseGanttSegment[]>();
  let minStart = Infinity;
  let maxEnd = -Infinity;

  for (const a of activities) {
    const start = new Date(a.eventStart).getTime();
    const end = Math.max(start + 1, new Date(a.eventEnd).getTime());
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;

    const segments = byName.get(a.SegmentName) ?? [];
    segments.push({
      startHour: start,
      endHour: end,
      state: isFailedActivity(a) ? 'unscheduled-dt' : 'production',
      label: isFailedActivity(a) ? 'Fail' : undefined
    });
    byName.set(a.SegmentName, segments);
  }

  const rows: BaseGanttRow[] = Array.from(byName.entries())
    .map(([label, segments]) => ({
      label,
      segments: segments.sort((x, y) => x.startHour - y.startHour)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { rows, domainStart: minStart, domainSpan: Math.max(1, maxEnd - minStart) };
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tick formatter for the segment timeline's axis — HH:MM:SS:mmm (matching the reference
 * design) once zoomed into a single day; a leading M/D date is prefixed whenever the
 * currently-visible window still spans more than a day, so ticks never look like they
 * run backwards just because time-of-day wrapped past midnight.
 */
export function formatSegmentTimelineTick(epochMs: number, visibleSpanMs = 0): string {
  const d = new Date(epochMs);
  const p = (n: number, len = 2) => String(n).padStart(len, '0');
  const time = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}:${p(d.getMilliseconds(), 3)}`;
  if (visibleSpanMs <= ONE_DAY_MS) return time;
  return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${time}`;
}

/** Duration formatter for the segment timeline's hover tooltip — span is in ms. */
export function formatSegmentDuration(spanMs: number): string {
  const totalSec = spanMs / 1000;
  if (totalSec < 60) return `${totalSec.toFixed(1)}s`;
  const min = Math.floor(totalSec / 60);
  const sec = Math.round(totalSec % 60);
  return `${min}m ${sec}s`;
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
