export type ToolState =
  | 'Production'
  | 'Engineering'
  | 'Standby'
  | 'Scheduled Downtime'
  | 'Unscheduled Downtime'
  | 'Non-Scheduled'
  | 'Gap';

export type AlarmCategory =
  | 'Equipment Safety'
  | 'Attention Flags'
  | 'Data Integrity'
  | 'Irrecoverable';

export type Severity = 'Fatal' | 'Non-Fatal';

export interface GlobalFilters {
  fleet: string;
  dateFrom: string; // yyyy/MM/dd
  dateTo: string;
  duration: 'Last 4 Weeks' | 'Last 13 Weeks' | 'Last 52 Weeks';
}

export interface WeeklyUptimePoint {
  workWeek: string;        // e.g. 2025-46
  oneWeekRolling: number;  // %
  thirteenWeekRolling: number;
  periodAverage: number;
}

export interface UptimeBreakdownRow {
  label: string;
  group: '1 Week Rolling' | '13 Week Rolling' | 'Tool' | 'SW Version';
  values: Record<string, number>; // workWeek -> %
}

export interface UnavailableTool {
  toolId: string;
  unscheduledHrs: number;
  scheduledHrs: number;
  nonScheduledHrs: number;
}

export interface DowntimeCategory {
  category: string;
  periodPct: number;
  thirteenWeekPct: number;
  fourWeekPct: number;
  wowDelta: number;
}

export interface UptimeAnalysisResponse {
  weekly: WeeklyUptimePoint[];
  breakdown: UptimeBreakdownRow[];
  topUnavailable: UnavailableTool[];
  downtimeCategories: DowntimeCategory[];
  kpis: { oneWeekRolling: number; thirteenWeekRolling: number };
}

// ── Up-Time Trend (granular history, PascalCase — mirrors upstream API contract) ──
export interface UptimeInfoPoint {
  GranulariReferencePoint: string; // e.g. "2026-29" (year-dayOfYear)
  UptimePercentage: number;
  UptimeDurationHrs: number;
  DowntimeDurationHrs: number;
  NoStateDurationHrs: number;
}

export interface UptimeTrendWindow {
  RollingWindow: number; // e.g. 1, 13
  UptimeInfo: UptimeInfoPoint[];
}

export type UptimeTrendResponse = UptimeTrendWindow[];

export interface AvailabilityKpis {
  thirteenWeekRollingAvg: number;
  fourWeekRollingAvg: number;
  currentWeek: number;
  currentWeekLabel: string;
  mtbrAvgHrs: number;
  totalDowntimeHrs: number;
}

export interface FleetTrendPoint {
  workWeek: string;
  uptimePct: number;
  fourWeekRolling: number;
  thirteenWeekRolling: number;
  target: number;
  unscheduledHrs: number;
  scheduledHrs: number;
  nonScheduledHrs: number;
}

export interface HeatmapDay {
  date: string;               // MM-dd
  hours: ToolState[];         // 8 blocks of 3h (or 24 x 1h)
}

export interface StateTotals {
  production: number;
  engineering: number;
  standby: number;
  scheduledDT: number;
  unscheduledDT: number;
}

export interface GanttSegment {
  state: ToolState;
  startHour: number; // 0..24 fractional
  endHour: number;
  label?: string;    // e.g. "1.9h"
  /** Recipe/task context from a correlated segment activity, e.g. "Recipe Run · Fail (0xc82f001a)". */
  detail?: string;
}

export interface GanttDay {
  day: string;       // Mon
  date: string;      // 05-04
  availabilityPct: number;
  downtimeHrs: number;
  sysRow: GanttSegment[];
  toolRow: GanttSegment[];
}

export interface ToolEvent {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  durationHrs: number;
  source: 'MES' | 'E10' | 'Auto' | 'Manual';
  state: ToolState;
  details: string;
}

export interface AvailabilityResponse {
  kpis: AvailabilityKpis;
  trend: FleetTrendPoint[];
  topUnavailable: { toolId: string; hrs: number; unscheduledHrs: number; scheduledHrs: number; nonScheduledHrs: number }[];
  heatmap: HeatmapDay[];
  stateTotals: StateTotals;
  downtimeCategories: DowntimeCategory[];
}

// ── Tool State Segments — raw feed (mixed casing mirrors upstream API contract).
// Single source of truth: both the Activity Gantt bars and the Event Details
// rows are derived from this instead of being separately mocked. ──
export interface StateSegment {
  ToolDetail: string | null;
  segmentId: number;
  sourceName: 'system' | 'tool';
  stateName: string; // raw upstream label, e.g. "standby"
  start: string;      // ISO datetime
  end: string;        // ISO datetime
  segmentDurationHrs: number;
  metadata: unknown | null;
}

export interface StateSegmentsResponse {
  stateSegments: StateSegment[];
}

// ── Segment Activities — task/recipe-level detail within a tool's
// Production windows (getSegmentActivities). Correlated with StateSegment
// at generation time so the Activity Gantt and Event Details tables can
// enrich themselves from this same underlying data. ──
export interface SegmentActivityParams {
  [key: string]: string | number | null;
}

export interface SegmentActivity {
  modelId: string;
  toolId: number;
  eventStart: string; // ISO datetime
  eventEnd: string;   // ISO datetime
  duration: number;
  segmentType: string; // e.g. "TaskSegment"
  SegmentName: string;  // casing mirrors upstream API contract
  params: SegmentActivityParams;
}

export interface SegmentActivitiesResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean | null;
  responseException: unknown | null;
  result: SegmentActivity[];
  /** Not present in the upstream payload — added by the mock for pagination UI. */
  totalCount: number;
}

export interface FleetAlarmSummary {
  rank: number;
  fleetId: string;
  fleetName: string;
  toolCount: number;
  totalAlarms: number;
  trendPct: number;
  byCategory: Record<AlarmCategory, number>;
}

export interface AlarmVolumeWeek {
  workWeek: string;
  byCategory: Record<AlarmCategory, number>;
}

export interface ToolAlarmSummary {
  toolId: string;
  swVersion: string;
  totalAlarms: number;
  equipmentSafety: number;
  attentionFlags: number;
  dataIntegrity: number;
  irrecoverable: number;
  trendPct: number | null;
}

export interface AlarmDefinition {
  alarmId: string;
  description: string;
  category: AlarmCategory;
  severity: Severity;
  count: number;
  freqPerDay: number;
  lastSeen: string;
  firstSeen: string;
  recipe: string | null;
  affectedTools: number;
  recipeMatchPct: number;
  weeklyTrend: number[];
}

export interface AlarmEvent {
  seq: number;
  timestamp: string;
  toolId: string;
  recipe: string | null;
  workWeek: string;
  swVersion: string;
  duration: string; // hh:mm:ss
  resolution: 'Auto-cleared' | 'Manual reset' | 'Tool downtime';
}

export interface AlarmHomeResponse {
  volume: AlarmVolumeWeek[];
  fleets: FleetAlarmSummary[];
}

export interface FleetAlarmDetailResponse {
  fleet: FleetAlarmSummary;
  toolDistribution: { toolId: string; byCategory: Record<AlarmCategory, number> }[];
  topAlarms: { rank: number; alarmId: string; description: string; count: number; category: AlarmCategory }[];
  tools: ToolAlarmSummary[];
  swVersions: string[];
  topCategory: AlarmCategory;
}

export interface ToolAlarmDetailResponse {
  toolId: string;
  totalAlarms: number;
  alarms: AlarmDefinition[];
}

export interface AlarmEventsResponse {
  alarm: AlarmDefinition;
  toolId: string;
  events: AlarmEvent[];
  total: number;
}
