import type { Meta, StoryObj } from '@storybook/angular';
import { BaseScatterChartComponent } from '../../app/base';

/** Correlation between two metrics, e.g. MTBR vs utilization. */
const meta: Meta<BaseScatterChartComponent> = {
  title: 'Base/Charts & Visualization/Scatter Chart',
  component: BaseScatterChartComponent,
  tags: ['autodocs'],
  args: {
    data: [
      { x: 12, y: 88, label: 'RAPID-701' }, { x: 34, y: 76 }, { x: 55, y: 92 },
      { x: 61, y: 58 }, { x: 78, y: 81 }, { x: 90, y: 95 }
    ]
  }
};
export default meta;
type Story = StoryObj<BaseScatterChartComponent>;

export const Default: Story = {};
