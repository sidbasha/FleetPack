import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDatepickerComponent } from '../../app/base';

const meta: Meta<BaseDatepickerComponent> = {
  title: 'Base/Forms/Date Picker',
  component: BaseDatepickerComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  args: {
    label: 'Maintenance date',
    placeholder: 'Select date...',
    value: null,
    hint: '',
    error: '',
    disabled: false,
    clearable: true,
    min: null,
    max: null,
    weekStart: 1,
    showTime: false
  },
  render: (args) => ({
    props: args,
    template: `<base-datepicker [label]="label" [placeholder]="placeholder" [value]="value"
                                 [hint]="hint" [error]="error" [disabled]="disabled" [clearable]="clearable"
                                 [min]="min" [max]="max" [weekStart]="weekStart" [showTime]="showTime" />`
  })
};
export default meta;
type Story = StoryObj<BaseDatepickerComponent>;

export const Default: Story = {};
export const Selected: Story = { args: { value: new Date() } };
export const WithHint: Story = { args: { hint: 'Weekends disabled' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Maintenance date is required.' } };
export const Disabled: Story = { args: { value: new Date(), disabled: true } };

export const WithTime: Story = { args: { label: 'Scheduled at', showTime: true, value: new Date() } };
