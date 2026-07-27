import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxComponent } from '../../app/base';

const meta: Meta<BaseCheckboxComponent> = {
  title: 'Base/Forms/Checkbox',
  component: BaseCheckboxComponent,
  tags: ['autodocs'],
  args: {
    label: 'Include engineering tools',
    checked: false,
    disabled: false
  },
  // Explicit render: BaseCheckboxComponent inherits internal signal state (e.g. `formDisabled`)
  // from BaseControl that isn't a real @Input - Storybook's auto-generated wrapper force-assigns
  // any arg key it doesn't recognize as a real input directly onto the instance, which stomps
  // that internal signal and breaks the template. A hand-written template avoids that path.
  render: (args) => ({
    props: args,
    template: `<base-checkbox [label]="label" [checked]="checked" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseCheckboxComponent>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { checked: true, disabled: true } };
