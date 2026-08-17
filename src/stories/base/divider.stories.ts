import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDividerComponent } from '../../app/base';

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
