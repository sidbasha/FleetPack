import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxComponent } from '../../app/base';

/** A checkbox is part of a form that gets submitted — pressing Save is what commits it. Reach
 *  for `<base-toggle>` instead when the change should take effect immediately. */
const meta: Meta<BaseCheckboxComponent> = {
  title: 'Base/Forms/Checkbox',
  component: BaseCheckboxComponent,
  tags: ['autodocs'],
  args: {
    label: 'Include engineering tools',
    checked: false,
    indeterminate: false,
    description: '',
    error: '',
    disabled: false
  },
  // Explicit render: BaseCheckboxComponent inherits internal signal state (e.g. `formDisabled`)
  // from BaseControl that isn't a real @Input - Storybook's auto-generated wrapper force-assigns
  // any arg key it doesn't recognize as a real input directly onto the instance, which stomps
  // that internal signal and breaks the template. A hand-written template avoids that path.
  render: (args) => ({
    props: args,
    template: `<base-checkbox [label]="label" [checked]="checked" [indeterminate]="indeterminate"
                              [description]="description" [error]="error" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseCheckboxComponent>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const WithDescription: Story = {
  args: {
    label: 'Email me on unscheduled downtime', checked: true,
    description: 'Sends within two minutes of the state change, to the address on your profile.'
  }
};
export const ErrorState: Story = { name: 'Error', args: { error: 'This setting is required before saving.' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { checked: true, disabled: true } };

export const AllStates: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <base-checkbox label="Unchecked" />
        <base-checkbox label="Checked" [checked]="true" />
        <base-checkbox label="Indeterminate" [indeterminate]="true" />
        <base-checkbox label="Error" error="Required" />
        <base-checkbox label="Disabled" [disabled]="true" />
        <base-checkbox label="Disabled checked" [checked]="true" [disabled]="true" />
      </div>`
  })
};
