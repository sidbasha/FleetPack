import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from '../../app/layout/sidebar.component';
import { NavGroup } from '../../app/core/constants/app.constants';

const meta: Meta<SidebarComponent> = {
  title: 'Layout/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<fam-sidebar />` })
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {};

const DEMO_GROUPS: NavGroup[] = [
  {
    heading: 'Monitor',
    items: [
      { label: 'Availability', icon: '📶', children: [
        { label: 'Fleet trend', path: '/fleet-availability/up-time/analysis', icon: '↗' },
        { label: 'Tool deep dive', path: '/fleet-availability/up-time/availability', icon: '▤' }
      ] },
      { label: 'Alarms', path: '/alarm-explorer', icon: '🔔', badge: 47 }
    ]
  },
  {
    heading: 'Manage',
    items: [
      { label: 'Tools', path: '/fleet-configuration', icon: '🔧' },
      { label: 'Configuration', path: '/engineering-utilities', icon: '⚙' },
      { label: 'Audit log', icon: '📜', disabled: true }
    ]
  }
];

export const FullExample: Story = {
  render: () => ({
    props: { groups: DEMO_GROUPS },
    template: `<fam-sidebar [groups]="groups" />`
  })
};

export const Collapsed: Story = {
  render: () => ({
    props: { groups: DEMO_GROUPS },
    template: `<fam-sidebar [groups]="groups" [collapsed]="true" />`
  })
};
