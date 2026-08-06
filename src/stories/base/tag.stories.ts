import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTagComponent } from '../../app/base';

const meta: Meta<BaseTagComponent> = {
  title: 'Base/Data Display/Tag',
  component: BaseTagComponent,
  tags: ['autodocs'],
  args: { label: 'Fleet A', icon: '' }
};
export default meta;
type Story = StoryObj<BaseTagComponent>;

export const Default: Story = {};
export const WithIcon: Story = { args: { label: 'Fleet A', icon: '🚛' } };

export const StaticClassification: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <base-tag label="Fleet A" />
        <base-tag label="MOD-A-001" />
        <base-tag label="v2.26.1" />
      </div>`
  })
};
