import type { Meta, StoryObj } from '@storybook/angular';
import { BaseManageColumnsComponent, ManageColumnItem } from '../../app/base';

const ITEMS: ManageColumnItem[] = [
  { key: 'toolId', header: 'Tool', locked: true },
  { key: 'chamber', header: 'Chamber', locked: false },
  { key: 'fab', header: 'Fab', locked: false },
  { key: 'status', header: 'Status', locked: false },
  { key: 'uptime', header: 'Uptime %', locked: false },
  { key: 'alarms', header: 'Alarms', locked: false },
  { key: 'lastMaint', header: 'Last Maintenance', locked: false },
  { key: 'actions', header: '', locked: true }
];

const meta: Meta<BaseManageColumnsComponent> = {
  title: 'Base/Tables & Data/Manage Columns',
  component: BaseManageColumnsComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    items: ITEMS,
    visibleKeys: ITEMS.filter((i) => !i.locked).map((i) => i.key),
    align: 'left'
  },
  render: (args) => ({
    props: args,
    template: `<base-manage-columns [items]="items" [visibleKeys]="visibleKeys" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseManageColumnsComponent>;

export const Default: Story = {};

export const MostlyHidden: Story = {
  args: { visibleKeys: ['toolId', 'status', 'actions'] }
};
