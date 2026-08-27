import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTrendChartComponent } from '../../app/base';

const WEEKS = ['25-20', '25-26', '25-32', '25-38', '25-44', '26-02', '26-08'];
const ACTUAL = [98, 91, 78, 62, 58, 74, 96];
const ROLLING4W = [96, 93, 84, 71, 63, 68, 88];
const ROLLING13W = [90, 89, 85, 79, 74, 73, 78];

const meta: Meta<BaseTrendChartComponent> = {
  title: 'Base/Charts & Visualization/Trend Chart',
  component: BaseTrendChartComponent,
  tags: ['autodocs'],
  argTypes: {
    zoomable: { control: 'boolean' }
  },
  args: {
    data: WEEKS.map((x, i) => ({ x, y: ACTUAL[i] })),
    // rollingSeries takes any number of rolling-average overlays — nothing is hardcoded to
    // 4/13 weeks, that's just what these two happen to represent. Each point carries its
    // own week label rather than assuming positional alignment with `data` (see RollingWarmUp).
    rollingSeries: [
      { key: '4w', label: '4W Rolling', data: WEEKS.map((x, i) => ({ x, y: ROLLING4W[i] })) },
      { key: '13w', label: '13W Rolling', data: WEEKS.map((x, i) => ({ x, y: ROLLING13W[i] })) }
    ],
    target: 95,
    targetLabel: '95% Target',
    seriesLabel: 'Work Week (actual)'
  },
  parameters: {
    docs: {
      description: {
        component: 'Drag-select across the chart to zoom into a range of points (a "Reset Zoom" link appears once zoomed); the y-axis and rolling-average overlays rescale to whatever is visible. `rollingSeries` accepts any number of overlays of any window length, each matched to `data` by week label — see RollingWarmUp for one that starts partway through, and AnyWindowLength for a mix of window sizes beyond just 4/13 weeks.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseTrendChartComponent>;

export const Default: Story = {};
export const SingleSeries: Story = { args: { rollingSeries: [], target: undefined } };

const LARGE_WEEKS = Array.from({ length: 156 }, (_, i) => `${24 + Math.floor(i / 52)}-${String((i % 52) + 1).padStart(2, '0')}`);
const LARGE_ACTUAL = LARGE_WEEKS.map((_, i) => 75 + 20 * Math.sin(i / 6) + (Math.random() * 6 - 3));

export const LargeDataset: Story = {
  name: 'Large dataset · 3 years weekly (drag to zoom)',
  args: {
    data: LARGE_WEEKS.map((x, i) => ({ x, y: Math.round(LARGE_ACTUAL[i]) })),
    rollingSeries: [],
    target: 95
  },
  parameters: {
    docs: { description: { story: '156 weekly points — the point labels below the axis thin out automatically, and the useful move is a drag-select to zoom into any sub-range.' } }
  }
};

const WARMUP_WEEKS = Array.from({ length: 30 }, (_, i) => `26-${String(i + 1).padStart(2, '0')}`);
const WARMUP_ACTUAL = WARMUP_WEEKS.map((_, i) => 75 + 18 * Math.sin(i / 5) + (Math.random() * 5 - 2.5));

export const RollingWarmUp: Story = {
  name: 'Rolling averages warm up late (label-aligned, not index-aligned)',
  args: {
    data: WARMUP_WEEKS.map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i]) })),
    // A 4-week rolling average only exists once 4 weeks of history do; 13-week needs 13.
    // These series are intentionally shorter than `data` and start on later week labels —
    // the chart aligns each point to its own label, so the lines correctly begin late
    // rather than sliding to the wrong weeks or stretching to fill the full width.
    rollingSeries: [
      { key: '4w', label: '4W Rolling', data: WARMUP_WEEKS.slice(3).map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i + 3] * 0.97) })) },
      { key: '13w', label: '13W Rolling', data: WARMUP_WEEKS.slice(12).map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i + 12] * 0.94) })) }
    ],
    target: 95
  },
  parameters: {
    docs: {
      description: {
        story: 'The 4W series starts at week 4 and the 13W series at week 13 of a 30-week run — both correctly begin partway across the chart instead of being squeezed to the left edge or stretched across the full width. Drag-zoom into any range and the rolling lines still line up with the right weeks.'
      }
    }
  }
};

export const AnyWindowLength: Story = {
  name: 'Any window length, not just 4W/13W',
  args: {
    data: WARMUP_WEEKS.map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i]) })),
    // Nothing about rollingSeries assumes 4 or 13 weeks specifically — three arbitrary
    // window lengths render side by side here, each warming up at its own week.
    rollingSeries: [
      { key: '2w', label: '2W Rolling', data: WARMUP_WEEKS.slice(1).map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i + 1] * 0.99) })) },
      { key: '8w', label: '8W Rolling', data: WARMUP_WEEKS.slice(7).map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i + 7] * 0.96) })) },
      { key: '20w', label: '20W Rolling', data: WARMUP_WEEKS.slice(19).map((x, i) => ({ x, y: Math.round(WARMUP_ACTUAL[i + 19] * 0.93) })) }
    ],
    target: undefined
  },
  parameters: {
    docs: { description: { story: '2W, 8W, and 20W rolling overlays together — each cycles to its own color/dash pattern, and any combination can be selected at once from the legend (click a second entry to add it, not replace the first).' } }
  }
};

export const ZoomDisabled: Story = {
  args: { zoomable: false }
};
