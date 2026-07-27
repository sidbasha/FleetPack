import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRadioGroupComponent, BaseSelectOption } from '../../app/base';

const SHIFT_OPTIONS: BaseSelectOption<string>[] = [
  { label: 'Day', value: 'day' },
  { label: 'Swing', value: 'swing' },
  { label: 'Night', value: 'night' },
  { label: 'Weekend (unstaffed)', value: 'weekend', disabled: true }
];

const meta: Meta<BaseRadioGroupComponent> = {
  title: 'Base/Forms/Radio Group',
  component: BaseRadioGroupComponent,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] }
  },
  args: {
    label: 'Shift',
    options: SHIFT_OPTIONS,
    value: 'day',
    direction: 'horizontal',
    disabled: false
  }
};
export default meta;
type Story = StoryObj<BaseRadioGroupComponent>;

export const Horizontal: Story = {};
export const Vertical: Story = { args: { direction: 'vertical' } };
export const Disabled: Story = { args: { disabled: true } };
