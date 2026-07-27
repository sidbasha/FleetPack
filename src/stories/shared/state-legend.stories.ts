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
  },
  // `text` (SHARED_UI_TEXT) is a plain public field, not a real @Input - see
  // base/checkbox.stories.ts for why an explicit render avoids Storybook stomping it.
  render: (args) => ({
    props: args,
    template: `<fam-state-legend [withGap]="withGap" [withDayShift]="withDayShift" />`
  })
};
export default meta;
type Story = StoryObj<StateLegendComponent>;

export const Default: Story = {};
export const WithGapAndDayShift: Story = { args: { withGap: true, withDayShift: true } };
