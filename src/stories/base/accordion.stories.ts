import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAccordionComponent, BaseBadgeComponent } from '../../app/base';

const meta: Meta<BaseAccordionComponent> = {
  title: 'Base/Data Display/Accordion',
  component: BaseAccordionComponent,
  tags: ['autodocs'],
  args: { title: 'Advanced settings', icon: '', open: false },
  render: (args) => ({
    props: args,
    template: `
      <base-accordion [title]="title" [icon]="icon" [open]="open">
        Retention window, export defaults, and notification thresholds live here,
        collapsed by default since most reviewers never need to change them.
      </base-accordion>`
  })
};
export default meta;
type Story = StoryObj<BaseAccordionComponent>;

export const Collapsed: Story = {};
export const Open: Story = { args: { open: true } };

export const WithIconAndStatus: Story = {
  decorators: [moduleMetadata({ imports: [BaseBadgeComponent] })],
  render: () => ({
    template: `
      <div class="flex flex-col gap-2 max-w-md">
        <base-accordion title="Chamber A" icon="⚙" [open]="true">
          <base-badge status label="Passing" tone="success" [dot]="true" />
          Pressure, temperature and flow all inside control limits for the last 14 days.
          Next qualification due 2026-08-11.
        </base-accordion>
        <base-accordion title="Chamber B" icon="⚙">
          <base-badge status label="Drifting" tone="warning" [dot]="true" />
        </base-accordion>
        <base-accordion title="Chamber C" icon="⚙">
          <base-badge status label="Offline" tone="neutral" [dot]="true" />
        </base-accordion>
      </div>`
  })
};
