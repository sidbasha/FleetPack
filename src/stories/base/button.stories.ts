import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseButtonComponent } from '../../app/base';

const meta: Meta<BaseButtonComponent> = {
  title: 'Base/Actions/Button',
  component: BaseButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'outline', 'text', 'destructive', 'success', 'warning']
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    shape: { control: 'select', options: ['default', 'pill'] },
    debounceMs: { control: 'number' }
  },
  args: {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    fullWidth: false,
    iconOnly: false,
    shape: 'default',
    debounceMs: 0
  },
  render: (args) => ({
    props: args,
    template: `
      <base-button [variant]="variant" [size]="size" [type]="type" [shape]="shape"
                   [disabled]="disabled" [loading]="loading" [fullWidth]="fullWidth" [debounceMs]="debounceMs">
        Save changes
      </base-button>`
  })
};
export default meta;
type Story = StoryObj<BaseButtonComponent>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Text: Story = { args: { variant: 'text' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-button variant="primary">Primary</base-button>
        <base-button variant="secondary">Secondary</base-button>
        <base-button variant="tertiary">Tertiary</base-button>
        <base-button variant="ghost">Ghost</base-button>
        <base-button variant="outline">Outline</base-button>
        <base-button variant="text">Text</base-button>
        <base-button variant="destructive">Destructive</base-button>
        <base-button variant="success">Success</base-button>
        <base-button variant="warning">Warning</base-button>
      </div>`
  })
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-button size="sm">Small 28</base-button>
        <base-button size="md">Medium 36</base-button>
        <base-button size="lg">Large 44</base-button>
      </div>`
  })
};

export const IconOnly: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <base-button variant="secondary" [iconOnly]="true" size="sm" ariaLabel="Filter">▽</base-button>
        <base-button variant="secondary" [iconOnly]="true" ariaLabel="Refresh">↻</base-button>
        <base-button variant="ghost" [iconOnly]="true" ariaLabel="More">⋮</base-button>
        <base-button variant="destructive" [iconOnly]="true" ariaLabel="Delete">🗑</base-button>
      </div>`
  })
};

export const FloatingActionButton: Story = {
  name: 'Floating action button',
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-4">
        <base-button variant="primary" shape="pill" size="lg" [iconOnly]="true" ariaLabel="Add tool">+</base-button>
        <base-button variant="primary" shape="pill" size="md" [iconOnly]="true" ariaLabel="Add tool">+</base-button>
        <base-button variant="primary" shape="pill" size="lg">+ Add tool</base-button>
      </div>`
  })
};

export const LoadingAndDisabled: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-3 gap-3 items-center text-[11px] text-neutral-400 max-w-md">
        <span></span><span>Loading</span><span>Disabled</span>

        @for (v of ['primary','secondary','tertiary','ghost','outline','destructive']; track v) {
          <span class="capitalize text-ink-600 font-semibold">{{ v }}</span>
          <base-button [variant]="v" [loading]="true">Save</base-button>
          <base-button [variant]="v" [disabled]="true">Save</base-button>
        }
      </div>`
  })
};

@Component({
  selector: 'story-debounced-button',
  standalone: true,
  imports: [BaseButtonComponent],
  template: `
    <div class="flex flex-col gap-4 max-w-sm">
      <div class="flex items-center gap-3">
        <base-button (clicked)="normalCalls.update(n => n + 1)">Save (no debounce)</base-button>
        <span class="text-xs text-ink-600">API calls fired: <b class="text-action">{{ normalCalls() }}</b></span>
      </div>
      <div class="flex items-center gap-3">
        <base-button [debounceMs]="600" (clicked)="debouncedCalls.update(n => n + 1)">Save (debounceMs="600")</base-button>
        <span class="text-xs text-ink-600">API calls fired: <b class="text-action">{{ debouncedCalls() }}</b></span>
      </div>
      <p class="text-[11px] text-neutral-400">
        Click each button several times fast. The top button fires once per click — a burst of
        clicks becomes a burst of API calls. The bottom button ignores every click that lands
        within 600ms of the last one it accepted, so the same burst reaches the API at most once
        every 600ms. The button never looks disabled during that window — it just drops the
        duplicate calls.
      </p>
    </div>
  `
})
class StoryDebouncedButtonComponent {
  readonly normalCalls = signal(0);
  readonly debouncedCalls = signal(0);
}

export const DebouncedApiCall: StoryObj<StoryDebouncedButtonComponent> = {
  name: 'Debounced — prevent duplicate API calls',
  decorators: [moduleMetadata({ imports: [StoryDebouncedButtonComponent] })],
  render: () => ({ template: `<story-debounced-button />` })
};
