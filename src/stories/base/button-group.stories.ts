import type { Meta, StoryObj } from '@storybook/angular';
import { BaseButtonGroupComponent } from '../../app/base';

/**
 * 2–4 related actions that share one bordered silhouette but fire independently — e.g. switching
 * a panel's view (Trend / Table / Gantt). Unlike `<base-segmented-control>`, the group does not
 * manage a mutually-exclusive value itself; every press still emits (itemClick).
 */
const meta: Meta<BaseButtonGroupComponent> = {
  title: 'Base/Actions/Button Group',
  component: BaseButtonGroupComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { id: 'trend', label: 'Trend', icon: '📈' },
      { id: 'table', label: 'Table', icon: '▤' },
      { id: 'gantt', label: 'Gantt', icon: '▥' }
    ],
    activeId: 'table'
  }
};
export default meta;
type Story = StoryObj<BaseButtonGroupComponent>;

export const Default: Story = {};

export const IconOnly: Story = {
  args: { iconOnly: true, ariaLabel: 'View' }
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { id: 'day', label: 'Day' },
      { id: 'week', label: 'Week' },
      { id: 'month', label: 'Month', disabled: true },
      { id: 'quarter', label: 'Quarter' }
    ],
    activeId: 'week'
  }
};
