import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import {
  FLEETS, buildAlarmEvents, buildAlarmHome, buildAvailability, buildFleetDetail,
  buildSegmentActivities, buildStateSegments, buildToolAlarms, buildUptimeAnalysis, buildUptimeTrend
} from './mock-data';

/**
 * Mock API — intercepts every request to /api/** and returns
 * deterministic in-memory data with a small network-like latency.
 *
 * Endpoints:
 *   GET /api/fleets
 *   GET /api/uptime/analysis?fleet=...
 *   GET /api/uptime/trend?fleet=...
 *   GET /api/uptime/availability?fleet=...
 *   GET /api/tools/state-segments?toolIds=...&startDate=...&endDate=...
 *   GET /api/tools/segment-activities?toolId=...&startTime=...&endTime=...&pageNumber=...&pageSize=...
 *   GET /api/alarms/home
 *   GET /api/alarms/fleets/:fleetId
 *   GET /api/alarms/fleets/:fleetId/tools/:toolId
 *   GET /api/alarms/fleets/:fleetId/tools/:toolId/alarms/:alarmId/events
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = new URL(req.url, 'http://mock.local');
  if (!url.pathname.startsWith('/api/')) return next(req);

  const path = url.pathname.replace(/^\/api\//, '');
  const parts = path.split('/').filter(Boolean);
  const respond = (body: unknown) =>
    of(new HttpResponse({ status: 200, body })).pipe(delay(280 + Math.random() * 320));

  // /api/fleets
  if (path === 'fleets') return respond(FLEETS);

  // /api/uptime/analysis
  if (path === 'uptime/analysis') return respond(buildUptimeAnalysis());

  // /api/uptime/trend
  if (path === 'uptime/trend') return respond(buildUptimeTrend());

  // /api/uptime/availability
  if (path === 'uptime/availability') return respond(buildAvailability());

  // /api/tools/state-segments
  if (parts[0] === 'tools' && parts[1] === 'state-segments') {
    const toolId = url.searchParams.get('toolIds') ?? 'Axion_T2500';
    return respond(buildStateSegments(toolId));
  }

  // /api/tools/segment-activities
  if (parts[0] === 'tools' && parts[1] === 'segment-activities') {
    const toolId = url.searchParams.get('toolId') ?? 'Axion_T2500';
    const startTime = url.searchParams.get('startTime') ?? '1970-01-01T00:00:00.000Z';
    const endTime = url.searchParams.get('endTime') ?? '2999-01-01T00:00:00.000Z';
    const pageNumber = Number(url.searchParams.get('pageNumber') ?? '0');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '500');
    return respond(buildSegmentActivities(toolId, startTime, endTime, pageNumber, pageSize));
  }

  // /api/alarms/home
  if (path === 'alarms/home') return respond(buildAlarmHome());

  // /api/alarms/fleets/:fleetId[...]
  if (parts[0] === 'alarms' && parts[1] === 'fleets' && parts[2]) {
    const fleetId = parts[2];
    if (parts.length === 3) return respond(buildFleetDetail(fleetId));
    if (parts[3] === 'tools' && parts[4]) {
      const toolId = parts[4];
      if (parts.length === 5) return respond(buildToolAlarms(toolId));
      if (parts[5] === 'alarms' && parts[6] && parts[7] === 'events') {
        return respond(buildAlarmEvents(toolId, parts[6]));
      }
    }
  }

  return of(new HttpResponse({ status: 404, body: { error: `Mock API: no route for ${path}` } })).pipe(delay(150));
};
