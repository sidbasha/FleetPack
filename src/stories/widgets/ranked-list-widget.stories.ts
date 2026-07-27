import type { Meta, StoryObj } from '@storybook/angular';
import { RankedListWidgetComponent } from '../../app/shared/dynamic/basic-widgets.components';
import { RankedListWidget } from '../../app/shared/dynamic/widget.model';

const WIDGET: RankedListWidget = {
  id: 'top10-unavailable',
  type: 'ranked-list',
  trendBadWhenUp: true,
  footnote: 'Period: 2026-07-20 - 2026-07-27',
  items: [
    { key: '1', rank: 1, title: 'KLA-1042', subtitle: 'Fab-A - CH-2', value: '312 hrs', trendPct: 4.1, barPct: 92, barColor: '#ef4444' },
    { key: '2', rank: 2, title: 'KLA-1017', subtitle: 'Fab-B - CH-1', value: '204 hrs', trendPct: -2.3, barPct: 68 },
    { key: '3', rank: 3, title: 'KLA-1099', subtitle: 'Fab-A - CH-4', value: '150 hrs', trendPct: null, barPct: 51 },
    { key: '4', rank: 4, title: 'KLA-1005', subtitle: 'Fab-C - CH-1', value: '98 hrs', trendPct: -8.6, barPct: 33 }
  ]
};

/** `fam-ranked-list-widget` - used for "Top 10 Unavailable Tools" style panels. `onItemClick` (set here) adds a chevron and hover affordance. */
const meta: Meta<RankedListWidgetComponent> = {
  title: 'Widgets/Ranked List',
  component: RankedListWidgetComponent,
  tags: ['autodocs'],
  args: { widget: WIDGET }
};
export default meta;
type Story = StoryObj<RankedListWidgetComponent>;

export const Default: Story = {};
export const Clickable: Story = {
  args: { widget: { ...WIDGET, onItemClick: () => {} } }
};
export const NoRankNumbers: Story = {
  args: {
    widget: {
      ...WIDGET,
      items: WIDGET.items.map(({ rank, ...rest }) => rest)
    }
  }
};
