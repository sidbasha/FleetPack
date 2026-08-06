import type { Meta, StoryObj } from '@storybook/angular';
import { BaseComboboxComponent } from '../../app/base';

/** Unlike Select, the typed text is a real value, not just a filter — you
 *  type but an unmatched entry is still accepted if the field allows free
 *  text. */
const meta: Meta<BaseComboboxComponent> = {
  title: 'Base/Forms/Combobox',
  component: BaseComboboxComponent,
  tags: ['autodocs'],
  args: {
    label: 'Recipe',
    placeholder: 'RCP-88',
    options: [
      { label: 'RCP-8821-A', value: 'RCP-8821-A' },
      { label: 'RCP-8834-C', value: 'RCP-8834-C' }
    ],
    value: ''
  }
};
export default meta;
type Story = StoryObj<BaseComboboxComponent>;

export const Default: Story = {};
