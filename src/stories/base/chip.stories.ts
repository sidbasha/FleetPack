import type { Meta, StoryObj } from '@storybook/angular';
import { BaseChipComponent } from '../../app/base';

/** Chips are removable, user-applied filters. Removing one fires (removed)
 *  immediately — there's no separate "Apply" step, unlike panel filters. */
const meta: Meta<BaseChipComponent> = {
  title: 'Base/Data Display/Chip',
  component: BaseChipComponent,
  tags: ['autodocs'],
  args: { label: 'Status: Active', removable: true }
};
export default meta;
type Story = StoryObj<BaseChipComponent>;

export const Default: Story = {};
export const NonRemovable: Story = { args: { removable: false } };

export const FilterRow: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <base-chip label="Status: Active" />
        <base-chip label="Fleet: A, B" />
        <button type="button" class="btn-ghost border border-neutral-200">+ Add filter</button>
      </div>`
  })
};
