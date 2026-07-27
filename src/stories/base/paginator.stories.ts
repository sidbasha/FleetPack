import type { Meta, StoryObj } from '@storybook/angular';
import { BasePaginatorComponent } from '../../app/base';

const meta: Meta<BasePaginatorComponent> = {
  title: 'Base/Tables & Data/Paginator',
  component: BasePaginatorComponent,
  tags: ['autodocs'],
  args: {
    page: 3,
    pageSize: 10,
    total: 247,
    pageCountOverride: 0,
    pageSizeOptions: [10, 25, 50, 100],
    showPageSize: true,
    maxButtons: 5
  }
};
export default meta;
type Story = StoryObj<BasePaginatorComponent>;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 25 } };
export const NoPageSizeControl: Story = { args: { showPageSize: false } };
export const NoRecords: Story = { args: { total: 0, page: 1 } };
/** Server-side mode often only knows the page count, not the total record count. */
export const PageCountOnly: Story = { name: 'Page-count-only (server-side)', args: { pageCountOverride: 12, page: 4 } };
