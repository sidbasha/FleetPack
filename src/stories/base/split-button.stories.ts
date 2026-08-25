import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSplitButtonComponent } from '../../app/base';

const meta: Meta<BaseSplitButtonComponent> = {
  title: 'Base/Actions/Split Button',
  component: BaseSplitButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    debounceMs: { control: 'number' }
  },
  args: {
    variant: 'primary',
    debounceMs: 0,
    items: [
      { id: 'csv', label: 'Export as CSV' },
      { id: 'xlsx', label: 'Export as Excel' },
      { id: 'pdf', label: 'Export as PDF' }
    ]
  },
  render: (args) => ({
    props: args,
    template: `<base-split-button [items]="items" [variant]="variant" [debounceMs]="debounceMs">Download</base-split-button>`
  })
};
export default meta;
type Story = StoryObj<BaseSplitButtonComponent>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const BothVariants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-split-button [items]="items" variant="primary">Export CSV</base-split-button>
        <base-split-button [items]="items" variant="secondary">Assign</base-split-button>
      </div>`
  })
};
