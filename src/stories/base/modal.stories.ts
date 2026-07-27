import type { Meta, StoryObj } from '@storybook/angular';
import { BaseModalComponent } from '../../app/base';

/**
 * `open` is a two-way `model()` - see the note in drawer.stories.ts. Defaulted
 * to `true` here so the dialog's anatomy is visible directly in the canvas.
 */
const meta: Meta<BaseModalComponent> = {
  title: 'Base/Overlays/Modal',
  component: BaseModalComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] }
  },
  args: {
    open: true,
    title: 'Edit tool',
    size: 'md',
    closeOnBackdrop: true,
    showClose: true
  },
  render: (args) => ({
    props: args,
    template: `
      <base-modal [open]="open" [title]="title" [size]="size"
                  [closeOnBackdrop]="closeOnBackdrop" [showClose]="showClose">
        <div class="space-y-3">
          <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Tool ID</label>
          <input class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" value="KLA-1042" readonly />
        </div>
        <div footer class="flex gap-2">
          <button class="btn-ghost border border-slate-200">Cancel</button>
          <button class="btn-primary">Save</button>
        </div>
      </base-modal>`
  })
};
export default meta;
type Story = StoryObj<BaseModalComponent>;

export const Medium: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const ExtraLarge: Story = { args: { size: 'xl' } };
export const NoCloseButton: Story = { args: { showClose: false } };
