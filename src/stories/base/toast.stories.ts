import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseToastHostComponent, BaseToastService } from '../../app/base';

/** Confirms an action the operator just took — never for something they did not initiate.
 *  Auto-dismisses after 4s except errors, which require explicit dismissal. Hovering (or
 *  keyboard focus anywhere in the stack) pauses the timer; Esc clears the whole stack. */
@Component({
  selector: 'story-toast-demo',
  standalone: true,
  imports: [BaseToastHostComponent],
  template: `
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-primary" (click)="svc.success('Threshold saved', 'SP7-04 now alerts below 95.0%.')">Trigger success toast</button>
      <button type="button" class="btn-secondary border border-neutral-200" (click)="svc.error('Export failed', 'The report service timed out. Try again.')">Trigger error toast</button>
      <button type="button" class="btn-secondary border border-neutral-200" (click)="svc.warning('Partially applied', '7 of 9 tools updated. 2 were locked.')">Trigger warning toast</button>
      <button type="button" class="btn-secondary border border-neutral-200"
              (click)="svc.info('3 tools reassigned to Inspection', undefined, { actionLabel: 'Undo', onAction: onUndo })">
        Trigger info toast with Undo
      </button>
    </div>
    <base-toast-host />
  `
})
class StoryToastDemoComponent {
  protected readonly svc = inject(BaseToastService);
  protected onUndo = () => this.svc.success('Reassignment undone');
}

const meta: Meta<StoryToastDemoComponent> = {
  title: 'Base/Feedback/Toast',
  component: StoryToastDemoComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [StoryToastDemoComponent] })]
};
export default meta;
type Story = StoryObj<StoryToastDemoComponent>;

export const Default: Story = {};
