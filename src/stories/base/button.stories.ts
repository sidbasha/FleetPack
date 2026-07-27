import type { Meta, StoryObj } from '@storybook/angular';
import { BaseButtonComponent } from '../../app/base';

const meta: Meta<BaseButtonComponent> = {
  title: 'Base/Actions/Button',
  component: BaseButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] }
  },
  args: {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    fullWidth: false
  },
  render: (args) => ({
    props: args,
    template: `
      <base-button [variant]="variant" [size]="size" [type]="type"
                   [disabled]="disabled" [loading]="loading" [fullWidth]="fullWidth">
        Save changes
      </base-button>`
  })
};
export default meta;
type Story = StoryObj<BaseButtonComponent>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger' }, name: 'Danger (destructive)' };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-button variant="primary">Primary</base-button>
        <base-button variant="secondary">Secondary</base-button>
        <base-button variant="ghost">Ghost</base-button>
        <base-button variant="danger">Danger</base-button>
      </div>`
  })
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-button size="sm">Small</base-button>
        <base-button size="md">Medium</base-button>
        <base-button size="lg">Large</base-button>
      </div>`
  })
};
