import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBadgeComponent, BaseListItemComponent } from '../../app/base';

/** Row with a hairline divider; use a table for multi-column rows. [subLabel] stacks a second
 *  line under the label; project a trailing status pill into `[status]`. */
const meta: Meta<BaseListItemComponent> = {
  title: 'Base/Data Display/List Item',
  component: BaseListItemComponent,
  tags: ['autodocs'],
  args: { label: '1KABA452100', icon: '🛠️', subLabel: '', meta: '', clickable: true }
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

/** Two-line rows with a trailing status pill — "Recent downtime" from the spec. */
export const TwoLineWithStatus: Story = {
  decorators: [moduleMetadata({ imports: [BaseBadgeComponent] })],
  render: () => ({
    template: `
      <div class="panel overflow-hidden">
        <base-list-item label="ARC-07 · Chamber Interlock" subLabel="Fab 8 · Dresden · 4h 12m" icon="⚠">
          <base-badge status label="Unscheduled" tone="error" />
        </base-list-item>
        <base-list-item label="EDR-11 · Preventive Maintenance" subLabel="Fab 21 · Chandler · 6h 00m" icon="🔧">
          <base-badge status label="Scheduled" tone="warning" />
        </base-list-item>
        <base-list-item label="SP7-04 · Recipe Calibration" subLabel="Fab 12 · Hillsboro · 1h 45m" icon="📋">
          <base-badge status label="Engineering" tone="action" />
        </base-list-item>
      </div>`
  })
};
