import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRangeFilterComponent } from '../../app/base';

/** Deterministic, mildly skewed distribution so the histogram has visible shape. */
const VALUES = Array.from({ length: 180 }, (_, i) => 60 + ((i * 37) % 40) - (i % 5 === 0 ? 15 : 0));

const meta: Meta<BaseRangeFilterComponent> = {
  title: 'Base/Tables & Data/Range Filter',
  component: BaseRangeFilterComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    header: 'Uptime %',
    from: null,
    to: null,
    values: [],
    active: false,
    align: 'left'
  },
  render: (args) => ({
    props: args,
    template: `<base-range-filter [header]="header" [from]="from" [to]="to" [values]="values" [active]="active" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseRangeFilterComponent>;

/** Click the ▽ icon in the canvas: From/To number inputs, Clear, Apply (disabled while From > To). */
export const Default: Story = {};

export const ActiveFilterApplied: Story = { args: { from: 10, to: 95, active: true } };

/** Typing From > To shows "Enter Valid Range" and disables Apply until it's fixed. */
export const InvalidRangeExample: Story = { args: { from: 90, to: 10 } };

/** [values] (the full column's numeric values — `<base-table>` supplies these) draws a 12-bucket
 *  distribution histogram above the inputs; buckets inside the current draft [from, to] highlight. */
export const WithDistribution: Story = { args: { values: VALUES, from: 55, to: 85, active: true } };
