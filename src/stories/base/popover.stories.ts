import type { Meta, StoryObj } from '@storybook/angular';
import { BasePopoverComponent } from '../../app/base';

const meta: Meta<BasePopoverComponent> = {
  title: 'Base/Overlays/Popover',
  component: BasePopoverComponent,
  tags: ['autodocs'],
  render: () => ({
    template: `
      <base-popover ariaLabel="Column options">
        <button trigger type="button" class="btn-secondary border border-neutral-200 rounded-r-sm px-3 py-1.5 text-xs font-semibold text-action">
          Column options
        </button>
        <div panel class="p-3 w-48">
          <label class="flex items-center gap-2 text-xs text-ink-600 py-1">
            <input type="checkbox" checked class="w-3.5 h-3.5 accent-action" /> Show tool ID
          </label>
          <label class="flex items-center gap-2 text-xs text-ink-600 py-1">
            <input type="checkbox" class="w-3.5 h-3.5 accent-action" /> Show fleet
          </label>
          <button type="button" class="btn-primary w-full justify-center mt-2">Apply</button>
        </div>
      </base-popover>`
  })
};
export default meta;
type Story = StoryObj<BasePopoverComponent>;

export const Default: Story = {};

export const FilterByState: Story = {
  render: () => ({
    template: `
      <base-popover ariaLabel="Filter by state">
        <button trigger type="button" class="btn-secondary border border-neutral-200 rounded-r-sm px-3 py-1.5 text-xs font-semibold text-ink-600 inline-flex items-center gap-1.5">
          <span class="icon-outline" style="font-size:14px;" aria-hidden="true">filter_alt</span> Filter by state
        </button>
        <div panel class="w-64">
          <div class="flex items-center justify-between px-sp-4 pt-sp-3 pb-sp-2">
            <span class="text-xs font-semibold text-ink-900">Filter by state</span>
            <button type="button" class="text-neutral-300 hover:text-neutral-500 text-xs" aria-label="Close">✕</button>
          </div>
          <div class="px-sp-4 pb-sp-2">
            <input type="text" placeholder="Find a state" class="w-full h-8 border border-neutral-200 rounded-r-sm px-sp-2 text-xs focus:outline-none focus:ring-2 focus:ring-action-surface focus:border-action" />
          </div>
          <div class="px-sp-4 pb-sp-2 flex flex-col gap-1.5">
            <label class="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" checked class="w-3.5 h-3.5 accent-action" /> Production</label>
            <label class="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" checked class="w-3.5 h-3.5 accent-action" /> Engineering</label>
            <label class="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" class="w-3.5 h-3.5 accent-action" /> Standby</label>
            <label class="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" class="w-3.5 h-3.5 accent-action" /> Scheduled DT</label>
            <label class="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" class="w-3.5 h-3.5 accent-action" /> Unscheduled DT</label>
          </div>
          <div class="flex items-center justify-between px-sp-4 py-sp-3 border-t border-neutral-100">
            <button type="button" class="text-xs font-semibold text-action hover:text-action-hover underline underline-offset-2">Clear</button>
            <button type="button" class="btn-primary px-sp-3 py-1.5">Apply</button>
          </div>
        </div>
      </base-popover>`
  })
};

export const InfoPopover: Story = {
  render: () => ({
    template: `
      <base-popover ariaLabel="How availability is computed">
        <button trigger type="button" class="text-neutral-300 hover:text-ink-500" aria-label="How availability is computed">ⓘ</button>
        <div panel class="w-64 p-sp-4">
          <p class="text-xs font-semibold text-ink-900 mb-1.5 flex items-center gap-1.5">
            <span class="icon-outline text-neutral-400" style="font-size:14px;" aria-hidden="true">help</span>
            How availability is computed
          </p>
          <p class="text-[11px] text-neutral-500 leading-relaxed mb-2">
            Production time divided by scheduled time, across every chamber on the tool. Engineering time is excluded unless the module opts in.
          </p>
          <a href="#" class="text-[11px] font-semibold text-action hover:text-action-hover underline underline-offset-2">Read the full method</a>
        </div>
      </base-popover>`
  })
};
