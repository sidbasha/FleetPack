import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBadgeComponent } from '../../app/base';

/** Reports state the system owns — never clickable. Three shapes in one component: a status
 *  pill, a numeric/notification count (auto-capped at "99+"), and a bare dot for "something
 *  changed" where a number would be noise. */
const meta: Meta<BaseBadgeComponent> = {
  title: 'Base/Feedback/Badge',
  component: BaseBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'action', 'accent', 'info', 'success', 'warning', 'error', 'brand'] },
    shape: { control: 'select', options: ['pill', 'square'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] }
  },
  args: {
    label: 'PRODUCTION',
    tone: 'success',
    dot: true,
    solid: false,
    shape: 'pill',
    size: 'md'
  },
  // `toneClass` is an internal computed (not a real @Input) - see checkbox.stories.ts for why
  // an explicit render avoids Storybook stomping it via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-badge [label]="label" [tone]="tone" [dot]="dot" [solid]="solid" [shape]="shape" [size]="size" />`
  })
};
export default meta;
type Story = StoryObj<BaseBadgeComponent>;

export const Default: Story = {};
export const Solid: Story = { args: { solid: true, label: 'Passing' } };
export const Square: Story = { args: { shape: 'square', dot: false, tone: 'action', label: 'Square' } };
export const Large: Story = { args: { size: 'lg', dot: false, tone: 'success', label: 'Large' } };

export const Tones: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <base-badge label="Neutral" tone="neutral" />
        <base-badge label="Action" tone="action" />
        <base-badge label="Accent" tone="accent" />
        <base-badge label="Info" tone="info" />
        <base-badge label="Success" tone="success" />
        <base-badge label="Warning" tone="warning" />
        <base-badge label="Error" tone="error" />
        <base-badge label="Brand" tone="brand" />
      </div>`
  })
};

/** Reserve solid for a count or a state that must dominate the row. */
export const SolidVsTint: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <base-badge label="Action" tone="action" [solid]="true" />
        <base-badge label="Passing" tone="success" [solid]="true" />
        <base-badge label="At risk" tone="warning" [solid]="true" />
        <base-badge label="Failed" tone="error" [solid]="true" />
        <base-badge label="Archived" tone="neutral" [solid]="true" />
      </div>`
  })
};

/** The FleetPack machine-state vocabulary — `<base-table>`'s `dot`/`badge` cell kinds map row
 *  values to pills exactly this way via `dotClassMap`/`badgeClassMap`, or a `tone` directly. */
export const StatusVocabulary: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <base-badge label="Production" tone="success" [dot]="true" />
        <base-badge label="Engineering" tone="action" [dot]="true" />
        <base-badge label="Standby" tone="accent" [dot]="true" />
        <base-badge label="Scheduled DT" tone="warning" [dot]="true" />
        <base-badge label="Unscheduled DT" tone="error" [dot]="true" />
        <base-badge label="No data" tone="neutral" [dot]="true" />
      </div>`
  })
};

/** Numeric counts, capped at "99+" — and the bare dot for a change with no number worth showing. */
export const Counts: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-badge [count]="8" tone="neutral" />
        <base-badge [count]="47" tone="action" />
        <base-badge [count]="3" tone="error" />
        <base-badge [count]="12" tone="success" />
        <base-badge [count]="2" tone="neutral" />
        <base-badge [count]="140" tone="neutral" />
        <span class="relative inline-flex text-lg" aria-label="Notifications, 12 unread" role="img">
          🔔<base-badge [count]="12" tone="error" [hiddenFromA11y]="true" class="absolute -top-1 -right-1" />
        </span>
      </div>`
  })
};

/** Attached to a control — the badge stays purely visual; the count is spoken once, by the host. */
export const AttachedToAControl: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="btn-secondary border border-neutral-200 inline-flex items-center gap-2"
                aria-label="Open alarms, 47">
          Open alarms <base-badge [count]="47" tone="action" [hiddenFromA11y]="true" />
        </button>
        <button type="button" class="text-xs font-semibold text-action border-b-2 border-action pb-1 inline-flex items-center gap-2"
                aria-label="Active, 48">
          Active <base-badge [count]="48" tone="action" [hiddenFromA11y]="true" />
        </button>
        <button type="button" class="text-xs font-semibold text-neutral-400 pb-1 inline-flex items-center gap-2"
                aria-label="Resolved, 204">
          Resolved <base-badge [count]="204" tone="neutral" [hiddenFromA11y]="true" />
        </button>
      </div>`
  })
};
