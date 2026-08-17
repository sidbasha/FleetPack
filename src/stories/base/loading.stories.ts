import type { Meta, StoryObj } from '@storybook/angular';
import { BaseLoadingComponent } from '../../app/base';

const meta: Meta<BaseLoadingComponent> = {
  title: 'Base/Feedback/Loading',
  component: BaseLoadingComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['spinner', 'dots'] },
    size: { control: 'select', options: ['sm', 'md'] }
  },
  args: {
    message: 'Loading...',
    variant: 'spinner',
    size: 'md',
    compact: false
  }
};
export default meta;
type Story = StoryObj<BaseLoadingComponent>;

export const Default: Story = {};
export const CustomMessage: Story = { args: { message: 'Loading fleet availability...' } };
export const Dots: Story = { args: { variant: 'dots' } };
export const Compact: Story = { args: { compact: true, size: 'sm', message: 'Refreshing…' } };

export const IndicatorStyles: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <base-loading [compact]="true" size="sm" message="" variant="spinner" />
        <base-loading [compact]="true" size="md" message="" variant="spinner" />
        <base-loading [compact]="true" size="md" message="" variant="dots" />
      </div>`
  })
};
