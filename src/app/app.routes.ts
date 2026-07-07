import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'FAM · Login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'fleet-availability/up-time/analysis' },

      // ── Fleet Availability › Up+Time ──
      {
        path: 'fleet-availability/up-time/analysis',
        title: 'FAM · Fleet Up-Time Analysis',
        loadComponent: () =>
          import('./features/uptime-analysis/uptime-analysis.component').then(m => m.UptimeAnalysisComponent)
      },
      {
        path: 'fleet-availability/up-time/availability',
        title: 'FAM · Fleet Up-Time Availability',
        loadComponent: () =>
          import('./features/uptime-availability/uptime-availability.component').then(m => m.UptimeAvailabilityComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'heatmap' },
          {
            path: 'heatmap',
            loadComponent: () =>
              import('./features/uptime-availability/state-heatmap.component').then(m => m.StateHeatmapComponent)
          },
          {
            path: 'gantt',
            loadComponent: () =>
              import('./features/uptime-availability/activity-gantt.component').then(m => m.ActivityGanttComponent)
          },
          {
            path: 'events',
            loadComponent: () =>
              import('./features/uptime-availability/event-details.component').then(m => m.EventDetailsComponent)
          }
        ]
      },

      // ── Alarm Explorer drill-down ──
      {
        path: 'alarm-explorer',
        title: 'FAM · Alarm Explorer',
        loadComponent: () =>
          import('./features/alarm-explorer/alarm-home.component').then(m => m.AlarmHomeComponent)
      },
      {
        path: 'alarm-explorer/fleet/:fleetId',
        title: 'FAM · Alarm Explorer · Fleet',
        loadComponent: () =>
          import('./features/alarm-explorer/fleet-detail.component').then(m => m.FleetDetailComponent)
      },
      {
        path: 'alarm-explorer/fleet/:fleetId/tool/:toolId',
        title: 'FAM · Alarm Explorer · Tool',
        loadComponent: () =>
          import('./features/alarm-explorer/tool-alarms.component').then(m => m.ToolAlarmsComponent)
      },
      {
        path: 'alarm-explorer/fleet/:fleetId/tool/:toolId/alarm/:alarmId',
        title: 'FAM · Alarm Explorer · Events',
        loadComponent: () =>
          import('./features/alarm-explorer/alarm-events.component').then(m => m.AlarmEventsComponent)
      },

      // ── Remaining modules (placeholders wired into nav) ──
      ...['fleet-configuration', 'fleet-productivity', 'tqual', 'my-reports', 'innovation-lab', 'engineering-utilities']
        .map(path => ({
          path,
          loadComponent: () =>
            import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent)
        }))
    ]
  },
  { path: '**', redirectTo: '' }
];
