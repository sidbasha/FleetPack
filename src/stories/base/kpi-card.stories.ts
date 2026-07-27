import type { Meta, StoryObj } from '@storybook/angular';
import { BaseKpiCardComponent } from '../../app/base';

const meta: Meta<BaseKpiCardComponent> = {
  title: 'Base/Cards & Containers/KPI Card',
  component: BaseKpiCardComponent,
  tags: ['autodocs'],
  args: {
    label: 'Fleet Uptime',
    value: 94.2,
    unit: '%',
    sub: '',
    accent: true,
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
export const NoTrend: Story = {
  args: { label: 'Tools In Production', value: 42, unit: '', accent: false, sub: 'of 60 tools', trendPct: undefined }
};
export const NullTrend: Story = {
  name: 'Trend unavailable (null)',
  args: { label: 'MTTR', value: 3.4, unit: 'h', accent: false, trendPct: null }
};
export const Clickable: Story = { args: { clickable: true } };

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
