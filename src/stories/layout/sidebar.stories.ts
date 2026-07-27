import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from '../../app/layout/sidebar.component';

/** `fam-sidebar` is pure presentation over static constants (`APP_BRAND`, `NAV_GROUPS`, `SIDEBAR_TEXT`)
 * plus `routerLink`/`routerLinkActive` - no injected services, so it stories directly. */
const meta: Meta<SidebarComponent> = {
  title: 'Layout/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' }
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {};
