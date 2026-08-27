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

const meta: Meta<ChartWidgetComponent> = {
  title: 'Widgets/Chart',
  component: ChartWidgetComponent,
  tags: ['autodocs'],
  args: { widget: LINE_WIDGET },
  parameters: {
    docs: {
      description: {
        component:
          'Wraps `ng2-charts`/Chart.js. Click legend chips to select which datasets show — any ' +
          'number at once (click again to deselect). Chart.js\'s own `hideDataset()`/`update()` ' +
          'actually removes the other series from the canvas (axes rescale automatically), not ' +
          'just a visual dim. Legend chips are matched to datasets by `label`, not array position, ' +
          'so a legend entry with no matching dataset (see LegendWithUnmatchedEntry) simply isn\'t ' +
          'clickable rather than toggling the wrong series. A "Reset Filter" link appears once ' +
          'anything is selected.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<ChartWidgetComponent>;

export const LineTrend: Story = {};
export const BarComparison: Story = { args: { widget: BAR_WIDGET } };

const ALARM_CATEGORIES = ['Equipment Safety', 'Attention Flags', 'Data Integrity', 'Irrecoverable'];
const ALARM_COLORS = ['#dc2626', '#f59e0b', '#6366f1', '#7c3aed'];

const STACKED_BAR_WIDGET: ChartWidget = {
  id: 'alarm-volume',
  type: 'chart',
  chartType: 'bar',
  height: 288,
  legend: ALARM_CATEGORIES.map((label, i) => ({ label, color: ALARM_COLORS[i] })),
  data: {
    labels: WEEKS,
    datasets: ALARM_CATEGORIES.map((label, i) => ({
      label,
      data: WEEKS.map(() => Math.round(4 + Math.random() * (12 - i * 2))),
      backgroundColor: ALARM_COLORS[i],
      stack: 'alarms',
      borderRadius: 2
    }))
  },
  options: {
    plugins: { legend: { display: false } },
    scales: { x: { stacked: true }, y: { stacked: true } }
  }
};

export const StackedBarIsolate: Story = {
  name: 'Stacked bar · isolate a category',
  args: { widget: STACKED_BAR_WIDGET },
  parameters: {
    docs: {
      description: {
        story: 'Click a legend chip to select that category, click another to add it too — the stack shows only the selected categories and the y-axis rescales to fit them, matching how the real Alarm Volume widget behaves. Reset Filter brings the full stack back.'
      }
    }
  }
};

const LEGEND_WITH_UNMATCHED_WIDGET: ChartWidget = {
  id: 'trend-with-decorative-legend',
  type: 'chart',
  chartType: 'line',
  height: 288,
  // "Work Week" has no matching dataset below — mirrors the real Fleet Uptime/Downtime
  // Trend widget, where a legend entry exists purely as a decorative key with nothing to isolate.
  legend: [
    { label: 'Work Week', color: 'rgba(99,102,241,.3)' },
    { label: '4 Week Rolling', color: '#f59e0b' },
    { label: '13 Week Rolling', color: '#16a34a' }
  ],
  data: {
    labels: WEEKS,
    datasets: [
      { label: '4 Week Rolling', data: [80, 81, 79, 84, 87, 88, 90, 92], borderColor: '#f59e0b', tension: 0.3 },
      { label: '13 Week Rolling', data: [83, 83, 84, 85, 85, 86, 87, 88], borderColor: '#16a34a', tension: 0.3 }
    ]
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
};

export const LegendWithUnmatchedEntry: Story = {
  name: 'Legend entry with no matching dataset',
  args: { widget: LEGEND_WITH_UNMATCHED_WIDGET },
  parameters: {
    docs: {
      description: {
        story: '"Work Week" has no corresponding dataset — it stays a plain, non-clickable chip while "4 Week Rolling" and "13 Week Rolling" are isolatable, since matching is by label rather than position.'
      }
    }
  }
};
