import type { Meta, StoryObj } from '@storybook/angular';
import { DynamicPageComponent } from '../../app/shared/dynamic/dynamic-page.component';
import { ChartWidget, KpiGridWidget, RankedListWidget, WidgetConfig } from '../../app/shared/dynamic/widget.model';

const KPIS: KpiGridWidget = {
  id: 'kpis', type: 'kpi-grid', title: 'Fleet Summary', colSpan: 6,
  kpis: [
    { label: '13W Rolling', value: 94.2, unit: '%', accent: true },
    { label: 'MTBr', value: 312, unit: 'hrs' },
    { label: 'Alarms (30d)', value: 128, danger: true },
    { label: 'Resets', value: 6 }
  ]
};

const TREND: ChartWidget = {
  id: 'trend', type: 'chart', title: 'Uptime Trend', colSpan: 4, chartType: 'line', height: 240,
  data: { labels: ['W1', 'W2', 'W3', 'W4', 'W5'], datasets: [{ label: 'Uptime', data: [88, 91, 87, 94, 96], borderColor: '#6366f1', tension: 0.3 }] },
  options: { plugins: { legend: { display: false } } }
};

const TOP10: RankedListWidget = {
  id: 'top10', type: 'ranked-list', title: 'Top Unavailable Tools', colSpan: 2, trendBadWhenUp: true,
  items: [
    { key: '1', rank: 1, title: 'KLA-1042', value: '312 hrs', trendPct: 4.1, barPct: 92, barColor: '#ef4444' },
    { key: '2', rank: 2, title: 'KLA-1017', value: '204 hrs', trendPct: -2.3, barPct: 68 }
  ]
};

const WIDGETS: WidgetConfig[] = [KPIS, TREND, TOP10];

const meta: Meta<DynamicPageComponent> = {
  title: 'Widgets/Dynamic Page (grid layout)',
  component: DynamicPageComponent,
  tags: ['autodocs'],
  args: { widgets: WIDGETS }
};
export default meta;
type Story = StoryObj<DynamicPageComponent>;

export const MixedWidgetGrid: Story = {};
