import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { AlarmStore } from '../../core/state/alarm.store';
import { AlarmCategory } from '../../core/models/models';

const CAT_DOT: Record<AlarmCategory, string> = {
  'Equipment Safety': 'bg-alarm-safety',
  'Attention Flags': 'bg-alarm-attention',
  'Data Integrity': 'bg-alarm-integrity',
  'Irrecoverable': 'bg-alarm-irrecoverable'
};

/**
 * Inspector side panel for the selected alarm.
 * Registered in the widget registry as 'alarm-info-panel' and rendered
 * dynamically via a ComponentWidget — reads AlarmStore directly.
 */
@Component({
  selector: 'fam-alarm-info-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
  template: `
    <aside class="panel sticky top-[72px]">
      <div class="panel-header">
        <h2 class="panel-title">Alarm Info</h2>
        @if (store.inspectedAlarm()) {
          <button class="text-slate-300 hover:text-slate-500" (click)="store.inspectedAlarmId.set(null)">✕</button>
        }
      </div>
      @if (store.inspectedAlarm(); as a) {
        <div class="p-4 space-y-4">
          <div>
            <p class="text-base font-bold font-mono text-indigo-600">{{ a.alarmId }}</p>
            <p class="text-sm text-slate-700 font-medium">{{ a.description }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <i class="chip-dot rounded-full" [ngClass]="dot(a.category)"></i>{{ a.category }}
              </span>
              <span class="text-[10px] font-bold rounded-full px-2 py-0.5"
                    [ngClass]="a.severity === 'Fatal' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'">{{ a.severity }}</span>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
            <dt class="text-slate-400">Total count</dt><dd class="font-mono font-bold text-right">{{ a.count }}</dd>
            <dt class="text-slate-400">Frequency</dt><dd class="font-mono text-right">{{ a.freqPerDay | number:'1.2-2' }} / day</dd>
            <dt class="text-slate-400">First seen</dt><dd class="font-mono text-right">{{ a.firstSeen }}</dd>
            <dt class="text-slate-400">Last seen</dt><dd class="font-mono text-right">{{ a.lastSeen }}</dd>
            <dt class="text-slate-400">Affected tools</dt><dd class="font-mono text-right">{{ a.affectedTools }} tools</dd>
            <dt class="text-slate-400">Common recipe</dt><dd class="font-mono text-right">{{ a.recipe ?? '—' }}</dd>
            <dt class="text-slate-400">Recipe match</dt><dd class="font-mono text-right">{{ a.recipeMatchPct }}% of events</dd>
          </dl>

          <div>
            <p class="kpi-label mb-1.5">Weekly trend (last 8 weeks)</p>
            <div class="flex items-end gap-1 h-14">
              @for (v of a.weeklyTrend; track $index) {
                <div class="flex-1 rounded-t bg-indigo-400/80 hover:bg-indigo-600 transition-colors"
                     [style.height.%]="(v / maxTrend(a.weeklyTrend)) * 100" [title]="v + ' events'"></div>
              }
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button class="btn-primary flex-1" (click)="viewEvents?.(a.alarmId)">View Event Log</button>
            <button class="btn-ghost flex-1 border border-slate-200">Export Alarm Data</button>
          </div>
        </div>
      } @else {
        <p class="p-5 text-xs text-slate-400">Select an alarm row to inspect its occurrence summary, recipe context and weekly trend.</p>
      }
    </aside>
  `
})
export class AlarmInfoPanelComponent {
  store = inject(AlarmStore);

  /** Injected by the ComponentWidget config so navigation stays in the page component. */
  @Input() viewEvents?: (alarmId: string) => void;

  dot(cat: AlarmCategory): string { return CAT_DOT[cat]; }
  maxTrend(arr: number[]): number { return Math.max(1, ...arr); }
}
