import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSliderComponent } from '../../app/base';

/** Bounded numeric single value with a visible current reading. Reach for `<base-range-slider>`
 *  for a from/to pair, or `<base-numeric-stepper>` once clicking beats dragging. */
const meta: Meta<BaseSliderComponent> = {
  title: 'Base/Forms/Slider',
  component: BaseSliderComponent,
  tags: ['autodocs'],
  args: { label: 'Availability alert threshold', min: 0, max: 100, step: 1, unit: '%', value: 95, showValueBubble: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<base-slider [label]="label" [min]="min" [max]="max" [step]="step" [unit]="unit"
                            [value]="value" [showValueBubble]="showValueBubble" [disabled]="disabled" />`
  })
};
export default meta;
type Story = StoryObj<BaseSliderComponent>;

export const Default: Story = {};
export const WithValueBubble: Story = { args: { showValueBubble: true } };
export const Disabled: Story = { args: { disabled: true } };
