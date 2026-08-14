import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAvatarComponent, BaseBadgeComponent, BaseHoverCardComponent } from '../../app/base';

/**
 * A preview of an entity — a tool, an operator — reachable from a dense table without leaving
 * it. Hover-triggered like a tooltip, but (unlike a tooltip) can hold controls, sparingly. The
 * hide delay lets the pointer travel from trigger to panel without the card flickering shut.
 */
const meta: Meta<BaseHoverCardComponent> = {
  title: 'Base/Overlays/Hover Card',
  component: BaseHoverCardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BaseAvatarComponent, BaseBadgeComponent] })],
  parameters: { layout: 'padded' },
  render: () => ({
    template: `
      <div class="pt-16 pl-16">
        <base-hover-card>
          <a trigger href="#" class="text-xs font-semibold text-action hover:text-action-hover underline underline-offset-2">SP7-04</a>
          <div card class="w-64">
            <div class="flex items-center gap-2.5 mb-3">
              <base-avatar name="SP" size="md" />
              <div>
                <p class="text-xs font-semibold text-ink-900">SP7-04</p>
                <p class="text-[11px] text-neutral-400">Fab 12 · Inspection</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 mb-3">
              <base-badge label="Production" tone="success" [dot]="true" />
              <base-badge label="Passed" tone="neutral" />
            </div>
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100">
              <div><p class="text-xs font-semibold text-ink-900 tabular-nums">98.4%</p><p class="text-[10px] text-neutral-400">Up-time</p></div>
              <div><p class="text-xs font-semibold text-ink-900 tabular-nums">128 h</p><p class="text-[10px] text-neutral-400">MTBF</p></div>
              <div><p class="text-xs font-semibold text-ink-900 tabular-nums">1</p><p class="text-[10px] text-neutral-400">Open alarm</p></div>
            </div>
          </div>
        </base-hover-card>
      </div>`
  })
};
export default meta;
type Story = StoryObj<BaseHoverCardComponent>;

export const ToolPreview: Story = {};

export const AlignedRight: Story = {
  render: () => ({
    template: `
      <div class="pt-16 pr-4 flex justify-end">
        <base-hover-card align="right">
          <a trigger href="#" class="text-xs font-semibold text-action hover:text-action-hover underline underline-offset-2">SP7-04</a>
          <div card class="w-56 text-xs text-ink-600">A preview panel, right-aligned to its trigger.</div>
        </base-hover-card>
      </div>`
  })
};
