import { ChangeDetectionStrategy, Component, Input, booleanAttribute } from '@angular/core';
import { SHARED_UI_TEXT } from '../../core/constants/app.constants';
import {
  BaseKpiCardComponent,
  BaseLoadingComponent,
  BaseTrendComponent
} from '../../base';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGACY SHARED COMPONENTS → thin wrappers over the BASE MODULE
 *
 * These selectors (fam-kpi, fam-loading, fam-trend) are kept so existing
 * feature templates continue to compile, but ALL rendering is delegated to
 * the base library. New code should import from src/app/base directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @deprecated Use <base-kpi-card> from the base module. */
@Component({
  selector: 'fam-kpi',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseKpiCardComponent],
  template: `<base-kpi-card [label]="label" [value]="value" [unit]="unit" [sub]="sub" [accent]="accent" />`
})
export class KpiComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() unit = '';
  @Input() sub = '';
  @Input({ transform: booleanAttribute }) accent = false;
}

/** @deprecated Use <base-loading> from the base module. */
@Component({
  selector: 'fam-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseLoadingComponent],
  template: `<base-loading [message]="text.loadingPrefix + ' ' + what" />`
})
export class LoadingComponent {
  readonly text = SHARED_UI_TEXT;
  @Input() what: string = SHARED_UI_TEXT.loadingDefaultSubject;
}

/** Domain-specific machine-state legend (colors from the FAM theme). */
@Component({
  selector: 'fam-state-legend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span class="chip"><i class="chip-dot bg-state-production"></i>{{ text.stateLegend.production }}</span>
      <span class="chip"><i class="chip-dot bg-state-engineering"></i>{{ text.stateLegend.engineering }}</span>
      <span class="chip"><i class="chip-dot bg-state-standby"></i>{{ text.stateLegend.standby }}</span>
      <span class="chip"><i class="chip-dot bg-state-scheduled"></i>{{ text.stateLegend.scheduledDowntime }}</span>
      <span class="chip"><i class="chip-dot bg-state-unscheduled"></i>{{ text.stateLegend.unscheduledDowntime }}</span>
      @if (withGap) { <span class="chip"><i class="chip-dot bg-state-gap"></i>{{ text.stateLegend.gap }}</span> }
      @if (withDayShift) { <span class="chip"><i class="chip-dot bg-slate-100 border border-slate-200"></i>{{ text.stateLegend.dayShift }}</span> }
    </div>
  `
})
export class StateLegendComponent {
  readonly text = SHARED_UI_TEXT;
  @Input({ transform: booleanAttribute }) withGap = false;
  @Input({ transform: booleanAttribute }) withDayShift = false;
}

/** @deprecated Use <base-trend> from the base module. */
@Component({
  selector: 'fam-trend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTrendComponent],
  template: `<base-trend [value]="value" [badWhenUp]="badWhenUp" />`
})
export class TrendPillComponent {
  @Input({ required: true }) value: number | null = null;
  @Input({ transform: booleanAttribute }) badWhenUp = false;
}
