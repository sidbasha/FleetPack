import type { Meta, StoryObj } from '@storybook/angular';
import { BaseStepperComponent, BaseStepperStep } from '../../app/base';

const STEPS: BaseStepperStep[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'placement', label: 'Placement' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'review', label: 'Review' }
];

const QUALIFICATION_STEPS: BaseStepperStep[] = [
  { id: 'baseline', label: 'Baseline captured', description: 'Reference readings recorded' },
  { id: 'qualification', label: 'Running qualification', description: 'Comparing against tolerance band' },
  { id: 'signoff', label: 'Sign-off', description: 'Engineer approval pending' }
];

const meta: Meta<BaseStepperComponent> = {
  title: 'Base/Navigation/Stepper',
  component: BaseStepperComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] }
  },
  args: {
    steps: STEPS,
    activeId: 'telemetry',
    orientation: 'horizontal',
    linear: true
  }
};
export default meta;
type Story = StoryObj<BaseStepperComponent>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { steps: QUALIFICATION_STEPS, activeId: 'qualification', orientation: 'vertical' }
};

export const AllCompleted: Story = { args: { activeId: 'review' } };

export const NotStarted: Story = { args: { activeId: 'identity' } };

export const NonLinearJumpsAllowed: Story = { args: { activeId: 'placement', linear: false } };
