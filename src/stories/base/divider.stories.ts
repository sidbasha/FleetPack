import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDividerComponent } from '../../app/base';

/** `border-subtle`, 1px. A labeled divider carries no extra visual weight over a plain one. */
const meta: Meta<BaseDividerComponent> = {
  title: 'Base/Data Display/Divider',
  component: BaseDividerComponent,
  tags: ['autodocs'],
  args: { label: '' }
};
export default meta;
type Story = StoryObj<BaseDividerComponent>;

export const Plain: Story = {};
export const Labeled: Story = { args: { label: 'Production' } };
