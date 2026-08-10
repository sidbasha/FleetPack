import type { Meta, StoryObj } from '@storybook/angular';
import { BaseMultiSelectChipsComponent } from '../../app/base';

/** Multi-select field; selected values render as removable chips inline. */
const meta: Meta<BaseMultiSelectChipsComponent> = {
  title: 'Base/Forms/Multi-Select (Chips)',
  component: BaseMultiSelectChipsComponent,
  tags: ['autodocs'],
  args: {
    label: 'Fleets',
    options: [
      { label: 'Fleet A', value: 'a' },
      { label: 'Fleet B', value: 'b' },
      { label: 'Fleet C', value: 'c' }
    ],
    value: ['a', 'c']
  }
};
export default meta;
type Story = StoryObj<BaseMultiSelectChipsComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { value: [] } };
