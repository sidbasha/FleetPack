import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from '../../app/layout/sidebar.component';

/** `fam-sidebar` is pure presentation over static constants (`APP_BRAND`, `NAV_GROUPS`, `SIDEBAR_TEXT`)
 * plus `routerLink`/`routerLinkActive` - no injected services, so it stories directly. */
const meta: Meta<SidebarComponent> = {
  title: 'Layout/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  // No real @Inputs at all - `brand`/`groups`/`routes`/`sidebar` are plain fields sourced from
  // app.constants.ts. An explicit render with no props binding sidesteps Storybook's
  // auto-generated wrapper entirely (see base/checkbox.stories.ts for the general issue).
  render: () => ({ template: `<fam-sidebar />` })
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {};
