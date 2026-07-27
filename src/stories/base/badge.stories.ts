import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBadgeComponent } from '../../app/base';

const meta: Meta<BaseBadgeComponent> = {
  title: 'Base/Feedback/Badge',
  component: BaseBadgeComponent,
  tags: ['autodocs'],
  args: {
    label: 'PRODUCTION',
    colorClass: 'bg-emerald-50 text-emerald-600',
    dot: false
  }
};
export default meta;
type Story = StoryObj<BaseBadgeComponent>;

export const Default: Story = {};
export const WithDot: Story = { args: { dot: true } };

/** `colorClass` is a plain Tailwind class string, so any status vocabulary can be represented -
 * this is exactly how `<base-table>`'s `badge` cell kind maps row values to pills via `badgeClassMap`. */
export const StatusVocabulary: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <base-badge label="PRODUCTION" colorClass="bg-emerald-50 text-emerald-600" [dot]="true" />
        <base-badge label="ENGINEERING" colorClass="bg-sky-50 text-sky-600" [dot]="true" />
        <base-badge label="STANDBY" colorClass="bg-violet-50 text-violet-600" [dot]="true" />
        <base-badge label="DOWN" colorClass="bg-red-50 text-red-600" [dot]="true" />
        <base-badge label="UNKNOWN" />
      </div>`
  })
};
