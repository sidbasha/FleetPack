import type { Meta, StoryObj } from '@storybook/angular';
import { BaseColorPickerComponent } from '../../app/base';

const meta: Meta<BaseColorPickerComponent> = {
  title: 'Base/Forms/Color Picker',
  component: BaseColorPickerComponent,
  tags: ['autodocs'],
  args: {
    label: 'Segment colour',
    value: 'action',
    hint: 'Free-form hex entry is deliberately absent — a segment colour is a token, so it survives a theme switch.',
    disabled: false
  },
  render: (args) => ({
    props: args,
    template: `<base-color-picker [label]="label" [value]="value" [hint]="hint" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseColorPickerComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
