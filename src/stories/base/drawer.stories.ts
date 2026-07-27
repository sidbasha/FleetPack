import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDrawerComponent } from '../../app/base';

/**
 * `open` is a two-way `model()`, so these stories bind it one-way and default
 * to `true` to show the drawer's anatomy directly in the canvas. Backdrop/ESC
 * close will flicker rather than stay closed (the story's static arg keeps
 * re-asserting `open`) - exercise the real open/close lifecycle at `/dev/base`
 * or in a feature that owns the signal itself.
 */
const meta: Meta<BaseDrawerComponent> = {
  title: 'Base/Overlays/Drawer',
  component: BaseDrawerComponent,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    open: true,
    title: 'Alarm Info',
    side: 'right',
    width: '420px',
    closeOnBackdrop: true,
    showClose: true
  },
  render: (args) => ({
    props: args,
    template: `
      <base-drawer [open]="open" [title]="title" [side]="side" [width]="width"
                   [closeOnBackdrop]="closeOnBackdrop" [showClose]="showClose">
        <div class="p-5 space-y-3 text-xs text-slate-600">
          <p><b class="text-slate-800">EquipmentSafety - AttentionFlags</b></p>
          <p>Alarm 10332412162 raised on tool NAv_98741, 2026-07-24 08:16:03.</p>
          <p>13-week trend: 6 occurrences, +6% W/W.</p>
        </div>
        <div footer class="w-full flex gap-2">
          <button class="btn-primary flex-1">View Event Log</button>
          <button class="btn-ghost flex-1 border border-slate-200">Export</button>
        </div>
      </base-drawer>`
  })
};
export default meta;
type Story = StoryObj<BaseDrawerComponent>;

export const Right: Story = {};
export const Left: Story = { args: { side: 'left' } };
export const NoCloseButton: Story = { args: { showClose: false } };
export const NoTitle: Story = { args: { title: '' } };
