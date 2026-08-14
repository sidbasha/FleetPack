import type { Meta, StoryObj } from '@storybook/angular';
import { BaseProgressBarComponent } from '../../app/base';

/** Determinate by default — pass [indeterminate] the moment the shape of what's coming is
 *  genuinely unknown. Above ~10 seconds, a determinate bar with an estimate reads better than
 *  a bare spinner: an operator will wait if they know how long. */
const meta: Meta<BaseProgressBarComponent> = {
  title: 'Base/Feedback/Progress Bar',
  component: BaseProgressBarComponent,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['action', 'success', 'warning', 'error'] }
  },
  args: {
    value: 72,
    tone: 'action',
    color: '',
    height: 6,
    showLabel: true,
    indeterminate: false,
    label: ''
  },
  // `clamped`/`colorClass` are internal computeds (not real @Inputs) - see checkbox.stories.ts
  // for why an explicit render avoids Storybook stomping them via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-progress-bar [value]="value" [tone]="tone" [color]="color" [height]="height"
                                  [showLabel]="showLabel" [indeterminate]="indeterminate" [label]="label" />`
  })
};
export default meta;
type Story = StoryObj<BaseProgressBarComponent>;

export const Default: Story = {};
export const NoLabel: Story = { args: { showLabel: false } };
export const Complete: Story = { args: { value: 100, tone: 'success' } };
export const AtRisk: Story = { name: 'At risk (warning tone)', args: { value: 18, tone: 'warning' } };
export const CustomColor: Story = { args: { value: 72, color: '#6366f1' } };
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Waiting for the telemetry service' } };

/** The full "Progress Indicators" panel from the spec. */
export const ProgressIndicators: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 max-w-md">
        <base-progress-bar label="Recomputing availability" [value]="62" tone="action" />
        <base-progress-bar label="Qualification complete" [value]="100" tone="success" />
        <base-progress-bar label="Sync stalled" [value]="34" tone="warning" />
        <base-progress-bar label="Waiting for the telemetry service" [value]="0" tone="action" [indeterminate]="true" />
      </div>`
  })
};
