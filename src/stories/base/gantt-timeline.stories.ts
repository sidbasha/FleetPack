import type { Meta, StoryObj } from '@storybook/angular';
import { BaseGanttRow, BaseGanttTimelineComponent } from '../../app/base';

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
