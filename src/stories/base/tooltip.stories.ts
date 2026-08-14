import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTooltipDirective } from '../../app/base';

/** A tooltip labels — it must never hold anything the operator needs to click, and it
 *  disappears the moment the pointer leaves. `[baseTooltip]` is a directive, not a component -
 *  it attaches to any host element. Hover the buttons below. */
const meta: Meta<BaseTooltipDirective> = {
  title: 'Base/Overlays/Tooltip',
  component: BaseTooltipDirective,
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
};
export default meta;
type Story = StoryObj<BaseTooltipDirective>;

export const Positions: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-6 pt-16 pb-16 pl-16">
        <button class="btn-ghost border border-slate-200" baseTooltip="Top tooltip" tooltipPosition="top">Top</button>
        <button class="btn-ghost border border-slate-200" baseTooltip="Bottom tooltip" tooltipPosition="bottom">Bottom</button>
        <button class="btn-ghost border border-slate-200" baseTooltip="Left tooltip" tooltipPosition="left">Left</button>
        <button class="btn-ghost border border-slate-200" baseTooltip="Right tooltip" tooltipPosition="right">Right</button>
      </div>`
  })
};

/** Naming an icon button, in the same words the menu item would use — the spec's "Positions" row. */
export const IconButtonLabels: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4 pt-16 pb-4 pl-16">
        <button class="btn-ghost border border-slate-200" baseTooltip="Delete tool" tooltipPosition="top">🗑</button>
        <button class="btn-ghost border border-slate-200" baseTooltip="Export current view" tooltipPosition="bottom">⬇</button>
        <button class="btn-ghost border border-slate-200" baseTooltip="Filter rows" tooltipPosition="right">▽</button>
      </div>`
  })
};

/** A rich tooltip may wrap and carry a heading, but it still contains no links and no buttons —
 *  reach for `<base-popover>` the moment the content needs to be clickable. */
export const RichTooltip: Story = {
  render: () => ({
    template: `
      <div class="pt-20 pl-16">
        <button class="btn-ghost border border-slate-200"
                baseTooltip="Total production hours divided by the number of unscheduled downtime events in the same window. Engineering and standby time are excluded."
                tooltipTitle="Mean time between failures" tooltipPosition="bottom">
          MTBF ⓘ
        </button>
      </div>`
  })
};
