import type { Meta, StoryObj } from '@storybook/angular';
import { StateLegendComponent } from '../../app/shared/components/ui.components';

const meta: Meta<StateLegendComponent> = {
  title: 'Shared/State Legend',
  component: StateLegendComponent,
  tags: ['autodocs'],
  args: {
    withGap: false,
    withDayShift: false
  },
  render: (args) => ({
    props: args,
    template: `<fam-state-legend [withGap]="withGap" [withDayShift]="withDayShift" />`
  })
};
export default meta;
type Story = StoryObj<StateLegendComponent>;

export const Default: Story = {};
export const WithGapAndDayShift: Story = { args: { withGap: true, withDayShift: true } };
