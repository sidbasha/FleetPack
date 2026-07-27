import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTrendComponent } from '../../app/base';

const meta: Meta<BaseTrendComponent> = {
  title: 'Base/Feedback/Trend',
  component: BaseTrendComponent,
  tags: ['autodocs'],
  args: {
    value: 1.8,
    badWhenUp: false,
    digits: '1.1-1'
  }
};
export default meta;
type Story = StoryObj<BaseTrendComponent>;

export const Up: Story = {};
export const Down: Story = { args: { value: -6.4 } };
/** For metrics like alarm counts, an increase is bad - `badWhenUp` flips the color mapping without flipping the arrow. */
export const BadWhenUp: Story = { args: { value: 6.4, badWhenUp: true } };
export const NoData: Story = { name: 'No data (null)', args: { value: null } };
