import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTextInputComponent } from '../../app/base';

const meta: Meta<BaseTextInputComponent> = {
  title: 'Base/Forms/Text Input',
  component: BaseTextInputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'email', 'number', 'tel', 'url'] }
  },
  args: {
    label: 'Tool identifier',
    placeholder: 'e.g. SP7-04',
    value: '',
    type: 'text',
    hint: '',
    error: '',
    warning: '',
    success: '',
    loading: false,
    disabled: false,
    readOnly: false,
    required: false,
    clearable: false,
    prefix: '',
    suffix: '',
    maxLength: 0
  },
  render: (args) => ({
    props: args,
    template: `<base-text-input [label]="label" [placeholder]="placeholder" [value]="value" [type]="type"
                                 [hint]="hint" [error]="error" [warning]="warning" [success]="success" [loading]="loading"
                                 [disabled]="disabled" [readOnly]="readOnly" [required]="required"
                                 [clearable]="clearable" [prefix]="prefix" [suffix]="suffix" [maxLength]="maxLength" />`
  })
};
export default meta;
type Story = StoryObj<BaseTextInputComponent>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Format: three letters, hyphen, two digits.' } };
export const Clearable: Story = { args: { value: 'SP7-04', clearable: true } };
export const Required: Story = { args: { required: true } };
export const WithPrefixSuffix: Story = {
  args: { label: 'Threshold', value: '92', type: 'number', suffix: '%' }
};
export const Password: Story = { args: { label: 'Operator key', value: 'operator-key', type: 'password' } };
export const SuccessState: Story = {
  name: 'Success',
  args: { value: 'SP7-04', success: 'Identifier available' }
};
export const WarningState: Story = {
  name: 'Warning',
  args: { value: 'SP7-4', warning: 'Unusual format — check before saving.' }
};
export const ErrorState: Story = {
  name: 'Error',
  args: { value: 'sp7 04', error: 'Use three letters, a hyphen, two digits.' }
};
export const Loading: Story = { args: { value: 'SP7-04', loading: true, hint: 'Checking availability…' } };
export const ReadOnly: Story = { args: { value: 'TOOL-SP7-04', readOnly: true, label: 'Tool ID' } };
export const Disabled: Story = {
  args: { value: 'SP7-04', disabled: true, hint: 'Locked while the tool is in qualification.' }
};

export const AllStates: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
        <base-text-input label="Default" value="SP7-04" />
        <base-text-input label="Filled" value="SP7-04" />
        <base-text-input label="Success" value="SP7-04" success="Identifier available" />
        <base-text-input label="Warning" value="SP7-4" warning="Unusual format — check before saving." />
        <base-text-input label="Error" value="sp7 04" error="Use three letters, a hyphen, two digits." />
        <base-text-input label="Disabled" value="SP7-04" [disabled]="true" hint="Locked while the tool is in qualification." />
        <base-text-input label="Read-only" value="SP7-04" [readOnly]="true" />
        <base-text-input label="Loading" value="SP7-04" [loading]="true" hint="Checking availability…" />
      </div>`
  })
};
