import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AlarmStore } from '../../core/state/alarm.store';
import { AlarmCategory } from '../../core/models/models';

const CAT_BADGE: Record<AlarmCategory, string> = {
  'Equipment Safety': 'bg-red-50 text-red-700 border border-red-200',
  'Attention Flags': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Data Integrity': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Irrecoverable': 'bg-violet-50 text-violet-700 border border-violet-200'
};

/**
 * Inspector content for the selected alarm — rendered inside a <base-drawer>
 * by the host page (ToolAlarmsComponent). Reads AlarmStore directly.
 */
@Component({
  selector: 'fam-alarm-info-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    @if (store.inspectedAlarm(); as a) {
      <div class="p-5 space-y-6">
        <section>
          <h3 class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Alarm Info</h3>
          <div class="grid grid-cols-[130px_1fr] gap-y-2.5 text-xs">
            <span class="text-slate-400">Alarm ID</span><span class="font-mono font-bold text-slate-800">{{ a.alarmId }}</span>
            <span class="text-slate-400">Description</span><span class="text-slate-700">{{ a.description }}</span>
            <span class="text-slate-400">Category</span>
            <span><span class="text-[10px] font-bold rounded-full px-2 py-0.5" [class]="catBadge(a.category)">{{ a.category }}</span></span>
            <span class="text-slate-400">Severity</span>
            <span><span class="text-[10px] font-bold rounded-full px-2 py-0.5"
                        [class]="a.severity === 'Fatal' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">{{ a.severity }}</span></span>
          </div>
        </section>

        <section class="pt-5 border-t border-slate-100">
          <h3 class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Occurrence Summary</h3>
          <div class="grid grid-cols-[130px_1fr] gap-y-2.5 text-xs">
            <span class="text-slate-400">Total Count</span><span class="font-semibold text-slate-800">{{ a.count }}</span>
            <span class="text-slate-400">Frequency</span><span class="font-mono text-slate-700">{{ a.freqPerDay | number:'1.2-2' }} / day</span>
            <span class="text-slate-400">First Seen</span><span class="font-mono text-slate-700">{{ a.firstSeen }}</span>
            <span class="text-slate-400">Last Seen</span><span class="font-mono text-slate-700">{{ a.lastSeen }}</span>
            <span class="text-slate-400">Affected Tools</span><span class="text-slate-700">{{ a.affectedTools }} tools</span>
          </div>
        </section>

        <section class="pt-5 border-t border-slate-100">
          <h3 class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Recipe Context</h3>
          <div class="grid grid-cols-[130px_1fr] gap-y-2.5 text-xs">
            <span class="text-slate-400">Common Recipe</span><span class="font-mono text-slate-700">{{ a.recipe ?? '—' }}</span>
            <span class="text-slate-400">Recipe Match</span><span class="text-slate-700">{{ a.recipeMatchPct }}% of events</span>
          </div>
        </section>

        <section class="pt-5 border-t border-slate-100">
          <h3 class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">Weekly Trend (Last 8 Weeks)</h3>
          <div class="flex gap-2">
            <div class="flex flex-col justify-between text-[10px] text-slate-300 h-24 py-0.5">
              <span>8</span><span>4</span><span>0</span>
            </div>
            <div class="flex-1 flex items-end gap-1.5 h-24 border-l border-b border-slate-100 pl-2 pb-0.5">
              @for (v of a.weeklyTrend; track $index) {
                <div class="flex-1 rounded-t bg-indigo-500/80 hover:bg-indigo-600 transition-colors"
                     [style.height.%]="(v / maxTrend(a.weeklyTrend)) * 100" [title]="v + ' events'"></div>
              }
            </div>
          </div>
          <div class="flex gap-1.5 mt-1 pl-8 text-[9px] text-slate-300">
            @for (v of a.weeklyTrend; track $index; let i = $index) {
              <span class="flex-1 text-center">W-{{ a.weeklyTrend.length - i }}</span>
            }
          </div>
        </section>
      </div>
    } @else {
      <p class="p-5 text-xs text-slate-400">Select an alarm row to inspect its occurrence summary, recipe context and weekly trend.</p>
    }
  `
})
export class AlarmInfoPanelComponent {
  store = inject(AlarmStore);

  catBadge(cat: AlarmCategory): string { return CAT_BADGE[cat]; }
  maxTrend(arr: number[]): number { return Math.max(1, ...arr); }
}
