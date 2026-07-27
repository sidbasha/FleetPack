import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAlertComponent } from '../../app/base';

const meta: Meta<BaseAlertComponent> = {
  title: 'Base/Feedback/Alert',
  component: BaseAlertComponent,
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['info', 'success', 'warning', 'error'] }
  },
  args: {
    kind: 'info',
    title: 'Heads up',
    message: 'CDC sync runs every 5 minutes.',
    dismissible: false
  },
  // `kindClass`/`icon` are internal computeds (not real @Inputs) - see checkbox.stories.ts
  // for why an explicit render avoids Storybook stomping them via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-alert [kind]="kind" [title]="title" [message]="message" [dismissible]="dismissible" />`
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
export const Dismissible: Story = { args: { dismissible: true } };

export const AllKinds: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 max-w-xl">
        <base-alert kind="info" title="Heads up" message="CDC sync runs every 5 minutes." [dismissible]="true" />
        <base-alert kind="success" message="Fleet snapshot exported." />
        <base-alert kind="warning" message="3 tools have stale telemetry." />
        <base-alert kind="error" title="Connection lost" message="Retrying ClickHouse..." />
      </div>`
  })
};
