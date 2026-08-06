import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSplitButtonComponent } from '../../app/base';

/** A default action plus a short menu of closely related variants — worth
 *  naming separately from a plain button (one action) and a dropdown menu
 *  (no default action of its own). */
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
