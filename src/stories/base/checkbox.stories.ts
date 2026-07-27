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
  }
};
export default meta;
type Story = StoryObj<BaseCheckboxComponent>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { checked: true, disabled: true } };
