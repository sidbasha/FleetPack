import type { Meta, StoryObj } from '@storybook/angular';
import { BaseEmptyStateComponent } from '../../app/base';

const meta: Meta<BaseEmptyStateComponent> = {
  title: 'Base/Feedback/Empty State',
  component: BaseEmptyStateComponent,
  tags: ['autodocs'],
  args: {
    icon: '📭',
    title: 'No data',
    hint: '',
    actionLabel: ''
  }
};
export default meta;
type Story = StoryObj<BaseEmptyStateComponent>;

export const Default: Story = {};
/** This is the fallback rendered inside `<base-table>` when the row list is empty - same component, same props. */
export const NoMatchingRecords: Story = {
  args: { title: 'No matching records', hint: 'Try adjusting filters or search.' }
};
export const WithAction: Story = {
  args: { icon: '⚙️', title: 'Not configured', hint: 'This fleet has no FCM settings yet.', actionLabel: 'Add fleet setting' }
};
