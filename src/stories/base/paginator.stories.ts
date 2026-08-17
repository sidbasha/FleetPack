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
    maxButtons: 5,
    unknownTotal: false,
    currentCount: 10,
    hasNext: true
  },
  render: (args) => ({
    props: args,
    template: `<base-paginator [page]="page" [pageSize]="pageSize" [total]="total"
                                [pageCountOverride]="pageCountOverride" [pageSizeOptions]="pageSizeOptions"
                                [showPageSize]="showPageSize" [maxButtons]="maxButtons"
                                [unknownTotal]="unknownTotal" [currentCount]="currentCount" [hasNext]="hasNext" />`
  })
};
export default meta;
type Story = StoryObj<BasePaginatorComponent>;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 25 } };
export const NoPageSizeControl: Story = { args: { showPageSize: false } };
export const NoRecords: Story = { args: { total: 0, page: 1 } };
export const PageCountOnly: Story = { name: 'Page-count-only (server-side)', args: { pageCountOverride: 12, page: 4 } };

export const LargePageCount: Story = { args: { page: 5, pageSize: 25, total: 1072 } };

export const UnknownTotal: Story = { args: { unknownTotal: true, page: 4, currentCount: 10, hasNext: true } };

export const UnknownTotalLastPage: Story = { args: { unknownTotal: true, page: 5, currentCount: 4, hasNext: false } };
