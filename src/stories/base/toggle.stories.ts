import type { Meta, StoryObj } from '@storybook/angular';
import { BaseToggleComponent } from '../../app/base';

/** Applies immediately with no Save button. Reach for `<base-checkbox>` instead the moment the
 *  change is part of a form that gets submitted — if the operator has to press Save afterwards,
 *  it's a checkbox. */
const meta: Meta<BaseToggleComponent> = {
  title: 'Base/Forms/Toggle',
  component: BaseToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'] },
    tone: { control: 'select', options: ['action', 'success'] }
  },
  args: {
    label: 'Auto-refresh',
    checked: false,
    disabled: false,
    size: 'md',
    tone: 'action'
  },
  // See checkbox.stories.ts - avoids Storybook force-assigning inherited internal
  // signal state (BaseControl's `formDisabled`) as if it were a plain input.
  render: (args) => ({
    props: args,
    template: `<base-toggle [label]="label" [checked]="checked" [disabled]="disabled" [size]="size" [tone]="tone" />`
  })
};
export default meta;
type Story = StoryObj<BaseToggleComponent>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };
export const ActionTone: Story = { name: 'Action tone (success)', args: { checked: true, tone: 'success' } };
export const Large: Story = { args: { checked: true, size: 'lg', label: 'Large 44×24' } };

export const AllStates: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <base-toggle label="Off" />
        <base-toggle label="On" [checked]="true" />
        <base-toggle label="Disabled" [disabled]="true" />
        <base-toggle label="Action tone" [checked]="true" tone="success" />
        <base-toggle label="Large 44×24" [checked]="true" size="lg" />
      </div>`
  })
};
