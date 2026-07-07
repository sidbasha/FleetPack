import { registerWidget } from './widget-registry';
import { StateHeatmapComponent } from '../../features/uptime-availability/state-heatmap.component';
import { ActivityGanttComponent } from '../../features/uptime-availability/activity-gantt.component';
import { EventDetailsComponent } from '../../features/uptime-availability/event-details.component';
import { AlarmInfoPanelComponent } from '../../features/alarm-explorer/alarm-info-panel.component';

/**
 * Registers built-in custom widgets so pages (or, in future,
 * server-driven page configs) can reference them by name:
 *   { type: 'component', name: 'state-heatmap' }
 *
 * Called once at bootstrap via provideAppInitializer (see app.config.ts).
 * Future modules register their widgets the same way.
 */
export function registerBuiltInWidgets(): void {
  registerWidget('state-heatmap', StateHeatmapComponent);
  registerWidget('activity-gantt', ActivityGanttComponent);
  registerWidget('event-details', EventDetailsComponent);
  registerWidget('alarm-info-panel', AlarmInfoPanelComponent);
}
