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
  // `positive` is an internal computed (not a real @Input) - see checkbox.stories.ts for why
  // an explicit render avoids Storybook stomping it via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-trend [value]="value" [badWhenUp]="badWhenUp" [digits]="digits" [zeroLabel]="zeroLabel" />`
  })
};
export default meta;
type Story = StoryObj<BaseTrendComponent>;

export const Up: Story = {};
export const Down: Story = { args: { value: -6.4 } };
/** For metrics like alarm counts, an increase is bad - `badWhenUp` flips the color mapping without flipping the arrow. */
export const BadWhenUp: Story = { args: { value: 6.4, badWhenUp: true } };
/** Exactly 0 is neutral, not a false ▼ — 0 is not "down". */
export const ZeroChange: Story = { name: 'Zero (no change)', args: { value: 0 } };
export const NoData: Story = { name: 'No data (null)', args: { value: null } };
