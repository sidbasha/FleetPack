import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSelectComponent, BaseSelectOption } from '../../app/base';

const FAB_OPTIONS: BaseSelectOption<string>[] = [
  { label: 'Fab-A', value: 'Fab-A' },
  { label: 'Fab-B', value: 'Fab-B' },
  { label: 'Fab-C', value: 'Fab-C' },
  { label: 'Fab-D (offline)', value: 'Fab-D', disabled: true }
];

const meta: Meta<BaseSelectComponent> = {
  title: 'Base/Forms/Select',
  component: BaseSelectComponent,
  tags: ['autodocs'],
  args: {
    label: 'Fab',
    placeholder: 'Select...',
    value: null,
    options: FAB_OPTIONS,
    hint: '',
    error: '',
    disabled: false,
    searchable: false,
    showChevron: true
  }
};
export default meta;
type Story = StoryObj<BaseSelectComponent>;

export const Default: Story = {};
export const Selected: Story = { args: { value: 'Fab-B' } };
export const Searchable: Story = { args: { searchable: true } };
/** `[showChevron]="false"` makes the select read as a plain input-styled box - used in filter bars. */
export const PlainInputLook: Story = { name: 'Plain input look (no chevron)', args: { showChevron: false, value: 'Fab-A' } };
export const ErrorState: Story = { name: 'Error', args: { error: 'Fab is required.' } };
export const Disabled: Story = { args: { value: 'Fab-A', disabled: true } };
