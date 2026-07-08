import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/auth/auth.guard';
import { APP_ROUTE_PATHS, PLACEHOLDER_ROUTE_PATHS, ROUTE_TITLES } from './core/constants/app.constants';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: APP_ROUTE_PATHS.login,
    title: ROUTE_TITLES.login,
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: APP_ROUTE_PATHS.root,
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: APP_ROUTE_PATHS.root, pathMatch: 'full', redirectTo: APP_ROUTE_PATHS.fleetAvailabilityAnalysis },
      {
        path: APP_ROUTE_PATHS.fleetAvailabilityAnalysis,
        title: ROUTE_TITLES.fleetAvailabilityAnalysis,
        loadComponent: () =>
          import('./features/uptime-analysis/uptime-analysis.component').then(m => m.UptimeAnalysisComponent)
      },
      {
        path: APP_ROUTE_PATHS.fleetAvailabilityAvailability,
        title: ROUTE_TITLES.fleetAvailabilityAvailability,
        loadComponent: () =>
          import('./features/uptime-availability/uptime-availability.component').then(m => m.UptimeAvailabilityComponent),
        children: [
          { path: APP_ROUTE_PATHS.root, pathMatch: 'full', redirectTo: APP_ROUTE_PATHS.heatmap },
          {
            path: APP_ROUTE_PATHS.heatmap,
            loadComponent: () =>
              import('./features/uptime-availability/state-heatmap.component').then(m => m.StateHeatmapComponent)
          },
          {
            path: APP_ROUTE_PATHS.gantt,
            loadComponent: () =>
              import('./features/uptime-availability/activity-gantt.component').then(m => m.ActivityGanttComponent)
          },
          {
            path: APP_ROUTE_PATHS.events,
            loadComponent: () =>
              import('./features/uptime-availability/event-details.component').then(m => m.EventDetailsComponent)
          }
        ]
      },
      {
        path: APP_ROUTE_PATHS.alarmExplorer,
        title: ROUTE_TITLES.alarmExplorer,
        loadComponent: () =>
          import('./features/alarm-explorer/alarm-home.component').then(m => m.AlarmHomeComponent)
      },
      {
        path: APP_ROUTE_PATHS.alarmFleetDetail,
        title: ROUTE_TITLES.alarmFleetDetail,
        loadComponent: () =>
          import('./features/alarm-explorer/fleet-detail.component').then(m => m.FleetDetailComponent)
      },
      {
        path: APP_ROUTE_PATHS.alarmToolAlarms,
        title: ROUTE_TITLES.alarmToolAlarms,
        loadComponent: () =>
          import('./features/alarm-explorer/tool-alarms.component').then(m => m.ToolAlarmsComponent)
      },
      {
        path: APP_ROUTE_PATHS.alarmEvents,
        title: ROUTE_TITLES.alarmEvents,
        loadComponent: () =>
          import('./features/alarm-explorer/alarm-events.component').then(m => m.AlarmEventsComponent)
      },
      ...PLACEHOLDER_ROUTE_PATHS.map(path => ({
        path,
        loadComponent: () =>
          import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent)
      }))
    ]
  },
  { path: APP_ROUTE_PATHS.wildcard, redirectTo: APP_ROUTE_PATHS.root }
];
