import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDropdownMenuComponent, BaseMenuItem } from '../../app/base';

const ITEMS: BaseMenuItem[] = [
  { id: 'export', label: 'Export CSV', icon: '⬇️' },
  { id: 'assign', label: 'Assign to group', icon: '👥' },
  { id: 'disable', label: 'Disable selected', icon: '🚫', dividerBefore: true, disabled: true },
  { id: 'delete', label: 'Delete', icon: '🗑', danger: true }
];

const meta: Meta<BaseDropdownMenuComponent> = {
  title: 'Base/Navigation/Dropdown Menu',
  component: BaseDropdownMenuComponent,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    label: 'Bulk actions',
    items: ITEMS,
    align: 'left',
    disabled: false
  },
  parameters: {
    // Menu opens on click and is not open by default - story canvas needs room for the popup.
    layout: 'padded'
  }
};
export default meta;
type Story = StoryObj<BaseDropdownMenuComponent>;

export const Default: Story = {};
export const AlignedRight: Story = { args: { align: 'right' } };
export const Disabled: Story = { args: { disabled: true } };

/** Click the trigger in the canvas to see items, a divider, a disabled item, and a destructive item together. */
export const OpenExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-end pt-24 pr-4">
        <base-dropdown-menu [label]="label" [items]="items" [align]="align" [disabled]="disabled" />
      </div>`
  })
};
