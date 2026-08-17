import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCalendarFilterComponent } from '../../app/base';

const meta: Meta<BaseCalendarFilterComponent> = {
  title: 'Base/Tables & Data/Calendar Filter',
  component: BaseCalendarFilterComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  argTypes: {
    align: { control: 'select', options: ['left', 'right'] }
  },
  args: {
    header: 'Last Maintenance',
    start: null,
    end: null,
    showTime: false,
    active: false,
    align: 'left'
  },
  render: (args) => ({
    props: args,
    template: `<base-calendar-filter [header]="header" [start]="start" [end]="end"
                                      [showTime]="showTime" [active]="active" [align]="align" />`
  })
};
export default meta;
type Story = StoryObj<BaseCalendarFilterComponent>;

export const Default: Story = {};

export const ActiveFilterApplied: Story = {
  args: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 15), active: true }
};

export const WithTime: Story = { args: { showTime: true } };

export const RelativePresets: Story = {};
