import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRangeSliderComponent } from '../../app/base';

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
