import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AlarmStore } from '../../core/state/alarm.store';
import { LoadingComponent } from '../../shared/components/ui.components';
import { DynamicPageComponent } from '../../shared/dynamic/dynamic-page.component';
import { WidgetConfig } from '../../shared/dynamic/widget.model';
import { AlarmCategory } from '../../core/models/models';

const CAT_COLORS: Record<AlarmCategory, string> = {
  'Equipment Safety': '#ef4444',
  'Attention Flags': '#f59e0b',
  'Data Integrity': '#6366f1',
  'Irrecoverable': '#7c3aed'
};

@Component({
  selector: 'fam-alarm-home',
  standalone: true,
  imports: [NgClass, LoadingComponent, DynamicPageComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Alarm Explorer <span class="badge-fam">FAM</span></h1>
        <p class="text-xs text-slate-400 mt-0.5">All models · all fleets · all categories · last 13 weeks</p>
      </div>
      <div class="flex-1"></div>
      <div class="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <button class="tab-btn" [ngClass]="view() === 'trend' ? 'tab-btn-active' : ''" (click)="view.set('trend')">Trend</button>
        <button class="tab-btn" [ngClass]="view() === 'pareto' ? 'tab-btn-active' : ''" (click)="view.set('pareto')">Pareto</button>
      </div>
      <button class="btn-primary self-center">↓ Export</button>
    </div>

    @if (store.homeLoading()) {
      <fam-loading what="alarm volume" />
    } @else {
      <fam-dynamic-page class="block mt-3.5"   [widgets]="widgets()" />
    }
  `
})
export class AlarmHomeComponent implements OnInit {
  store = inject(AlarmStore);
  private router = inject(Router);

  readonly view = signal<'trend' | 'pareto'>('trend');

  readonly widgets = computed<WidgetConfig[]>(() => {
    const home = this.store.home();
    if (!home) return [];

    const cats = Object.keys(CAT_COLORS) as AlarmCategory[];
    const pareto = this.view() === 'pareto';

    let chartData;
    if (pareto) {
      const fleets = [...home.fleets].sort((a, b) => b.totalAlarms - a.totalAlarms);
      const total = fleets.reduce((a, f) => a + f.totalAlarms, 0);
      let cum = 0;
      chartData = {
        labels: fleets.map(f => f.fleetName),
        datasets: [
          {
            type: 'line' as const, label: 'Cumulative %', yAxisID: 'y1',
            data: fleets.map(f => { cum += f.totalAlarms; return Math.round((cum / total) * 1000) / 10; }),
            borderColor: '#0ea5e9', pointRadius: 3, tension: 0.25, borderWidth: 2
          },
          { label: 'Alarms', data: fleets.map(f => f.totalAlarms), backgroundColor: 'rgba(99,102,241,.8)', borderRadius: 4 }
        ]
      };
    } else {
      chartData = {
        labels: home.volume.map(v => v.workWeek),
        datasets: cats.map(cat => ({
          label: cat,
          data: home.volume.map(v => v.byCategory[cat]),
          backgroundColor: CAT_COLORS[cat],
          stack: 'alarms',
          borderRadius: 2
        }))
      };
    }

    return [
      {
        id: 'alarm-volume', type: 'chart', badge: 'FAM', colSpan: 4,
        title: 'Alarm Volume · All Fleets',
        legend: cats.map(c => ({ label: c, color: CAT_COLORS[c] })),
        chartType: 'bar', height: 320,
        data: chartData,
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { stacked: !pareto, ticks: { font: { size: 10 } }, grid: { display: false } },
            y: { stacked: !pareto, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } },
            y1: { position: 'right', min: 0, max: 100, display: pareto, ticks: { callback: v => `${v}%`, font: { size: 10 } }, grid: { display: false } }
          }
        }
      },
      {
        id: 'fleet-breakdown', type: 'ranked-list', badge: 'FAM', colSpan: 2,
        title: 'Fleet Breakdown',
        subtitle: 'Click a fleet to drill down',
        footnote: 'Click a fleet row to see tool-level breakdown →',
        trendBadWhenUp: true,
        items: home.fleets.map(f => ({
          key: f.fleetId, rank: f.rank,
          title: f.fleetName, subtitle: `${f.toolCount} tools`,
          value: f.totalAlarms, trendPct: f.trendPct
        })),
        onItemClick: item => this.router.navigate(['/alarm-explorer/fleet', item.key])
      }
    ];
  });

  ngOnInit(): void {
    this.store.loadHome();
  }
}
