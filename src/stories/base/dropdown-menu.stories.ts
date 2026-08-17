import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDropdownMenuComponent, BaseMenuItem } from '../../app/base';

const ITEMS: BaseMenuItem[] = [
  { id: 'export', label: 'Export CSV', icon: '⬇️' },
  { id: 'assign', label: 'Assign to group', icon: '👥' },
  { id: 'disable', label: 'Disable selected', icon: '🚫', dividerBefore: true, disabled: true },
  { id: 'delete', label: 'Delete', icon: '🗑', danger: true }
];

const TOOL_ACTIONS: BaseMenuItem[] = [
  { id: 'deep-dive', label: 'Open deep dive', icon: '👁', shortcut: 'O' },
  { id: 'thresholds', label: 'Edit thresholds', icon: '✎', shortcut: 'E' },
  { id: 'copy-id', label: 'Copy tool ID', icon: '📋' },
  { id: 'export-history', label: 'Export history', icon: '⬇', dividerBefore: true },
  { id: 'compare', label: 'Compare — select two tools', icon: '⧉', disabled: true },
  { id: 'archive', label: 'Archive tool', icon: '🗄', dividerBefore: true, danger: true }
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
    layout: 'padded'
  },
  render: (args) => ({
    props: args,
    template: `<base-dropdown-menu [label]="label" [items]="items" [align]="align" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseDropdownMenuComponent>;

export const Default: Story = {};
export const AlignedRight: Story = { args: { align: 'right' } };
export const Disabled: Story = { args: { disabled: true } };

export const OpenExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-end pt-24 pr-4">
        <base-dropdown-menu [label]="label" [items]="items" [align]="align" [disabled]="disabled" />
      </div>`
  })
};

export const ToolActions: Story = {
  args: { label: 'Tool actions', items: TOOL_ACTIONS },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex justify-end pt-24 pr-4">
        <base-dropdown-menu [label]="label" [items]="items" [align]="align" [disabled]="disabled" />
      </div>`
  })
};
