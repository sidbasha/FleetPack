import type { Meta, StoryObj } from '@storybook/angular';
import { BaseLoadingComponent } from '../../app/base';

const meta: Meta<BaseLoadingComponent> = {
  title: 'Base/Feedback/Loading',
  component: BaseLoadingComponent,
  tags: ['autodocs'],
  args: {
    message: 'Loading...'
  }
};
export default meta;
type Story = StoryObj<BaseLoadingComponent>;

export const Default: Story = {};
export const CustomMessage: Story = { args: { message: 'Loading fleet availability...' } };
