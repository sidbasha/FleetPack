import type { Meta, StoryObj } from '@storybook/angular';
import { KpiGridWidgetComponent } from '../../app/shared/dynamic/basic-widgets.components';
import { KpiGridWidget } from '../../app/shared/dynamic/widget.model';

const WIDGET: KpiGridWidget = {
  id: 'kpi-demo',
  type: 'kpi-grid',
  kpis: [
    { label: '13W Rolling', value: 94.2, unit: '%', sub: '+1.8% W/W', accent: true },
    { label: 'MTBr', value: 312, unit: 'hrs' },
    { label: 'Alarms (30d)', value: 128, danger: true },
    { label: 'No. of Resets', value: 6, sub: 'last 4 weeks' }
  ]
};

const meta: Meta<KpiGridWidgetComponent> = {
  title: 'Widgets/KPI Grid',
  component: KpiGridWidgetComponent,
  tags: ['autodocs'],
  args: { widget: WIDGET }
};
export default meta;
type Story = StoryObj<KpiGridWidgetComponent>;

export const Default: Story = {};
export const WithDangerValue: Story = {
  args: {
    widget: {
      id: 'kpi-danger',
      type: 'kpi-grid',
      kpis: [{ label: 'Unscheduled Downtime', value: '18.4', unit: 'hrs', danger: true }]
    }
  }
};
