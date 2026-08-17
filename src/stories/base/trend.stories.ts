import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTrendComponent } from '../../app/base';

const meta: Meta<BaseTrendComponent> = {
  title: 'Base/Feedback/Trend',
  component: BaseTrendComponent,
  tags: ['autodocs'],
  args: {
    value: 1.8,
    badWhenUp: false,
    digits: '1.1-1',
    zeroLabel: 'No change'
  },
  render: (args) => ({
    props: args,
    template: `<base-trend [value]="value" [badWhenUp]="badWhenUp" [digits]="digits" [zeroLabel]="zeroLabel" />`
  })
};
export default meta;
type Story = StoryObj<BaseTrendComponent>;

export const Up: Story = {};
export const Down: Story = { args: { value: -6.4 } };
export const BadWhenUp: Story = { args: { value: 6.4, badWhenUp: true } };
export const ZeroChange: Story = { name: 'Zero (no change)', args: { value: 0 } };
export const NoData: Story = { name: 'No data (null)', args: { value: null } };
