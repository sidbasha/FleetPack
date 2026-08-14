import type { Meta, StoryObj } from '@storybook/angular';
import { BaseAvatarGroupComponent } from '../../app/base';

/** Overlapping avatar stack with a "+N" overflow badge past [max]. */
const meta: Meta<BaseAvatarGroupComponent> = {
  title: 'Base/Data Display/Avatar Group',
  component: BaseAvatarGroupComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { name: 'Maria Okonkwo' }, { name: 'Maria Okonkwo' }, { name: 'Jamie Reyes' },
      { name: 'Tom Sena' }, { name: 'Priya Nair' }, { name: 'Chen Wei' },
      { name: 'Alex Kim' }, { name: 'Sofia Rossi' }, { name: 'Dana Cole' }
    ],
    max: 4
  }
};
export default meta;
type Story = StoryObj<BaseAvatarGroupComponent>;

export const Default: Story = {};
export const NoOverflow: Story = { args: { items: [{ name: 'Maria Okonkwo' }, { name: 'Jamie Reyes' }], max: 4 } };
export const Large: Story = { args: { size: 'lg' } };
