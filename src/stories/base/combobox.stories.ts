import type { Meta, StoryObj } from '@storybook/angular';
import { BaseComboboxComponent } from '../../app/base';

/** Type-ahead field where the typed text is a real value, not just a filter. Options can be
 *  grouped (pre-sort the array by [group]) and carry trailing [meta] text, e.g. a tool count. */
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
export const ConfirmedSelection: Story = { name: 'Confirmed selection (closed)', args: { value: 'RCP-8821-A' } };

/** Grouped options with per-option meta text, and a disabled option (offline) — as in the "Site" picker. */
export const GroupedWithMeta: Story = {
  args: {
    label: 'Site',
    placeholder: 'Search a site…',
    value: 'Fab 12 · Hillsboro',
    options: [
      { label: 'Fab 12 · Hillsboro', value: 'fab12', group: 'North America', meta: '' },
      { label: 'Fab 21 · Chandler', value: 'fab21', group: 'North America', meta: '78 tools' },
      { label: 'Fab 8 · Dresden', value: 'fab8', group: 'Europe', meta: '44 tools' },
      { label: 'Fab 3 · Leuven', value: 'fab3', group: 'Europe', meta: 'offline', disabled: true }
    ]
  }
};
