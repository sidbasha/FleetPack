import type { Meta, StoryObj } from '@storybook/angular';
import { BaseOtpInputComponent } from '../../app/base';

const meta: Meta<BaseOtpInputComponent> = {
  title: 'Base/Forms/OTP Input',
  component: BaseOtpInputComponent,
  tags: ['autodocs'],
  args: { label: 'One-time passcode', length: 6, value: '481', hint: 'Sent to the authenticator on your badge.', error: '', disabled: false },
  render: (args) => ({
    props: args,
    template: `<base-otp-input [label]="label" [length]="length" [value]="value" [hint]="hint" [error]="error" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseOtpInputComponent>;

export const Default: Story = {};
export const ErrorState: Story = {
  name: 'Error',
  args: { value: '481009', hint: '', error: 'Code expired. Request a new one.' }
};
export const Disabled: Story = { args: { disabled: true } };
