import type { Meta, StoryObj } from '@storybook/angular';
import { BaseBreadcrumbsComponent, BaseBreadcrumbItem } from '../../app/base';

const CRUMBS: BaseBreadcrumbItem[] = [
  { label: 'Fleet Availability', icon: '🏠' },
  { label: 'Advanced Analysis' },
  { label: 'Enhanced Breakdown' }
];

const meta: Meta<BaseBreadcrumbsComponent> = {
  title: 'Base/Navigation/Breadcrumbs',
  component: BaseBreadcrumbsComponent,
  tags: ['autodocs'],
  args: {
    items: CRUMBS,
    separator: '›'
  }
};
export default meta;
type Story = StoryObj<BaseBreadcrumbsComponent>;

export const Default: Story = {};
export const TwoLevels: Story = { args: { items: [{ label: 'Dashboard', icon: '🏠' }, { label: 'FAM' }] } };
export const CustomSeparator: Story = { args: { separator: '/' } };
