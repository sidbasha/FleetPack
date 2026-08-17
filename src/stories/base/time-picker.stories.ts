import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTimePickerComponent } from '../../app/base';

const meta: Meta<BaseTimePickerComponent> = {
  title: 'Base/Forms/Time Picker',
  component: BaseTimePickerComponent,
  tags: ['autodocs'],
  args: { label: 'Shift start', value: '06:00', stepMinutes: 30, minTime: '00:00', maxTime: '23:30', disabled: false }
};
export default meta;
type Story = StoryObj<BaseTimePickerComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { value: '' } };
export const Disabled: Story = { args: { disabled: true } };
