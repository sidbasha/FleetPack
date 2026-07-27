import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSparklineComponent } from '../../app/base';

const RISING = [70, 74, 71, 78, 82, 85, 89, 94];
const FALLING = [94, 90, 88, 84, 79, 75, 70, 66];

const meta: Meta<BaseSparklineComponent> = {
  title: 'Base/Cards & Containers/Sparkline',
  component: BaseSparklineComponent,
  tags: ['autodocs'],
  args: {
    data: RISING,
    width: 96,
    height: 28,
    color: '#6366f1',
    fill: true,
    showLast: true
  }
};
export default meta;
type Story = StoryObj<BaseSparklineComponent>;

export const Rising: Story = {};
export const Falling: Story = { args: { data: FALLING, color: '#ef4444' } };
export const NoFill: Story = { args: { fill: false } };
export const Large: Story = { args: { width: 240, height: 60 } };

/** This is the exact renderer used by `<base-table>`'s `sparkline` cell kind, e.g. a "7-day" history column. */
export const InTableRow: Story = {
  render: () => ({
    template: `
      <table class="w-full max-w-md">
        <tbody class="divide-y divide-slate-100">
          <tr><td class="table-td">KLA-1000</td><td class="table-td"><base-sparkline [data]="[70,74,71,78,82,85,89,94]" /></td></tr>
          <tr><td class="table-td">KLA-1001</td><td class="table-td"><base-sparkline [data]="[94,90,88,84,79,75,70,66]" color="#ef4444" /></td></tr>
        </tbody>
      </table>`
  })
};
