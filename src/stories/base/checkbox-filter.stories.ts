import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxFilterComponent } from '../../app/base';

const OPTIONS = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'STANDBY', label: 'Standby' },
  { value: 'DOWN', label: 'Down' }
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
