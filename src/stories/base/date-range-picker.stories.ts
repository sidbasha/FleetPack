import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDateRangePickerComponent, DateRangeValue } from '../../app/base';

const ALL_VALUE: DateRangeValue = { preset: 'all', from: null, to: null };

const meta: Meta<BaseDateRangePickerComponent> = {
  title: 'Base/Forms/Date Range Picker',
  component: BaseDateRangePickerComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    value: ALL_VALUE,
    disabled: false,
    disableFuture: true,
    minDate: null,
    maxDate: null,
    align: 'left'
  },
  render: (args) => ({
    props: args,
    template: `<base-date-range-picker [value]="value" [disabled]="disabled" [disableFuture]="disableFuture"
                                        [minDate]="minDate" [maxDate]="maxDate" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseDateRangePickerComponent>;

export const Default: Story = {};

export const Last7Days: Story = { args: { value: { preset: 'last7', from: null, to: null } } };

export const CustomRangeSelected: Story = {
  args: {
    value: {
      preset: 'custom',
      from: new Date(2026, 6, 15),
      to: new Date(2026, 6, 22),
      fromTime: { h: 9, m: 0 },
      toTime: { h: 18, m: 30 }
    }
  }
};

export const Disabled: Story = { args: { disabled: true } };

export const AlignedRight: Story = {
  args: { align: 'right' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-end pt-4 pr-4">
        <base-date-range-picker [value]="value" [disabled]="disabled" [disableFuture]="disableFuture"
                                 [minDate]="minDate" [maxDate]="maxDate" [align]="align" />
      </div>`
  })
};
