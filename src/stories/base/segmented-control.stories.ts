import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSegmentedControlComponent } from '../../app/base';

/** A closed set of 2–4 mutually exclusive view options. Reserve for options
 *  that fit one line without wrapping; beyond that, `<base-select>` reads
 *  better than a segmented control that wraps to a second row. */
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
