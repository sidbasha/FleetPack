import { Component, Input, Type } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChartWidget, ComponentWidget, KpiGridWidget, RankedListWidget, TableWidget, WidgetConfig
} from './widget.model';
import { resolveWidget } from './widget-registry';
import { ChartWidgetComponent, KpiGridWidgetComponent, RankedListWidgetComponent } from './basic-widgets.components';
import { TableWidgetComponent } from './table-widget.component';

/**
 * Renders any WidgetConfig: panel chrome (title/badge/legend/actions)
 * plus the type-specific body. 'component' widgets are resolved either
 * from a direct class or by name via the widget registry.
 */
@Component({
  selector: 'fam-dynamic-widget',
  standalone: true,
  imports: [
    NgComponentOutlet, NgTemplateOutlet,
    KpiGridWidgetComponent, ChartWidgetComponent, RankedListWidgetComponent, TableWidgetComponent
  ],
  template: `
    @if (widget.frameless) {
      <ng-container [ngTemplateOutlet]="body" />
    } @else {
      <section class="panel h-full flex flex-col">
        @if (widget.title || widget.legend?.length || widget.actions?.length) {
          <div class="panel-header flex-wrap gap-2">
            <h2 class="panel-title">
              {{ widget.title }}
              @if (widget.badge) { <span class="badge-fam">{{ widget.badge }}</span> }
            </h2>
            <div class="flex items-center flex-wrap gap-2">
              @for (l of widget.legend ?? []; track l.label) {
                <span class="chip"><i class="chip-dot" [style.background]="l.color"></i>{{ l.label }}</span>
              }
              @for (a of widget.actions ?? []; track $index) {
                <button [class]="a.kind === 'primary' ? 'btn-primary' : 'btn-ghost'" (click)="a.run()">{{ a.label }}</button>
              }
            </div>
          </div>
        }
        @if (widget.subtitle) {
          <p class="px-4 pt-2.5 text-[11px] text-slate-400">{{ widget.subtitle }}</p>
        }
        <div class="flex-1 min-h-0">
          <ng-container [ngTemplateOutlet]="body" />
        </div>
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
