import type { Meta, StoryObj } from '@storybook/angular';
import { BaseHeatmapRow, BaseMachineState, BaseStateHeatmapComponent } from '../../app/base';

const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`);
const STATES: BaseMachineState[] = ['production', 'production', 'production', 'engineering', 'standby', 'production', 'unscheduled-dt', 'scheduled-dt', 'production', 'production', 'production', 'gap'];
const DAYS = ['04-27', '04-28', '04-29', '04-30', '05-01', '05-02', '05-03'];

const rows: BaseHeatmapRow[] = DAYS.map(d => ({
  label: d,
  cells: HOURS.map((h, i) => ({ col: h, state: STATES[(i + d.charCodeAt(3)) % STATES.length] }))
}));

const meta: Meta<BaseStateHeatmapComponent> = {
  title: 'Base/Charts & Visualization/State Heatmap',
  component: BaseStateHeatmapComponent,
  tags: ['autodocs'],
  argTypes: {
    filterable: { control: 'boolean' }
  },
  args: { rows, columns: HOURS },
  parameters: {
    docs: {
      description: {
        component: 'Click legend states to select which show — any number at once (click again to deselect). Every cell outside the selected states dims to 15% opacity while the matching cells (and hover highlight) stay fully visible. A "Reset Filter" link appears once anything is selected.'
      }
    }
  }
};
export default meta;
type Story = StoryObj<BaseStateHeatmapComponent>;

export const Default: Story = {};
export const NonInteractive: Story = {
  name: 'Filter disabled',
  args: { filterable: false }
};
