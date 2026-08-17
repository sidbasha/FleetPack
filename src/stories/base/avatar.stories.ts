import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAvatarComponent } from '../../app/base';

const meta: Meta<BaseAvatarComponent> = {
  title: 'Base/Data Display/Avatar',
  component: BaseAvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] }
  },
  args: { name: 'Maria Okonkwo', size: 'md' }
};
export default meta;
type Story = StoryObj<BaseAvatarComponent>;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg', name: 'Tom Sena' } };
export const ExplicitInitials: Story = { args: { name: '', initials: 'MO' } };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3">
        <base-avatar name="Maria Okonkwo" size="sm" />
        <base-avatar name="Maria Okonkwo" size="md" />
        <base-avatar name="Tom Sena" size="lg" />
      </div>`
  })
};
