import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBarChartComponent } from '../../app/base';

const meta: Meta<BaseBarChartComponent> = {
  title: 'Base/Charts & Visualization/Bar Chart',
  component: BaseBarChartComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] }
  },
  args: {
    data: [
      { x: 'FAM', y: 42 }, { x: 'FCM', y: 28 }, { x: 'TQual', y: 15 }, { x: 'Alarm', y: 63 }
    ],
    orientation: 'vertical',
    valueSuffix: ''
  }
};
export default meta;
type Story = StoryObj<BaseBarChartComponent>;

export const Default: Story = {};

export const PerBarTone: Story = {
  args: {
    data: [
      { x: 'Dec', y: 14 }, { x: 'Jan', y: 16 }, { x: 'Feb', y: 27, tone: 'error' }, { x: 'Mar', y: 15 },
      { x: 'Apr', y: 11 }, { x: 'May', y: 10 }, { x: 'Jun', y: 8 }, { x: 'Jul', y: 6, tone: 'success' }
    ]
  }
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    valueSuffix: ' h',
    data: [
      { x: 'Chamber', y: 42, tone: 'error' },
      { x: 'Handling', y: 28, tone: 'warning' },
      { x: 'Optics', y: 19, tone: 'accent' },
      { x: 'Software', y: 11, tone: 'action' },
      { x: 'Facilities', y: 6, tone: 'info' }
    ]
  }
};

export const Stacked: Story = {
  args: {
    valueSuffix: ' h',
    data: [
      { x: 'SP7-04', y: 0, segments: [{ value: 18, tone: 'success', label: 'Production' }, { value: 4, tone: 'action', label: 'Engineering' }, { value: 2, tone: 'error', label: 'Unscheduled DT' }] },
      { x: 'CAN-02', y: 0, segments: [{ value: 20, tone: 'success', label: 'Production' }, { value: 3, tone: 'accent', label: 'Standby' }, { value: 1, tone: 'warning', label: 'Scheduled DT' }] }
    ]
  }
};

export const StackedHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    valueSuffix: ' h',
    data: [
      { x: 'SP7-04', y: 0, segments: [{ value: 18, tone: 'success' }, { value: 4, tone: 'action' }, { value: 2, tone: 'error' }] },
      { x: 'CAN-02', y: 0, segments: [{ value: 20, tone: 'success' }, { value: 3, tone: 'accent' }, { value: 1, tone: 'warning' }] }
    ]
  }
};
