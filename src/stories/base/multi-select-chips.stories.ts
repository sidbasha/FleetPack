import type { Meta, StoryObj } from '@storybook/angular';
import { BaseMultiSelectChipsComponent } from '../../app/base';

const meta: Meta<BaseMultiSelectChipsComponent> = {
  title: 'Base/Forms/Multi-Select (Chips)',
  component: BaseMultiSelectChipsComponent,
  tags: ['autodocs'],
  args: {
    label: 'Fleet segments — multi-select',
    options: [
      { label: 'Inspection', value: 'inspection' },
      { label: 'Metrology', value: 'metrology' },
      { label: 'Review', value: 'review' },
      { label: 'Etch', value: 'etch' },
      { label: 'Deposition', value: 'deposition' },
      { label: 'CMP', value: 'cmp' },
      { label: 'Litho', value: 'litho' },
      { label: 'Clean', value: 'clean' },
      { label: 'Test', value: 'test' }
    ],
    value: ['inspection', 'metrology', 'review'],
    hint: 'Three of nine segments selected.'
  }
};
export default meta;
type Story = StoryObj<BaseMultiSelectChipsComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { value: [], hint: '' } };
