import type { Meta, StoryObj } from '@storybook/angular';
import { BasePopoverComponent } from '../../app/base';

/** A tooltip explains; a popover contains interactive content. If it has a
 *  button or a checkbox inside, it's a popover, not a tooltip. Keeps focus
 *  inside while open: Tab cycles within the panel, Escape closes it and
 *  returns focus to the trigger. */
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
