import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRangeSliderComponent } from '../../app/base';

/** Two bounded handles over one track — a from/to pair, e.g. a maintenance window. Either
 *  handle stays independently grabbable even when they're side by side. */
const meta: Meta<BaseRangeSliderComponent> = {
  title: 'Base/Forms/Range Slider',
  component: BaseRangeSliderComponent,
  tags: ['autodocs'],
  args: { label: 'Maintenance window', min: 0, max: 24, step: 1, unit: 'h', value: { from: 0, to: 12 }, disabled: false }
};
export default meta;
type Story = StoryObj<BaseRangeSliderComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
