import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAccordionComponent } from '../../app/base';

/** Collapsible section; siblings are independent, not single-open-only. */
const meta: Meta<BaseAccordionComponent> = {
  title: 'Base/Data Display/Accordion',
  component: BaseAccordionComponent,
  tags: ['autodocs'],
  args: { title: 'Advanced settings', open: false },
  render: (args) => ({
    props: args,
    template: `
      <base-accordion [title]="title" [open]="open">
        Retention window, export defaults, and notification thresholds live here,
        collapsed by default since most reviewers never need to change them.
      </base-accordion>`
  })
};
export default meta;
type Story = StoryObj<BaseAccordionComponent>;

export const Collapsed: Story = {};
export const Open: Story = { args: { open: true } };
