import type { Meta, StoryObj } from '@storybook/angular';
import { BaseListItemComponent } from '../../app/base';

/** Full-row click target when it navigates; hairline divider between rows,
 *  never a card border per item. Reserve for flat, single-line collections —
 *  anything with two or more data points per row belongs in a table. */
const meta: Meta<BaseListItemComponent> = {
  title: 'Base/Data Display/List Item',
  component: BaseListItemComponent,
  tags: ['autodocs'],
  args: { label: '1KABA452100', icon: '🛠️', meta: '', clickable: true }
};
export default meta;
type Story = StoryObj<BaseListItemComponent>;

export const Default: Story = {};

export const Collection: Story = {
  render: () => ({
    template: `
      <div class="panel overflow-hidden">
        <base-list-item label="1KABA452100" icon="🛠️" [clickable]="true" />
        <base-list-item label="1KABA452200" icon="🛠️" [clickable]="true" />
      </div>`
  })
};
