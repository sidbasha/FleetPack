import type { Meta, StoryObj } from '@storybook/angular';
import { BaseNotificationsPanelComponent } from '../../app/base';

/** Read state uses text opacity as its cue, not a background change. Unread
 *  carries a small dot, the same token as an active nav item. Shown here
 *  against a dark surface since it's header-anchored (see the Global Header
 *  anatomy in Foundations → Navigation). */
const meta: Meta<BaseNotificationsPanelComponent> = {
  title: 'Base/Navigation/Notifications Panel',
  component: BaseNotificationsPanelComponent,
  tags: ['autodocs'],
  args: {
    notifications: [
      { id: '1', icon: 'notifications_active', title: '3 new alarms on Fleet-001', time: '4 minutes ago', read: false },
      { id: '2', icon: 'check_circle', title: 'Export complete', time: '1 hour ago', read: true }
    ]
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="bg-surface-inverse p-8 rounded-r-md flex justify-end">
        <base-notifications-panel [notifications]="notifications" />
      </div>`
  })
};
export default meta;
type Story = StoryObj<BaseNotificationsPanelComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { notifications: [] } };
