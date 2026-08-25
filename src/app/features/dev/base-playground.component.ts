import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, signal } from '@angular/core';
import {
  AdditionalHeaderGroup,
  BaseAccordionComponent,
  BaseAlertComponent,
  BaseAvatarComponent,
  BaseAvatarGroupComponent,
  BaseAvatarItem,
  BaseBadgeComponent,
  BaseBannerComponent,
  BaseBarChartComponent,
  BaseBreadcrumbsComponent,
  BaseButtonComponent,
  BaseButtonGroupComponent,
  BaseCardComponent,
  BaseCellDirective,
  BaseCellEditEvent,
  BaseChartFrameComponent,
  BaseChartPoint,
  BaseChildCellDirective,
  BaseChipComponent,
  BaseCheckboxComponent,
  BaseCheckboxGroupComponent,
  BaseColorPickerComponent,
  BaseColumnDef,
  BaseComboOption,
  BaseComboboxComponent,
  BaseContextMenuComponent,
  BaseDateRangePickerComponent,
  BaseDatepickerComponent,
  BaseDividerComponent,
  BaseDrawerComponent,
  BaseDropdownMenuComponent,
  BaseEmptyStateComponent,
  BaseErrorPageComponent,
  BaseFileUploadComponent,
  BaseFilterEvent,
  BaseGanttRow,
  BaseGanttTimelineComponent,
  BaseGlobalSearchComponent,
  BaseHandleActionEvent,
  BaseHeatmapRow,
  BaseHistogramComponent,
  BaseHoverCardComponent,
  BaseKpiCardComponent,
  BaseListItemComponent,
  BaseLoadingComponent,
  BaseMenuItem,
  BaseModalComponent,
  BaseMultiSelectChipsComponent,
  BaseNotification,
  BaseNotificationsPanelComponent,
  BaseNumericStepperComponent,
  BaseOtpInputComponent,
  BasePageEvent,
  BasePopoverComponent,
  BaseProgressBarComponent,
  BaseRadioGroupComponent,
  BaseRangeSliderComponent,
  BaseRangeValue,
  BaseRowAction,
  BaseRowSaveRequest,
  BaseRowSaveResult,
  BaseScatterChartComponent,
  BaseScatterPoint,
  BaseSearchResult,
  BaseSegmentedControlComponent,
  BaseSelectComponent,
  SERIES_COLOR_ORDER,
  BaseSelectionCardComponent,
  BaseSelectionCardOption,
  BaseSkeletonComponent,
  BaseSliderComponent,
  BaseSortEvent,
  BaseSparklineComponent,
  BaseSplitButtonComponent,
  BaseStateHeatmapComponent,
  BaseStatBarComponent,
  BaseStepperComponent,
  BaseStepperStep,
  BaseTableComponent,
  BaseTableView,
  BaseTableViewsComponent,
  BaseTabItem,
  BaseTabsComponent,
  BaseTagComponent,
  BaseTextInputComponent,
  BaseTextareaComponent,
  BaseTimePickerComponent,
  BaseToastHostComponent,
  BaseToastService,
  BaseToggleComponent,
  BaseTooltipDirective,
  BaseTrendChartComponent,
  BaseTrendComponent,
  BaseUploadFile,
  DateRangeValue
} from '../../base';

interface ToolRow {
  toolId: string;
  chamber: string;
  fab: string;
  status: 'PRODUCTION' | 'ENGINEERING' | 'STANDBY' | 'DOWN';
  uptime: number;
  alarms: number;
  trendPct: number | null;
  history: number[];
  lastMaint: string;
  photo: string;
  fileProgress: number;
  isCheckboxDisable?: boolean;
  checkboxDisableReason?: string;
  isEditing?: boolean;
  hasEditError?: boolean;
}

const STATUSES: ToolRow['status'][] = ['PRODUCTION', 'ENGINEERING', 'STANDBY', 'DOWN'];
const FABS = ['Fab-A', 'Fab-B', 'Fab-C'];
const SERIES_LABEL: Record<(typeof SERIES_COLOR_ORDER)[number], string> = {
  action: 'Action', accent: 'Accent', info: 'Info', success: 'Success', warning: 'Warning', error: 'Error'
};

function mockRows(n: number): ToolRow[] {
  return Array.from({ length: n }, (_, i) => {
    const uptime = 78 + Math.round(Math.random() * 21);
    return {
      toolId: `KLA-${(1000 + i).toString()}`,
      chamber: `CH-${(i % 4) + 1}`,
      fab: FABS[i % FABS.length],
      status: STATUSES[i % STATUSES.length],
      uptime,
      alarms: Math.round(Math.random() * 40),
      trendPct: i % 7 === 0 ? null : +((Math.random() * 8 - 4).toFixed(1)),
      history: Array.from({ length: 8 }, () => 70 + Math.round(Math.random() * 30)),
      lastMaint: new Date(Date.now() - i * 86_400_000 * 3).toISOString(),
      photo: `https://picsum.photos/seed/tool${i}/64/64`,
      fileProgress: i % 6 === 0 ? Math.round(Math.random() * 90) + 5 : 0
    };
  });
}

/**
 * DEV playground for the Base Module. Every core requirement is exercised here:
 * dynamic columns, pagination, custom cell templates (image / chart / buttons),
 * filtering (global + per column), sticky header, sticky left+right columns,
 * sorting, selection, and event listeners with a live event log.
 */
@Component({
  selector: 'fam-base-playground',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    BaseTableComponent,
    BaseTableViewsComponent,
    BaseCellDirective,
    BaseChildCellDirective,
    BaseKpiCardComponent,
    BaseBadgeComponent,
    BaseBannerComponent,
    BaseAvatarComponent,
    BaseAvatarGroupComponent,
    BaseTrendComponent,
    BaseSparklineComponent,
    BaseBreadcrumbsComponent,
    BaseTabsComponent,
    BaseStepperComponent,
    BaseButtonComponent,
    BaseButtonGroupComponent,
    BaseCardComponent,
    BaseTextInputComponent,
    BaseTextareaComponent,
    BaseSelectComponent,
    BaseCheckboxComponent,
    BaseRadioGroupComponent,
    BaseToggleComponent,
    BaseDatepickerComponent,
    BaseDropdownMenuComponent,
    BaseModalComponent,
    BaseAlertComponent,
    BaseProgressBarComponent,
    BaseSkeletonComponent,
    BaseTooltipDirective,
    BaseComboboxComponent,
    BaseMultiSelectChipsComponent,
    BaseFileUploadComponent,
    BaseSliderComponent,
    BaseRangeSliderComponent,
    BaseSegmentedControlComponent,
    BaseSelectionCardComponent,
    BaseNumericStepperComponent,
    BaseOtpInputComponent,
    BaseColorPickerComponent,
    BaseCheckboxGroupComponent,
    BaseTimePickerComponent,
    BaseDateRangePickerComponent,
    BaseTagComponent,
    BaseChipComponent,
    BaseStatBarComponent,
    BaseListItemComponent,
    BaseAccordionComponent,
    BaseDividerComponent,
    BaseEmptyStateComponent,
    BaseErrorPageComponent,
    BaseLoadingComponent,
    BaseSplitButtonComponent,
    BaseContextMenuComponent,
    BasePopoverComponent,
    BaseNotificationsPanelComponent,
    BaseGlobalSearchComponent,
    BaseDrawerComponent,
    BaseToastHostComponent,
    BaseTrendChartComponent,
    BaseBarChartComponent,
    BaseChartFrameComponent,
    BaseScatterChartComponent,
    BaseHistogramComponent,
    BaseStateHeatmapComponent,
    BaseGanttTimelineComponent,
    BaseHoverCardComponent
  ],
  template: `
    <div class="space-y-5">
      <div class="panel px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <base-breadcrumbs [items]="crumbs" (itemClick)="log('breadcrumb itemClick', $event.item.label)" />
        <base-dropdown-menu label="Bulk actions" align="right" [items]="menuItems"
                            (itemSelect)="log('menu itemSelect', $event.label)" />
      </div>

      <div class="panel px-4 pt-2 pb-4">
        <base-tabs [tabs]="tabs" [(activeId)]="activeTab" (tabSelect)="log('tabSelect', $event.label)" />
        <div class="pt-4">
          @switch (activeTab()) {
            @case ('table') { <p class="text-xs text-slate-500">Table demo below — all six core features live.</p> }
            @case ('forms') {
              <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <base-text-input label="Tool ID" placeholder="e.g. KLA-1042" [(value)]="toolId"
                                 [clearable]="true" hint="Search by exact id"
                                 (enterPressed)="log('text enterPressed', $event)" />
                <base-text-input label="Threshold" type="number" suffix="%" [(value)]="threshold"
                                 [error]="+threshold() > 100 ? 'Must be ≤ 100' : ''" />
                <base-select label="Fab" [options]="fabOptions" [(value)]="fab" [searchable]="true"
                             (optionSelected)="log('select optionSelected', $event.label)" />
                <base-datepicker label="Maintenance date" [(value)]="maintDate"
                                 [min]="minDate" [disabledDates]="noWeekends"
                                 hint="Weekends disabled"
                                 (valueChange)="log('datepicker valueChange', $event ? $event.toDateString() : 'null')" />
                <base-radio-group label="Shift" [options]="shiftOptions" [(value)]="shift" />
                <div class="flex flex-col gap-2.5 pt-1">
                  <base-checkbox label="Email me on unscheduled downtime" [(checked)]="includeEng"
                                 description="Sends within two minutes of the state change, to the address on your profile."
                                 (checkedChange)="log('checkbox checkedChange', '' + $event)" />
                  <base-toggle label="Auto-refresh" [(checked)]="autoRefresh"
                               (checkedChange)="log('toggle checkedChange', '' + $event)" />
                </div>
                <base-textarea class="md:col-span-2" label="Notes" [(value)]="notes" [maxLength]="200"
                               placeholder="Handover notes…" [rows]="2" />
                <base-combobox label="Recipe (type-ahead)" [options]="comboOptions" [(value)]="comboValue"
                               placeholder="Type to search…" hint="Accepts free text too"
                               (optionSelected)="log('combobox optionSelected', $event.label)" />
                <base-multi-select-chips label="Fabs" [options]="multiSelectOptions" [(value)]="multiSelectValue"
                                         hint="Three of nine segments selected." />
                <base-checkbox-group label="Machine state" [options]="machineStateOptions" [(value)]="machineStateValue" />
                <base-slider label="Alert threshold" [min]="0" [max]="100" unit="%" [showValueBubble]="true" [(value)]="sliderValue" />
                <base-range-slider label="Maintenance window" [min]="0" [max]="24" unit="h" [(value)]="maintWindow" />
                <base-numeric-stepper label="Retry limit" [min]="0" [max]="20" [(value)]="retryLimit" />
                <base-time-picker label="Shift start" [(value)]="shiftStart" />
                <base-color-picker label="Segment colour" [(value)]="segmentColor"
                                   hint="Free-form hex entry is deliberately absent." />
                <base-otp-input class="md:col-span-2 xl:col-span-3" label="One-time passcode" [(value)]="otpValue"
                                hint="Sent to the authenticator on your badge."
                                (completed)="log('otp completed', $event)" />
                <base-selection-cards class="md:col-span-2 xl:col-span-3" label="Selection cadence"
                                      [options]="selectionCardOptions" [(value)]="selectionCardValue" />
                <base-segmented-control [options]="segmentOptions" [(value)]="segment" ariaLabel="Time bucket" />
                <base-date-range-picker [(value)]="dateRange" (applied)="log('dateRangePicker applied', $event.preset)" />
                <base-file-upload class="md:col-span-2 xl:col-span-3" label="Recipe file" accept="JSON, XML"
                                  [acceptTypes]="['application/json', 'text/xml', 'application/xml']" [maxSizeMb]="20"
                                  [(files)]="uploadFiles" (filesAdded)="log('fileUpload filesAdded', $event.length + ' file(s)')" />
                <div class="flex items-end gap-2 flex-wrap">
                  <base-button variant="primary" (clicked)="openModal.set(true)">Open modal</base-button>
                  <base-button variant="destructive" (clicked)="openDeleteModal.set(true)">Delete tool</base-button>
                  <base-button variant="secondary" baseTooltip="I am a tooltip" tooltipPosition="top">Hover me</base-button>
                  <base-button variant="secondary" [iconOnly]="true" ariaLabel="MTBF definition"
                               baseTooltip="Total production hours divided by the number of unscheduled downtime events in the same window."
                               tooltipTitle="Mean time between failures" tooltipPosition="bottom">ⓘ</base-button>
                  <base-button variant="tertiary">View details</base-button>
                  <base-button variant="outline">Compare</base-button>
                  <base-button variant="text">Reset filters</base-button>
                  <base-button variant="success" (clicked)="log('button', 'approve qual')">Approve qual</base-button>
                  <base-button variant="warning" (clicked)="log('button', 'force sync')">Force sync</base-button>
                  <base-button variant="danger" [loading]="saving()" (clicked)="fakeSave()">Save</base-button>
                  <base-split-button [items]="splitButtonItems" (clicked)="log('splitButton clicked', 'primary')"
                                     (itemSelect)="log('splitButton itemSelect', $event.label)">More actions</base-split-button>
                  <base-split-button variant="secondary" [items]="splitButtonItems" (clicked)="log('splitButton clicked', 'primary')"
                                     (itemSelect)="log('splitButton itemSelect', $event.label)">Assign</base-split-button>
                  <base-button-group [items]="viewGroupItems" [activeId]="viewGroupActiveId()"
                                     (itemClick)="viewGroupActiveId.set($event.id); log('buttonGroup itemClick', $event.label)" />
                  <base-button variant="primary" shape="pill" [iconOnly]="true" ariaLabel="Add tool"
                               (clicked)="log('fab', 'add tool')">+</base-button>
                </div>
              </div>
            }
            @case ('feedback') {
              <div class="space-y-5 max-w-2xl">
                <div class="space-y-2">
                  <base-banner kind="info" title="Scheduled maintenance Saturday 09 August, 02:00–06:00 UTC."
                               message="FleetPack will be read-only for the duration." actionLabel="Details" [dismissible]="true"
                               (action)="log('banner action', 'details')" (dismissed)="log('banner dismissed', 'info')" />
                  <base-banner kind="warning" title="Telemetry from Fab 3 · Leuven has been unavailable since 04:12."
                               message="Availability figures for that site are stale." actionLabel="Check feed status"
                               (action)="log('banner action', 'check feed status')" />
                </div>

                <div class="space-y-3">
                  <base-alert kind="info" title="Heads up" message="CDC sync runs every 5 minutes." [dismissible]="true"
                              (dismissed)="log('alert dismissed', 'info')" />
                  <base-alert kind="success" message="Fleet snapshot exported." />
                  <base-alert kind="warning" title="Three tools are drifting toward their control limits"
                              message="Chamber pressure has trended upward for six consecutive days." [dismissible]="true"
                              actionLabel="Review drift" secondaryActionLabel="Snooze 24 h"
                              (action)="log('alert action', 'review drift')" (secondaryAction)="log('alert secondaryAction', 'snooze 24h')" />
                  <base-alert kind="error" title="Connection lost" message="Retrying ClickHouse…" />
                  <base-alert kind="neutral" title="This tool is archived"
                              message="Historical data is read-only. Restore the tool to resume telemetry collection."
                              actionLabel="Restore" [actionInline]="true" (action)="log('alert action', 'restore')" />
                  <base-alert kind="warning" message="2 filters are hiding 187 rows." actionLabel="Clear filters" [compact]="true"
                              (action)="log('alert action', 'clear filters')" />
                  <base-progress-bar label="Recomputing availability" [value]="62" tone="action" />
                  <base-progress-bar label="Qualification complete" [value]="100" tone="success" />
                  <base-progress-bar label="Sync stalled" [value]="34" tone="warning" />
                  <base-progress-bar label="Waiting for the telemetry service" [value]="0" tone="action" [indeterminate]="true" />
                  <div class="flex items-center gap-3">
                    <base-skeleton width="40px" height="40px" shape="circle" />
                    <div class="flex-1 space-y-2">
                      <base-skeleton width="60%" />
                      <base-skeleton width="90%" />
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <base-loading message="Loading fleet snapshot…" />
                    <base-loading [compact]="true" size="sm" message="" variant="spinner" />
                    <base-loading [compact]="true" size="md" message="" variant="dots" />
                    <base-button variant="secondary" (clicked)="showToast()">Show toast</base-button>
                    <base-button variant="secondary" (clicked)="showUndoToast()">Show toast w/ undo</base-button>
                  </div>

                  <div class="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    <base-kpi-card label="Fleet Uptime" [value]="96.4" unit="%" [trendPct]="2.1" />
                    <base-kpi-card label="Open Alarms" [value]="47" unit="" [trendPct]="0" />
                    <base-kpi-card label="Predicted Downtime" value="" errorMessage="The forecast service didn't respond."
                                   (retry)="log('kpi retry', 'Predicted Downtime')" />
                  </div>
                </div>

                <base-divider label="Data display" />

                <div class="flex flex-wrap items-center gap-2">
                  <base-badge label="Production" tone="success" [dot]="true" />
                  <base-badge label="Passing" tone="success" [solid]="true" />
                  <base-badge label="Square" tone="action" shape="square" />
                  <base-badge label="Large" tone="warning" size="lg" />
                  <base-badge [count]="47" tone="action" />
                  <base-badge [count]="140" tone="error" />
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <base-tag label="Fleet A" icon="🏷" />
                  <base-tag label="Q3 Review" />
                  <base-tag label="Metrology" [dot]="true" />
                  <base-tag label="M. Okonkwo" icon="👤" [removable]="true" (removed)="log('tag removed', 'M. Okonkwo')" />
                  <base-tag label="Archived" [disabled]="true" />
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <base-chip label="Status: Active" (removed)="log('chip removed', 'Status: Active')" />
                  <base-chip label="Locked" [removable]="false" />
                  @for (o of filterChipOptions; track o) {
                    <base-chip [label]="o" [removable]="false" [selectable]="true" [selected]="activeFilterChips().has(o)"
                               (clicked)="toggleFilterChip(o)" />
                  }
                  @for (o of choiceChipOptions; track o) {
                    <base-chip [label]="o" [removable]="false" [selectable]="true" [selected]="choiceChipValue() === o"
                               (clicked)="choiceChipValue.set(o)" />
                  }
                </div>

                <div class="flex items-center gap-4">
                  <base-avatar name="Maria Okonkwo" />
                  <base-avatar name="Jamie Reyes" size="lg" />
                  <base-avatar-group [items]="avatarGroupItems" [max]="4" />
                </div>

                <base-stat-bar [stats]="statBarSample" />

                <div class="panel divide-y divide-neutral-100">
                  <base-list-item label="ARC-07 · Chamber Interlock" subLabel="Fab 8 · Dresden · 4h 12m" icon="⚠"
                                  (itemClick)="log('listItem itemClick', 'ARC-07')">
                    <base-badge status label="Unscheduled" tone="error" />
                  </base-list-item>
                  <base-list-item label="EDR-11 · Preventive Maintenance" subLabel="Fab 21 · Chandler · 6h 00m" icon="🔧"
                                  (itemClick)="log('listItem itemClick', 'EDR-11')">
                    <base-badge status label="Scheduled" tone="warning" />
                  </base-list-item>
                  <base-list-item label="SP7-04 · Recipe Calibration" subLabel="Fab 12 · Hillsboro · 1h 45m" icon="📋"
                                  (itemClick)="log('listItem itemClick', 'SP7-04')">
                    <base-badge status label="Engineering" tone="action" />
                  </base-list-item>
                </div>

                <base-accordion title="Chamber A" icon="⚙" [open]="true">
                  <base-badge status label="Passing" tone="success" [dot]="true" />
                  Pressure, temperature and flow all inside control limits for the last 14 days.
                  Next qualification due 2026-08-11.
                </base-accordion>
                <base-accordion title="What counts as a Gap?">
                  A Gap is any interval with no reported machine state — distinct from Standby, which is a reported state.
                </base-accordion>

                <div class="grid md:grid-cols-3 gap-4">
                  <div class="panel">
                    <base-empty-state kind="no-data" title="No tools registered"
                                      hint="Register your first tool to start collecting state telemetry."
                                      actionLabel="+ Register tool" actionVariant="primary"
                                      (action)="log('emptyState action', 'register tool')" />
                  </div>
                  <div class="panel">
                    <base-empty-state kind="no-results" title='No tools match "surfscan xr"'
                                      hint="Check the spelling, or clear the two active filters to widen the search."
                                      actionLabel="Clear filters" secondaryActionLabel="Clear search"
                                      (action)="log('emptyState action', 'clear filters')"
                                      (secondaryAction)="log('emptyState secondaryAction', 'clear search')" />
                  </div>
                  <div class="panel">
                    <base-empty-state kind="out-of-range" title="No data in this window"
                                      hint="SP7-04 reported no state changes between 06 and 17 July. Widen the window to see earlier activity."
                                      actionLabel="Widen to 90 days" (action)="log('emptyState action', 'widen to 90 days')" />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div class="panel">
                    <base-error-page code="404" title="That tool isn't in this fleet"
                                     message="Tool SP7-99 doesn't exist, or it was archived and removed from the Fab 12 inventory."
                                     actionLabel="Back to fleet inventory" secondaryActionLabel="Search all sites"
                                     (action)="log('errorPage action', 'back to fleet inventory')" />
                  </div>
                  <div class="panel">
                    <base-error-page code="500" tone="error" title="The telemetry service isn't responding"
                                     message="This is on our side. The last successful sync was at 08:42 UTC, so figures shown elsewhere may be stale."
                                     actionLabel="↻ Retry" secondaryActionLabel="Status page" traceId="trc_9f2a4e1c-0842"
                                     (action)="log('errorPage action', 'retry')" />
                  </div>
                </div>
              </div>
            }
            @case ('navigation') {
              <div class="space-y-5 max-w-2xl">
                <div class="panel p-4 space-y-2">
                  <span class="panel-title">Tabs — underline, pills, vertical</span>
                  <base-tabs [tabs]="alarmStatusTabs" [(activeId)]="alarmStatusActiveId" variant="pills"
                             (tabSelect)="log('tabs tabSelect', $event.label)" />
                  <div class="panel p-2 max-w-[180px]">
                    <base-tabs [tabs]="settingsTabs" [(activeId)]="settingsTabActiveId" variant="vertical"
                               (tabSelect)="log('tabs tabSelect', $event.label)" />
                  </div>
                </div>

                <div class="panel p-4 space-y-3">
                  <base-stepper [steps]="stepperSteps" [(activeId)]="stepperActiveId"
                                (stepSelect)="log('stepper stepSelect', $event.step.label)" />
                  <div class="flex items-center gap-2">
                    <base-button variant="secondary" [disabled]="stepperIndex() <= 0" (clicked)="stepperBack()">Back</base-button>
                    <base-button variant="primary" [disabled]="stepperIndex() >= stepperSteps.length - 1"
                                 (clicked)="stepperNext()">Next</base-button>
                  </div>
                </div>
                <div class="panel p-4 max-w-xs">
                  <base-stepper [steps]="qualificationSteps" [(activeId)]="qualificationActiveId" orientation="vertical"
                                (stepSelect)="log('stepper stepSelect', $event.step.label)" />
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <base-popover>
                    <button trigger class="btn-secondary">Column options</button>
                    <div panel class="p-sp-4 w-56 space-y-2">
                      <base-checkbox label="Show photo column" />
                      <base-checkbox label="Show chamber column" />
                    </div>
                  </base-popover>
                  <base-hover-card>
                    <a trigger class="text-xs font-semibold text-action hover:text-action-hover underline underline-offset-2 cursor-pointer">SP7-04</a>
                    <div card class="w-64">
                      <div class="flex items-center gap-2.5 mb-3">
                        <base-avatar name="SP" size="md" />
                        <div>
                          <p class="text-xs font-semibold text-ink-900">SP7-04</p>
                          <p class="text-[11px] text-neutral-400">Fab 12 · Inspection</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 mb-3">
                        <base-badge label="Production" tone="success" [dot]="true" />
                        <base-badge label="Passed" tone="neutral" />
                      </div>
                      <div class="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100">
                        <div><p class="text-xs font-semibold text-ink-900 tabular-nums">98.4%</p><p class="text-[10px] text-neutral-400">Up-time</p></div>
                        <div><p class="text-xs font-semibold text-ink-900 tabular-nums">128 h</p><p class="text-[10px] text-neutral-400">MTBF</p></div>
                        <div><p class="text-xs font-semibold text-ink-900 tabular-nums">1</p><p class="text-[10px] text-neutral-400">Open alarm</p></div>
                      </div>
                    </div>
                  </base-hover-card>
                  <base-button variant="secondary" (clicked)="drawerOpen.set(true)">Open drawer</base-button>
                  <base-button variant="secondary" (clicked)="bulkActionsOpen.set(true)">Open bottom drawer</base-button>
                  <base-dropdown-menu label="Tool actions" [items]="toolActionsItems"
                                      (itemSelect)="log('dropdownMenu itemSelect', $event.label)" />
                </div>

                <div class="border border-dashed border-neutral-200 rounded-r-md px-sp-4 py-sp-6 text-center text-xs text-neutral-400"
                     (contextmenu)="contextMenuRef?.openAt($event.clientX, $event.clientY); $event.preventDefault()">
                  Right-click anywhere in this box to open a context menu
                </div>
                <base-context-menu #contextMenu [items]="contextMenuItems" (itemSelect)="log('contextMenu itemSelect', $event.label)" />

                <div class="bg-surface-inverse p-6 rounded-r-md flex flex-wrap items-center justify-between gap-3">
                  <base-global-search [results]="globalSearchResults" (resultSelect)="log('globalSearch resultSelect', $event.label)" />
                  <base-notifications-panel [notifications]="notifications"
                                            (itemClick)="log('notificationsPanel itemClick', $event.title)"
                                            (markAllRead)="log('notificationsPanel', 'mark all read')" />
                </div>
              </div>
            }
            @case ('charts') {
              <div class="grid md:grid-cols-2 gap-5">
                <div class="panel p-4">
                  <p class="panel-title mb-2">Trend chart</p>
                  <base-trend-chart [data]="trendChartData" [target]="95" seriesLabel="Uptime %" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Scatter chart</p>
                  <base-scatter-chart [data]="scatterChartData" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Histogram</p>
                  <base-histogram [bins]="histogramBins" />
                </div>
                <div class="panel p-4">
                  <p class="panel-title mb-2">Series order</p>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-600">
                    @for (s of seriesOrderLegend; track s.label; let i = $index) {
                      <span class="flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-r-xs" [style.background]="s.colorVar"></i>{{ i + 1 }} · {{ s.label }}</span>
                    }
                  </div>
                  <p class="text-[11px] text-neutral-400 mt-2">A seventh series wraps back to the first color — the signal a chart is doing too much.</p>
                </div>

                <base-chart-frame title="Downtime events" subtitle="Per month · fleet total" class="md:col-span-2">
                  <div chart>
                    <base-bar-chart [data]="barChartData" />
                    <div class="flex items-center gap-4 mt-2 text-[11px] text-ink-600">
                      <span class="flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-r-xs bg-error"></i>Worst month</span>
                      <span class="flex items-center gap-1.5"><i class="inline-block w-2.5 h-2.5 rounded-r-xs bg-success"></i>Best month</span>
                    </div>
                  </div>
                  <table table class="w-full text-xs text-left">
                    <thead><tr class="text-neutral-400 text-[10px] uppercase tracking-wide"><th class="pb-1">Month</th><th class="pb-1 text-right">Events</th></tr></thead>
                    <tbody>
                      @for (d of barChartData; track d.x) {
                        <tr [class]="d.tone === 'error' ? 'text-error font-semibold' : d.tone === 'success' ? 'text-success font-semibold' : ''">
                          <td class="py-0.5">{{ d.x }}</td><td class="text-right tabular-nums">{{ d.y }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </base-chart-frame>

                <base-chart-frame title="Downtime by root cause" subtitle="Hours · last 30 days"
                                  caption="106 hours total · 62% attributable to chamber and handling" class="md:col-span-2">
                  <div chart>
                    <base-bar-chart orientation="horizontal" valueSuffix=" h" [data]="downtimeByCauseData" />
                  </div>
                  <table table class="w-full text-xs text-left">
                    <thead><tr class="text-neutral-400 text-[10px] uppercase tracking-wide"><th class="pb-1">Cause</th><th class="pb-1 text-right">Hours</th></tr></thead>
                    <tbody>
                      @for (d of downtimeByCauseData; track d.x) {
                        <tr><td class="py-0.5">{{ d.x }}</td><td class="text-right tabular-nums">{{ d.y }} h</td></tr>
                      }
                    </tbody>
                  </table>
                </base-chart-frame>

                <base-chart-frame title="State heatmap · SP7-04" subtitle="Two-hour blocks · last 7 days"
                                  exportLabel="Export" [showTableToggle]="false" class="md:col-span-2"
                                  (exportClick)="log('chartFrame export', 'state heatmap')">
                  <div chart>
                    <base-state-heatmap [rows]="heatmapRows" [columns]="heatmapColumns" />
                  </div>
                </base-chart-frame>

                <base-chart-frame title="Activity gantt" subtitle="Five tools · 24 hours · Fab 12"
                                  exportLabel="Export" [showTableToggle]="false" class="md:col-span-2"
                                  (exportClick)="log('chartFrame export', 'activity gantt')">
                  <div chart>
                    <base-gantt-timeline [rows]="ganttRows" />
                  </div>
                </base-chart-frame>
              </div>
            }
          }
        </div>
      </div>

      <base-modal [(open)]="openModal" title="Edit tool" icon="edit" size="md" (closed)="log('modal closed', $event)">
        <div class="space-y-3">
          <base-text-input label="Tool ID" [(value)]="toolId" />
          <base-datepicker label="Next maintenance" [(value)]="maintDate" />
        </div>
        <div footer class="flex gap-2">
          <base-button variant="secondary" (clicked)="openModal.set(false)">Cancel</base-button>
          <base-button variant="primary" (clicked)="openModal.set(false); log('modal', 'saved')">Save</base-button>
        </div>
      </base-modal>

      <!-- Destructive is deliberate: names the object, quantifies the loss, requires a typed confirmation. -->
      <base-modal [(open)]="openDeleteModal" title="Delete {{ toolId() }}?" subtitle="This cannot be undone."
                  icon="delete" iconTone="error" size="sm" [destructive]="true"
                  (closed)="deleteConfirmText.set(''); log('modal closed', $event)">
        <div class="space-y-3">
          <p>
            Deleting this tool removes <b class="text-ink-900">14 months of state history</b>, 38 downtime events
            and its qualification record. Availability figures will be recalculated without it.
          </p>
          <base-alert kind="warning" message="Two open alarms are attached to this tool." [compact]="true" />
          <base-text-input [label]="'Type ' + toolId() + ' to confirm'" [(value)]="deleteConfirmText" [placeholder]="toolId()" />
        </div>
        <div footer class="flex gap-2">
          <base-button variant="secondary" (clicked)="openDeleteModal.set(false)">Cancel</base-button>
          <base-button variant="destructive" [disabled]="deleteConfirmText() !== toolId()"
                       (clicked)="openDeleteModal.set(false); removeRow(toolId()); deleteConfirmText.set('')">Delete tool</base-button>
        </div>
      </base-modal>

      <base-drawer [(open)]="drawerOpen" title="Tool inspector" icon="settings" side="right" width="400px"
                   (closed)="log('drawer closed', $event)">
        <div class="px-sp-5 py-sp-4 space-y-2 text-xs text-ink-600">
          <p><b class="text-ink-900">Tool ID:</b> {{ toolId() }}</p>
          <p>Drawers keep the current view in place — reach for one instead of a modal when the task doesn't need to leave the page.</p>
        </div>
        <div footer class="flex gap-2">
          <base-button variant="secondary" (clicked)="drawerOpen.set(false)">Close</base-button>
        </div>
      </base-drawer>

      <!-- Bottom drawer — action sheet at the compact breakpoint, where a side drawer would leave nothing visible. -->
      <base-drawer [(open)]="bulkActionsOpen" title="Bulk actions · {{ selectedCount() }} tools" side="bottom"
                   (closed)="log('drawer closed', $event)">
        <div class="py-2 text-xs text-ink-600">
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors"
                  (click)="bulkActionsOpen.set(false); log('bulkAction', 'assign to fleet segment')">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">bookmark_add</span>
            Assign to a fleet segment
          </button>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors"
                  (click)="bulkActionsOpen.set(false); log('bulkAction', 'set availability threshold')">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">tune</span>
            Set availability threshold
          </button>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 hover:bg-neutral-50 transition-colors"
                  (click)="bulkActionsOpen.set(false); log('bulkAction', 'export selection')">
            <span class="icon-outline text-neutral-400" style="font-size:18px;" aria-hidden="true">file_download</span>
            Export selection
          </button>
          <div class="border-t border-neutral-100 my-1"></div>
          <button type="button" class="w-full text-left px-sp-5 py-sp-3 flex items-center gap-2.5 text-error hover:bg-error-surface transition-colors"
                  (click)="bulkActionsOpen.set(false); log('bulkAction', 'archive')">
            <span class="icon-outline" style="font-size:18px;" aria-hidden="true">archive</span>
            Archive {{ selectedCount() }} tools
          </button>
        </div>
      </base-drawer>

      <base-toast-host />

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fleet Uptime" [value]="94.2" unit="%" [trendPct]="1.8" [accent]="true" />
        <base-kpi-card label="Active Alarms" [value]="128" unit="" [trendPct]="0" sub="12 equipment safety" />
        <base-kpi-card label="Tools In Qual" [value]="12" unit="" [trendPct]="3" sub="of 214 monitored" />
        <base-kpi-card label="MTTR" [value]="3.4" unit="h" [trendPct]="null" [clickable]="true"
                       (cardClick)="log('kpi cardClick', 'MTTR')" />
      </div>

      <!-- accent rail — colored left border encodes threshold state without a second colour on the number -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <base-kpi-card label="Fab 12 · Hillsboro" [value]="98.2" unit="%" railTone="success" sub="Above 95% target" />
        <base-kpi-card label="Fab 21 · Chandler" [value]="92.7" unit="%" railTone="warning" sub="Below 95% target" />
        <base-kpi-card label="Fab 8 · Dresden" [value]="76.9" unit="%" railTone="error" sub="Breach — 3 tools down" />
        <base-kpi-card label="Fab 3 · Leuven" value="—" railTone="info" sub="No telemetry since 04:12" />
      </div>

      <!-- base-card: icon+title header, projected body, footer row (link + status) -->
      <div class="grid md:grid-cols-3 gap-4">
        <base-card title="Availability model" icon="show_chart" iconTone="action">
          How production, engineering and standby time roll up into a single up-time figure.
          <div footer>
            <base-button variant="text" (clicked)="log('card action', 'read the method')">Read the method</base-button>
          </div>
        </base-card>
        <base-card title="Chamber A" icon="settings" [clickable]="true" (cardClick)="log('card cardClick', 'Chamber A')">
          <span actions class="text-neutral-300">⋮</span>
          Rolling 30-day availability with the current qualification window highlighted.
          <div footer>
            <base-button variant="text">Open deep dive</base-button>
            <base-badge label="Production" tone="success" [dot]="true" />
          </div>
        </base-card>
        <base-card title="This week">
          <span actions class="text-[10px] font-bold uppercase tracking-wide text-action bg-action-surface px-sp-2 py-0.5 rounded-r-full">Summary</span>
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between"><span>Downtime events</span><span class="font-semibold text-ink-900">31</span></div>
            <div class="flex justify-between"><span>Mean time to repair</span><span class="font-semibold text-ink-900">2.4 h</span></div>
            <div class="flex justify-between"><span>Quals passed</span><span class="font-semibold text-success">9 / 11</span></div>
          </div>
        </base-card>
      </div>

      <!-- toolbar demoing dynamic columns + new spec features -->
      <div class="panel px-4 py-3 flex flex-wrap items-center gap-3">
        <span class="panel-title">Base Table · all features</span>
        <span class="flex-1"></span>
        <button class="btn-ghost" (click)="toggleColumn('photo')">Toggle Photo col</button>
        <button class="btn-ghost" (click)="toggleColumn('history')">Toggle Chart col</button>
        <button class="btn-ghost" (click)="addDynamicColumn()">+ Add column</button>
        <button class="btn-ghost" (click)="highlightRandomRow()">Highlight + scroll to a row</button>
        <button class="btn-ghost" (click)="toggleTableEditable()">
          {{ tableEditable() ? 'Disable' : 'Enable' }} inline edit
        </button>
        <button class="btn-ghost" (click)="toggleTableReadOnly()">
          {{ tableReadOnly() ? 'Disable' : 'Enable' }} read-only mode
        </button>
        <button class="btn-ghost" (click)="simulateRouteLeave()">Simulate route leave (canDeactivate)</button>
        <button class="btn-ghost" (click)="simulateLoading()">Simulate refresh</button>
        <button class="btn-ghost" (click)="simulateError()">Simulate load error</button>
      </div>

      <!-- Saved Views & Filter Rail — fully controlled: this component only renders the rail and
           emits intent. "Modified" here is a proxy driven off sortChange/filterChange/manageColumn
           (see onTableStateChanged) since re-applying a saved view's filter/sort state onto the
           live table needs those to be host-controlled inputs — a natural next step, not done here.
           The filter-chips row below the table's search bar (on by default) shows every active
           checkbox/calendar/range filter as a removable chip plus a non-removable sort chip. -->
      <div class="panel overflow-hidden">
        <base-table-views [views]="tableViews()" [activeViewId]="activeViewId()" [modified]="viewModified()"
                           (activeViewIdChange)="onViewSwitch($event)" (save)="onViewSave($event)"
                           (update)="onViewUpdate()" (reset)="onViewReset()" (copyLink)="onViewCopyLink()" />

        <base-table class="block"
          [columns]="columns()"
          [rows]="rows()"
          trackKey="toolId"
          [showFilterRow]="true"
          [stickyHeader]="true"
          maxHeight="440px"
          minWidth="1550px"
          selectable="multiple"
          [striped]="true"
          [initialPageSize]="10"
          [manageColumns]="true"
          [additionalHeader]="additionalHeader"
          [expandable]="true"
          [childColumns]="childColumns()"
          [childRowsOf]="alarmEventsOf"
          [highlightKey]="highlightedToolId()"
          [readOnly]="tableReadOnly()"
          [loading]="tableLoading()"
          [error]="tableError()"
          errorMessage="The fleet service timed out — the last known page is still shown above."
          [editableRows]="tableEditable()"
          draftId="playground-tool-table"
          [draftAuthorOf]="draftAuthorOf"
          [maxVisibleActions]="2"
          [showSummary]="true"
          #editableTable
          (rowClick)="log('rowClick', $event.row.toolId)"
          (cellClick)="log('cellClick', $event.column.key + ' → ' + $event.row.toolId)"
          (sortChange)="onSort($event); onTableStateChanged()"
          (pageChange)="onPage($event)"
          (filterChange)="onFilter($event); onTableStateChanged()"
          (selectionChange)="selectedCount.set($event.length)"
          (expandChange)="log('expandChange', $event.row.toolId + ' → ' + $event.expanded)"
          (manageColumn)="log('manageColumn', $event.join(', ')); onTableStateChanged()"
          (handleAction)="onHandleAction($event)"
          (cellEdit)="onCellEdit($event)"
          (saveChanges)="onSaveChanges($event)"
          (discardAllChanges)="log('discardAllChanges', '')"
          (draftRestored)="log('draftRestored', '')"
          (draftDiscarded)="log('draftDiscarded', '')"
          (retry)="tableError.set(false); log('table retry', 'reloaded')">

          <!-- CUSTOM CELL TEMPLATE #1: composite cell (image + text + badge) -->
          <ng-template baseCell="toolId" let-row let-value="value">
            <span class="inline-flex items-center gap-2 font-semibold text-slate-700">
              {{ value }}
              @if (row.status === 'DOWN') { <base-badge label="!" colorClass="bg-red-100 text-red-600" /> }
            </span>
          </ng-template>

          <!-- CUSTOM CHILD CELL TEMPLATE: nested table columns accept baseChildCell templates too -->
          <ng-template baseChildCell="event" let-row let-value="value">
            <span class="inline-flex items-center gap-1.5 font-medium text-slate-700">
              @if (row.severity === 'High') { <i class="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></i> }
              {{ value }}
            </span>
          </ng-template>

          <!-- CUSTOM CELL TEMPLATE #2: action buttons -->
          <ng-template baseCell="actions" let-row>
            <span class="inline-flex gap-1">
              <button class="btn-ghost" (click)="log('edit', row.toolId)">Edit</button>
              <button class="btn-ghost text-red-500 hover:text-red-700 hover:bg-red-50"
                      (click)="removeRow(row.toolId)">Delete</button>
            </span>
          </ng-template>
        </base-table>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Event log</span>
          <span class="text-[11px] text-slate-400">{{ selectedCount() }} row(s) selected</span>
        </div>
        <div class="p-4 font-mono text-[11px] text-slate-500 space-y-1 max-h-48 overflow-y-auto">
          @for (e of events(); track $index) { <div>{{ e }}</div> }
          @if (events().length === 0) { <div class="text-slate-300">Interact with the table…</div> }
        </div>
      </div>

      <div class="panel p-4 flex flex-wrap items-center gap-4">
        <base-badge label="PRODUCTION" colorClass="bg-emerald-50 text-emerald-600" [dot]="true" />
        <base-badge label="DOWN" colorClass="bg-red-50 text-red-600" [dot]="true" />
        <base-trend [value]="4.2" />
        <base-trend [value]="-2.1" [badWhenUp]="true" />
        <base-sparkline [data]="[3, 7, 4, 9, 6, 11, 8, 14]" color="#0ea5e9" />
        <span class="text-[11px] text-slate-400">last filter: {{ lastFilter() | json }}</span>
      </div>
    </div>
  `
})
export class BasePlaygroundComponent {
  readonly rows = signal<ToolRow[]>(mockRows(57).map(r => r.status === 'DOWN'
    ? { ...r, isCheckboxDisable: true, checkboxDisableReason: 'Down tools are excluded from bulk actions' }
    : r));
  readonly selectedCount = signal(0);
  readonly events = signal<string[]>([]);
  readonly lastFilter = signal<BaseFilterEvent | null>(null);

  readonly tableEditable = signal(false);
  readonly tableReadOnly = signal(false);
  readonly tableLoading = signal(false);
  readonly tableError = signal(false);

  toggleTableEditable(): void { this.tableEditable.update(v => !v); }
  toggleTableReadOnly(): void { this.tableReadOnly.update(v => !v); }

  simulateLoading(): void {
    this.tableLoading.set(true);
    setTimeout(() => this.tableLoading.set(false), 1500);
  }
  simulateError(): void {
    this.tableError.set(true);
  }

  readonly tableViews = signal<BaseTableView[]>([
    { id: 'all', label: 'All', isDefault: true, count: this.rows().length },
    { id: 'down-tools', label: 'Down tools', pinned: true, count: this.rows().filter(r => r.status === 'DOWN').length },
    { id: 'shared-fab-a', label: 'Fab-A only', pinned: true, shared: true, readOnly: true, count: this.rows().filter(r => r.fab === 'Fab-A').length }
  ]);
  readonly activeViewId = signal('all');
  readonly viewModified = signal(false);

  onTableStateChanged(): void {
    if (!this.viewModified()) this.viewModified.set(true);
  }
  onViewSwitch(id: string): void {
    this.activeViewId.set(id);
    this.viewModified.set(false);
    this.log('table-views switch', id);
  }
  onViewSave(label: string): void {
    const id = `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    this.tableViews.update(v => [...v, { id, label }]);
    this.activeViewId.set(id);
    this.viewModified.set(false);
    this.log('table-views save', label);
  }
  onViewUpdate(): void {
    this.viewModified.set(false);
    this.log('table-views update', this.activeViewId());
  }
  onViewReset(): void {
    this.viewModified.set(false);
    this.log('table-views reset', this.activeViewId());
  }
  onViewCopyLink(): void {
    this.log('table-views copyLink', this.activeViewId());
  }

  onCellEdit(e: BaseCellEditEvent<ToolRow>): void {
    this.rows.update(rows => rows.map(r => r.toolId === e.row.toolId ? { ...r, [e.column.key]: e.value } : r));
    this.log('cellEdit', `${e.column.key} → ${e.value}`);
  }

  /** Who last touched a row on the "server" — purely for the draft-conflict dialog's demo; a real host would look this up from its own audit data. */
  readonly draftAuthorOf = (row: ToolRow): string | null => `J. Reyes, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  /** Simulates a server round-trip: succeeds after a short delay, except the second row in the batch always fails, so the partial-failure path (error fill, values kept, still dirty) is easy to see. */
  onSaveChanges(requests: BaseRowSaveRequest<ToolRow>[]): void {
    this.log('saveChanges', `${requests.length} row(s)`);
    setTimeout(() => {
      const results: BaseRowSaveResult[] = requests.map((r, i) => i === 1
        ? { key: r.key, success: false, error: 'Server rejected Uptime: value out of range' }
        : { key: r.key, success: true });
      this.editableTableRef?.reportSaveResult(results);
      this.log('reportSaveResult', results.map(r => r.success ? 'ok' : 'FAILED').join(', '));
    }, 900);
  }

  /** Stand-in for a router `CanDeactivate` guard calling `confirmLeave()` before an actual navigation. */
  simulateRouteLeave(): void {
    this.editableTableRef?.confirmLeave().then(canLeave => this.log('confirmLeave', canLeave ? 'navigation allowed' : 'navigation blocked (Stay on page)'));
  }

  readonly additionalHeader: AdditionalHeaderGroup[] = [
    { displayName: 'Identity', columnIds: ['toolId', 'photo', 'fab', 'chamber'] },
    { displayName: 'Health', columnIds: ['status', 'healthHeat', 'uptime', 'alarms', 'trendPct', 'history'] }
  ];

  private readonly healthHeatMap: Record<string, string> = {
    PRODUCTION: 'bg-success-surface text-success-hover',
    ENGINEERING: 'bg-action-surface text-action-hover',
    STANDBY: 'bg-warning-surface text-warning-hover',
    DOWN: 'bg-error-surface text-error-hover'
  };

  readonly columns = signal<BaseColumnDef<ToolRow>[]>([
    { key: 'toolId', header: 'Tool ID', sticky: 'left', width: '130px', sortable: true, filterable: true },
    { key: 'photo', header: 'Photo', kind: 'image', width: '70px', imageSize: 36 },
    { key: 'fab', header: 'Fab', kind: 'dot', filterable: true, editable: true, editType: 'select',
      editOptions: FABS.map(f => ({ label: f, value: f })),
      dotClassMap: { 'Fab-A': 'bg-indigo-500', 'Fab-B': 'bg-sky-500', 'Fab-C': 'bg-amber-500' } },
    { key: 'chamber', header: 'Chamber', filterable: true, editable: true, editType: 'text' },
    { key: 'status', header: 'Status', kind: 'badge', sortable: true, filterable: true, filterKind: 'checkbox', summary: 'count',
      badgeClassMap: {
        PRODUCTION: 'bg-emerald-50 text-emerald-600',
        ENGINEERING: 'bg-sky-50 text-sky-600',
        STANDBY: 'bg-amber-50 text-amber-600',
        DOWN: 'bg-red-50 text-red-600'
      } },
    { key: 'healthHeat', header: 'Health', kind: 'heat-cell', width: '110px', value: r => r.status, heatClassMap: this.healthHeatMap },
    { key: 'uptime', header: 'Uptime', kind: 'progress', width: '150px', sortable: true, align: 'left',
      editable: true, editType: 'number', summary: 'mean' },
    { key: 'alarms', header: 'Alarms', kind: 'number', align: 'right', sortable: true, filterable: true, filterKind: 'range',
      summary: 'total', cellClass: r => r.alarms > 30 ? 'text-red-600 font-bold' : '' },
    { key: 'downtimeCost', header: 'Downtime Cost', kind: 'number', align: 'right', sortable: true, width: '130px',
      value: r => Math.round((r.alarms - 14) * 1240), abbreviateNumbers: true, summary: 'total' },
    { key: 'trendPct', header: 'WoW', kind: 'trend', align: 'center', trendBadWhenUp: false },
    { key: 'history', header: '8-run trend', kind: 'sparkline', width: '120px' },
    { key: 'lastMaint', header: 'Last Maint.', kind: 'date', sortable: true, filterable: true, filterKind: 'calendar',
      dateFormat: { day: '2-digit', month: 'short', year: 'numeric' } },
    { key: 'quickActions', header: 'Quick', width: '190px', align: 'right', kind: 'row-actions',
      rowActions: [
        { type: 'view', title: 'View', isHidden: r => !!r.isEditing, run: r => this.log('view', r.toolId) },
        { type: 'edit', title: 'Edit', isHidden: r => !!r.isEditing, isDisabled: r => r.status === 'DOWN',
          run: r => {
            if (this.tableEditable()) { r.isEditing = true; this.log('edit start', r.toolId); }
            else this.log('edit', r.toolId);
          } },
        // No per-row Save action — saving is a whole-table control now (the save bar's
        // "Save N changes"), one of the five controls in the edit-state spec. Exit edit
        // only closes the controls; a dirty row stays dirty and keeps its flagged fill.
        { type: 'cancel', title: 'Exit edit', isHidden: r => !r.isEditing,
          run: r => { r.isEditing = false; this.log('exit edit', r.toolId); } },
        { type: 'download', title: 'Download', isHidden: r => !!r.isEditing, run: r => this.log('download', r.toolId) },
        { type: 'delete', title: 'Delete', isHidden: r => !!r.isEditing || r.status === 'PRODUCTION', run: r => this.removeRow(r.toolId) }
      ] satisfies BaseRowAction<ToolRow>[] },
    { key: 'actions', header: 'Actions', sticky: 'right', width: '140px', align: 'right' }
  ]);

  readonly childColumns = signal<BaseColumnDef<any>[]>([
    { key: 'event', header: 'Alarm Event' },
    { key: 'time', header: 'Time', kind: 'date', dateFormat: { dateStyle: 'short', timeStyle: 'short' } },
    { key: 'severity', header: 'Severity', kind: 'badge',
      badgeClassMap: { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-slate-100 text-slate-500' } },
    { key: 'actions', header: '', align: 'right', width: '90px', kind: 'row-actions',
      rowActions: [
        { icon: '✎', title: 'Edit', variant: 'icon', run: r => this.log('edit alarm event', r['id']) },
        { icon: '🗑', title: 'Delete', variant: 'icon', run: r => this.removeAlarmEvent(r['id']) }
      ] }
  ]);

  private readonly alarmEventsCache = new Map<string, Record<string, unknown>[]>();
  readonly alarmEventsOf = (row: ToolRow): Record<string, unknown>[] => {
    if (row.alarms === 0) return [];
    if (!this.alarmEventsCache.has(row.toolId)) {
      const severities = ['High', 'Medium', 'Low'];
      const count = Math.min(row.alarms, 5);
      this.alarmEventsCache.set(row.toolId, Array.from({ length: count }, (_, i) => ({
        id: `${row.toolId}-EV${i}`,
        event: `Alarm #${i + 1}`,
        time: new Date(Date.now() - i * 3_600_000).toISOString(),
        severity: severities[i % severities.length]
      })));
    }
    return this.alarmEventsCache.get(row.toolId)!;
  };

  private dynamicCount = 0;

  readonly crumbs = [
    { label: 'Home', icon: '🏠', url: '/' },
    { label: 'Fleet Availability' },
    { label: 'Base Playground' }
  ];
  readonly tabs = [
    { id: 'table', label: 'Table' },
    { id: 'forms', label: 'Form controls', badge: 15 },
    { id: 'feedback', label: 'Feedback & data display', badge: 9 },
    { id: 'navigation', label: 'Navigation & overlay', badge: 7 },
    { id: 'charts', label: 'Charts & timeline', badge: 6 },
    { id: 'disabled', label: 'Disabled', disabled: true }
  ];
  readonly activeTab = signal('forms');
  readonly menuItems = [
    { id: 'export', label: 'Export CSV', icon: '📄' },
    { id: 'refresh', label: 'Refresh', icon: '🔄' },
    { id: 'delete', label: 'Delete selected', icon: '🗑', danger: true, dividerBefore: true }
  ];

  readonly toolId = signal('KLA-1042');
  readonly threshold = signal('85');
  readonly notes = signal('');
  readonly fab = signal<string | null>('Fab-A');
  readonly fabOptions = FABS.map(f => ({ label: f, value: f }));
  readonly shift = signal<string | null>('A');
  readonly shiftOptions = [
    { label: 'Shift A', value: 'A' },
    { label: 'Shift B', value: 'B' },
    { label: 'Night', value: 'N', disabled: true }
  ];
  readonly includeEng = signal(true);
  readonly autoRefresh = signal(false);
  readonly maintDate = signal<Date | null>(null);
  readonly minDate = new Date(2026, 0, 1);
  readonly noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  readonly openModal = signal(false);
  readonly openDeleteModal = signal(false);
  readonly deleteConfirmText = signal('');
  readonly saving = signal(false);
  readonly highlightedToolId = signal<string | null>(null);

  readonly comboValue = signal('');
  readonly comboOptions: BaseComboOption[] = FABS.map(f => ({ label: f, value: f }));
  readonly multiSelectValue = signal<string[]>(['Fab-A']);
  readonly multiSelectOptions: BaseComboOption[] = [
    { label: 'Fab-A', value: 'Fab-A' },
    { label: 'Fab-B', value: 'Fab-B' },
    { label: 'Fab-C', value: 'Fab-C' },
    { label: 'Engineering', value: 'Engineering' }
  ];
  readonly sliderValue = signal(65);
  readonly maintWindow = signal<BaseRangeValue>({ from: 6, to: 18 });
  readonly retryLimit = signal(12);
  readonly shiftStart = signal('06:00');
  readonly segmentColor = signal('action');
  readonly otpValue = signal('481');
  readonly machineStateOptions = [
    { label: 'Production', value: 'production' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Standby', value: 'standby' },
    { label: 'Scheduled downtime', value: 'scheduled-dt' },
    { label: 'Unscheduled downtime', value: 'unscheduled-dt' }
  ];
  readonly machineStateValue = signal<string[]>(['production', 'engineering']);
  readonly selectionCardOptions: BaseSelectionCardOption<string>[] = [
    { label: 'Rolling 30 days', value: 'rolling30', description: 'Recalculated nightly at 02:00 local time.' },
    { label: 'Fixed window', value: 'fixed', description: 'Pick an explicit start and end date.' },
    { label: 'Since last qual', value: 'lastqual', description: 'Anchors to the most recent qualification.' }
  ];
  readonly selectionCardValue = signal('rolling30');
  readonly uploadFiles = signal<BaseUploadFile[]>([]);
  readonly segment = signal<string | null>('week');
  readonly segmentOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];
  readonly dateRange = signal<DateRangeValue>({ preset: 'last7', from: null, to: null });
  readonly splitButtonItems: BaseMenuItem[] = [
    { id: 'save-as', label: 'Save as new version', icon: '📄' },
    { id: 'duplicate', label: 'Duplicate', icon: '⧉' },
    { id: 'archive', label: 'Archive', icon: '🗄', dividerBefore: true, danger: true }
  ];
  readonly viewGroupItems = [
    { id: 'trend', label: 'Trend', icon: '📈' },
    { id: 'table', label: 'Table', icon: '▤' },
    { id: 'gantt', label: 'Gantt', icon: '▥' }
  ];
  readonly viewGroupActiveId = signal('table');

  private readonly toastSvc = inject(BaseToastService);
  readonly statBarSample = [
    { value: '94.2%', label: 'Uptime' },
    { value: 128, label: 'Active alarms' },
    { value: '3.4h', label: 'MTTR' }
  ];

  readonly filterChipOptions = ['Unscheduled DT', 'Scheduled DT', 'Engineering', 'Standby'];
  readonly activeFilterChips = signal(new Set(['Unscheduled DT']));
  toggleFilterChip(o: string): void {
    this.activeFilterChips.update(s => {
      const next = new Set(s);
      next.has(o) ? next.delete(o) : next.add(o);
      return next;
    });
    this.log('filterChip toggle', o);
  }

  readonly choiceChipOptions = ['24 hours', '7 days', '30 days', 'Quarter'];
  readonly choiceChipValue = signal('7 days');

  readonly avatarGroupItems: BaseAvatarItem[] = [
    { name: 'Maria Okonkwo' }, { name: 'Jamie Reyes' }, { name: 'Tom Sena' }, { name: 'Priya Nair' }, { name: 'Chen Wei' }
  ];

  showToast(): void {
    this.toastSvc.success('Export complete', 'service_activity.xlsx is ready to download.');
  }

  showUndoToast(): void {
    this.toastSvc.info('3 tools reassigned to Inspection', undefined, {
      actionLabel: 'Undo',
      onAction: () => { this.toastSvc.success('Reassignment undone'); this.log('toast', 'undo'); }
    });
  }

  @ViewChild('contextMenu') contextMenuRef?: BaseContextMenuComponent;
  @ViewChild('editableTable') editableTableRef?: BaseTableComponent<ToolRow>;
  readonly drawerOpen = signal(false);
  readonly bulkActionsOpen = signal(false);
  readonly contextMenuItems: BaseMenuItem[] = [
    { id: 'filter', label: 'Filter by this value', icon: '▽' },
    { id: 'hide', label: 'Hide this column', icon: '⊞' },
    { id: 'group', label: 'Group by site', icon: '⊟' },
    { id: 'copy', label: 'Copy cell', icon: '📋', shortcut: '⌘C', dividerBefore: true }
  ];
  readonly toolActionsItems: BaseMenuItem[] = [
    { id: 'deep-dive', label: 'Open deep dive', icon: '👁', shortcut: 'O' },
    { id: 'thresholds', label: 'Edit thresholds', icon: '✎', shortcut: 'E' },
    { id: 'copy-id', label: 'Copy tool ID', icon: '📋' },
    { id: 'export-history', label: 'Export history', icon: '⬇', dividerBefore: true },
    { id: 'compare', label: 'Compare — select two tools', icon: '⧉', disabled: true },
    { id: 'archive', label: 'Archive tool', icon: '🗄', dividerBefore: true, danger: true }
  ];
  readonly settingsTabs: BaseTabItem[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🛡' }
  ];
  readonly settingsTabActiveId = signal('profile');
  readonly alarmStatusTabs: BaseTabItem[] = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'acknowledged', label: 'Acknowledged' },
    { id: 'resolved', label: 'Resolved' }
  ];
  readonly alarmStatusActiveId = signal('all');
  readonly notifications: BaseNotification[] = [
    { id: 'n1', icon: 'warning', title: 'Fab-B uptime dipped below 90%', time: '4m ago', read: false },
    { id: 'n2', icon: 'check_circle', title: 'Weekly export completed', message: 'service_activity.xlsx', time: '1h ago', read: false },
    { id: 'n3', icon: 'info', title: 'Scheduled maintenance tonight', time: 'Yesterday', read: true }
  ];
  readonly globalSearchResults: BaseSearchResult[] = [
    { id: 'r1', label: 'KLA-1042', type: 'Tool' },
    { id: 'r2', label: 'Fab-A', type: 'Fleet' },
    { id: 'r3', label: 'Alarm Explorer', type: 'Module' }
  ];
  readonly stepperSteps: BaseStepperStep[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'placement', label: 'Placement' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'review', label: 'Review' }
  ];
  readonly stepperActiveId = signal('telemetry');
  readonly stepperIndex = computed(() => this.stepperSteps.findIndex(s => s.id === this.stepperActiveId()));
  readonly qualificationSteps: BaseStepperStep[] = [
    { id: 'baseline', label: 'Baseline captured', description: 'Reference readings recorded' },
    { id: 'qualification', label: 'Running qualification', description: 'Comparing against tolerance band' },
    { id: 'signoff', label: 'Sign-off', description: 'Engineer approval pending' }
  ];
  readonly qualificationActiveId = signal('qualification');

  stepperNext(): void {
    const next = this.stepperSteps[this.stepperIndex() + 1];
    if (next) this.stepperActiveId.set(next.id);
  }

  stepperBack(): void {
    const prev = this.stepperSteps[this.stepperIndex() - 1];
    if (prev) this.stepperActiveId.set(prev.id);
  }

  readonly trendChartData: BaseChartPoint[] = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
    .map((x, i) => ({ x, y: 90 + Math.round(Math.sin(i) * 4 + i * 0.3) }));
  readonly seriesOrderLegend = SERIES_COLOR_ORDER.map(tone => ({ label: SERIES_LABEL[tone], colorVar: `var(--color-${tone})` }));
  readonly barChartData: BaseChartPoint[] = [
    { x: 'Dec', y: 14 }, { x: 'Jan', y: 16 }, { x: 'Feb', y: 27, tone: 'error' }, { x: 'Mar', y: 15 },
    { x: 'Apr', y: 11 }, { x: 'May', y: 10 }, { x: 'Jun', y: 8 }, { x: 'Jul', y: 6, tone: 'success' }
  ];
  readonly downtimeByCauseData: BaseChartPoint[] = [
    { x: 'Chamber', y: 42, tone: 'error' },
    { x: 'Handling', y: 28, tone: 'warning' },
    { x: 'Optics', y: 19, tone: 'accent' },
    { x: 'Software', y: 11, tone: 'action' },
    { x: 'Facilities', y: 6, tone: 'info' }
  ];
  readonly scatterChartData: BaseScatterPoint[] = Array.from({ length: 18 }, () => ({
    x: 10 + Math.round(Math.random() * 80),
    y: 60 + Math.round(Math.random() * 40)
  }));
  readonly histogramBins = [
    { label: '0-1h', count: 12 },
    { label: '1-2h', count: 18 },
    { label: '2-4h', count: 9 },
    { label: '4-8h', count: 5 },
    { label: '8h+', count: 2 }
  ];
  readonly heatmapColumns = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
  readonly heatmapRows: BaseHeatmapRow[] = ['CH-1', 'CH-2', 'CH-3'].map(label => ({
    label,
    cells: this.heatmapColumns.map(col => ({
      col,
      state: (['production', 'engineering', 'standby', 'scheduled-dt', 'unscheduled-dt', 'gap'] as const)[Math.floor(Math.random() * 6)]
    }))
  }));
  readonly ganttRows: BaseGanttRow[] = [
    { label: 'SP7-04', badge: '98.2%', segments: [
      { startHour: 0, endHour: 13, state: 'production' },
      { startHour: 13, endHour: 15, state: 'engineering' },
      { startHour: 15, endHour: 24, state: 'production' }
    ] },
    { label: 'CAN-02', badge: '94.1%', segments: [{ startHour: 0, endHour: 24, state: 'production' }] },
    { label: 'EDR-11', badge: '91.2%', segments: [
      { startHour: 0, endHour: 8, state: 'standby' },
      { startHour: 8, endHour: 24, state: 'production' }
    ] },
    { label: 'ARC-07', badge: '76.9%', segments: [
      { startHour: 0, endHour: 9, state: 'production' },
      { startHour: 9, endHour: 18, state: 'unscheduled-dt', label: 'Chamber interlock' },
      { startHour: 18, endHour: 24, state: 'production' }
    ] },
    { label: 'VOY-19', segments: [], noData: true }
  ];

  fakeSave(): void {
    this.saving.set(true);
    setTimeout(() => { this.saving.set(false); this.log('button', 'save complete'); }, 1200);
  }

  log(name: string, detail: string): void {
    this.events.update(e => [`${new Date().toLocaleTimeString()}  (${name})  ${detail}`, ...e].slice(0, 40));
  }

  onSort(e: BaseSortEvent): void { this.log('sortChange', `${e.key ?? '—'} ${e.direction ?? ''}`); }
  onPage(e: BasePageEvent): void { this.log('pageChange', `page ${e.page} · size ${e.pageSize}`); }
  onFilter(e: BaseFilterEvent): void { this.lastFilter.set(e); this.log('filterChange', JSON.stringify(e)); }
  onHandleAction(e: BaseHandleActionEvent<ToolRow>): void { this.log('handleAction', `${e.actionType} → ${e.row.toolId}`); }

  highlightRandomRow(): void {
    const rows = this.rows();
    if (rows.length === 0) return;
    const row = rows[Math.min(rows.length - 1, 20 + Math.floor(Math.random() * 10))];
    this.highlightedToolId.set(row.toolId);
  }

  toggleColumn(key: string): void {
    this.columns.update(cols => cols.map(c => c.key === key ? { ...c, hidden: !c.hidden } : c));
  }

  addDynamicColumn(): void {
    const n = ++this.dynamicCount;
    this.columns.update(cols => [
      ...cols.slice(0, -1),
      { key: `dyn${n}`, header: `Extra ${n}`, value: r => `${r.chamber}/${n}` },
      cols[cols.length - 1]
    ]);
  }

  removeRow(toolId: string): void {
    this.rows.update(r => r.filter(x => x.toolId !== toolId));
    this.log('delete', toolId);
  }

  removeAlarmEvent(id: unknown): void {
    for (const [toolId, events] of this.alarmEventsCache) {
      if (events.some(e => e['id'] === id)) {
        this.alarmEventsCache.set(toolId, events.filter(e => e['id'] !== id));
        this.log('delete alarm event', String(id));
        return;
      }
    }
  }
}
