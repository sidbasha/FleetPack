import { DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, booleanAttribute } from '@angular/core';
import { SHARED_UI_TEXT } from '../../core/constants/app.constants';

@Component({
  selector: 'fam-kpi',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="panel px-5 py-4 flex flex-col justify-center gap-1">
      <span class="kpi-label">{{ label }}</span>
      <span class="kpi-value" [ngClass]="accent ? 'text-indigo-600' : ''">
        {{ value }}<span class="text-sm font-semibold text-slate-400 ml-0.5">{{ unit }}</span>
      </span>
      @if (sub) { <span class="text-[11px] text-slate-400">{{ sub }}</span> }
    </div>
  `
})
export class KpiComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() unit = '';
  @Input() sub = '';
  @Input({ transform: booleanAttribute }) accent = false;
}

@Component({
  selector: 'fam-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel p-6 flex items-center gap-3 text-sm text-slate-400" role="status">
      <span class="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
      {{ text.loadingPrefix }} {{ what }}
    </div>
  `
})
export class LoadingComponent {
  readonly text = SHARED_UI_TEXT;
  @Input() what: string = SHARED_UI_TEXT.loadingDefaultSubject;
}

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
    </div>
  `
})
export class StateLegendComponent {
  readonly text = SHARED_UI_TEXT;
  @Input({ transform: booleanAttribute }) withGap = false;
}

@Component({
  selector: 'fam-trend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
  template: `
    @if (value === null) {
      <span class="text-[11px] text-slate-300 font-medium">-</span>
    } @else {
      <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5"
            [ngClass]="badWhenUp
              ? (value > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')
              : (value > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')">
        {{ value > 0 ? text.trendUpIcon : text.trendDownIcon }} {{ value > 0 ? '+' : '' }}{{ value | number: '1.1-1' }}%
      </span>
    }
  `
})
export class TrendPillComponent {
  readonly text = SHARED_UI_TEXT;
  @Input({ required: true }) value: number | null = null;
  @Input({ transform: booleanAttribute }) badWhenUp = false;
}
