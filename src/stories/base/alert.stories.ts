import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAlertComponent } from '../../app/base';

/** Sits next to what it describes; stays until the condition clears. See `<base-banner>` for
 *  page-wide conditions and `BaseToastService` for transient action confirmations. */
const meta: Meta<BaseAlertComponent> = {
  title: 'Base/Feedback/Alert',
  component: BaseAlertComponent,
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['info', 'success', 'warning', 'error', 'neutral'] }
  },
  args: {
    kind: 'info',
    title: 'Heads up',
    message: 'CDC sync runs every 5 minutes.',
    dismissible: false,
    actionLabel: '',
    secondaryActionLabel: '',
    actionInline: false,
    compact: false
  },
  // `kindClass`/`icon` are internal computeds (not real @Inputs) - see checkbox.stories.ts
  // for why an explicit render avoids Storybook stomping them via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-alert [kind]="kind" [title]="title" [message]="message" [dismissible]="dismissible"
                           [actionLabel]="actionLabel" [secondaryActionLabel]="secondaryActionLabel"
                           [actionInline]="actionInline" [compact]="compact" />`
  })
};
export default meta;
type Story = StoryObj<BaseAlertComponent>;

export const Info: Story = {};
export const Success: Story = { args: { kind: 'success', title: '', message: 'Fleet snapshot exported.' } };
export const Warning: Story = { args: { kind: 'warning', title: '', message: '3 tools have stale telemetry.' } };
export const ErrorKind: Story = {
  name: 'Error',
  args: { kind: 'error', title: 'Connection lost', message: 'Retrying ClickHouse...' }
};
export const Neutral: Story = {
  args: {
    kind: 'neutral', title: 'This tool is archived',
    message: 'Historical data is read-only. Restore the tool to resume telemetry collection.',
    actionLabel: 'Restore', actionInline: true
  }
};
export const Dismissible: Story = { args: { dismissible: true } };

/** Primary action plus a lower-emphasis second action — e.g. a recoverable-error alert
 *  offering both "fix it now" and "back out". */
export const WithTwoActions: Story = {
  args: {
    kind: 'error', title: "Couldn't save the threshold change",
    message: 'The telemetry service rejected the update because another operator changed this tool 12 seconds ago. Reload to see their change before retrying.',
    actionLabel: 'Reload and compare', secondaryActionLabel: 'Discard my change'
  }
};

/** Dense, single-line layout for table toolbars and card footers — no title, and the action
 *  renders as an inline text link instead of a button. */
export const Compact: Story = {
  args: { kind: 'warning', message: '2 filters are hiding 187 rows.', actionLabel: 'Clear filters', compact: true }
};

export const AllKinds: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 max-w-xl">
        <base-alert kind="info" title="Availability is recalculated nightly"
                    message="The figures below reflect telemetry up to 02:00 local site time." [dismissible]="true" />
        <base-alert kind="success" title="Qualification passed"
                    message="SP7-04 met every control limit across the 14-day window." />
        <base-alert kind="warning" title="Three tools are drifting toward their control limits"
                    message="Chamber pressure on CAN-02, EDR-11 and ARC-07 has trended upward for six consecutive days."
                    [dismissible]="true" actionLabel="Review drift" secondaryActionLabel="Snooze 24 h" />
        <base-alert kind="error" title="Couldn't save the threshold change"
                    message="The telemetry service rejected the update because another operator changed this tool 12 seconds ago."
                    actionLabel="Reload and compare" secondaryActionLabel="Discard my change" />
        <base-alert kind="neutral" title="This tool is archived"
                    message="Historical data is read-only. Restore the tool to resume telemetry collection."
                    actionLabel="Restore" [actionInline]="true" />
      </div>`
  })
};

/** Compact variants side by side, as they appear stacked in a table toolbar. */
export const CompactStack: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-2 max-w-xl">
        <base-alert kind="warning" message="2 filters are hiding 187 rows." actionLabel="Clear filters" [compact]="true" />
        <base-alert kind="info" message="Export includes the filtered view only." [compact]="true" />
      </div>`
  })
};
