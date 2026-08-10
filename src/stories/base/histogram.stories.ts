import type { Meta, StoryObj } from '@storybook/angular';
import { BaseHistogramComponent } from '../../app/base';

/** Distribution of one metric into touching bars, e.g. downtime-duration buckets. */
const meta: Meta<BaseHistogramComponent> = {
  title: 'Base/Charts & Visualization/Histogram',
  component: BaseHistogramComponent,
  tags: ['autodocs'],
  args: {
    bins: [
      { label: '0-1h', count: 4 }, { label: '1-2h', count: 12 }, { label: '2-4h', count: 22 },
      { label: '4-8h', count: 15 }, { label: '8h+', count: 6 }
    ]
  }
};
export default meta;
type Story = StoryObj<BaseHistogramComponent>;

export const Default: Story = {};
