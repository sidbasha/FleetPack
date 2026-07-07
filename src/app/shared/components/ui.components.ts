import { Component, Input, booleanAttribute } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';

// ── KPI stat card ──
@Component({
  selector: 'fam-kpi',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="panel px-4 py-3.5 flex flex-col gap-1">
      <span class="kpi-label">{{ label }}</span>
      <span class="kpi-value" [ngClass]="accent ? 'text-indigo-600' : ''">{{ value }}<span class="text-sm font-semibold text-slate-400 ml-0.5">{{ unit }}</span></span>
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

// ── Loading shimmer ──
@Component({
  selector: 'fam-loading',
  standalone: true,
  template: `
    <div class="panel p-6 flex items-center gap-3 text-sm text-slate-400" role="status">
      <span class="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
      Loading {{ what }}…
    </div>
  `
})
export class LoadingComponent {
  @Input() what = 'data';
}

// ── Tool-state legend ──
@Component({
  selector: 'fam-state-legend',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span class="chip"><i class="chip-dot bg-state-production"></i>Production</span>
      <span class="chip"><i class="chip-dot bg-state-engineering"></i>Engineering</span>
      <span class="chip"><i class="chip-dot bg-state-standby"></i>Standby</span>
      <span class="chip"><i class="chip-dot bg-state-scheduled"></i>Scheduled DT</span>
      <span class="chip"><i class="chip-dot bg-state-unscheduled"></i>Unscheduled DT</span>
      @if (withGap) { <span class="chip"><i class="chip-dot bg-state-gap"></i>Gap</span> }
    </div>
  `
})
export class StateLegendComponent {
  @Input({ transform: booleanAttribute }) withGap = false;
}

// ── % trend pill (▲ +12.4% / ▼ -8.1%) ──
@Component({
  selector: 'fam-trend',
  standalone: true,
  imports: [DecimalPipe, NgClass],
  template: `
    @if (value === null) {
      <span class="text-[11px] text-slate-300 font-medium">—</span>
    } @else {
      <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5"
            [ngClass]="badWhenUp
              ? (value > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')
              : (value > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')">
        {{ value > 0 ? '▲' : '▼' }} {{ value > 0 ? '+' : '' }}{{ value | number: '1.1-1' }}%
      </span>
    }
  `
})
export class TrendPillComponent {
  @Input({ required: true }) value: number | null = null;
  /** Alarm counts going up is bad; uptime going up is good. */
  @Input({ transform: booleanAttribute }) badWhenUp = false;
}
