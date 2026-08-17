import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseButtonComponent, BaseChipComponent } from '../../app/base';

const meta: Meta<BaseChipComponent> = {
  title: 'Base/Data Display/Chip',
  component: BaseChipComponent,
  tags: ['autodocs'],
  args: { label: 'Status: Active', removable: true }
};
export default meta;
type Story = StoryObj<BaseChipComponent>;

export const Dismissible: Story = {};
export const NonRemovable: Story = { args: { removable: false } };
export const SelectedFilterChip: Story = { args: { removable: false, selectable: true, selected: true, label: 'Unscheduled DT' } };
export const DisabledFilterChip: Story = { args: { removable: false, selectable: true, disabled: true, label: 'No data' } };

export const DismissibleRow: Story = {
  name: 'Dismissible chips — applied filters',
  decorators: [moduleMetadata({ imports: [BaseButtonComponent] })],
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <base-chip label="Site: Fab 12" />
        <base-chip label="Segment: Inspection" />
        <base-chip label="Up-time < 90%" />
        <base-button variant="text">Clear all</base-button>
      </div>`
  })
};

/** Multi-select — each chip toggles independently; any number can be active at once. */
@Component({
  selector: 'story-filter-chips',
  standalone: true,
  imports: [BaseChipComponent],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      @for (o of options; track o) {
        <base-chip [label]="o" [removable]="false" [selectable]="true" [selected]="active().has(o)" (clicked)="toggle(o)" />
      }
      <base-chip label="Equipment safety" [removable]="false" [selectable]="true" [selected]="active().has('Equipment safety')"
                 [count]="12" (clicked)="toggle('Equipment safety')" />
      <base-chip label="No data" [removable]="false" [selectable]="true" [disabled]="true" />
    </div>
  `
})
class StoryFilterChipsComponent {
  readonly options = ['Unscheduled DT', 'Scheduled DT', 'Engineering', 'Standby'];
  readonly active = signal(new Set(['Unscheduled DT']));
  toggle(o: string): void {
    this.active.update(s => {
      const next = new Set(s);
      next.has(o) ? next.delete(o) : next.add(o);
      return next;
    });
  }
}

export const FilterChips: StoryObj<StoryFilterChipsComponent> = {
  name: 'Filter chips — multi-select, each independent',
  decorators: [moduleMetadata({ imports: [StoryFilterChipsComponent] })],
  render: () => ({ template: `<story-filter-chips />` })
};

/** One of N — picking a chip clears the rest, like a radio group. */
@Component({
  selector: 'story-choice-chips',
  standalone: true,
  imports: [BaseChipComponent],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      @for (o of options; track o) {
        <base-chip [label]="o" [removable]="false" [selectable]="true" [selected]="value() === o" (clicked)="value.set(o)" />
      }
    </div>
  `
})
class StoryChoiceChipsComponent {
  readonly options = ['24 hours', '7 days', '30 days', 'Quarter'];
  readonly value = signal('7 days');
}

export const ChoiceChips: StoryObj<StoryChoiceChipsComponent> = {
  name: 'Choice chips — one of N, mutually exclusive',
  decorators: [moduleMetadata({ imports: [StoryChoiceChipsComponent] })],
  render: () => ({ template: `<story-choice-chips />` })
};
