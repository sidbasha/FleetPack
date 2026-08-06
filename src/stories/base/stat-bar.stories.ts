import type { Meta, StoryObj } from '@storybook/angular';
import { BaseStatBarComponent } from '../../app/base';

/** A borderless, horizontal row of metrics for a page header — lighter than
 *  a grid of KPI tiles, used when the numbers are context for the page
 *  rather than its main subject. Reach for `<base-kpi-card>` instead when
 *  the numbers *are* the content (a dashboard). */
const meta: Meta<BaseStatBarComponent> = {
  title: 'Base/Data Display/Stat Bar',
  component: BaseStatBarComponent,
  tags: ['autodocs'],
  args: {
    stats: [
      { value: '99.7%', label: '13W rolling avg' },
      { value: '2,184', label: 'MTBR avg (hrs)' },
      { value: '1,385', label: 'Total downtime (hrs)' }
    ]
  }
};
export default meta;
type Story = StoryObj<BaseStatBarComponent>;

export const Default: Story = {};
