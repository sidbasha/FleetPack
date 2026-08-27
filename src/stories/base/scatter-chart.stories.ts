import type { Meta, StoryObj } from '@storybook/angular';
import { BaseScatterChartComponent } from '../../app/base';

const meta: Meta<BaseScatterChartComponent> = {
  title: 'Base/Charts & Visualization/Scatter Chart',
  component: BaseScatterChartComponent,
  tags: ['autodocs'],
  argTypes: {
    zoomable: { control: 'boolean' }
  },
  args: {
    data: [
      { x: 12, y: 88, label: 'RAPID-701' }, { x: 34, y: 76 }, { x: 55, y: 92 },
      { x: 61, y: 58 }, { x: 78, y: 81 }, { x: 90, y: 95 }
    ]
  },
  parameters: {
    docs: {
      description: {
        component: 'Drag-select a rectangle to zoom into that x/y region — both axes rescale to the selection, and points outside it drop out. "Reset Zoom" restores the full domain.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseScatterChartComponent>;

export const Default: Story = {};

export const LargeDataset: Story = {
  name: 'Large dataset · 300 points (rectangle zoom)',
  args: {
    data: Array.from({ length: 300 }, () => ({
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100)
    }))
  }
};

export const ZoomDisabled: Story = { args: { zoomable: false } };
