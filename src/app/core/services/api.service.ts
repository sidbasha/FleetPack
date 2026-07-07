import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AlarmEventsResponse, AlarmHomeResponse, AvailabilityResponse,
  FleetAlarmDetailResponse, ToolAlarmDetailResponse, UptimeAnalysisResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  getFleets(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/fleets`);
  }

  getUptimeAnalysis(fleet: string): Observable<UptimeAnalysisResponse> {
    return this.http.get<UptimeAnalysisResponse>(`${this.base}/uptime/analysis`, {
      params: new HttpParams().set('fleet', fleet)
    });
  }

  getAvailability(fleet: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.base}/uptime/availability`, {
      params: new HttpParams().set('fleet', fleet)
    });
  }

  getAlarmHome(): Observable<AlarmHomeResponse> {
    return this.http.get<AlarmHomeResponse>(`${this.base}/alarms/home`);
  }

  getFleetAlarmDetail(fleetId: string): Observable<FleetAlarmDetailResponse> {
    return this.http.get<FleetAlarmDetailResponse>(`${this.base}/alarms/fleets/${fleetId}`);
  }

  getToolAlarms(fleetId: string, toolId: string): Observable<ToolAlarmDetailResponse> {
    return this.http.get<ToolAlarmDetailResponse>(`${this.base}/alarms/fleets/${fleetId}/tools/${toolId}`);
  }

  getAlarmEvents(fleetId: string, toolId: string, alarmId: string): Observable<AlarmEventsResponse> {
    return this.http.get<AlarmEventsResponse>(
      `${this.base}/alarms/fleets/${fleetId}/tools/${toolId}/alarms/${alarmId}/events`
    );
  }
}
