import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTooltipDirective } from '../../app/base';

/** `[baseTooltip]` is a directive, not a component - it attaches to any host element. Hover the buttons below. */
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
