import { Component, ViewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseContextMenuComponent, BaseMenuItem } from '../../app/base';

/** Right-click/overflow-triggered menu; destructive items get a divider + red text, never listed first. */
@Component({
  selector: 'story-context-menu-demo',
  standalone: true,
  imports: [BaseContextMenuComponent],
  template: `
    <div class="border-2 border-dashed border-neutral-200 rounded-r-md px-sp-6 py-sp-10 text-center text-xs text-neutral-400"
         (contextmenu)="menu.openAt($event.clientX, $event.clientY); $event.preventDefault()">
      Right-click anywhere in this box
    </div>
    <base-context-menu #menu [items]="items" />
  `
})
class StoryContextMenuDemoComponent {
  @ViewChild('menu') menu!: BaseContextMenuComponent;
  readonly items: BaseMenuItem[] = [
    { id: 'edit', label: 'Edit tool', icon: '✎' },
    { id: 'duplicate', label: 'Duplicate', icon: '⧉' },
    { id: 'delete', label: 'Delete tool', icon: '🗑', danger: true, dividerBefore: true }
  ];
}

const meta: Meta<StoryContextMenuDemoComponent> = {
  title: 'Base/Navigation/Context Menu',
  component: StoryContextMenuDemoComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [StoryContextMenuDemoComponent] })]
};
export default meta;
type Story = StoryObj<StoryContextMenuDemoComponent>;

export const Default: Story = {};
