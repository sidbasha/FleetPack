import type { Meta, StoryObj } from '@storybook/angular';
import { BaseProgressBarComponent } from '../../app/base';

const meta: Meta<BaseProgressBarComponent> = {
  title: 'Base/Feedback/Progress Bar',
  component: BaseProgressBarComponent,
  tags: ['autodocs'],
  args: {
    value: 72,
    color: '#6366f1',
    height: 6,
    showLabel: true
  }
};
export default meta;
type Story = StoryObj<BaseProgressBarComponent>;

export const Default: Story = {};
export const NoLabel: Story = { args: { showLabel: false } };
export const Complete: Story = { args: { value: 100, color: '#16a34a' } };
export const AtRisk: Story = { name: 'At risk (custom color)', args: { value: 18, color: '#ef4444' } };
