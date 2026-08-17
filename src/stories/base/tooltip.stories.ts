import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTooltipDirective } from '../../app/base';

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
