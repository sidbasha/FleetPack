import type { Meta, StoryObj } from '@storybook/angular';
import { BaseGlobalSearchComponent } from '../../app/base';

/** A single global search reachable from the header, distinct from the
 *  per-page filter search. Opens a command-style overlay, not an inline
 *  expand. Results group by type, shown as a tag on the right. */
const meta: Meta<BaseGlobalSearchComponent> = {
  title: 'Base/Navigation/Global Search',
  component: BaseGlobalSearchComponent,
  tags: ['autodocs'],
  args: {
    results: [
      { id: '1', label: 'RAPID-7xx', type: 'Tool' },
      { id: '2', label: 'Fleet Availability', type: 'Module' }
    ]
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="bg-surface-inverse p-8 rounded-r-md">
        <base-global-search [results]="results" />
      </div>`
  })
};
export default meta;
type Story = StoryObj<BaseGlobalSearchComponent>;

export const Default: Story = {};
