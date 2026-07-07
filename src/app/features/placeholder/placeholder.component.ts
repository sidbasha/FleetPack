import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

const MODULE_INFO: Record<string, { title: string; blurb: string; icon: string }> = {
  'fleet-configuration': { title: 'Fleet Configuration', icon: '⚒', blurb: 'Define fleets, assign tools, and manage software version baselines across the fab.' },
  'fleet-productivity': { title: 'Fleet Productivity', icon: '▲', blurb: 'Throughput, wafer starts, and OEE analytics complementing the availability views.' },
  'tqual': { title: 'TQual', icon: '✓', blurb: 'Tool qualification tracking, matching runs, and release status.' },
  'my-reports': { title: 'My Reports', icon: '▧', blurb: 'Saved views, scheduled exports, and shared report subscriptions.' },
  'innovation-lab': { title: 'Innovation Lab', icon: '✦', blurb: 'Preview experimental analytics features before general release.' },
  'engineering-utilities': { title: 'Engineering Utilities', icon: '⌘', blurb: 'Log parsers, data extraction jobs, and bulk maintenance utilities.' }
};

@Component({
  selector: 'fam-placeholder',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="panel max-w-2xl mx-auto mt-10 p-10 text-center">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white text-2xl">
        {{ info().icon }}
      </div>
      <h1 class="mt-4 text-xl font-bold text-slate-900">{{ info().title }} <span class="badge-fam">FAM</span></h1>
      <p class="mt-2 text-sm text-slate-500 leading-relaxed">{{ info().blurb }}</p>
      <p class="mt-4 text-xs text-slate-400">This module is scaffolded and wired into routing &amp; navigation — plug its screens in here.</p>
      <div class="mt-6 flex justify-center gap-2">
        <a routerLink="/fleet-availability/up-time/analysis" class="btn-primary">Go to Up+Time Analysis</a>
        <a routerLink="/alarm-explorer" class="btn-ghost border border-slate-200">Open Alarm Explorer</a>
      </div>
    </div>
  `
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  private path = toSignal(this.route.url.pipe(map(segs => segs[0]?.path ?? '')), { initialValue: '' });

  info = computed(() =>
    MODULE_INFO[this.path()] ?? { title: 'Module', icon: '▦', blurb: 'Coming soon.' }
  );
}
