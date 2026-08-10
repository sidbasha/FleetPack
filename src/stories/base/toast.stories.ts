import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseToastHostComponent, BaseToastService } from '../../app/base';

/** Transient, global toasts, auto-dismissing after 3.5s — except errors,
 *  which require explicit dismissal. Hovering pauses the dismiss timer. */
@Component({
  selector: 'story-toast-demo',
  standalone: true,
  imports: [BaseToastHostComponent],
  template: `
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-primary" (click)="svc.success('Export complete', 'service_activity_2026Q3.xlsx is ready to download.')">Trigger success toast</button>
      <button type="button" class="btn-secondary border border-neutral-200" (click)="svc.error('Sync failed', 'Retry from the toolbar or check your connection.')">Trigger error toast</button>
      <button type="button" class="btn-secondary border border-neutral-200" (click)="svc.warning('3 tools missing data', 'Availability figures may be understated.')">Trigger warning toast</button>
      <button type="button" class="btn-secondary border border-neutral-200" (click)="svc.info('FCM settings incomplete', 'Complete configuration for 3 fleets.')">Trigger info toast</button>
    </div>
    <base-toast-host />
  `
})
class StoryToastDemoComponent {
  protected readonly svc = inject(BaseToastService);
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
