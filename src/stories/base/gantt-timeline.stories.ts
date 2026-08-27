import type { Meta, StoryObj } from '@storybook/angular';
import { BaseGanttRow, BaseGanttSegment, BaseGanttTimelineComponent, BaseMachineState } from '../../app/base';

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
          '(see "Real timestamp domain" below).'
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
