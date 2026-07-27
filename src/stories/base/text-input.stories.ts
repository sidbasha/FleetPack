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
    label: 'Tool ID',
    placeholder: 'e.g. KLA-1042',
    value: '',
    type: 'text',
    hint: '',
    error: '',
    disabled: false,
    required: false,
    clearable: false,
    prefix: '',
    suffix: '',
    maxLength: 0
  },
  // See checkbox.stories.ts - avoids Storybook force-assigning inherited internal
  // signal state (BaseControl's `formDisabled`) as if it were a plain input.
  render: (args) => ({
    props: args,
    template: `<base-text-input [label]="label" [placeholder]="placeholder" [value]="value" [type]="type"
                                 [hint]="hint" [error]="error" [disabled]="disabled" [required]="required"
                                 [clearable]="clearable" [prefix]="prefix" [suffix]="suffix" [maxLength]="maxLength" />`
  })
};
export default meta;
type Story = StoryObj<BaseTextInputComponent>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Search by exact id' } };
export const Clearable: Story = { args: { value: 'KLA-1042', clearable: true } };
export const Required: Story = { args: { required: true } };
export const WithPrefixSuffix: Story = {
  args: { label: 'Threshold', value: '92', type: 'number', suffix: '%' }
};
export const ErrorState: Story = {
  name: 'Error',
  args: { label: 'Threshold', value: '140', suffix: '%', error: 'Must be <= 100' }
};
export const Disabled: Story = { args: { value: 'KLA-1042', disabled: true } };
