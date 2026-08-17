import type { Meta, StoryObj } from '@storybook/angular';
import { BaseSkeletonComponent } from '../../app/base';

const meta: Meta<BaseSkeletonComponent> = {
  title: 'Base/Feedback/Skeleton',
  component: BaseSkeletonComponent,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['rect', 'circle'] }
  },
  args: {
    width: '100%',
    height: '14px',
    shape: 'rect'
  }
};
export default meta;
type Story = StoryObj<BaseSkeletonComponent>;

export const Rect: Story = {};
export const Circle: Story = { args: { width: '40px', height: '40px', shape: 'circle' } };

export const CardPlaceholder: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3 max-w-sm">
        <base-skeleton width="40px" height="40px" shape="circle" />
        <div class="flex-1 flex flex-col gap-2">
          <base-skeleton width="60%" />
          <base-skeleton width="90%" />
        </div>
      </div>`
  })
};
