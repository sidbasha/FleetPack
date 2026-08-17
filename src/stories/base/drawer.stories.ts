import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseBadgeComponent, BaseButtonComponent, BaseDrawerComponent } from '../../app/base';

const meta: Meta<BaseDrawerComponent> = {
  title: 'Base/Overlays/Drawer',
  component: BaseDrawerComponent,
  tags: ['autodocs'],
  parameters: { docs: { story: { inline: false, height: '420px' } } },
  argTypes: {
    side: { control: 'select', options: ['left', 'right', 'bottom'] }
  },
  args: {
    open: true,
    title: 'Alarm Info',
    icon: '',
    side: 'right',
    width: '480px',
    closeOnBackdrop: true,
    showClose: true
  },
  render: (args) => ({
    props: args,
    template: `
      <base-drawer [open]="open" [title]="title" [icon]="icon" [side]="side" [width]="width"
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
export const WithIcon: Story = { args: { icon: 'settings', title: 'SP7-04' } };

export const ToolInspector: Story = {
  decorators: [moduleMetadata({ imports: [BaseBadgeComponent, BaseButtonComponent] })],
  render: () => ({
    template: `
      <base-drawer [open]="true" title="SP7-04" icon="settings" side="right" width="400px">
        <div class="p-5 space-y-4 text-xs text-ink-600">
          <div class="flex items-center gap-2">
            <base-badge label="Production" tone="success" [dot]="true" />
            <base-badge label="Qual passed" tone="neutral" />
          </div>
          <div>
            <p class="font-display text-display-lg text-ink-900">98.4%</p>
            <p class="text-[11px] text-neutral-400 uppercase tracking-wide">Up-time</p>
          </div>
          <div>
            <p class="font-display text-display-md text-ink-900">128 h</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-2">Recent events</p>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="icon-outline text-success" style="font-size:16px;" aria-hidden="true">check_circle</span>
                <span class="flex-1">Qual passed</span>
                <span class="text-neutral-400">28 Jul · 14:02</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="icon-outline text-action" style="font-size:16px;" aria-hidden="true">build</span>
                <span class="flex-1">Recipe calibration</span>
                <span class="text-neutral-400">22 Jul · 06:15</span>
              </div>
            </div>
          </div>
        </div>
        <div footer class="flex gap-2 w-full justify-end">
          <base-button variant="secondary">Close</base-button>
          <base-button variant="primary">Deep dive →</base-button>
        </div>
      </base-drawer>`
  })
};

export const BottomActionSheet: Story = {
  decorators: [moduleMetadata({ imports: [BaseButtonComponent] })],
  render: () => ({
    template: `
      <base-drawer [open]="true" title="Bulk actions · 3 tools" side="bottom">
        <div class="py-2 text-xs text-ink-600">
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">bookmark_add</span>
            Assign to a fleet segment
          </button>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">tune</span>
            Set availability threshold
          </button>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">file_download</span>
            Export selection
          </button>
          <div class="border-t border-neutral-100 my-1"></div>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 text-error hover:bg-error-surface transition-colors">
            <span class="icon-outline" style="font-size:18px;" aria-hidden="true">archive</span>
            Archive 3 tools
          </button>
        </div>
      </base-drawer>`
  })
};
