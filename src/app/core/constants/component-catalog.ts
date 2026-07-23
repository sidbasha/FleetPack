export interface ComponentCatalogEntry {
  name: string;
  selector: string;
  group: string;
  file: string;
  route?: string;
  description: string;
}

/**
 * Curated, hand-maintained index of every component in the app — the runtime
 * counterpart to docs/COMPONENTS.md. Add an entry here whenever a new
 * component is delivered (see the checklist in that doc).
 */
export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  { name: 'KpiComponent', selector: 'fam-kpi', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Single KPI tile — label / value / unit / sub, optional accent color.' },
  { name: 'LoadingComponent', selector: 'fam-loading', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Inline spinner + "Loading {what}" shown while a store query is in flight.' },
  { name: 'StateLegendComponent', selector: 'fam-state-legend', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Fixed legend chips for the tool states (Production … Gap).' },
  { name: 'TrendPillComponent', selector: 'fam-trend', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: '▲ / ▼ percentage pill; color flips via badWhenUp.' },

  { name: 'DynamicPageComponent', selector: 'fam-dynamic-page', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/dynamic-page.component.ts', description: 'Responsive 6-column grid that lays out a WidgetConfig[].' },
  { name: 'DynamicWidgetComponent', selector: 'fam-dynamic-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/dynamic-page.component.ts', description: 'Renders panel chrome + dispatches to the widget renderer by type.' },
  { name: 'KpiGridWidgetComponent', selector: 'fam-kpi-grid-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'kpi-grid' WidgetConfig type." },
  { name: 'ChartWidgetComponent', selector: 'fam-chart-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'chart' WidgetConfig type (Chart.js canvas)." },
  { name: 'RankedListWidgetComponent', selector: 'fam-ranked-list-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'ranked-list' WidgetConfig type." },
  { name: 'TableWidgetComponent', selector: 'fam-table-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/table-widget.component.ts', description: "Renderer for the 'table' WidgetConfig type — grouping, pagination, cell kinds." },

  { name: 'ShellComponent', selector: 'fam-shell', group: 'Layout', file: 'layout/shell.component.ts', description: 'App frame hosting the topbar, sidebar and routed feature outlet.' },
  { name: 'TopbarComponent', selector: 'fam-topbar', group: 'Layout', file: 'layout/topbar.component.ts', description: 'Fleet/duration filters, breadcrumbs, notifications, session menu.' },
  { name: 'SidebarComponent', selector: 'fam-sidebar', group: 'Layout', file: 'layout/sidebar.component.ts', description: 'Primary navigation, grouped by NAV_GROUPS.' },

  { name: 'LoginComponent', selector: 'fam-login', group: 'Auth', file: 'features/auth/login.component.ts', route: '/login', description: 'Reactive-form sign-in against AuthService.login().' },

  { name: 'UptimeAnalysisComponent', selector: 'fam-uptime-analysis', group: 'Up+Time Analysis', file: 'features/uptime-analysis/uptime-analysis.component.ts', route: '/fleet-availability/up-time/analysis', description: 'Trend chart, rolling/tool/SW breakdown table, top-unavailable chart, downtime table.' },

  { name: 'UptimeAvailabilityComponent', selector: 'fam-uptime-availability', group: 'Up+Time Availability', file: 'features/uptime-availability/uptime-availability.component.ts', route: '/fleet-availability/up-time/availability', description: 'Page shell — KPI row, trend widgets, tool selector, routed analysis tabs.' },
  { name: 'StateHeatmapComponent', selector: 'fam-state-heatmap', group: 'Up+Time Availability', file: 'features/uptime-availability/state-heatmap.component.ts', route: '/fleet-availability/up-time/availability/heatmap', description: "24h x 14-day state heatmap. Registered widget: 'state-heatmap'." },
  { name: 'ActivityGanttComponent', selector: 'fam-activity-gantt', group: 'Up+Time Availability', file: 'features/uptime-availability/activity-gantt.component.ts', route: '/fleet-availability/up-time/availability/gantt', description: "Per-day Sys/Tool gantt bars with day-shift mask. Registered widget: 'activity-gantt'." },
  { name: 'EventDetailsComponent', selector: 'fam-event-details', group: 'Up+Time Availability', file: 'features/uptime-availability/event-details.component.ts', route: '/fleet-availability/up-time/availability/events', description: "State-change events, grouped by day, paginated. Registered widget: 'event-details'." },
  { name: 'SegmentActivitiesComponent', selector: 'fam-segment-activities', group: 'Up+Time Availability', file: 'features/uptime-availability/segment-activities.component.ts', route: '/fleet-availability/up-time/availability/activities', description: 'Task/recipe-level activity table correlated to production windows.' },

  { name: 'AlarmHomeComponent', selector: 'fam-alarm-home', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-home.component.ts', route: '/alarm-explorer', description: 'Alarm volume chart (trend/pareto), fleet breakdown ranked list.' },
  { name: 'FleetDetailComponent', selector: 'fam-fleet-detail', group: 'Alarm Explorer', file: 'features/alarm-explorer/fleet-detail.component.ts', route: '/alarm-explorer/fleet/:fleetId', description: 'KPIs, tool-level distribution chart, top alarms, tool summary table.' },
  { name: 'ToolAlarmsComponent', selector: 'fam-tool-alarms', group: 'Alarm Explorer', file: 'features/alarm-explorer/tool-alarms.component.ts', route: '/alarm-explorer/fleet/:fleetId/tool/:toolId', description: 'Searchable/filterable alarm table + info side panel.' },
  { name: 'AlarmEventsComponent', selector: 'fam-alarm-events', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-events.component.ts', route: '/alarm-explorer/fleet/:fleetId/tool/:toolId/alarm/:alarmId', description: 'Chronological alarm event log, recipe filter, pagination, CSV export.' },
  { name: 'AlarmInfoPanelComponent', selector: 'fam-alarm-info-panel', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-info-panel.component.ts', description: "Inspector panel for the selected alarm. Registered widget: 'alarm-info-panel'." },

  { name: 'PlaceholderComponent', selector: 'fam-placeholder', group: 'Placeholder', file: 'features/placeholder/placeholder.component.ts', description: 'Scaffolded "coming soon" screen for modules not yet built.' }
];
