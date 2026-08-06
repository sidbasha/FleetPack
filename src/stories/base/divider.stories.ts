import type { Meta, StoryObj } from '@storybook/angular';
import { BaseDividerComponent } from '../../app/base';

/** `border-subtle`, 1px. A labeled divider (with inline text) uses the same
 *  weight as a plain one — the label never gets extra visual emphasis a
 *  plain divider doesn't have. */
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
