import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBarChartComponent, BaseChartFrameComponent, BaseGanttTimelineComponent } from '../../app/base';

/**
 * The standard panel shell every chart sits in: a title/subtitle header, an optional export
 * action, and — the one thing every chart must offer — a "view as table" toggle. The table is
 * the accessible source of truth; the chart is the fast read.
 */
const meta: Meta<BaseChartFrameComponent> = {
  title: 'Base/Charts & Visualization/Chart Frame',
  component: BaseChartFrameComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BaseBarChartComponent] })],
  args: {
    title: 'Downtime events',
    subtitle: 'Per month · fleet total',
    caption: '',
    exportLabel: '',
    showTableToggle: true,
    tableView: false
  },
  render: (args) => ({
    props: args,
    template: `
      <base-chart-frame [title]="title" [subtitle]="subtitle" [caption]="caption" [exportLabel]="exportLabel"
                        [showTableToggle]="showTableToggle" [tableView]="tableView">
        <div chart>
          <base-bar-chart [data]="[
            { x: 'Dec', y: 14 }, { x: 'Jan', y: 16 }, { x: 'Feb', y: 27, tone: 'error' }, { x: 'Mar', y: 15 },
            { x: 'Apr', y: 11 }, { x: 'May', y: 10 }, { x: 'Jun', y: 8 }, { x: 'Jul', y: 6, tone: 'success' }
          ]" />
        </div>
        <table table class="w-full text-xs text-left">
          <thead><tr class="text-neutral-400 text-[10px] uppercase tracking-wide"><th class="pb-1">Month</th><th class="pb-1 text-right">Events</th></tr></thead>
          <tbody>
            <tr><td class="py-0.5">Dec</td><td class="text-right tabular-nums">14</td></tr>
            <tr><td class="py-0.5">Jan</td><td class="text-right tabular-nums">16</td></tr>
            <tr><td class="py-0.5 text-error font-semibold">Feb</td><td class="text-right tabular-nums text-error font-semibold">27</td></tr>
            <tr><td class="py-0.5">Mar</td><td class="text-right tabular-nums">15</td></tr>
            <tr><td class="py-0.5">Apr</td><td class="text-right tabular-nums">11</td></tr>
            <tr><td class="py-0.5">May</td><td class="text-right tabular-nums">10</td></tr>
            <tr><td class="py-0.5">Jun</td><td class="text-right tabular-nums">8</td></tr>
            <tr><td class="py-0.5 text-success font-semibold">Jul</td><td class="text-right tabular-nums text-success font-semibold">6</td></tr>
          </tbody>
        </table>
      </base-chart-frame>`
  })
};
export default meta;
type Story = StoryObj<BaseChartFrameComponent>;

export const Default: Story = {};
export const TableView: Story = { args: { tableView: true } };
export const WithCaption: Story = {
  args: { title: 'Downtime by root cause', subtitle: 'Hours · last 30 days', caption: '106 hours total · 62% attributable to chamber and handling' }
};

/** The spec's "State heatmap" and "Activity gantt" headers — export button, no table toggle. */
export const WithExportOnly: Story = {
  decorators: [moduleMetadata({ imports: [BaseGanttTimelineComponent] })],
  render: () => ({
    template: `
      <base-chart-frame title="Activity gantt" subtitle="Five tools · 24 hours · Fab 12" exportLabel="Export" [showTableToggle]="false">
        <div chart>
          <base-gantt-timeline [rows]="[
            { label: 'SP7-04', segments: [{ startHour: 0, endHour: 13, state: 'production' }, { startHour: 13, endHour: 15, state: 'engineering' }, { startHour: 15, endHour: 24, state: 'production' }] },
            { label: 'CAN-02', segments: [{ startHour: 0, endHour: 24, state: 'production' }] },
            { label: 'VOY-19', segments: [], noData: true }
          ]" />
        </div>
      </base-chart-frame>`
  })
};
