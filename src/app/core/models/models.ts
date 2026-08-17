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
  dateFrom: string;
  dateTo: string;
  duration: 'Last 4 Weeks' | 'Last 13 Weeks' | 'Last 52 Weeks';
}

export interface WeeklyUptimePoint {
  workWeek: string;
  oneWeekRolling: number;
  thirteenWeekRolling: number;
  periodAverage: number;
}

export interface UptimeBreakdownRow {
  label: string;
  group: '1 Week Rolling' | '13 Week Rolling' | 'Tool' | 'SW Version';
  values: Record<string, number>;
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

export interface UptimeInfoPoint {
  GranulariReferencePoint: string;
  UptimePercentage: number;
  UptimeDurationHrs: number;
  DowntimeDurationHrs: number;
  NoStateDurationHrs: number;
}

export interface UptimeTrendWindow {
  RollingWindow: number;
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
  date: string;
  hours: ToolState[];
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
  startHour: number;
  endHour: number;
  label?: string;
  detail?: string;
}

export interface GanttDay {
  day: string;
  date: string;
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

export interface StateSegment {
  ToolDetail: string | null;
  segmentId: number;
  sourceName: 'system' | 'tool';
  stateName: string;
  start: string;
  end: string;
  segmentDurationHrs: number;
  metadata: unknown | null;
}

export interface StateSegmentsResponse {
  stateSegments: StateSegment[];
}

export interface SegmentActivityParams {
  [key: string]: string | number | null;
}

export interface SegmentActivity {
  modelId: string;
  toolId: number;
  eventStart: string;
  eventEnd: string;
  duration: number;
  segmentType: string;
  SegmentName: string;
  params: SegmentActivityParams;
}

export interface SegmentActivitiesResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean | null;
  responseException: unknown | null;
  result: SegmentActivity[];
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
  duration: string;
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
