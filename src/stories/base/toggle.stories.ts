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
  },
  // See checkbox.stories.ts - avoids Storybook force-assigning inherited internal
  // signal state (BaseControl's `formDisabled`) as if it were a plain input.
  render: (args) => ({
    props: args,
    template: `<base-toggle [label]="label" [checked]="checked" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseToggleComponent>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };
