import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTagComponent } from '../../app/base';

const meta: Meta<BaseTagComponent> = {
  title: 'Base/Data Display/Tag',
  component: BaseTagComponent,
  tags: ['autodocs'],
  args: { label: 'Fleet A', icon: '', dot: false, disabled: false, removable: false }
};
export default meta;
type Story = StoryObj<BaseTagComponent>;

export const Default: Story = {};
export const WithIcon: Story = { args: { label: 'Fleet A', icon: '🚛' } };
export const WithDot: Story = { args: { label: 'Metrology', dot: true } };
export const Removable: Story = { args: { label: 'Night shift', removable: true } };
export const Disabled: Story = { args: { label: 'Archived', disabled: true } };

export const StaticClassification: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <base-tag label="Inspection" />
        <base-tag label="Metrology" [dot]="true" />
        <base-tag label="Review" [dot]="true" />
        <base-tag label="M. Okonkwo" icon="👤" [removable]="true" />
        <base-tag label="Night shift" [removable]="true" />
        <base-tag label="Archived" [disabled]="true" />
      </div>`
  })
};
