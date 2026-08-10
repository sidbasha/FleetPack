import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSliderComponent } from '../../app/base';

/** Bounded numeric range slider with a visible current value. */
const meta: Meta<BaseSliderComponent> = {
  title: 'Base/Forms/Slider',
  component: BaseSliderComponent,
  tags: ['autodocs'],
  args: { label: 'Alarm sensitivity', min: 0, max: 100, step: 1, value: 72 }
};
export default meta;
type Story = StoryObj<BaseSliderComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
