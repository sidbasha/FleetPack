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
    pageEntryThreshold: 10,
    disabled: false,
    unknownTotal: false,
    currentCount: 10,
    hasNext: true
  },
  render: (args) => ({
    props: args,
    template: `<base-paginator [page]="page" [pageSize]="pageSize" [total]="total"
                                [pageCountOverride]="pageCountOverride" [pageSizeOptions]="pageSizeOptions"
                                [showPageSize]="showPageSize" [maxButtons]="maxButtons"
                                [pageEntryThreshold]="pageEntryThreshold" [disabled]="disabled"
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

/** Type a page number above the bound and press Enter — it reports "Only N pages available" and holds the current page instead of clamping. */
export const GoToPageDirectEntry: Story = {
  name: 'Go to page · direct entry',
  args: { page: 4, pageSize: 25, total: 214, pageEntryThreshold: 8 }
};

/** Below the threshold, the direct-entry field doesn't show at all — repeated clicking is fine for a handful of pages. */
export const BelowEntryThreshold: Story = {
  args: { page: 2, pageSize: 25, total: 90, pageEntryThreshold: 8 }
};

/** A single known page hides the entire stepper — numbers, first/prev/next/last — not just the entry field. */
export const SinglePageHidesEverything: Story = {
  name: 'Single page · entry, numbers and steps all hide',
  args: { page: 1, pageSize: 25, total: 12, currentCount: 12 }
};

/** While something else blocks paging (e.g. unsaved edits) every control disables, but the summary text stays legible. */
export const Disabled: Story = { args: { disabled: true } };
