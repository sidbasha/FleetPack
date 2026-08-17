import type { Meta, StoryObj } from '@storybook/angular';
import { BaseEmptyStateComponent } from '../../app/base';

const meta: Meta<BaseEmptyStateComponent> = {
  title: 'Base/Feedback/Empty State',
  component: BaseEmptyStateComponent,
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['no-results', 'no-access', 'no-data', 'out-of-range', 'not-configured', 'custom'] },
    actionVariant: { control: 'select', options: ['primary', 'secondary'] }
  },
  args: {
    kind: 'no-results',
    icon: '',
    title: '',
    hint: '',
    actionLabel: '',
    actionVariant: 'secondary',
    secondaryActionLabel: ''
  }
};
export default meta;
type Story = StoryObj<BaseEmptyStateComponent>;

export const Default: Story = {};
export const NoMatchingRecords: Story = {
  args: { title: 'No matching records', hint: 'Try adjusting filters or search.' }
};

export const NoDataYet: Story = {
  args: {
    kind: 'no-data', title: 'No tools registered', hint: 'Register your first tool to start collecting state telemetry.',
    actionLabel: '+ Register tool', actionVariant: 'primary'
  }
};

export const NoResultsWithFilters: Story = {
  args: {
    kind: 'no-results', title: 'No tools match "surfscan xr"',
    hint: 'Check the spelling, or clear the two active filters to widen the search.',
    actionLabel: 'Clear filters', secondaryActionLabel: 'Clear search'
  }
};

export const OutOfRange: Story = {
  args: {
    kind: 'out-of-range', title: 'No data in this window',
    hint: 'SP7-04 reported no state changes between 06 and 17 July. Widen the window to see earlier activity.',
    actionLabel: 'Widen to 90 days'
  }
};

export const NoAccess: Story = { args: { kind: 'no-access', title: 'No access' } };

export const ThreeSituations: Story = {
  render: () => ({
    template: `
      <div class="grid md:grid-cols-3 gap-4">
        <div class="panel">
          <base-empty-state kind="no-data" title="No tools registered"
                            hint="Register your first tool to start collecting state telemetry."
                            actionLabel="+ Register tool" actionVariant="primary" />
        </div>
        <div class="panel">
          <base-empty-state kind="no-results" title='No tools match "surfscan xr"'
                            hint="Check the spelling, or clear the two active filters to widen the search."
                            actionLabel="Clear filters" secondaryActionLabel="Clear search" />
        </div>
        <div class="panel">
          <base-empty-state kind="out-of-range" title="No data in this window"
                            hint="SP7-04 reported no state changes between 06 and 17 July. Widen the window to see earlier activity."
                            actionLabel="Widen to 90 days" />
        </div>
      </div>`
  })
};
