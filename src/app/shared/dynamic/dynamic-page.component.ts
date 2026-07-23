import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { BaseSearchInputComponent, BaseTabsComponent, BaseToggleComponent } from '../../base';
import {
  ChartWidget, ComponentWidget, KpiGridWidget, RankedListWidget, TableWidget, WidgetConfig
} from './widget.model';
import { resolveWidget } from './widget-registry';
import { ChartWidgetComponent, KpiGridWidgetComponent, RankedListWidgetComponent } from './basic-widgets.components';
import { TableWidgetComponent } from './table-widget.component';

/**
 * Renders any WidgetConfig: panel chrome (title/badge/date range/tabs/
 * toggle/actions) plus the type-specific body. 'component' widgets are
 * resolved either from a direct class or by name via the widget registry.
 */
@Component({
  selector: 'fam-dynamic-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgComponentOutlet, NgTemplateOutlet, BaseTabsComponent, BaseToggleComponent, BaseSearchInputComponent,
    KpiGridWidgetComponent, ChartWidgetComponent, RankedListWidgetComponent, TableWidgetComponent
  ],
  template: `
    @if (widget.frameless) {
      <ng-container [ngTemplateOutlet]="body" />
    } @else {
      <section class="panel h-full flex flex-col">
        @if (widget.title || widget.actions?.length || widget.dateRange || widget.tabs || widget.toggle || widget.search) {
          <div class="panel-header flex-wrap gap-2">
            <h2 class="panel-title inline-flex items-center gap-2">
              @if (widget.collapsible) {
                <button type="button" class="text-slate-400 hover:text-indigo-600 text-[10px] leading-none"
                        [attr.aria-label]="widget.collapsed ? 'Expand' : 'Collapse'"
                        (click)="widget.onToggleCollapse?.()">{{ widget.collapsed ? '▸' : '▾' }}</button>
              }
              @if (widget.badge) { <span class="badge-fam ml-0!">{{ widget.badge }}</span> }
              <span>
                @if (widget.titlePrefix) { <span class="font-normal text-slate-400 mr-1">{{ widget.titlePrefix }}</span> }
                {{ widget.title }}
              </span>
            </h2>
            <div class="flex items-center flex-wrap gap-3">
              @if (widget.dateRange; as dr) {
                <span class="flex flex-col items-end leading-tight text-[11px] text-slate-400 font-medium">
                  <span>{{ dr.from }}</span>
                  <span>{{ dr.to }}</span>
                </span>
              }
              @if (widget.tabs; as t) {
                <base-tabs variant="pills" [tabs]="t.items" [activeId]="t.activeId" (activeIdChange)="t.onChange($event)" />
              }
              @if (widget.toggle; as tg) {
                <base-toggle [checked]="tg.checked" [label]="tg.label" (checkedChange)="tg.onChange($event)" />
              }
              @if (widget.search; as s) {
                <base-search-input [placeholder]="s.placeholder ?? 'Search…'" (search)="s.onChange($event)" />
              }
              @if (widget.actionsLabel) {
                <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ widget.actionsLabel }}</span>
              }
              @for (a of widget.actions ?? []; track $index) {
                @if (a.active === undefined) {
                  <button [class]="a.kind === 'primary' ? 'btn-primary' : 'btn-ghost'" (click)="a.run()">{{ a.label }}</button>
                } @else {
                  <button type="button" class="chip-toggle" [class]="a.active ? 'chip-toggle-active' : 'chip-toggle-inactive'"
                          (click)="a.run()">
                    <span class="text-[9px]">{{ a.active ? '●' : '○' }}</span>{{ a.label }}
                  </button>
                }
              }
              @if (widget.note) {
                <span class="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">{{ widget.note }}</span>
              }
            </div>
          </div>
        }
        @if (!widget.collapsed) {
          @if (widget.subtitle) {
            <p class="px-4 pt-2.5 text-[11px] text-slate-400">{{ widget.subtitle }}</p>
          }
          <div class="flex-1 min-h-0">
            <ng-container [ngTemplateOutlet]="body" />
          </div>
        }
      </section>
    }

    <ng-template #body>
      @switch (widget.type) {
        @case ('kpi-grid') { <fam-kpi-grid-widget [widget]="asKpis" /> }
        @case ('chart') { <fam-chart-widget [widget]="asChart" /> }
        @case ('table') { <fam-table-widget [widget]="asTable" /> }
        @case ('ranked-list') { <fam-ranked-list-widget [widget]="asList" /> }
        @case ('component') {
          <ng-container *ngComponentOutlet="resolvedComponent; inputs: asComponent.inputs ?? {}" />
        }
      }
    </ng-template>
  `
})
export class DynamicWidgetComponent {
  @Input({ required: true }) widget!: WidgetConfig;

  get asKpis(): KpiGridWidget { return this.widget as KpiGridWidget; }
  get asChart(): ChartWidget { return this.widget as ChartWidget; }
  get asTable(): TableWidget { return this.widget as TableWidget; }
  get asList(): RankedListWidget { return this.widget as RankedListWidget; }
  get asComponent(): ComponentWidget { return this.widget as ComponentWidget; }

  get resolvedComponent(): Type<unknown> | null {
    const w = this.asComponent;
    return w.component ?? (w.name ? resolveWidget(w.name) : null);
  }
}

/**
 * Responsive 6-column grid of dynamic widgets.
 * Screens pass a computed WidgetConfig[] — templates stay one line.
 */
@Component({
  selector: 'fam-dynamic-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicWidgetComponent],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-6 gap-5">
      @for (w of widgets; track w.id) {
        <div [class]="spanClass(w)">
          <fam-dynamic-widget [widget]="w" />
        </div>
      }
    </div>
  `
})
export class DynamicPageComponent {
  @Input({ required: true }) widgets: WidgetConfig[] = [];

  private spans: Record<number, string> = {
    1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3',
    4: 'xl:col-span-4', 5: 'xl:col-span-5', 6: 'xl:col-span-6'
  };

  spanClass(w: WidgetConfig): string {
    return this.spans[w.colSpan ?? 6];
  }
}
