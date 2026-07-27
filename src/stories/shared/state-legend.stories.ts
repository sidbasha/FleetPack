import type { Meta, StoryObj } from '@storybook/angular';
import { StateLegendComponent } from '../../app/shared/components/ui.components';

/** Domain-specific machine-state legend (colors sourced from the Nexus theme's `--color-state-*` tokens). */
const meta: Meta<StateLegendComponent> = {
  title: 'Shared/State Legend',
  component: StateLegendComponent,
  tags: ['autodocs'],
  args: {
    withGap: false,
    withDayShift: false
  }
};
export default meta;
type Story = StoryObj<StateLegendComponent>;

export const Default: Story = {};
export const WithGapAndDayShift: Story = { args: { withGap: true, withDayShift: true } };
