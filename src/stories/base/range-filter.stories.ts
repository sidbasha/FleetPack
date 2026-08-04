import type { Meta, StoryObj } from '@storybook/angular';
import { BaseRangeFilterComponent } from '../../app/base';

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
    active: false,
    align: 'left'
  },
  render: (args) => ({
    props: args,
    template: `<base-range-filter [header]="header" [from]="from" [to]="to" [active]="active" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseRangeFilterComponent>;

/** Click the ▽ icon in the canvas: From/To number inputs, Clear, Apply (disabled while From > To). */
export const Default: Story = {};

export const ActiveFilterApplied: Story = { args: { from: 10, to: 95, active: true } };

/** Typing From > To shows "Enter Valid Range" and disables Apply until it's fixed. */
export const InvalidRangeExample: Story = { args: { from: 90, to: 10 } };
