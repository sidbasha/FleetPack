import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTrendChartComponent } from '../../app/base';

const WEEKS = ['25-20', '25-26', '25-32', '25-38', '25-44', '26-02', '26-08'];
const ACTUAL = [98, 91, 78, 62, 58, 74, 96];

/** Rolling-average line chart with optional target band and area fill. */
const meta: Meta<BaseTrendChartComponent> = {
  title: 'Base/Charts & Visualization/Trend Chart',
  component: BaseTrendChartComponent,
  tags: ['autodocs'],
  args: {
    data: WEEKS.map((x, i) => ({ x, y: ACTUAL[i] })),
    rolling4w: [96, 93, 84, 71, 63, 68, 88],
    rolling13w: [90, 89, 85, 79, 74, 73, 78],
    target: 95,
    targetLabel: '95% Target',
    seriesLabel: 'Work Week (actual)'
  }
};
export default meta;
type Story = StoryObj<BaseTrendChartComponent>;

export const Default: Story = {};
export const SingleSeries: Story = { args: { rolling4w: [], rolling13w: [], target: undefined } };
