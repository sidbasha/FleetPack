import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSplitButtonComponent } from '../../app/base';

/** Default action plus a chevron menu of related variants. */
const meta: Meta<BaseSplitButtonComponent> = {
  title: 'Base/Actions/Split Button',
  component: BaseSplitButtonComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { id: 'csv', label: 'Export as CSV' },
      { id: 'xlsx', label: 'Export as Excel' },
      { id: 'pdf', label: 'Export as PDF' }
    ]
  },
  render: (args) => ({
    props: args,
    template: `<base-split-button [items]="items">Download</base-split-button>`
  })
};
export default meta;
type Story = StoryObj<BaseSplitButtonComponent>;

export const Default: Story = {};
