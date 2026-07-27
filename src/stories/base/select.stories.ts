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
  },
  // See checkbox.stories.ts - avoids Storybook force-assigning inherited/internal
  // signal state (BaseControl's `formDisabled`, plus BaseSelectComponent's own
  // `open`/`query`/`selectedLabel`/`filteredOptions`) as if it were a plain input.
  render: (args) => ({
    props: args,
    template: `<base-select [label]="label" [placeholder]="placeholder" [value]="value" [options]="options"
                             [hint]="hint" [error]="error" [disabled]="disabled" [searchable]="searchable"
                             [showChevron]="showChevron" />`
  })
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
