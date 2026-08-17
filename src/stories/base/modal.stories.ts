import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  BaseAlertComponent,
  BaseButtonComponent,
  BaseModalComponent,
  BaseSelectComponent,
  BaseStepperComponent,
  BaseStepperStep,
  BaseTextInputComponent,
  BaseTextareaComponent
} from '../../app/base';

const meta: Meta<BaseModalComponent> = {
  title: 'Base/Overlays/Modal',
  component: BaseModalComponent,
  tags: ['autodocs'],
  parameters: { docs: { story: { inline: false, height: '480px' } } },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    iconTone: { control: 'select', options: ['action', 'accent', 'success', 'warning', 'error', 'neutral'] }
  },
  args: {
    open: true,
    title: 'Edit tool',
    subtitle: '',
    icon: '',
    iconTone: 'action',
    size: 'md',
    closeOnBackdrop: true,
    showClose: true,
    destructive: false
  },
  render: (args) => ({
    props: args,
    template: `
      <base-modal [open]="open" [title]="title" [subtitle]="subtitle" [icon]="icon" [iconTone]="iconTone"
                  [size]="size" [closeOnBackdrop]="closeOnBackdrop" [showClose]="showClose" [destructive]="destructive">
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
export const FullScreen: Story = { args: { size: 'full' } };
export const NoCloseButton: Story = { args: { showClose: false } };

export const WithIconAndSubtitle: Story = {
  args: { icon: 'add_circle', subtitle: 'Step 2 of 4 · Placement', title: 'Register tool' }
};

export const SplitFooter: Story = {
  render: (args) => ({
    props: args,
    template: `
      <base-modal [open]="open" title="Register tool" subtitle="Step 2 of 4 · Placement" icon="add_circle" size="lg">
        <div class="space-y-3">
          <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Site</label>
          <input class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" value="Fab 12 · Hillsboro" readonly />
        </div>
        <div footer class="w-full flex items-center justify-between">
          <base-button variant="text">Save and finish later</base-button>
          <div class="flex gap-2">
            <base-button variant="secondary">Back</base-button>
            <base-button variant="primary">Continue →</base-button>
          </div>
        </div>
      </base-modal>`
  })
};

/** Destructive: names the object, quantifies the loss, and requires the object's name to be
 *  typed before the danger button enables — the danger button is never the default focus. */
@Component({
  selector: 'story-destructive-modal-demo',
  standalone: true,
  imports: [BaseModalComponent, BaseButtonComponent, BaseTextInputComponent, BaseAlertComponent],
  template: `
    <base-modal [open]="true" title="Delete SP7-04?" subtitle="This cannot be undone." icon="delete" iconTone="error"
                size="sm" [destructive]="true">
      <div class="space-y-3">
        <p>
          Deleting this tool removes <b class="text-ink-900">14 months of state history</b>, 38 downtime events
          and its qualification record. Availability figures for Fab 12 will be recalculated without it.
        </p>
        <base-alert kind="warning" message="Two open alarms are attached to this tool." [compact]="true" />
        <base-text-input label="Type SP7-04 to confirm" [(value)]="confirmText" placeholder="SP7-04" />
      </div>
      <div footer class="flex gap-2">
        <base-button variant="secondary">Cancel</base-button>
        <base-button variant="destructive" [disabled]="confirmText() !== 'SP7-04'">Delete tool</base-button>
      </div>
    </base-modal>
  `
})
class StoryDestructiveModalDemoComponent {
  readonly confirmText = signal('');
}

export const DestructiveConfirm: StoryObj<StoryDestructiveModalDemoComponent> = {
  decorators: [moduleMetadata({ imports: [StoryDestructiveModalDemoComponent] })],
  render: () => ({ template: `<story-destructive-modal-demo />` })
};

/** A large form modal with an embedded stepper — the spec's "Register tool" flow. */
@Component({
  selector: 'story-wizard-modal-demo',
  standalone: true,
  imports: [BaseModalComponent, BaseButtonComponent, BaseTextInputComponent, BaseTextareaComponent, BaseSelectComponent, BaseStepperComponent],
  template: `
    <base-modal [open]="true" title="Register tool" subtitle="Step 2 of 4 · Placement" icon="add_circle" size="lg">
      <div class="space-y-4">
        <base-stepper [steps]="steps" [(activeId)]="activeStep" [linear]="false" />
        <div class="grid grid-cols-2 gap-4">
          <base-select label="Site" [required]="true" [options]="siteOptions" value="fab12" />
          <base-text-input label="Bay" value="B4-07" />
          <base-select label="Fleet segment" [required]="true" [options]="segmentOptions" value="inspection" />
          <base-text-input label="Owner" value="M. Okonkwo" />
          <base-textarea class="col-span-2" label="Notes" placeholder="Anything the next operator should know about this placement" />
        </div>
      </div>
      <div footer class="w-full flex items-center justify-between">
        <base-button variant="text">Save and finish later</base-button>
        <div class="flex gap-2">
          <base-button variant="secondary">Back</base-button>
          <base-button variant="primary">Continue →</base-button>
        </div>
      </div>
    </base-modal>
  `
})
class StoryWizardModalDemoComponent {
  readonly steps: BaseStepperStep[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'placement', label: 'Placement' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'review', label: 'Review' }
  ];
  readonly activeStep = signal('placement');
  readonly siteOptions = [{ label: 'Fab 12 · Hillsboro', value: 'fab12' }, { label: 'Fab 21 · Chandler', value: 'fab21' }];
  readonly segmentOptions = [{ label: 'Inspection', value: 'inspection' }, { label: 'Metrology', value: 'metrology' }];
}

export const RegisterToolWizard: StoryObj<StoryWizardModalDemoComponent> = {
  decorators: [moduleMetadata({ imports: [StoryWizardModalDemoComponent] })],
  render: () => ({ template: `<story-wizard-modal-demo />` })
};
