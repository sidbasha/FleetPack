import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxFilterComponent } from '../../app/base';

const OPTIONS = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'STANDBY', label: 'Standby' },
  { value: 'DOWN', label: 'Down' }
];

/** `<base-table>` computes these against every OTHER active filter — shown here as static data
 *  since this story renders the filter standalone, with no table behind it. Includes the
 *  synthetic "(No value)" option `<base-table>` appends whenever some row has a null/empty cell. */
const OPTIONS_WITH_COUNTS = [
  { value: 'PRODUCTION', label: 'Production', count: 18 },
  { value: 'ENGINEERING', label: 'Engineering', count: 6 },
  { value: 'STANDBY', label: 'Standby', count: 9 },
  { value: 'DOWN', label: 'Down', count: 2 },
  { value: '__no_value__', label: '(No value)', count: 3 }
];

const meta: Meta<BaseCheckboxFilterComponent> = {
  title: 'Base/Tables & Data/Checkbox Filter',
  component: BaseCheckboxFilterComponent,
  tags: ['autodocs'],
  parameters: {
    // Opens on click; the story canvas needs room for the popup.
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    header: 'Status',
    options: OPTIONS,
    selected: [],
    sortable: true,
    currentSort: null,
    active: false,
    align: 'left'
  },
  // `open`/draft signals are internal state - see checkbox.stories.ts for why an explicit
  // render avoids Storybook stomping them via the auto-generated wrapper.
  render: (args) => ({
    props: args,
    template: `<base-checkbox-filter [header]="header" [options]="options" [selected]="selected"
                                      [sortable]="sortable" [currentSort]="currentSort" [active]="active" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseCheckboxFilterComponent>;

/** Click the ▽ icon in the canvas: search, checkbox list, Sort Asc/Desc (since `sortable` is on), Clear, Apply. */
export const Default: Story = {};

export const ActiveFilterApplied: Story = {
  args: { selected: ['PRODUCTION', 'ENGINEERING'], currentSort: 'asc', active: true }
};

export const WithoutSort: Story = { args: { sortable: false } };

/** Per-option record counts (evaluated against every OTHER active filter) plus the synthetic
 *  "(No value)" row for null/empty cells — both are `<base-table>`-computed in real use. */
export const WithCountsAndNoValue: Story = { args: { options: OPTIONS_WITH_COUNTS, selected: ['PRODUCTION'], active: true } };

/** Above 200 options the list stays a plain scrolling+searchable list rather than adopting
 *  windowed virtualization — a deliberate scope call, noted in the component doc. */
export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 240 }, (_, i) => ({ value: `V${i}`, label: `Value ${i + 1}`, count: (i * 7) % 30 })),
    sortable: false
  }
};
