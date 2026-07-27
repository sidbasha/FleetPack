import type { Meta, StoryObj } from '@storybook/angular';
import { BaseToggleComponent } from '../../app/base';

const meta: Meta<BaseToggleComponent> = {
  title: 'Base/Forms/Toggle',
  component: BaseToggleComponent,
  tags: ['autodocs'],
  args: {
    label: 'Auto-refresh',
    checked: false,
    disabled: false
  }
};
export default meta;
type Story = StoryObj<BaseToggleComponent>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };
