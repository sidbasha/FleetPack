import type { Meta, StoryObj } from '@storybook/angular';
import { BaseHistogramComponent } from '../../app/base';

const meta: Meta<BaseHistogramComponent> = {
  title: 'Base/Charts & Visualization/Histogram',
  component: BaseHistogramComponent,
  tags: ['autodocs'],
  argTypes: {
    zoomable: { control: 'boolean' }
  },
  args: {
    bins: [
      { label: '0-1h', count: 4 }, { label: '1-2h', count: 12 }, { label: '2-4h', count: 22 },
      { label: '4-8h', count: 15 }, { label: '8h+', count: 6 }
    ]
  },
  parameters: {
    docs: {
      description: {
        component: 'Drag-select across the bins to zoom into a range; a "Reset Zoom" link appears once zoomed.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseHistogramComponent>;

export const Default: Story = {};

export const ManyBins: Story = {
  name: 'Large dataset · 40 bins (drag to zoom)',
  args: {
    bins: Array.from({ length: 40 }, (_, i) => ({
      label: `${i}-${i + 1}h`,
      count: Math.round(30 * Math.exp(-((i - 12) ** 2) / 80) + Math.random() * 4)
    }))
  }
};

export const ZoomDisabled: Story = { args: { zoomable: false } };
