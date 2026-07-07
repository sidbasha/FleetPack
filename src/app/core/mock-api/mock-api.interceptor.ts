import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import {
  FLEETS, buildAlarmEvents, buildAlarmHome, buildAvailability,
  buildFleetDetail, buildToolAlarms, buildUptimeAnalysis
} from './mock-data';

/**
 * Mock API — intercepts every request to /api/** and returns
 * deterministic in-memory data with a small network-like latency.
 *
 * Endpoints:
 *   GET /api/fleets
 *   GET /api/uptime/analysis?fleet=...
 *   GET /api/uptime/availability?fleet=...
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

  // /api/uptime/availability
  if (path === 'uptime/availability') return respond(buildAvailability());

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
