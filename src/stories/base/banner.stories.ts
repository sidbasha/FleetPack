import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBannerComponent } from '../../app/base';

/** Spans the page — the condition affects the whole product, not one region. A persistent
 *  banner (no [dismissible]) should only disappear once the condition itself resolves; a
 *  dismissible one must always offer [actionLabel] as a way to reach the detail first. */
const meta: Meta<BaseBannerComponent> = {
  title: 'Base/Feedback/Banner',
  component: BaseBannerComponent,
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['info', 'warning', 'critical', 'accent'] }
  },
  args: {
    kind: 'info',
    title: 'Scheduled maintenance Saturday 09 August, 02:00–06:00 UTC.',
    message: 'FleetPack will be read-only for the duration.',
    actionLabel: 'Details',
    dismissible: true
  },
  render: (args) => ({
    props: args,
    template: `<base-banner [kind]="kind" [title]="title" [message]="message" [actionLabel]="actionLabel" [dismissible]="dismissible" />`
  })
};
export default meta;
type Story = StoryObj<BaseBannerComponent>;

export const Info: Story = {};

/** Persistent — no dismiss control, because only the feed coming back should end it. */
export const Warning: Story = {
  args: {
    kind: 'warning', title: 'Telemetry from Fab 3 · Leuven has been unavailable since 04:12.',
    message: 'Availability figures for that site are stale.', actionLabel: 'Check feed status', dismissible: false
  }
};

/** Persistent — the session either extends or expires; there's nothing to dismiss. */
export const Critical: Story = {
  args: {
    kind: 'critical', title: 'Your session expires in 2 minutes.', message: 'Unsaved changes on this page will be lost.',
    actionLabel: 'Stay signed in', dismissible: false
  }
};

export const Accent: Story = {
  name: 'Accent (announcement)',
  args: {
    kind: 'accent', title: 'Predictive downtime is now available for inspection tools.',
    message: 'Forecasts appear on the tool deep dive.', actionLabel: 'Take a look', dismissible: true
  }
};

export const AllKinds: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-2 max-w-3xl">
        <base-banner kind="info" title="Scheduled maintenance Saturday 09 August, 02:00–06:00 UTC."
                     message="FleetPack will be read-only for the duration." actionLabel="Details" [dismissible]="true" />
        <base-banner kind="warning" title="Telemetry from Fab 3 · Leuven has been unavailable since 04:12."
                     message="Availability figures for that site are stale." actionLabel="Check feed status" />
        <base-banner kind="critical" title="Your session expires in 2 minutes."
                     message="Unsaved changes on this page will be lost." actionLabel="Stay signed in" />
        <base-banner kind="accent" title="Predictive downtime is now available for inspection tools."
                     message="Forecasts appear on the tool deep dive." actionLabel="Take a look" [dismissible]="true" />
      </div>`
  })
};
