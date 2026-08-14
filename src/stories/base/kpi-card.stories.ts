import type { Meta, StoryObj } from '@storybook/angular';
import { BaseKpiCardComponent } from '../../app/base';

/** The atom of every dashboard: one number, one direction, one comparison window. A second
 *  number that matters equally is a second tile, never a smaller figure squeezed underneath. */
const meta: Meta<BaseKpiCardComponent> = {
  title: 'Base/Cards & Containers/KPI Card',
  component: BaseKpiCardComponent,
  tags: ['autodocs'],
  argTypes: {
    railTone: { control: 'select', options: ['none', 'success', 'warning', 'error', 'info'] }
  },
  args: {
    label: 'Fleet Uptime',
    value: 94.2,
    unit: '%',
    sub: '',
    accent: true,
    railTone: 'none',
    trendPct: 1.8,
    trendBadWhenUp: false,
    clickable: false
  }
};
export default meta;
type Story = StoryObj<BaseKpiCardComponent>;

export const Default: Story = {};
export const NegativeTrend: Story = {
  args: { label: 'Active Alarms', value: 128, unit: '', accent: false, trendPct: -6.4, trendBadWhenUp: true }
};
export const NoChange: Story = {
  name: 'Zero trend (no change)',
  args: { label: 'Open Alarms', value: 47, unit: '', accent: false, trendPct: 0, sub: '12 equipment safety' }
};
export const NoTrend: Story = {
  args: { label: 'Tools In Production', value: 42, unit: '', accent: false, sub: 'of 60 tools', trendPct: undefined }
};
export const NullTrend: Story = {
  name: 'Trend unavailable (null)',
  args: { label: 'MTTR', value: 3.4, unit: 'h', accent: false, trendPct: null }
};
export const Clickable: Story = { args: { clickable: true } };

/** A colored left rail encodes a threshold state without touching the number's own color. */
export const RailTone: Story = {
  args: { label: 'Fab 8 · Dresden', value: 76.9, unit: '%', accent: false, railTone: 'error', trendPct: undefined, sub: 'Breach — 3 tools down' }
};

export const Grid: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fleet Uptime" [value]="94.2" unit="%" [trendPct]="1.8" [accent]="true" />
        <base-kpi-card label="Active Alarms" [value]="128" [trendPct]="-6.4" [trendBadWhenUp]="true" />
        <base-kpi-card label="Tools In Production" [value]="42" sub="of 60 tools" />
        <base-kpi-card label="MTTR" [value]="3.4" unit="h" [trendPct]="null" [clickable]="true" />
      </div>`
  })
};

/** The "accent rail" pattern from the spec — a fleet of tiles reads at a glance without every
 *  number turning into a traffic light. */
export const AccentRailRow: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fab 12 · Hillsboro" [value]="98.2" unit="%" railTone="success" sub="Above 95% target" />
        <base-kpi-card label="Fab 21 · Chandler" [value]="92.7" unit="%" railTone="warning" sub="Below 95% target" />
        <base-kpi-card label="Fab 8 · Dresden" [value]="76.9" unit="%" railTone="error" sub="Breach — 3 tools down" />
        <base-kpi-card label="Fab 3 · Leuven" value="—" railTone="info" sub="No telemetry since 04:12" />
      </div>`
  })
};

/** A page rarely fails all at once — one panel failing shouldn't take the rest of the screen
 *  with it. Outlines the whole tile in red (not just the left rail) and swaps the number for a
 *  retry link. */
export const PartialFailure: Story = {
  args: {
    label: 'Predicted Downtime', value: '', errorMessage: "The forecast service didn't respond."
  }
};

export const InlinePartialFailureRow: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <base-kpi-card label="Fleet Uptime" [value]="96.4" unit="%" [trendPct]="2.1" />
        <base-kpi-card label="Open Alarms" [value]="47" unit="" [trendPct]="0" />
        <base-kpi-card label="Predicted Downtime" value="" errorMessage="The forecast service didn't respond." />
      </div>`
  })
};
