import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseTableView, BaseTableViewsComponent } from '../../app/base';

const VIEWS: BaseTableView[] = [
  { id: 'all', label: 'All', isDefault: true },
  { id: 'down', label: 'Down tools', pinned: true },
  { id: 'mine', label: 'My fleet segment', pinned: true },
  { id: 'shared-qual', label: 'Qual due this week', pinned: true, shared: true, readOnly: true },
  { id: 'archive', label: 'Archived (2025)' },
  { id: 'fab21', label: 'Fab 21 only' },
  { id: 'low-uptime', label: 'Uptime < 90%' }
];

/**
 * "New in v2.0" — saved/filter view tab rail. Fully controlled: the host owns the view list and
 * decides what "modified" means by diffing its own live table state against the active view's
 * saved snapshot. See the class doc in base-table-views.component.ts for the full contract.
 */
const meta: Meta<BaseTableViewsComponent> = {
  title: 'Base/Tables & Data/Table Views',
  component: BaseTableViewsComponent,
  tags: ['autodocs'],
  args: {
    views: VIEWS,
    activeViewId: 'all',
    modified: false,
    maxPinned: 4,
    maxViews: 20
  },
  render: (args) => ({
    props: args,
    template: `<base-table-views [views]="views" [activeViewId]="activeViewId" [modified]="modified"
                                  [maxPinned]="maxPinned" [maxViews]="maxViews" />`
  })
};
export default meta;
type Story = StoryObj<BaseTableViewsComponent>;

/** "All" is always first and never editable. Extra saved views beyond the pinned set collapse into "More views". */
export const Default: Story = {};

export const ActiveNonDefaultView: Story = { args: { activeViewId: 'down' } };

/** Live filters have drifted from the active view's saved state — a "Modified" badge appears on
 *  its tab, and Update/Reset/Save-as-new controls light up on the right. */
export const Modified: Story = { args: { activeViewId: 'mine', modified: true } };

/** A view shared by someone else — read-only for everyone but its owner: no Update/Reset, only
 *  "Save as new" (a personal copy) stays available. */
export const SharedReadOnlyView: Story = { args: { activeViewId: 'shared-qual', modified: true } };

/** At the 20-saved-views cap, "Save as new" is replaced by a plain limit note instead of a dead button. */
export const AtSavedViewsLimit: Story = {
  args: {
    views: [{ id: 'all', label: 'All', isDefault: true }, ...Array.from({ length: 19 }, (_, i) => ({ id: `v${i}`, label: `View ${i + 1}` }))],
    activeViewId: 'all',
    modified: true
  }
};

/** Full interactive demo — clicking "Save as new view" opens the inline name field; Update/Reset/
 *  Copy link/switching tabs all just log to the story's own state so you can see every event fire. */
@Component({
  selector: 'story-table-views-demo',
  standalone: true,
  imports: [BaseTableViewsComponent],
  template: `
    <div class="space-y-3">
      <base-table-views [views]="views()" [activeViewId]="activeViewId()" [modified]="modified()"
                         (activeViewIdChange)="onSwitch($event)" (save)="onSave($event)"
                         (update)="onUpdate()" (reset)="onReset()" (copyLink)="log.set('Copied link to ' + activeViewId())" />
      <div class="flex items-center gap-2 px-1">
        <button type="button" class="text-[11px] font-semibold text-action hover:text-action-hover" (click)="simulateEdit()">
          Simulate changing a filter (marks the active view "Modified")
        </button>
      </div>
      <p class="text-[11px] text-neutral-400 px-1">{{ log() }}</p>
    </div>
  `
})
class StoryTableViewsDemoComponent {
  readonly views = signal<BaseTableView[]>(VIEWS);
  readonly activeViewId = signal('all');
  readonly modified = signal(false);
  readonly log = signal('Try "Simulate changing a filter" below, then Update/Reset/Save it.');

  simulateEdit(): void {
    this.modified.set(true);
    this.log.set('Live table state now differs from the saved view');
  }

  onSwitch(id: string): void {
    this.activeViewId.set(id);
    this.modified.set(false);
    this.log.set(`Switched to "${this.views().find(v => v.id === id)?.label}"`);
  }

  onSave(label: string): void {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    this.views.update(v => [...v, { id, label }]);
    this.activeViewId.set(id);
    this.modified.set(false);
    this.log.set(`Saved new view "${label}"`);
  }

  onUpdate(): void {
    this.modified.set(false);
    this.log.set(`Updated "${this.views().find(v => v.id === this.activeViewId())?.label}" with the current state`);
  }

  onReset(): void {
    this.modified.set(false);
    this.log.set('Reverted live filters back to the saved view');
  }
}

export const Interactive: StoryObj<StoryTableViewsDemoComponent> = {
  decorators: [moduleMetadata({ imports: [StoryTableViewsDemoComponent] })],
  render: () => ({ template: `<story-table-views-demo />` })
};
