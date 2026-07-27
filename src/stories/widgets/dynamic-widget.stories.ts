import type { Meta, StoryObj } from '@storybook/angular';
import { DynamicWidgetComponent } from '../../app/shared/dynamic/dynamic-page.component';
import { ChartWidget, KpiGridWidget } from '../../app/shared/dynamic/widget.model';

const KPI_WIDGET: KpiGridWidget = {
  id: 'kpi-panel',
  type: 'kpi-grid',
  title: 'Fleet Uptime Summary',
  badge: 'FAM',
  dateRange: { from: '2026-07-20', to: '2026-07-27' },
  actionsLabel: 'Include:',
  actions: [{ label: 'Engineering', active: true, run: () => {} }, { label: 'Standby', active: false, run: () => {} }],
  note: 'v2.26.2',
  kpis: [
    { label: '13W Rolling', value: 94.2, unit: '%', accent: true },
    { label: 'MTBr', value: 312, unit: 'hrs' }
  ]
};

const CHART_WIDGET: ChartWidget = {
  id: 'trend-panel',
  type: 'chart',
  title: 'Uptime Trend',
  collapsible: true,
  chartType: 'line',
  height: 220,
  data: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ label: 'Uptime', data: [88, 91, 87, 94], borderColor: '#6366f1', tension: 0.3 }]
  },
  options: { plugins: { legend: { display: false } } }
};

/** `fam-dynamic-widget` renders the shared panel chrome (title/badge/date-range/tabs/toggle/search/actions/note)
 * around any `WidgetConfig` body. This is what every panel on a dynamic page actually renders through. */
const meta: Meta<DynamicWidgetComponent> = {
  title: 'Widgets/Dynamic Widget (panel chrome)',
  component: DynamicWidgetComponent,
  tags: ['autodocs'],
  args: { widget: KPI_WIDGET },
  // DynamicWidgetComponent exposes several getters (asKpis/asChart/asTable/asList/
  // asComponent/resolvedComponent) that aren't real @Inputs - see base/checkbox.stories.ts
  // for why an explicit render avoids Storybook stomping non-input props on the instance
  // (getters have no setter, so a stray assignment would throw outright).
  render: (args) => ({
    props: args,
    template: `<fam-dynamic-widget [widget]="widget" />`
  })
};
export default meta;
type Story = StoryObj<DynamicWidgetComponent>;

export const KpiPanel: Story = {};
export const ChartPanelCollapsible: Story = { args: { widget: CHART_WIDGET } };
export const Frameless: Story = { args: { widget: { ...KPI_WIDGET, frameless: true, title: undefined, badge: undefined } } };
