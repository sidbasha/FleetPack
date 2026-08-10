import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBarChartComponent } from '../../app/base';

/** Category comparison bar chart, e.g. alarms by module. */
const meta: Meta<BaseBarChartComponent> = {
  title: 'Base/Charts & Visualization/Bar Chart',
  component: BaseBarChartComponent,
  tags: ['autodocs'],
  args: {
    data: [
      { x: 'FAM', y: 42 }, { x: 'FCM', y: 28 }, { x: 'TQual', y: 15 }, { x: 'Alarm', y: 63 }
    ]
  }
};
export default meta;
type Story = StoryObj<BaseBarChartComponent>;

export const Default: Story = {};
