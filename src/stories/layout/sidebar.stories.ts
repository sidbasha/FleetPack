import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from '../../app/layout/sidebar.component';
import { NavGroup } from '../../app/core/constants/app.constants';

/** The application shell is a fixed dark surface in every theme — an exception to the semantic
 *  layer, matching the shipped product; everything inside it re-themes normally. Pure
 *  presentation over `[groups]`/`[brand]`/`[routes]`/`[sidebar]`, all defaulted from
 *  `app.constants.ts` — real usage (`<fam-sidebar />`) needs no inputs at all. */
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

/** The spec's full example — an expandable group, a badge count, and a disabled item that
 *  stays visible with its own reason (see the `title` attribute) rather than disappearing. */
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

/** Collapsed to the 60px rail — the operator can still reach every label via the native
 *  `title` tooltip; an icon alone is never the whole story. */
export const Collapsed: Story = {
  render: () => ({
    props: { groups: DEMO_GROUPS },
    template: `<fam-sidebar [groups]="groups" [collapsed]="true" />`
  })
};
