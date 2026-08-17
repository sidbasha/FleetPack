import { registerWidget } from './widget-registry';
import { StateHeatmapComponent } from '../../features/uptime-availability/state-heatmap.component';
import { ActivityGanttComponent } from '../../features/uptime-availability/activity-gantt.component';
import { EventDetailsComponent } from '../../features/uptime-availability/event-details.component';
import { AlarmInfoPanelComponent } from '../../features/alarm-explorer/alarm-info-panel.component';

export function registerBuiltInWidgets(): void {
  registerWidget('state-heatmap', StateHeatmapComponent);
  registerWidget('activity-gantt', ActivityGanttComponent);
  registerWidget('event-details', EventDetailsComponent);
  registerWidget('alarm-info-panel', AlarmInfoPanelComponent);
}
