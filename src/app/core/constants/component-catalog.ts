export interface ComponentCatalogEntry {
  name: string;
  selector: string;
  group: string;
  file: string;
  route?: string;
  description: string;
}

export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  { name: 'KpiComponent', selector: 'fam-kpi', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Single KPI tile — label / value / unit / sub, optional accent color.' },
  { name: 'LoadingComponent', selector: 'fam-loading', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Inline spinner + "Loading {what}" shown while a store query is in flight.' },
  { name: 'StateLegendComponent', selector: 'fam-state-legend', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: 'Fixed legend chips for the tool states (Production … Gap).' },
  { name: 'TrendPillComponent', selector: 'fam-trend', group: 'Shared · UI Atoms', file: 'shared/components/ui.components.ts', description: '▲ / ▼ percentage pill; color flips via badWhenUp.' },

  { name: 'BaseButtonComponent', selector: 'base-button', group: 'Base Module · Actions', file: 'base/components/base-form.components.ts', description: 'Primary command surface — primary / secondary / tertiary / ghost / destructive variants, loading + disabled states.' },
  { name: 'BaseSplitButtonComponent', selector: 'base-split-button', group: 'Base Module · Actions', file: 'base/components/base-form.components.ts', description: 'A default action plus a chevron menu of closely related variants.' },
  { name: 'BaseSegmentedControlComponent', selector: 'base-segmented-control', group: 'Base Module · Actions', file: 'base/components/base-form.components.ts', description: 'A closed set of 2–4 mutually exclusive view options that changes what\'s shown without navigating.' },
  { name: 'BaseButtonGroupComponent', selector: 'base-button-group', group: 'Base Module · Actions', file: 'base/components/base-form.components.ts', description: '2–4 related actions that share one bordered silhouette but fire independently — not a single/multi toggle.' },

  { name: 'BaseTextInputComponent', selector: 'base-text-input', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Text field with label/hint/error, prefix/suffix, clearable, CVA-compatible.' },
  { name: 'BaseTextareaComponent', selector: 'base-textarea', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Multi-line text field with max-length counter.' },
  { name: 'BaseSelectComponent', selector: 'base-select', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Single-select dropdown, optionally searchable.' },
  { name: 'BaseCheckboxComponent', selector: 'base-checkbox', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Checkbox with indeterminate support.' },
  { name: 'BaseRadioGroupComponent', selector: 'base-radio-group', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Radio button group, horizontal or vertical.' },
  { name: 'BaseToggleComponent', selector: 'base-toggle', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'On/off switch.' },
  { name: 'BaseComboboxComponent', selector: 'base-combobox', group: 'Base Module · Forms', file: 'base/components/base-advanced-form.components.ts', description: 'Type-ahead text field where the typed value is real, not just a filter — narrows options as you type.' },
  { name: 'BaseMultiSelectChipsComponent', selector: 'base-multi-select-chips', group: 'Base Module · Forms', file: 'base/components/base-advanced-form.components.ts', description: 'Multi-select field that renders selected values as removable chips inline.' },
  { name: 'BaseFileUploadComponent', selector: 'base-file-upload', group: 'Base Module · Forms', file: 'base/components/base-advanced-form.components.ts', description: 'Drag-and-drop upload zone with a per-file progress row.' },
  { name: 'BaseSliderComponent', selector: 'base-slider', group: 'Base Module · Forms', file: 'base/components/base-advanced-form.components.ts', description: 'Bounded numeric range slider with a visible current value.' },
  { name: 'BaseDatepickerComponent', selector: 'base-datepicker', group: 'Base Module · Forms', file: 'base/components/base-datepicker.component.ts', description: 'Dependency-free popup calendar; optional time-of-day boxes.' },
  { name: 'BaseDateRangePickerComponent', selector: 'base-date-range-picker', group: 'Base Module · Forms', file: 'base/components/base-date-range-picker.component.ts', description: 'Quick-range presets + dual month calendars; committed only on Apply.' },
  { name: 'BaseNumericStepperComponent', selector: 'base-numeric-stepper', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Bounded integer entry via decrement / value / increment, for small counts adjusted a few at a time.' },
  { name: 'BaseOtpInputComponent', selector: 'base-otp-input', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Fixed-length numeric code, one digit per box; auto-advances on entry, steps back on backspace.' },
  { name: 'BaseColorPickerComponent', selector: 'base-color-picker', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: "Restricted to the design system's own token palette — a swatch picker, not free-form hex entry." },
  { name: 'BaseCheckboxGroupComponent', selector: 'base-checkbox-group', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: 'Multi-select where every option stays visible at once — no dropdown to open, no chips to scan.' },
  { name: 'BaseSelectionCardComponent', selector: 'base-selection-cards', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: "One of N, presented as cards instead of base-radio-group's dot+label row." },
  { name: 'BaseTimePickerComponent', selector: 'base-time-picker', group: 'Base Module · Forms', file: 'base/components/base-form.components.ts', description: "A dropdown list of preset time slots — pick one, don't type one." },
  { name: 'BaseRangeSliderComponent', selector: 'base-range-slider', group: 'Base Module · Forms', file: 'base/components/base-advanced-form.components.ts', description: 'Dual-handle numeric range slider — a From/To band instead of a single value.' },

  { name: 'BaseBadgeComponent', selector: 'base-badge', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'States a fixed-vocabulary fact (e.g. "Active"); never interactive.' },
  { name: 'BaseTagComponent', selector: 'base-tag', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Static, non-removable classifier ("Fleet A").' },
  { name: 'BaseChipComponent', selector: 'base-chip', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Removable, user-applied filter chip.' },
  { name: 'BaseTrendComponent', selector: 'base-trend', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: '▲ / ▼ percentage pill; color flips via badWhenUp.' },
  { name: 'BaseKpiCardComponent', selector: 'base-kpi-card', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Label / value / unit / trend / sub KPI tile, optionally clickable or selected.' },
  { name: 'BaseStatBarComponent', selector: 'base-stat-bar', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Borderless horizontal row of metrics for a page header.' },
  { name: 'BaseSparklineComponent', selector: 'base-sparkline', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Dependency-free inline SVG mini line chart.' },
  { name: 'BaseListItemComponent', selector: 'base-list-item', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Full-row click target with hairline divider, for flat single-line collections.' },
  { name: 'BaseAccordionComponent', selector: 'base-accordion', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Collapsible content section with a chevron toggle.' },
  { name: 'BaseDividerComponent', selector: 'base-divider', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Plain or labeled horizontal rule.' },
  { name: 'BaseLoadingComponent', selector: 'base-loading', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Indeterminate inline spinner + message.' },
  { name: 'BaseSkeletonComponent', selector: 'base-skeleton', group: 'Base Module · Data Display', file: 'base/components/base-overlay.components.ts', description: 'Loading placeholder shaped like its content (rect / circle / table-row / kpi-tile / card / chart).' },
  { name: 'BaseEmptyStateComponent', selector: 'base-empty-state', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'No-results / no-access / not-configured / custom placeholder with an optional CTA.' },
  { name: 'BaseErrorPageComponent', selector: 'base-error-page', group: 'Base Module · Data Display', file: 'base/components/base-overlay.components.ts', description: 'Full-panel 404 / 403 / 500 / offline state — distinct from base-empty-state, for something that actually went wrong.' },
  { name: 'BaseAvatarComponent', selector: 'base-avatar', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Person identity chip — initials on a deterministic tint.' },
  { name: 'BaseAvatarGroupComponent', selector: 'base-avatar-group', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Overlapping avatar stack with a "+N" overflow badge past [max].' },
  { name: 'BaseCardComponent', selector: 'base-card', group: 'Base Module · Data Display', file: 'base/components/base-ui.components.ts', description: 'Generic content card shell — icon/title header, projected body, footer row.' },

  { name: 'BaseBreadcrumbsComponent', selector: 'base-breadcrumbs', group: 'Base Module · Navigation', file: 'base/components/base-nav.components.ts', description: 'Drill-down trail; current segment is always plain text.' },
  { name: 'BaseTabsComponent', selector: 'base-tabs', group: 'Base Module · Navigation', file: 'base/components/base-nav.components.ts', description: 'Headless tab strip — host switches content on [(activeId)].' },
  { name: 'BaseStepperComponent', selector: 'base-stepper', group: 'Base Module · Navigation', file: 'base/components/base-nav.components.ts', description: 'Linear progress stepper (horizontal or vertical) — step status derives from [(activeId)]\'s position in [steps].' },
  { name: 'BaseDropdownMenuComponent', selector: 'base-dropdown-menu', group: 'Base Module · Navigation', file: 'base/components/base-nav.components.ts', description: 'Button-triggered action menu.' },
  { name: 'BaseContextMenuComponent', selector: 'base-context-menu', group: 'Base Module · Navigation', file: 'base/components/base-nav.components.ts', description: 'Right-click / overflow-triggered menu; opened imperatively via openAt(x, y).' },
  { name: 'BaseNotificationsPanelComponent', selector: 'base-notifications-panel', group: 'Base Module · Navigation', file: 'base/components/base-notification.components.ts', description: 'Header-anchored notifications overlay with unread state.' },
  { name: 'BaseGlobalSearchComponent', selector: 'base-global-search', group: 'Base Module · Navigation', file: 'base/components/base-notification.components.ts', description: 'Header-anchored command-style global search (⌘K).' },

  { name: 'BaseModalComponent', selector: 'base-modal', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Content-projected dialog for a focused, interrupting decision.' },
  { name: 'BaseDrawerComponent', selector: 'base-drawer', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-drawer.component.ts', description: 'Content-projected slide-over panel that keeps the current view in place.' },
  { name: 'BasePopoverComponent', selector: 'base-popover', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Anchored panel for interactive content, with focus-trapping.' },
  { name: 'BaseAlertComponent', selector: 'base-alert', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Persistent, page/section-scoped info / success / warning / error banner.' },
  { name: 'BaseBannerComponent', selector: 'base-banner', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Page-wide condition banner (maintenance window, degraded feed) — use base-alert instead for one region.' },
  { name: 'BaseHoverCardComponent', selector: 'base-hover-card', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Hover-triggered rich preview of an entity, reachable from a dense table without leaving it.' },
  { name: 'BaseProgressBarComponent', selector: 'base-progress-bar', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Determinate progress bar for a measurable operation.' },
  { name: 'BaseToastHostComponent', selector: 'base-toast-host', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Renders the transient, auto-dismissing toast stack from BaseToastService.' },
  { name: 'BaseTooltipDirective', selector: '[baseTooltip]', group: 'Base Module · Overlay & Feedback', file: 'base/components/base-overlay.components.ts', description: 'Hover/focus tooltip directive — attach to any element.' },

  { name: 'BaseTrendChartComponent', selector: 'base-trend-chart', group: 'Base Module · Charts & Timeline', file: 'base/components/base-charts.components.ts', description: 'Rolling-average line chart with optional target band and area fill.' },
  { name: 'BaseBarChartComponent', selector: 'base-bar-chart', group: 'Base Module · Charts & Timeline', file: 'base/components/base-charts.components.ts', description: 'Category comparison bar chart, one semantic hue.' },
  { name: 'BaseScatterChartComponent', selector: 'base-scatter-chart', group: 'Base Module · Charts & Timeline', file: 'base/components/base-charts.components.ts', description: 'Correlation chart between two metrics.' },
  { name: 'BaseHistogramComponent', selector: 'base-histogram', group: 'Base Module · Charts & Timeline', file: 'base/components/base-charts.components.ts', description: 'Distribution of one metric into touching bars/buckets.' },
  { name: 'BaseStateHeatmapComponent', selector: 'base-state-heatmap', group: 'Base Module · Charts & Timeline', file: 'base/components/base-timeline.components.ts', description: 'Day × hour grid colored by dominant machine state, for spotting recurring patterns.' },
  { name: 'BaseGanttTimelineComponent', selector: 'base-gantt-timeline', group: 'Base Module · Charts & Timeline', file: 'base/components/base-timeline.components.ts', description: '24h per-row state segments — the detail view a heatmap cell expands into.' },
  { name: 'BaseChartFrameComponent', selector: 'base-chart-frame', group: 'Base Module · Charts & Timeline', file: 'base/components/base-charts.components.ts', description: 'Chart panel chrome — title/subtitle, export button, optional table/chart view toggle.' },

  { name: 'BaseTableComponent', selector: 'base-table', group: 'Base Module · Table', file: 'base/components/table/base-table.component.ts', description: 'Data grid: dynamic columns, pagination, filtering, sorting, selection, sticky header/columns, row expansion.' },
  { name: 'BasePaginatorComponent', selector: 'base-paginator', group: 'Base Module · Table', file: 'base/components/table/base-paginator.component.ts', description: 'Standalone, fully-controlled pagination control (used internally by Base Table).' },
  { name: 'BaseSearchInputComponent', selector: 'base-search-input', group: 'Base Module · Table', file: 'base/components/table/base-paginator.component.ts', description: 'Debounced quick-filter text input.' },
  { name: 'BaseManageColumnsComponent', selector: 'base-manage-columns', group: 'Base Module · Table', file: 'base/components/table/base-manage-columns.component.ts', description: 'Gear-icon panel to show/hide and drag-reorder table columns.' },
  { name: 'BaseCheckboxFilterComponent', selector: 'base-checkbox-filter', group: 'Base Module · Table', file: 'base/components/table/base-column-filters.components.ts', description: 'Per-column value-filter dropdown with search + optional sort.' },
  { name: 'BaseCalendarFilterComponent', selector: 'base-calendar-filter', group: 'Base Module · Table', file: 'base/components/table/base-column-filters.components.ts', description: 'Per-column date-range filter dropdown.' },
  { name: 'BaseRangeFilterComponent', selector: 'base-range-filter', group: 'Base Module · Table', file: 'base/components/table/base-column-filters.components.ts', description: 'Per-column numeric range filter dropdown.' },
  { name: 'BaseTableViewsComponent', selector: 'base-table-views', group: 'Base Module · Table', file: 'base/components/table/base-table-views.component.ts', description: 'Saved/filtered view tab rail — pinned "All" plus saved views, Modified badge, Save/Update/Reset/Copy link.' },

  { name: 'DynamicPageComponent', selector: 'fam-dynamic-page', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/dynamic-page.component.ts', description: 'Responsive 6-column grid that lays out a WidgetConfig[].' },
  { name: 'DynamicWidgetComponent', selector: 'fam-dynamic-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/dynamic-page.component.ts', description: 'Renders panel chrome + dispatches to the widget renderer by type.' },
  { name: 'KpiGridWidgetComponent', selector: 'fam-kpi-grid-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'kpi-grid' WidgetConfig type." },
  { name: 'ChartWidgetComponent', selector: 'fam-chart-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'chart' WidgetConfig type (Chart.js canvas)." },
  { name: 'RankedListWidgetComponent', selector: 'fam-ranked-list-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/basic-widgets.components.ts', description: "Renderer for the 'ranked-list' WidgetConfig type." },
  { name: 'TableWidgetComponent', selector: 'fam-table-widget', group: 'Shared · Dynamic Widgets', file: 'shared/dynamic/table-widget.component.ts', description: "Renderer for the 'table' WidgetConfig type — grouping, pagination, cell kinds." },

  { name: 'ShellComponent', selector: 'fam-shell', group: 'Layout', file: 'layout/shell.component.ts', description: 'App frame hosting the topbar, sidebar and routed feature outlet.' },
  { name: 'TopbarComponent', selector: 'fam-topbar', group: 'Layout', file: 'layout/topbar.component.ts', description: 'Fleet/duration filters, breadcrumbs, notifications, session menu.' },
  { name: 'SidebarComponent', selector: 'fam-sidebar', group: 'Layout', file: 'layout/sidebar.component.ts', description: 'Primary navigation, grouped by NAV_GROUPS.' },

  { name: 'LoginComponent', selector: 'fam-login', group: 'Auth', file: 'features/auth/login.component.ts', description: 'Reactive-form sign-in against AuthService.login().' },

  { name: 'UptimeAnalysisComponent', selector: 'fam-uptime-analysis', group: 'Up+Time Analysis', file: 'features/uptime-analysis/uptime-analysis.component.ts', route: '/fleet-availability/up-time/analysis', description: 'Trend chart, rolling/tool/SW breakdown table, top-unavailable chart, downtime table.' },

  { name: 'UptimeAvailabilityComponent', selector: 'fam-uptime-availability', group: 'Up+Time Availability', file: 'features/uptime-availability/uptime-availability.component.ts', route: '/fleet-availability/up-time/availability', description: 'Page shell — KPI row, trend widgets, tool selector, routed analysis tabs.' },
  { name: 'StateHeatmapComponent', selector: 'fam-state-heatmap', group: 'Up+Time Availability', file: 'features/uptime-availability/state-heatmap.component.ts', route: '/fleet-availability/up-time/availability/heatmap', description: "24h x 14-day state heatmap. Registered widget: 'state-heatmap'." },
  { name: 'ActivityGanttComponent', selector: 'fam-activity-gantt', group: 'Up+Time Availability', file: 'features/uptime-availability/activity-gantt.component.ts', route: '/fleet-availability/up-time/availability/gantt', description: "Per-day Sys/Tool gantt bars with day-shift mask. Registered widget: 'activity-gantt'." },
  { name: 'EventDetailsComponent', selector: 'fam-event-details', group: 'Up+Time Availability', file: 'features/uptime-availability/event-details.component.ts', route: '/fleet-availability/up-time/availability/events', description: "State-change events, grouped by day, paginated. Registered widget: 'event-details'." },
  { name: 'SegmentActivitiesComponent', selector: 'fam-segment-activities', group: 'Up+Time Availability', file: 'features/uptime-availability/segment-activities.component.ts', route: '/fleet-availability/up-time/availability/activities', description: 'Task/recipe-level activity table correlated to production windows.' },

  { name: 'AlarmHomeComponent', selector: 'fam-alarm-home', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-home.component.ts', route: '/alarm-explorer', description: 'Alarm volume chart (trend/pareto), fleet breakdown ranked list.' },
  { name: 'FleetDetailComponent', selector: 'fam-fleet-detail', group: 'Alarm Explorer', file: 'features/alarm-explorer/fleet-detail.component.ts', route: '/alarm-explorer/fleet/:fleetId', description: 'KPIs, tool-level distribution chart, top alarms, tool summary table.' },
  { name: 'ToolAlarmsComponent', selector: 'fam-tool-alarms', group: 'Alarm Explorer', file: 'features/alarm-explorer/tool-alarms.component.ts', route: '/alarm-explorer/fleet/:fleetId/tool/:toolId', description: 'Searchable/filterable alarm table; row click opens the alarm inspector in a base-drawer.' },
  { name: 'AlarmEventsComponent', selector: 'fam-alarm-events', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-events.component.ts', route: '/alarm-explorer/fleet/:fleetId/tool/:toolId/alarm/:alarmId', description: 'Chronological alarm event log, recipe filter, pagination, CSV export.' },
  { name: 'AlarmInfoPanelComponent', selector: 'fam-alarm-info-panel', group: 'Alarm Explorer', file: 'features/alarm-explorer/alarm-info-panel.component.ts', description: 'Inspector content for the selected alarm, rendered inside the Tool page\'s base-drawer.' },

  { name: 'PlaceholderComponent', selector: 'fam-placeholder', group: 'Placeholder', file: 'features/placeholder/placeholder.component.ts', description: 'Scaffolded "coming soon" screen for modules not yet built.' }
];
