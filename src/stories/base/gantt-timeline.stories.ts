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
  args: { rows }
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
  }
};
