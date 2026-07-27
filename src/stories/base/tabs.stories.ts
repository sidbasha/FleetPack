import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTabsComponent, BaseTabItem } from '../../app/base';

const TABS: BaseTabItem[] = [
  { id: 'table', label: 'Table' },
  { id: 'forms', label: 'Forms' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'locked', label: 'Admin only', disabled: true }
];

const TABS_WITH_BADGES: BaseTabItem[] = [
  { id: 'urgent', label: 'Urgent', badge: 5 },
  { id: 'warning', label: 'Warning', badge: 5 },
  { id: 'abnormal', label: 'Abnormal', badge: 4 }
];

const meta: Meta<BaseTabsComponent> = {
  title: 'Base/Navigation/Tabs',
  component: BaseTabsComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills'] }
  },
  args: {
    tabs: TABS,
    activeId: 'table',
    variant: 'underline'
  }
};
export default meta;
type Story = StoryObj<BaseTabsComponent>;

export const Underline: Story = {};
export const Pills: Story = { args: { variant: 'pills' } };
export const WithCountBadges: Story = { args: { tabs: TABS_WITH_BADGES, activeId: 'urgent' } };
export const WithDisabledTab: Story = { args: { activeId: 'locked' } };
