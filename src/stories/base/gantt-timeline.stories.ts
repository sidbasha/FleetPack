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

/** 24h per-row state segments — the detail view a heatmap cell expands into. */
const meta: Meta<BaseGanttTimelineComponent> = {
  title: 'Base/Charts & Visualization/Gantt Timeline',
  component: BaseGanttTimelineComponent,
  tags: ['autodocs'],
  args: { rows }
};
export default meta;
type Story = StoryObj<BaseGanttTimelineComponent>;

export const Default: Story = {};
