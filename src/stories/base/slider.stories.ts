import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSliderComponent } from '../../app/base';

/** Arrow keys step by 1, Page Up/Down step by 10; the current value is
 *  always visible as a number, never hidden behind the thumb alone. */
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
