import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSegmentedControlComponent } from '../../app/base';

const meta: Meta<BaseSegmentedControlComponent> = {
  title: 'Base/Actions/Segmented Control',
  component: BaseSegmentedControlComponent,
  tags: ['autodocs'],
  args: {
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' }
    ],
    value: 'week'
  }
};
export default meta;
type Story = StoryObj<BaseSegmentedControlComponent>;

export const Default: Story = {};
export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month', disabled: true }
    ]
  }
};
