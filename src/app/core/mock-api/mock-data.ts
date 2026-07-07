import {
  AlarmCategory, AlarmDefinition, AlarmEvent, AlarmHomeResponse, AlarmEventsResponse,
  AvailabilityResponse, DowntimeCategory, FleetAlarmDetailResponse, FleetAlarmSummary,
  GanttDay, GanttSegment, HeatmapDay, ToolAlarmDetailResponse, ToolEvent, ToolState,
  UptimeAnalysisResponse, WeeklyUptimePoint
} from '../models/models';

// Deterministic PRNG so the mock API is stable across reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORK_WEEKS = [
  '2025-46', '2025-47', '2025-48', '2025-49', '2025-50', '2025-51', '2025-52',
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
];

export const FLEETS = ['INTEL_ARCHER800AIM', 'Axion Fleet', 'Fleet 001', 'Fleet 002', 'Fleet 003', 'Fleet 004', 'Fleet 005'];

const CATEGORIES: AlarmCategory[] = ['Equipment Safety', 'Attention Flags', 'Data Integrity', 'Irrecoverable'];

// ─────────────────────────────────────────────────────────────
// 1) Fleet Up-Time Analysis
// ─────────────────────────────────────────────────────────────
export function buildUptimeAnalysis(): UptimeAnalysisResponse {
  const oneWeek = [96.9, 93.2, 97.8, 88.1, 83.9, 88.2, 97.8, 96.9, 96.2, 96.2, 98.6, 91.4, 97.6];
  const thirteenWeek = [94.9, 91.2, 95.8, 86.1, 81.9, 86.2, 95.8, 94.9, 94.2, 95.6, 89.4, 95.6, 99.6];
  const weekly: WeeklyUptimePoint[] = WORK_WEEKS.map((ww, i) => ({
    workWeek: ww,
    oneWeekRolling: oneWeek[i],
    thirteenWeekRolling: thirteenWeek[i],
    periodAverage: 94.1
  }));

  const rows: [string, UptimeAnalysisResponse['breakdown'][0]['group'], number[]][] = [
    ['1 Week Rolling', '1 Week Rolling', oneWeek],
    ['13 Week Rolling', '13 Week Rolling', thirteenWeek],
    ['1KABA452100', 'Tool', [95.2, 91.8, 96.5, 85.3, 80.1, 86.9, 96.2, 95.4, 94.8, 95.1, 97.2, 89.6, 96.3]],
    ['1KABA452200', 'Tool', [98.6, 94.6, 99.1, 90.9, 87.7, 89.5, 99.4, 98.4, 97.6, 97.3, 100.0, 93.2, 98.9]],
    ['6.48.203', 'SW Version', [97.1, 93.5, 98.0, 88.5, 84.2, 88.5, 98.1, 97.2, 96.5, 96.8, 98.9, 91.8, 97.9]],
    ['8.50.303', 'SW Version', [96.7, 92.9, 97.6, 87.7, 83.6, 87.9, 97.5, 96.6, 95.9, 95.6, 98.3, 91.0, 97.3]]
  ];

  return {
    weekly,
    breakdown: rows.map(([label, group, vals]) => ({
      label, group,
      values: Object.fromEntries(WORK_WEEKS.map((ww, i) => [ww, vals[i]]))
    })),
    topUnavailable: [
      { toolId: '1KABA452100', unscheduledHrs: 212, scheduledHrs: 118, nonScheduledHrs: 64 },
      { toolId: '1KABA452200', unscheduledHrs: 141, scheduledHrs: 96, nonScheduledHrs: 41 }
    ],
    downtimeCategories: [
      { category: 'SW Failure', periodPct: 2.15, thirteenWeekPct: 2.31, fourWeekPct: 1.94, wowDelta: -0.12 },
      { category: 'HW Failure', periodPct: 1.05, thirteenWeekPct: 1.12, fourWeekPct: 0.98, wowDelta: 0.04 },
      { category: 'Other', periodPct: 1.04, thirteenWeekPct: 0.97, fourWeekPct: 1.10, wowDelta: 0.02 },
      { category: 'Planned Restart', periodPct: 0.62, thirteenWeekPct: 0.66, fourWeekPct: 0.58, wowDelta: -0.03 },
      { category: 'KLA Preventative Maintenance', periodPct: 0.57, thirteenWeekPct: 0.61, fourWeekPct: 0.52, wowDelta: 0.0 }
    ],
    kpis: { oneWeekRolling: 98.6, thirteenWeekRolling: 89.4 }
  };
}

// ─────────────────────────────────────────────────────────────
// 2) Fleet Up-Time Availability (heatmap / gantt / events)
// ─────────────────────────────────────────────────────────────
const HEATMAP_STATES: ToolState[] = ['Production', 'Engineering', 'Standby', 'Scheduled Downtime', 'Unscheduled Downtime', 'Gap'];

function buildHeatmap(rand: () => number): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const dates = ['04-26', '04-27', '04-28', '04-29', '04-30', '05-01', '05-02', '05-03', '05-04', '05-05', '05-06', '05-07', '05-08', '05-09'];
  for (const date of dates) {
    const hours: ToolState[] = [];
    for (let h = 0; h < 8; h++) {
      const r = rand();
      hours.push(
        r < 0.62 ? 'Production'
          : r < 0.72 ? 'Engineering'
          : r < 0.82 ? 'Standby'
          : r < 0.90 ? 'Scheduled Downtime'
          : r < 0.97 ? 'Unscheduled Downtime'
          : 'Gap'
      );
    }
    days.push({ date, hours });
  }
  return days;
}

function seg(state: ToolState, startHour: number, endHour: number, label?: string): GanttSegment {
  return { state, startHour, endHour, label };
}

function buildGantt(): GanttDay[] {
  return [
    {
      day: 'Sat', date: '05-09', availabilityPct: 77, downtimeHrs: 3.2,
      sysRow: [seg('Production', 0, 9.5), seg('Unscheduled Downtime', 9.5, 11.4, '1.9h'), seg('Production', 11.4, 17.7, '6.3h'), seg('Standby', 17.7, 24)],
      toolRow: [seg('Production', 0, 8.3, '8.3h'), seg('Engineering', 8.3, 10.5), seg('Production', 10.5, 18.2, '7.7h'), seg('Standby', 18.2, 24)]
    },
    {
      day: 'Fri', date: '05-08', availabilityPct: 78, downtimeHrs: 3.6,
      sysRow: [seg('Production', 0, 8.9, '8.9h'), seg('Scheduled Downtime', 8.9, 12.5), seg('Production', 12.5, 18.6, '6.1h'), seg('Standby', 18.6, 24)],
      toolRow: [seg('Production', 0, 6.9, '6.9h'), seg('Standby', 6.9, 9), seg('Production', 9, 16.2, '7.2h'), seg('Engineering', 16.2, 18.6), seg('Production', 18.6, 24, '5.4h')]
    },
    {
      day: 'Thu', date: '05-07', availabilityPct: 100, downtimeHrs: 0,
      sysRow: [seg('Production', 0, 12), seg('Production', 12, 24)],
      toolRow: [seg('Production', 0, 5.1, '5.1h'), seg('Standby', 5.1, 7.4), seg('Production', 7.4, 10.7, '3.3h'), seg('Production', 10.7, 16.4, '5.7h'), seg('Production', 16.4, 24)]
    },
    {
      day: 'Wed', date: '05-06', availabilityPct: 71, downtimeHrs: 7.1,
      sysRow: [seg('Production', 0, 5), seg('Unscheduled Downtime', 5, 6.5, '1.5h'), seg('Production', 6.5, 11.5, '5.0h'), seg('Scheduled Downtime', 11.5, 15.5, '4.0h'), seg('Production', 15.5, 22), seg('Standby', 22, 24)],
      toolRow: [seg('Production', 0, 5, '5.0h'), seg('Engineering', 5, 7.2, '2.2h'), seg('Production', 7.2, 12.2), seg('Unscheduled Downtime', 12.2, 13.8, '1.6h'), seg('Production', 13.8, 21, '7.1h'), seg('Standby', 21, 24)]
    },
    {
      day: 'Tue', date: '05-05', availabilityPct: 97, downtimeHrs: 0,
      sysRow: [seg('Production', 0, 24)],
      toolRow: [seg('Production', 0, 7.2, '7.2h'), seg('Standby', 7.2, 9.4, '2.2h'), seg('Production', 9.4, 16.9, '7.5h'), seg('Production', 16.9, 24)]
    },
    {
      day: 'Mon', date: '05-04', availabilityPct: 94, downtimeHrs: 1.5,
      sysRow: [seg('Production', 0, 13.5), seg('Scheduled Downtime', 13.5, 15), seg('Production', 15, 24)],
      toolRow: [seg('Production', 0, 2.4, '2.4h'), seg('Engineering', 2.4, 5), seg('Production', 5, 8.9, '3.9h'), seg('Production', 8.9, 13.6, '4.7h'), seg('Production', 13.6, 24)]
    },
    {
      day: 'Sun', date: '05-03', availabilityPct: 82, downtimeHrs: 2.6,
      sysRow: [seg('Unscheduled Downtime', 0, 8.7, '8.7h'), seg('Production', 8.7, 12.4, '3.7h'), seg('Production', 12.4, 24)],
      toolRow: [seg('Standby', 0, 2.5, '2.5h'), seg('Production', 2.5, 10.7, '8.2h'), seg('Engineering', 10.7, 13.3, '2.6h'), seg('Production', 13.3, 17.3, '4.0h'), seg('Production', 17.3, 24, '3.4h')]
    }
  ];
}

function buildToolEvents(rand: () => number): ToolEvent[] {
  const states: ToolState[] = ['Production', 'Engineering', 'Production', 'Unscheduled Downtime', 'Scheduled Downtime', 'Production'];
  const sources: ToolEvent['source'][] = ['MES', 'E10', 'Auto', 'Manual'];
  const events: ToolEvent[] = [];
  let id = 1;
  for (let d = 0; d < 100; d++) {
    const day = new Date(2026, 4, 8);
    day.setDate(day.getDate() - d);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    let cursor = 0;
    const n = 4 + Math.floor(rand() * 3);
    for (let e = 0; e < n && cursor < 23; e++) {
      const dur = Math.round((0.5 + rand() * 7.5) * 100) / 100;
      const end = Math.min(24, cursor + dur);
      const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}:00`;
      const state = states[Math.floor(rand() * states.length)];
      events.push({
        id: id++,
        date,
        startTime: fmt(cursor),
        endTime: end === 24 ? '24:00:00' : fmt(end),
        durationHrs: Math.round((end - cursor) * 100) / 100,
        source: sources[Math.floor(rand() * sources.length)],
        state,
        details: state === 'Production' ? (rand() < 0.85 ? 'JobStatus: Pass' : 'JobStatus: Fail') : ''
      });
      cursor = end;
    }
  }
  return events;
}

export function buildAvailability(): AvailabilityResponse {
  const rand = mulberry32(42);
  const trend = WORK_WEEKS.map((ww, i) => {
    const base = [99.1, 98.4, 97.2, 92.8, 88.5, 91.2, 96.9, 98.8, 99.4, 99.7, 99.9, 100, 100][i];
    return {
      workWeek: ww,
      uptimePct: base,
      fourWeekRolling: Math.min(100, base + 0.4),
      thirteenWeekRolling: 99.7 - (12 - i) * 0.35,
      target: 95,
      unscheduledHrs: Math.round((100 - base) * 1.4 * 10) / 10,
      scheduledHrs: Math.round(rand() * 12 * 10) / 10,
      nonScheduledHrs: Math.round(rand() * 5 * 10) / 10
    };
  });

  return {
    kpis: {
      thirteenWeekRollingAvg: 99.7,
      fourWeekRollingAvg: 100.0,
      currentWeek: 100.0,
      currentWeekLabel: '26-19',
      mtbrAvgHrs: 2184,
      totalDowntimeHrs: 1385
    },
    trend,
    topUnavailable: [{ toolId: 'Axion_T2500', hrs: 1202 }],
    heatmap: buildHeatmap(mulberry32(7)),
    stateTotals: { production: 368, engineering: 59, standby: 52, scheduledDT: 69, unscheduledDT: 47 },
    gantt: buildGantt(),
    ganttSummary: { avgProductionPct: 85.5, totalDowntimeHrs: 17.9 },
    events: buildToolEvents(mulberry32(11)),
    downtimeCategories: [
      { category: 'Unknown', periodPct: 99.45, thirteenWeekPct: 99.2, fourWeekPct: 99.6, wowDelta: 0 },
      { category: 'Planned Repair', periodPct: 3.57, thirteenWeekPct: 3.4, fourWeekPct: 3.7, wowDelta: 0 },
      { category: 'Testing', periodPct: 0.08, thirteenWeekPct: 0.1, fourWeekPct: 0.06, wowDelta: 0 }
    ]
  };
}

// ─────────────────────────────────────────────────────────────
// 3) Alarm Explorer
// ─────────────────────────────────────────────────────────────
function categorySplit(total: number, rand: () => number): Record<AlarmCategory, number> {
  const w = [0.44, 0.25, 0.2, 0.11].map(x => x * (0.85 + rand() * 0.3));
  const sum = w.reduce((a, b) => a + b, 0);
  const parts = w.map(x => Math.round((x / sum) * total));
  parts[0] += total - parts.reduce((a, b) => a + b, 0);
  return { 'Equipment Safety': parts[0], 'Attention Flags': parts[1], 'Data Integrity': parts[2], 'Irrecoverable': parts[3] };
}

const FLEET_SUMMARIES: FleetAlarmSummary[] = [
  { rank: 1, fleetId: 'fleet-001', fleetName: 'Fleet 001', toolCount: 8, totalAlarms: 163, trendPct: 12.4, byCategory: categorySplit(163, mulberry32(1)) },
  { rank: 2, fleetId: 'fleet-002', fleetName: 'Fleet 002', toolCount: 6, totalAlarms: 133, trendPct: 5.2, byCategory: categorySplit(133, mulberry32(2)) },
  { rank: 3, fleetId: 'fleet-003', fleetName: 'Fleet 003', toolCount: 8, totalAlarms: 113, trendPct: -8.1, byCategory: categorySplit(113, mulberry32(3)) },
  { rank: 4, fleetId: 'fleet-004', fleetName: 'Fleet 004', toolCount: 5, totalAlarms: 93, trendPct: 3.4, byCategory: categorySplit(93, mulberry32(4)) },
  { rank: 5, fleetId: 'fleet-005', fleetName: 'Fleet 005', toolCount: 5, totalAlarms: 77, trendPct: 2.1, byCategory: categorySplit(77, mulberry32(5)) }
];

export function buildAlarmHome(): AlarmHomeResponse {
  const rand = mulberry32(99);
  return {
    volume: WORK_WEEKS.map(ww => ({ workWeek: ww, byCategory: categorySplit(30 + Math.round(rand() * 40), rand) })),
    fleets: FLEET_SUMMARIES
  };
}

const FLEET001_TOOLS = [
  { toolId: '1KABA452100', swVersion: '6.48.203', totalAlarms: 85, equipmentSafety: 38, attentionFlags: 22, dataIntegrity: 18, irrecoverable: 7, trendPct: 12.9 },
  { toolId: '1KABA452200', swVersion: '8.50.303', totalAlarms: 78, equipmentSafety: 33, attentionFlags: 20, dataIntegrity: 13, irrecoverable: 12, trendPct: 9.1 },
  { toolId: '1KABA453100', swVersion: '6.48.203', totalAlarms: 62, equipmentSafety: 28, attentionFlags: 14, dataIntegrity: 12, irrecoverable: 8, trendPct: 5.4 },
  { toolId: '1KABA453200', swVersion: '8.50.303', totalAlarms: 54, equipmentSafety: 24, attentionFlags: 13, dataIntegrity: 11, irrecoverable: 6, trendPct: -1.4 },
  { toolId: '1KABA454100', swVersion: '6.48.203', totalAlarms: 48, equipmentSafety: 20, attentionFlags: 11, dataIntegrity: 10, irrecoverable: 7, trendPct: 3.6 },
  { toolId: '1KABA454200', swVersion: '8.50.303', totalAlarms: 41, equipmentSafety: 17, attentionFlags: 10, dataIntegrity: 8, irrecoverable: 6, trendPct: null },
  { toolId: '1KABA455100', swVersion: '6.48.203', totalAlarms: 35, equipmentSafety: 14, attentionFlags: 9, dataIntegrity: 7, irrecoverable: 5, trendPct: -11.4 },
  { toolId: '1KABA455200', swVersion: '8.50.303', totalAlarms: 29, equipmentSafety: 11, attentionFlags: 7, dataIntegrity: 6, irrecoverable: 5, trendPct: 1.8 }
];

export function buildFleetDetail(fleetId: string): FleetAlarmDetailResponse {
  const fleet = FLEET_SUMMARIES.find(f => f.fleetId === fleetId) ?? FLEET_SUMMARIES[0];
  const rand = mulberry32(fleet.rank * 17);
  const tools = fleet.fleetId === 'fleet-001'
    ? FLEET001_TOOLS
    : FLEET001_TOOLS.slice(0, fleet.toolCount).map((t, i) => {
        const total = Math.max(10, Math.round(fleet.totalAlarms * (0.3 - i * 0.03)));
        const split = categorySplit(total, rand);
        return {
          ...t,
          toolId: `${fleet.fleetName.replace(' ', '')}_T${2100 + i * 100}`,
          totalAlarms: total,
          equipmentSafety: split['Equipment Safety'],
          attentionFlags: split['Attention Flags'],
          dataIntegrity: split['Data Integrity'],
          irrecoverable: split['Irrecoverable'],
          trendPct: Math.round((rand() * 24 - 10) * 10) / 10
        };
      });
  return {
    fleet,
    toolDistribution: tools.map(t => ({
      toolId: t.toolId,
      byCategory: {
        'Equipment Safety': t.equipmentSafety,
        'Attention Flags': t.attentionFlags,
        'Data Integrity': t.dataIntegrity,
        'Irrecoverable': t.irrecoverable
      }
    })),
    topAlarms: [
      { rank: 1, alarmId: 'ALM-4521', description: 'Wafer Handler Position Error', count: 47 },
      { rank: 2, alarmId: 'ALM-3892', description: 'Pressure Sensor Out of Range', count: 38 },
      { rank: 3, alarmId: 'ALM-5501', description: 'Data Checksum Mismatch', count: 24 },
      { rank: 4, alarmId: 'ALM-2211', description: 'Robot Arm Calibration Drift', count: 19 },
      { rank: 5, alarmId: 'ALM-6701', description: 'Vacuum Pressure Drop', count: 16 }
    ],
    tools,
    swVersions: ['6.48.203', '8.50.303'],
    topCategory: 'Equipment Safety'
  };
}

const ALARM_DEFS: AlarmDefinition[] = [
  { alarmId: 'ALM-4521', description: 'Wafer Handler Position Error', category: 'Equipment Safety', severity: 'Fatal', count: 47, freqPerDay: 1.24, lastSeen: '2026-04-18 14:37:55', firstSeen: '2025-11-03 08:14:22', recipe: 'RCP-8821-A', affectedTools: 5, recipeMatchPct: 69, weeklyTrend: [3, 5, 4, 7, 6, 8, 6, 8] },
  { alarmId: 'ALM-3892', description: 'Pressure Sensor Out of Range', category: 'Equipment Safety', severity: 'Fatal', count: 38, freqPerDay: 1.0, lastSeen: '2026-04-20 09:02:11', firstSeen: '2025-11-10 12:30:00', recipe: 'RCP-9012-B', affectedTools: 4, recipeMatchPct: 54, weeklyTrend: [2, 4, 5, 4, 6, 5, 6, 6] },
  { alarmId: 'ALM-5501', description: 'Data Checksum Mismatch', category: 'Data Integrity', severity: 'Non-Fatal', count: 24, freqPerDay: 0.63, lastSeen: '2026-04-22 16:44:03', firstSeen: '2025-12-01 07:12:45', recipe: null, affectedTools: 6, recipeMatchPct: 0, weeklyTrend: [1, 2, 3, 3, 4, 3, 4, 4] },
  { alarmId: 'ALM-2211', description: 'Robot Arm Calibration Drift', category: 'Attention Flags', severity: 'Non-Fatal', count: 19, freqPerDay: 0.5, lastSeen: '2026-04-15 11:20:37', firstSeen: '2025-12-14 09:41:18', recipe: 'RCP-8821-A', affectedTools: 3, recipeMatchPct: 61, weeklyTrend: [1, 2, 2, 3, 2, 3, 3, 3] },
  { alarmId: 'ALM-6701', description: 'Vacuum Pressure Drop', category: 'Equipment Safety', severity: 'Fatal', count: 16, freqPerDay: 0.42, lastSeen: '2026-04-17 06:55:29', firstSeen: '2026-01-08 15:03:51', recipe: null, affectedTools: 2, recipeMatchPct: 0, weeklyTrend: [0, 1, 2, 2, 3, 2, 3, 3] },
  { alarmId: 'ALM-1198', description: 'Chamber Temperature Exceedance', category: 'Data Integrity', severity: 'Fatal', count: 9, freqPerDay: 0.24, lastSeen: '2026-04-10 13:18:44', firstSeen: '2026-02-02 10:26:33', recipe: 'RCP-9012-B', affectedTools: 2, recipeMatchPct: 44, weeklyTrend: [0, 1, 1, 1, 2, 1, 2, 1] }
];

export function buildToolAlarms(toolId: string): ToolAlarmDetailResponse {
  return { toolId, totalAlarms: 85, alarms: ALARM_DEFS };
}

const RESOLUTIONS: AlarmEvent['resolution'][] = ['Auto-cleared', 'Auto-cleared', 'Auto-cleared', 'Manual reset', 'Tool downtime'];

export function buildAlarmEvents(toolId: string, alarmId: string): AlarmEventsResponse {
  const alarm = ALARM_DEFS.find(a => a.alarmId === alarmId) ?? ALARM_DEFS[0];
  const rand = mulberry32(alarmId.length * 31);
  const recipes = [alarm.recipe, alarm.recipe, 'RCP-9012-B', null];
  const events: AlarmEvent[] = [];
  const start = new Date(2026, 3, 18, 14, 37, 55);
  for (let i = 0; i < alarm.count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - Math.round(i * (160 / alarm.count)) - Math.floor(rand() * 3));
    d.setHours(6 + Math.floor(rand() * 13), Math.floor(rand() * 60), Math.floor(rand() * 60));
    const week = getWorkWeek(d);
    const durSec = 40 + Math.floor(rand() * 260);
    events.push({
      seq: i + 1,
      timestamp: fmtTs(d),
      toolId,
      recipe: recipes[Math.floor(rand() * recipes.length)],
      workWeek: week,
      swVersion: '6.48.203',
      duration: `00:${String(Math.floor(durSec / 60)).padStart(2, '0')}:${String(durSec % 60).padStart(2, '0')}`,
      resolution: RESOLUTIONS[Math.floor(rand() * RESOLUTIONS.length)]
    });
  }
  return { alarm, toolId, events, total: events.length };
}

function fmtTs(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function getWorkWeek(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-${String(week).padStart(2, '0')}`;
}
