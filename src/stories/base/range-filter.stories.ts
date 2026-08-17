import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRangeFilterComponent } from '../../app/base';

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

export const Default: Story = {};

export const ActiveFilterApplied: Story = { args: { from: 10, to: 95, active: true } };

export const InvalidRangeExample: Story = { args: { from: 90, to: 10 } };

export const WithDistribution: Story = { args: { values: VALUES, from: 55, to: 85, active: true } };
