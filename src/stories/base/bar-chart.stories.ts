import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBarChartComponent } from '../../app/base';

const meta: Meta<BaseBarChartComponent> = {
  title: 'Base/Charts & Visualization/Bar Chart',
  component: BaseBarChartComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    zoomable: { control: 'boolean' }
  },
  args: {
    data: [
      { x: 'FAM', y: 42 }, { x: 'FCM', y: 28 }, { x: 'TQual', y: 15 }, { x: 'Alarm', y: 63 }
    ],
    orientation: 'vertical',
    valueSuffix: ''
  },
  parameters: {
    docs: {
      description: {
        component: 'Drag-select to zoom: horizontally across the bars in vertical mode, vertically down the category list in horizontal mode. A "Reset Zoom" link appears once zoomed. Clicking bars/categories selects which show — any number at once, with a "Reset Filter" link.'
      }
    }
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

const TONES = ['action', 'accent', 'info', 'success', 'warning', 'error'] as const;

export const LargeDatasetVertical: Story = {
  name: 'Large dataset · 60 bars (drag to zoom)',
  args: {
    data: Array.from({ length: 60 }, (_, i) => ({ x: `W${i + 1}`, y: Math.round(20 + Math.random() * 80) }))
  }
};

export const LargeDatasetHorizontal: Story = {
  name: 'Large dataset · 40 rows (drag to zoom)',
  args: {
    orientation: 'horizontal',
    valueSuffix: ' h',
    data: Array.from({ length: 40 }, (_, i) => ({
      x: `TOOL-${(i + 1).toString().padStart(3, '0')}`,
      y: Math.round(2 + Math.random() * 48),
      tone: TONES[i % TONES.length]
    }))
  }
};

export const ZoomDisabled: Story = { args: { zoomable: false } };
