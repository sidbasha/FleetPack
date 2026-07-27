import type { Meta, StoryObj } from '@storybook/angular';
import { ChartWidgetComponent } from '../../app/shared/dynamic/basic-widgets.components';
import { ChartWidget } from '../../app/shared/dynamic/widget.model';

const WEEKS = ['2026-15', '2026-16', '2026-17', '2026-18', '2026-19', '2026-20', '2026-21', '2026-22'];

const LINE_WIDGET: ChartWidget = {
  id: 'uptime-trend',
  type: 'chart',
  chartType: 'line',
  height: 288,
  footnote: 'Fleet: FAM_OMD (1) - 13 week rolling window',
  legend: [
    { label: '1 Week Rolling', color: '#6366f1' },
    { label: '4 Week Rolling', color: '#f59e0b' },
    { label: '13 Week Rolling', color: '#16a34a' }
  ],
  data: {
    labels: WEEKS,
    datasets: [
      { label: '1 Week Rolling', data: [78, 82, 74, 88, 91, 85, 93, 96], borderColor: '#6366f1', backgroundColor: '#6366f1', tension: 0.3 },
      { label: '4 Week Rolling', data: [80, 81, 79, 84, 87, 88, 90, 92], borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.3 },
      { label: '13 Week Rolling', data: [83, 83, 84, 85, 85, 86, 87, 88], borderColor: '#16a34a', backgroundColor: '#16a34a', tension: 0.3 }
    ]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
};

const BAR_WIDGET: ChartWidget = {
  id: 'downtime-category',
  type: 'chart',
  chartType: 'bar',
  height: 260,
  data: {
    labels: ['Scheduled', 'Unscheduled', 'Non-Scheduled'],
    datasets: [{ label: 'Hours (13WW)', data: [312, 148, 40, ].slice(0, 3), backgroundColor: ['#f59e0b', '#ef4444', '#94a3b8'] }]
  },
  options: { plugins: { legend: { display: false } } }
};

/** `fam-chart-widget` wraps `ng2-charts`' `<canvas baseChart>` with the widget-config API (data/options/legend/footnote). */
const meta: Meta<ChartWidgetComponent> = {
  title: 'Widgets/Chart',
  component: ChartWidgetComponent,
  tags: ['autodocs'],
  args: { widget: LINE_WIDGET }
};
export default meta;
type Story = StoryObj<ChartWidgetComponent>;

export const LineTrend: Story = {};
export const BarComparison: Story = { args: { widget: BAR_WIDGET } };
