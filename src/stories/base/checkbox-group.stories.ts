import type { Meta, StoryObj } from '@storybook/angular';
import { BaseCheckboxGroupComponent } from '../../app/base';

const meta: Meta<BaseCheckboxGroupComponent> = {
  title: 'Base/Forms/Checkbox Group',
  component: BaseCheckboxGroupComponent,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] }
  },
  args: {
    label: 'Machine state',
    direction: 'vertical',
    disabled: false,
    options: [
      { label: 'Production', value: 'production' },
      { label: 'Engineering', value: 'engineering' },
      { label: 'Standby', value: 'standby' },
      { label: 'Scheduled downtime', value: 'scheduled-dt' },
      { label: 'Unscheduled downtime', value: 'unscheduled-dt' }
    ],
    value: ['production', 'engineering']
  },
  render: (args) => ({
    props: args,
    template: `<base-checkbox-group [label]="label" [options]="options" [value]="value" [direction]="direction" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseCheckboxGroupComponent>;

export const Default: Story = {};
export const Horizontal: Story = { args: { direction: 'horizontal' } };
export const Disabled: Story = { args: { disabled: true } };
