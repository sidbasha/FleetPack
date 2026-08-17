import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxFilterComponent } from '../../app/base';

const OPTIONS = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'STANDBY', label: 'Standby' },
  { value: 'DOWN', label: 'Down' }
];

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
  render: (args) => ({
    props: args,
    template: `<base-checkbox-filter [header]="header" [options]="options" [selected]="selected"
                                      [sortable]="sortable" [currentSort]="currentSort" [active]="active" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseCheckboxFilterComponent>;

export const Default: Story = {};

export const ActiveFilterApplied: Story = {
  args: { selected: ['PRODUCTION', 'ENGINEERING'], currentSort: 'asc', active: true }
};

export const WithoutSort: Story = { args: { sortable: false } };

export const WithCountsAndNoValue: Story = { args: { options: OPTIONS_WITH_COUNTS, selected: ['PRODUCTION'], active: true } };

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 240 }, (_, i) => ({ value: `V${i}`, label: `Value ${i + 1}`, count: (i * 7) % 30 })),
    sortable: false
  }
};
