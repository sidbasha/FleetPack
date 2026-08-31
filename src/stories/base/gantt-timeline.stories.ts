import type { Meta, StoryObj } from '@storybook/angular';
import { BASE_MACHINE_STATE_META, BaseGanttMarker, BaseGanttRow, BaseGanttSegment, BaseGanttTimelineComponent, BaseMachineState } from '../../app/base';

const rows: BaseGanttRow[] = [
  {
    label: 'MON 05-04',
    badge: '97%',
    segments: [
      { startHour: 0, endHour: 6.5, state: 'production' },
      { startHour: 6.5, endHour: 7.2, state: 'standby' },
      { startHour: 7.2, endHour: 24, state: 'production' }
    ]
  },
  {
    label: 'TUE 05-05',
    badge: '71%',
    segments: [
      { startHour: 0, endHour: 8, state: 'production' },
      { startHour: 8, endHour: 8.5, state: 'unscheduled-dt' },
      { startHour: 8.5, endHour: 15, state: 'production' },
      { startHour: 15, endHour: 24, state: 'unscheduled-dt' }
    ]
  },
  {
    label: 'WED 05-06',
    badge: '71%',
    segments: [
      { startHour: 0, endHour: 10, state: 'production' },
      { startHour: 10, endHour: 16, state: 'scheduled-dt' },
      { startHour: 16, endHour: 24, state: 'production' }
    ]
  }
];

const meta: Meta<BaseGanttTimelineComponent> = {
  title: 'Base/Charts & Visualization/Gantt Timeline',
  component: BaseGanttTimelineComponent,
  tags: ['autodocs'],
  argTypes: {
    zoomable: { control: 'boolean' },
    filterable: { control: 'boolean' },
    showDurationOnBar: { control: 'boolean' },
    rowHeight: { control: 'number' },
    maxViewportHeight: { control: 'number' }
  },
  args: { rows },
  parameters: {
    docs: {
      description: {
        component:
          'Canvas-rendered swimlane timeline built for large datasets: rows are virtualized ' +
          '(`@angular/cdk` virtual scroll) so hundreds of rows stay smooth, drag-select on the ' +
          'timeline zooms into a time range ("Reset Zoom"), and clicking row labels or legend ' +
          'states selects which show — any number of rows and any number of states can be ' +
          'selected at once (click again to deselect), dimming every segment outside the ' +
          'selected states across all rows. Both filters share the same "Reset Filter" link and ' +
          'can combine with each other and with zoom. `startHour`/`endHour` are just numbers ' +
          'in whatever unit `totalHours` is — hours-in-a-day by default, but `domainStart` + a custom ' +
          '`axisTickFormat`/`durationFormat` let the same component plot real epoch-ms timestamps ' +
          '(see "Real timestamp domain" below). Wherever the winning state actually changes between ' +
          'two adjacent segments, a 1px seam of the track\'s background separates them so they read ' +
          'as discrete blocks instead of one bar that changes color, and the bar itself stops short ' +
          'of the lane\'s bottom edge rather than filling it edge-to-edge, leaving a baseline gap ' +
          'under the color (see "Segment boundaries" below) — same-state runs still merge into one ' +
          'unbroken block. A row can also carry `lanes` — stacked, mutually-exclusive sub-rows ' +
          'sharing one row label, e.g. a "System" state lane above a "Tool" event lane (see ' +
          '"Mutually exclusive sub-rows" below). Hovering any bar or marker shows a tooltip with its ' +
          'label, duration, and start–end time range; `showDurationOnBar` additionally prints each ' +
          'bar\'s own duration directly on the bar, skipped where a segment is too narrow/short to ' +
          'hold the text legibly (see "Duration labels on bar" below).'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseGanttTimelineComponent>;

export const Default: Story = {};

export const WithSegmentLabels: Story = {
  args: {
    rows: [
      {
        label: 'ARC-07', badge: '76.9%',
        segments: [
          { startHour: 0, endHour: 9, state: 'production' },
          { startHour: 9, endHour: 18, state: 'unscheduled-dt', label: 'Chamber interlock' },
          { startHour: 18, endHour: 24, state: 'production' }
        ]
      }
    ]
  }
};

export const DurationLabelsOnBar: Story = {
  name: 'Duration labels on bar (showDurationOnBar)',
  args: {
    showDurationOnBar: true
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `showDurationOnBar` enabled, each bar prints its own duration ("6.5h") centered on ' +
          'it — white text with a dark outline so it reads over any state color or hatch pattern. ' +
          'The label is skipped wherever a segment (or a merged same-state run) is too narrow, or ' +
          "the lane too short, to fit the text without spilling out of the bar — e.g. the ~0.7h " +
          'standby blip on MON 05-04 below has no label. Off by default. The hover tooltip (present ' +
          'in every story) already shows duration plus the exact start–end time for any segment or ' +
          'marker regardless of this flag — `showDurationOnBar` is for when the duration needs to be ' +
          'visible at a glance, without hovering.'
      }
    }
  }
};

export const WithNoTelemetryRow: Story = {
  args: {
    rows: [
      { label: 'SP7-04', badge: '98.2%', segments: [
        { startHour: 0, endHour: 13, state: 'production' },
        { startHour: 13, endHour: 15, state: 'engineering' },
        { startHour: 15, endHour: 24, state: 'production' }
      ] },
      { label: 'CAN-02', badge: '94.1%', segments: [{ startHour: 0, endHour: 24, state: 'production' }] },
      { label: 'EDR-11', badge: '91.2%', segments: [
        { startHour: 0, endHour: 8, state: 'standby' },
        { startHour: 8, endHour: 24, state: 'production' }
      ] },
      { label: 'ARC-07', badge: '76.9%', segments: [
        { startHour: 0, endHour: 9, state: 'production' },
        { startHour: 9, endHour: 18, state: 'unscheduled-dt', label: 'Chamber interlock' },
        { startHour: 18, endHour: 24, state: 'production' }
      ] },
      { label: 'VOY-19', segments: [], noData: true }
    ]
  }
};

const HEAVY_ROTATION_STATES: BaseMachineState[] = ['production', 'standby', 'engineering', 'scheduled-dt', 'non-scheduled'];
const WEEK_HOURS = 168;

function buildHeavyRows(rowCount: number, segmentsPerRow: number): BaseGanttRow[] {
  return Array.from({ length: rowCount }, (_, r) => {
    const segments: BaseGanttSegment[] = [];
    let hour = 0;
    for (let i = 0; i < segmentsPerRow && hour < WEEK_HOURS; i++) {
      const duration = (WEEK_HOURS / segmentsPerRow) * (0.4 + Math.random() * 1.2);
      const end = Math.min(WEEK_HOURS, hour + duration);
      const isBlip = i % 137 === 0;
      const state: BaseMachineState = isBlip ? 'unscheduled-dt' : HEAVY_ROTATION_STATES[(r + i) % HEAVY_ROTATION_STATES.length];
      segments.push({ startHour: hour, endHour: end, state, label: isBlip ? 'Interlock trip' : undefined });
      hour = end;
    }
    return {
      label: `TOOL-${(r + 1).toString().padStart(3, '0')}`,
      badge: `${(70 + Math.random() * 29).toFixed(1)}%`,
      segments
    };
  });
}

export const HighVolumeWeek: Story = {
  name: 'High volume · 100k+ segments across a week',
  args: {
    totalHours: WEEK_HOURS,
    rows: buildHeavyRows(50, 2000)
  },
  parameters: {
    docs: { description: { story: 'Segment-heavy: few rows, thousands of segments each. Drag-select the timeline to zoom into a time range — only the visible window is redrawn per row.' } }
  }
};

function buildManyRows(rowCount: number): BaseGanttRow[] {
  const states: BaseMachineState[] = ['production', 'standby', 'engineering', 'scheduled-dt', 'unscheduled-dt'];
  return Array.from({ length: rowCount }, (_, r) => {
    const segments: BaseGanttSegment[] = [];
    let hour = 0;
    while (hour < 24) {
      const duration = 1 + Math.random() * 5;
      const end = Math.min(24, hour + duration);
      segments.push({ startHour: hour, endHour: end, state: states[(r + segments.length) % states.length] });
      hour = end;
    }
    return { label: `CH-${(r + 1).toString().padStart(3, '0')}`, badge: `${(80 + Math.random() * 19).toFixed(1)}%`, segments };
  });
}

export const ManyRows: Story = {
  name: 'Row-heavy · 200 rows (virtualized)',
  args: {
    rows: buildManyRows(200),
    rowHeight: 28,
    maxViewportHeight: 400
  },
  parameters: {
    docs: { description: { story: 'Row-heavy instead of segment-heavy: 200 rows in a fixed-height, scrollable viewport. Only the rows currently on screen mount a canvas — scroll to see more render in.' } }
  }
};

// A real epoch-ms domain — the same shape the "Segment Activities" feature feeds this
// component with, just standing in for recipe-step names instead of app-specific data.
const STEP_NAMES = ['Wafer Origin', 'RIC Step', 'Optimization RIC', 'AutoRun', 'AutoCalibration', 'Alignment', 'Acquisition', 'MFG Set LEDs', 'Measurement'];
const DOMAIN_START = Date.UTC(2026, 4, 4, 8, 3, 0);
const DOMAIN_SPAN_MS = 10 * 60 * 1000; // 10 minutes, matching the reference design

function buildTimestampRows(): BaseGanttRow[] {
  return STEP_NAMES.map((label, r) => {
    const segments: BaseGanttSegment[] = [];
    let t = DOMAIN_START + r * 4_000;
    while (t < DOMAIN_START + DOMAIN_SPAN_MS) {
      const duration = 800 + Math.random() * 3_000;
      const end = Math.min(DOMAIN_START + DOMAIN_SPAN_MS, t + duration);
      const failed = Math.random() < 0.06;
      segments.push({ startHour: t, endHour: end, state: failed ? 'unscheduled-dt' : 'production', label: failed ? 'Fail' : undefined });
      t = end + 2_000 + Math.random() * 15_000;
    }
    return { label, segments };
  });
}

function formatClockTick(epochMs: number): string {
  const d = new Date(epochMs);
  const p = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}:${p(d.getMilliseconds(), 3)}`;
}

function formatMsDuration(spanMs: number): string {
  return spanMs < 1000 ? `${Math.round(spanMs)}ms` : `${(spanMs / 1000).toFixed(1)}s`;
}

export const RealTimestampDomain: Story = {
  name: 'Real timestamp domain (HH:MM:SS:mmm axis)',
  args: {
    rows: buildTimestampRows(),
    domainStart: DOMAIN_START,
    totalHours: DOMAIN_SPAN_MS,
    axisTickFormat: formatClockTick,
    durationFormat: formatMsDuration,
    legendStates: ['production', 'unscheduled-dt']
  },
  parameters: {
    docs: {
      description: {
        story:
          '`startHour`/`endHour` hold real epoch-ms timestamps here, `domainStart` anchors the axis, ' +
          'and `axisTickFormat`/`durationFormat` render clock time instead of hours. This is the exact ' +
          'shape the Segment Activities screen uses for its recipe-step timeline.'
      }
    }
  }
};

export const NonInteractive: Story = {
  name: 'Zoom & filter disabled',
  args: { zoomable: false, filterable: false },
  parameters: {
    docs: { description: { story: 'For read-only embeds (report snapshots, print views) — disables drag-to-zoom and the row/state multi-select filter, hiding the Reset Zoom/Reset Filter links.' } }
  }
};

export const SegmentBoundaries: Story = {
  name: 'Segment boundaries (state-change seam + baseline inset)',
  args: {
    rows: [
      {
        label: 'ARC-11', badge: '88%',
        segments: [
          { startHour: 0, endHour: 4, state: 'production' },
          { startHour: 4, endHour: 4.6, state: 'standby' },
          { startHour: 4.6, endHour: 9, state: 'production' },
          { startHour: 9, endHour: 9.4, state: 'scheduled-dt' },
          { startHour: 9.4, endHour: 16, state: 'production' },
          { startHour: 16, endHour: 16.3, state: 'unscheduled-dt' },
          { startHour: 16.3, endHour: 24, state: 'production' }
        ]
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story:
          'Every time the winning state actually changes between two adjacent segments, a 1px seam ' +
          "of the track's background shows through so the two blocks read as discrete segments " +
          'rather than one bar that happens to change color — matching the white gaps between state ' +
          'blocks called out in the C9 design review. Two adjacent segments that share the same ' +
          'state still merge into one unbroken block; there is nothing to show a boundary for. Each ' +
          "bar also stops short of the lane's bottom edge instead of filling it edge-to-edge, so a " +
          'thin baseline gap shows under the color the whole way across — hover hit-testing is keyed ' +
          'on x only, so the inset has no effect on it.'
      }
    }
  }
};

// Per-day rows that each hold two mutually-exclusive tracks: a "System" state-bar lane and a
// "Tool" event-marker lane. Neither lane's own content overlaps itself, and the two lanes are
// independent of each other — exactly the shape called out in the C9 design review ("two
// levels/lines per row ... our lines are mutually exclusive and do not overlap"). Each day is
// deliberately built from several short segments (not just one downtime window) so the System
// lane shows multiple state-change seams, and the Tool lane's markers are derived FROM those same
// transitions — one at every boundary where System actually changes state — so the two lanes read
// as correlated (a tool action logged against each system state change) rather than unrelated data.
interface LaneDay { date: string; badge: string; segments: { endHour: number; state: BaseMachineState; label?: string }[]; }

const LANE_DAYS: LaneDay[] = [
  {
    date: '07-13', badge: '89%',
    segments: [
      { endHour: 4, state: 'production' },
      { endHour: 4.6, state: 'standby' },
      { endHour: 9, state: 'production' },
      { endHour: 9.6, state: 'unscheduled-dt', label: 'Chamber interlock' },
      { endHour: 16, state: 'production' },
      { endHour: 16.4, state: 'scheduled-dt' },
      { endHour: 24, state: 'production' }
    ]
  },
  {
    date: '07-14', badge: '100%',
    segments: [{ endHour: 24, state: 'production' }]
  },
  {
    date: '07-15', badge: '81%',
    segments: [
      { endHour: 2, state: 'production' },
      { endHour: 2.4, state: 'standby' },
      { endHour: 11, state: 'production' },
      { endHour: 15, state: 'unscheduled-dt', label: 'Robot fault' },
      { endHour: 20, state: 'production' },
      { endHour: 20.3, state: 'standby' },
      { endHour: 24, state: 'production' }
    ]
  },
  {
    date: '07-16', badge: '96%',
    segments: [
      { endHour: 6, state: 'production' },
      { endHour: 6.4, state: 'scheduled-dt' },
      { endHour: 24, state: 'production' }
    ]
  }
];

function buildLaneRows(): BaseGanttRow[] {
  return LANE_DAYS.map(day => {
    const systemSegments: BaseGanttSegment[] = [];
    let hour = 0;
    for (const seg of day.segments) {
      systemSegments.push({ startHour: hour, endHour: seg.endHour, state: seg.state, label: seg.label });
      hour = seg.endHour;
    }

    // One Tool marker per System boundary that's an actual state change — the same transitions
    // that draw a segment-boundary seam above — so each green tick sits directly under the seam
    // it corresponds to.
    const toolMarkers: BaseGanttMarker[] = [];
    for (let i = 1; i < systemSegments.length; i++) {
      const curr = systemSegments[i];
      const enteringDowntime = curr.state !== 'production';
      toolMarkers.push({
        hour: curr.startHour,
        label: enteringDowntime
          ? `Tool paused · ${curr.label ?? BASE_MACHINE_STATE_META[curr.state].label}`
          : `Tool resumed · ${curr.startHour.toFixed(1)}h`
      });
    }

    return {
      label: day.date,
      badge: day.badge,
      segments: [],
      lanes: [
        { label: 'System E10', segments: systemSegments },
        { label: 'Tool E10', markers: toolMarkers }
      ]
    };
  });
}

export const MutuallyExclusiveSubRows: Story = {
  name: 'Mutually exclusive sub-rows (System + Tool lanes)',
  args: {
    rows: buildLaneRows(),
    rowHeight: 40
  },
  parameters: {
    docs: {
      description: {
        story:
          'Each `BaseGanttRow` can carry `lanes` instead of (or in addition to) a flat `segments` list — ' +
          'stacked sub-rows sharing one row label, e.g. a "System" state lane above a "Tool" event lane. ' +
          "A lane's own content is expected to be mutually exclusive in time (it never overlaps itself), " +
          "and lanes don't merge into each other via `STATE_PRIORITY` collision handling the way segments " +
          'on a single lane do — each is drawn and hover-tested independently. Segment lanes (`segments`) ' +
          'render as colored state blocks — including the 1px boundary seam between state changes, see ' +
          '"Segment boundaries" above; marker lanes (`markers`) render as thin event ticks. The System ' +
          "lane here is built from several short segments (not one downtime block) so its boundary " +
          "seams show clearly, and the Tool lane's markers are generated from those same System " +
          'transitions — one "Tool paused"/"Tool resumed" tick per System state change — so each tick ' +
          "lines up under the seam it corresponds to instead of showing unrelated data. Bump " +
          '`rowHeight` to give multi-lane rows more vertical room — it splits evenly across the lane count.'
      }
    }
  }
};
