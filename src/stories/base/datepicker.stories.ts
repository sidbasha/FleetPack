import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDatepickerComponent } from '../../app/base';

const meta: Meta<BaseDatepickerComponent> = {
  title: 'Base/Forms/Date Picker',
  component: BaseDatepickerComponent,
  tags: ['autodocs'],
  parameters: {
    // The popup calendar renders at document level and can get clipped by the docs iframe.
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
  // See checkbox.stories.ts - avoids Storybook force-assigning inherited/internal
  // signal state (BaseControl's `formDisabled`, plus this component's own `open`/
  // `displayText`/`monthLabel`/`cells`) as if it were a plain input.
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
/** Click the field in the canvas to open the calendar. */
export const WithHint: Story = { args: { hint: 'Weekends disabled' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Maintenance date is required.' } };
export const Disabled: Story = { args: { value: new Date(), disabled: true } };

/** Picking a date leaves the panel open so the HH:MM boxes can be adjusted before Close. */
export const WithTime: Story = { args: { label: 'Scheduled at', showTime: true, value: new Date() } };
