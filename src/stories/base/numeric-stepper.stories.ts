import type { Meta, StoryObj } from '@storybook/angular';
import { BaseNumericStepperComponent } from '../../app/base';

const meta: Meta<BaseNumericStepperComponent> = {
  title: 'Base/Forms/Numeric Stepper',
  component: BaseNumericStepperComponent,
  tags: ['autodocs'],
  args: { label: 'Retry limit', value: 12, min: 0, max: 20, stepSize: 1, disabled: false },
  render: (args) => ({
    props: args,
    template: `<base-numeric-stepper [label]="label" [value]="value" [min]="min" [max]="max" [stepSize]="stepSize" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseNumericStepperComponent>;

export const Default: Story = {};
export const AtMin: Story = { args: { value: 0 } };
export const AtMax: Story = { args: { value: 20 } };
export const Disabled: Story = { args: { disabled: true } };
