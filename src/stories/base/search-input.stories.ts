import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSearchInputComponent } from '../../app/base';

const meta: Meta<BaseSearchInputComponent> = {
  title: 'Base/Forms/Search Input',
  component: BaseSearchInputComponent,
  tags: ['autodocs'],
  args: {
    placeholder: 'Search...',
    debounceMs: 250
  }
};
export default meta;
type Story = StoryObj<BaseSearchInputComponent>;

export const Default: Story = {};
export const CustomPlaceholder: Story = { args: { placeholder: 'Search tool id...' } };
