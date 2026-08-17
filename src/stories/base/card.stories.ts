import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBadgeComponent, BaseButtonComponent, BaseCardComponent } from '../../app/base';

const meta: Meta<BaseCardComponent> = {
  title: 'Base/Cards & Containers/Card',
  component: BaseCardComponent,
  tags: ['autodocs'],
  argTypes: {
    iconTone: { control: 'select', options: ['neutral', 'action', 'accent', 'info', 'success', 'warning', 'error', 'brand'] }
  },
  args: { title: 'Chamber A', icon: 'settings', iconTone: 'action', clickable: false },
  decorators: [moduleMetadata({ imports: [BaseButtonComponent, BaseBadgeComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <base-card [title]="title" [icon]="icon" [iconTone]="iconTone" [clickable]="clickable" class="max-w-sm">
        <span actions class="text-neutral-300">⋮</span>
        Rolling 30-day availability with the current qualification window highlighted.
        <div footer>
          <base-button variant="text">Open deep dive</base-button>
          <base-badge label="Production" tone="success" [dot]="true" />
        </div>
      </base-card>`
  })
};
export default meta;
type Story = StoryObj<BaseCardComponent>;

export const Default: Story = {};
export const Clickable: Story = { args: { clickable: true } };
export const TitleOnly: Story = {
  render: (args) => ({
    props: args,
    template: `<base-card title="Fleet summary" class="max-w-sm">Nothing else to add here.</base-card>`
  })
};
export const BodyOnly: Story = {
  render: () => ({
    template: `<base-card class="max-w-sm">A static content block with no header at all.</base-card>`
  })
};

export const InfoFeatureSummary: Story = {
  decorators: [moduleMetadata({ imports: [BaseButtonComponent] })],
  render: () => ({
    template: `
      <div class="grid md:grid-cols-3 gap-4">
        <base-card title="Availability model" icon="show_chart" iconTone="action">
          How production, engineering and standby time roll up into a single up-time figure.
          <div footer><base-button variant="text">Read the method</base-button></div>
        </base-card>
        <base-card title="Qualification calendar" icon="event" iconTone="accent">
          Scheduled quals across the fleet for the next six weeks, with conflicts flagged.
          <div footer><base-button variant="text">Open calendar</base-button></div>
        </base-card>
        <base-card title="This week">
          <span actions class="text-[10px] font-bold uppercase tracking-wide text-action bg-action-surface px-sp-2 py-0.5 rounded-r-full">Summary</span>
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between"><span>Downtime events</span><span class="font-semibold text-ink-900">31</span></div>
            <div class="flex justify-between"><span>Mean time to repair</span><span class="font-semibold text-ink-900">2.4 h</span></div>
            <div class="flex justify-between"><span>Quals passed</span><span class="font-semibold text-success">9 / 11</span></div>
          </div>
        </base-card>
      </div>`
  })
};
