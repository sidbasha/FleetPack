import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAccordionComponent } from '../../app/base';

/** Chevron rotates 180° on open with `mo-slow`; collapsed by default unless
 *  the content is required to complete a task. Multiple accordions on a
 *  page are independent (never single-open-only) unless the host
 *  explicitly coordinates that. */
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
