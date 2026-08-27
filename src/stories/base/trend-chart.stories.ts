import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTrendChartComponent } from '../../app/base';

const WEEKS = ['25-20', '25-26', '25-32', '25-38', '25-44', '26-02', '26-08'];
const ACTUAL = [98, 91, 78, 62, 58, 74, 96];

const meta: Meta<BaseTrendChartComponent> = {
  title: 'Base/Charts & Visualization/Trend Chart',
  component: BaseTrendChartComponent,
  tags: ['autodocs'],
  argTypes: {
    zoomable: { control: 'boolean' }
  },
  args: {
    data: WEEKS.map((x, i) => ({ x, y: ACTUAL[i] })),
    rolling4w: [96, 93, 84, 71, 63, 68, 88],
    rolling13w: [90, 89, 85, 79, 74, 73, 78],
    target: 95,
    targetLabel: '95% Target',
    seriesLabel: 'Work Week (actual)'
  },
  parameters: {
    docs: {
      description: {
        component: 'Drag-select across the chart to zoom into a range of points (a "Reset Zoom" link appears once zoomed); the y-axis and rolling-average overlays rescale to whatever is visible.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseTrendChartComponent>;

export const Default: Story = {};
export const SingleSeries: Story = { args: { rolling4w: [], rolling13w: [], target: undefined } };

const LARGE_WEEKS = Array.from({ length: 156 }, (_, i) => `${24 + Math.floor(i / 52)}-${String((i % 52) + 1).padStart(2, '0')}`);
const LARGE_ACTUAL = LARGE_WEEKS.map((_, i) => 75 + 20 * Math.sin(i / 6) + (Math.random() * 6 - 3));

export const LargeDataset: Story = {
  name: 'Large dataset · 3 years weekly (drag to zoom)',
  args: {
    data: LARGE_WEEKS.map((x, i) => ({ x, y: Math.round(LARGE_ACTUAL[i]) })),
    rolling4w: [],
    rolling13w: [],
    target: 95
  },
  parameters: {
    docs: { description: { story: '156 weekly points — the point labels below the axis thin out automatically, and the useful move is a drag-select to zoom into any sub-range.' } }
  }
};

export const ZoomDisabled: Story = {
  args: { zoomable: false }
};
