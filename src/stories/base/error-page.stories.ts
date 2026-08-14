import type { Meta, StoryObj } from '@storybook/angular';
import { BaseErrorPageComponent } from '../../app/base';

/**
 * Recovery is part of the state: every error screen offers at least one way forward and
 * preserves what the operator already did — filters stay applied, form values stay entered.
 * Distinct from `<base-empty-state>`, which is for a neutral, nothing-went-wrong situation.
 */
const meta: Meta<BaseErrorPageComponent> = {
  title: 'Base/Feedback/Error Page',
  component: BaseErrorPageComponent,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'error'] }
  },
  args: {
    code: '404',
    tone: 'neutral',
    title: "That tool isn't in this fleet",
    message: "Tool SP7-99 doesn't exist, or it was archived and removed from the Fab 12 inventory.",
    actionLabel: 'Back to fleet inventory',
    secondaryActionLabel: 'Search all sites',
    offline: false,
    statusNote: '',
    traceId: ''
  }
};
export default meta;
type Story = StoryObj<BaseErrorPageComponent>;

export const NotFound: Story = {};

export const Forbidden: Story = {
  args: {
    code: '403', title: "Your role doesn't include configuration",
    message: 'You have FAM read access at Fab 12. Editing recipes requires the FCM operator role.',
    actionLabel: 'Request access', secondaryActionLabel: 'Back to dashboard'
  }
};

export const ServerError: Story = {
  name: '500 (with trace id)',
  args: {
    code: '500', tone: 'error', title: "The telemetry service isn't responding",
    message: 'This is on our side. The last successful sync was at 08:42 UTC, so figures shown elsewhere may be stale.',
    actionLabel: '↻ Retry', secondaryActionLabel: 'Status page', traceId: 'trc_9f2a4e1c-0842'
  }
};

export const Offline: Story = {
  args: {
    offline: true, title: "You're offline", code: '',
    message: 'FleetPack is showing the last data it cached at 08:31. Nothing you change now will be saved until the connection returns.',
    actionLabel: 'Retry connection', secondaryActionLabel: '', statusNote: 'Cached view · 214 tools'
  }
};

export const FourStates: Story = {
  render: () => ({
    template: `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="panel"><base-error-page code="404" title="That tool isn't in this fleet"
          message="Tool SP7-99 doesn't exist, or it was archived and removed from the Fab 12 inventory."
          actionLabel="Back to fleet inventory" secondaryActionLabel="Search all sites" /></div>
        <div class="panel"><base-error-page code="403" title="Your role doesn't include configuration"
          message="You have FAM read access at Fab 12. Editing recipes requires the FCM operator role."
          actionLabel="Request access" secondaryActionLabel="Back to dashboard" /></div>
        <div class="panel"><base-error-page code="500" tone="error" title="The telemetry service isn't responding"
          message="This is on our side. The last successful sync was at 08:42 UTC, so figures shown elsewhere may be stale."
          actionLabel="↻ Retry" secondaryActionLabel="Status page" traceId="trc_9f2a4e1c-0842" /></div>
        <div class="panel"><base-error-page [offline]="true" title="You're offline"
          message="FleetPack is showing the last data it cached at 08:31. Nothing you change now will be saved until the connection returns."
          actionLabel="Retry connection" statusNote="Cached view · 214 tools" /></div>
      </div>`
  })
};
