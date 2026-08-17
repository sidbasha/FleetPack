import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTextareaComponent } from '../../app/base';

const meta: Meta<BaseTextareaComponent> = {
  title: 'Base/Forms/Textarea',
  component: BaseTextareaComponent,
  tags: ['autodocs'],
  args: {
    label: 'Notes',
    placeholder: 'Handover notes...',
    value: '',
    rows: 3,
    hint: '',
    error: '',
    disabled: false,
    maxLength: 0
  },
  render: (args) => ({
    props: args,
    template: `<base-textarea [label]="label" [placeholder]="placeholder" [value]="value" [rows]="rows"
                               [hint]="hint" [error]="error" [disabled]="disabled" [maxLength]="maxLength" />`
  })
};
export default meta;
type Story = StoryObj<BaseTextareaComponent>;

export const Default: Story = {};
export const WithCharacterCounter: Story = {
  args: { value: 'Replaced chuck heater, verified calibration.', maxLength: 200 }
};
export const ErrorState: Story = { name: 'Error', args: { error: 'Notes are required before closing this ticket.' } };
export const Disabled: Story = { args: { value: 'Locked after sign-off.', disabled: true } };
