import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSelectionCardComponent } from '../../app/base';

/** One of N, presented as cards instead of `<base-radio-group>`'s dot+label row — reach for
 *  this when each option needs room for a description to be chosen with confidence. */
const meta: Meta<BaseSelectionCardComponent> = {
  title: 'Base/Forms/Selection Cards',
  component: BaseSelectionCardComponent,
  tags: ['autodocs'],
  args: {
    label: 'Selection cadence',
    columns: 3,
    value: 'rolling30',
    disabled: false,
    options: [
      { label: 'Rolling 30 days', value: 'rolling30', description: 'Recalculated nightly at 02:00 local time.', icon: '🔵' },
      { label: 'Fixed window', value: 'fixed', description: 'Pick an explicit start and end date.' },
      { label: 'Since last qual', value: 'lastqual', description: 'Anchors to the most recent qualification.' }
    ]
  },
  render: (args) => ({
    props: args,
    template: `<base-selection-cards [label]="label" [options]="options" [value]="value" [columns]="columns" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseSelectionCardComponent>;

export const Default: Story = {};
export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Rolling 30 days', value: 'rolling30', description: 'Recalculated nightly at 02:00 local time.' },
      { label: 'Fixed window', value: 'fixed', description: 'Pick an explicit start and end date.' },
      { label: 'Since last qual', value: 'lastqual', description: 'Requires at least one completed qualification.', disabled: true }
    ]
  }
};
