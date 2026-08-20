import { Routes } from '@angular/router';
import { APP_ROUTE_PATHS, PLACEHOLDER_ROUTE_PATHS, ROUTE_TITLES } from './core/constants/app.constants';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: APP_ROUTE_PATHS.root,
    component: ShellComponent,
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
          },
          {
            path: APP_ROUTE_PATHS.segmentActivities,
            loadComponent: () =>
              import('./features/uptime-availability/segment-activities.component').then(m => m.SegmentActivitiesComponent)
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
      })),
      {
        path: APP_ROUTE_PATHS.devComponentCatalog,
        title: ROUTE_TITLES.devComponentCatalog,
        loadComponent: () =>
          import('./features/dev/component-catalog.component').then(m => m.ComponentCatalogComponent)
      },
      {
        path: APP_ROUTE_PATHS.devBasePlayground,
        title: ROUTE_TITLES.devBasePlayground,
        loadComponent: () =>
          import('./features/dev/base-playground.component').then(m => m.BasePlaygroundComponent)
      }
    ]
  },
  { path: APP_ROUTE_PATHS.wildcard, redirectTo: APP_ROUTE_PATHS.root }
];
