import type { Meta, StoryObj } from '@storybook/angular';
import { BaseManageColumnsComponent, ManageColumnItem } from '../../app/base';

const ITEMS: ManageColumnItem[] = [
  { key: 'toolId', header: 'Tool', locked: true, pin: 'left', widthPx: 120 },
  { key: 'chamber', header: 'Chamber', locked: false, widthPx: 110 },
  { key: 'fab', header: 'Fab', locked: false, widthPx: 100 },
  { key: 'status', header: 'Status', locked: false, widthPx: 120 },
  { key: 'uptime', header: 'Uptime %', locked: false, widthPx: 110 },
  { key: 'alarms', header: 'Alarms', locked: false, widthPx: 90 },
  { key: 'lastMaint', header: 'Last Maintenance', locked: false, widthPx: 160 },
  { key: 'actions', header: 'Actions', locked: true, pin: 'right', widthPx: 90 }
];

const meta: Meta<BaseManageColumnsComponent> = {
  title: 'Base/Tables & Data/Manage Columns',
  component: BaseManageColumnsComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] },
    budgetPercent: { control: { type: 'number', min: 0, max: 100, step: 5 } }
  },
  args: {
    items: ITEMS,
    visibleKeys: ITEMS.filter((i) => !i.locked).map((i) => i.key),
    align: 'left',
    budgetPercent: 40
  },
  render: (args) => ({
    props: args,
    template: `<base-manage-columns [items]="items" [visibleKeys]="visibleKeys" [align]="align" [budgetPercent]="budgetPercent" />`
  })
};
export default meta;
type Story = StoryObj<BaseManageColumnsComponent>;

export const Default: Story = {};

export const MostlyHidden: Story = {
  args: { visibleKeys: ['toolId', 'status', 'actions'] }
};

/**
 * A scrollable column (`chamber`) the user has already pinned left, in
 * addition to the identity-locked `toolId` — shows the Pinned left group
 * holding both a locked row and a draggable, unpinnable-by-drag-out one
 * side by side.
 */
export const WithUserPinnedColumn: Story = {
  args: {
    items: ITEMS.map((i) => (i.key === 'chamber' ? { ...i, pin: 'left' as const } : i))
  }
};

/**
 * Pinning most of the table's width pushes the budget meter past its
 * threshold — advisory only, Apply still works, but the bar and label
 * switch to the error tone.
 */
export const OverBudget: Story = {
  args: {
    items: ITEMS.map((i) => (['chamber', 'fab', 'status', 'uptime'].includes(i.key) ? { ...i, pin: 'left' as const } : i)),
    budgetPercent: 30
  }
};
