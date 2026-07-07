import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor';
import { registerBuiltInWidgets } from './shared/dynamic/register-widgets';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    // Mock API — remove this interceptor (or swap for auth/error interceptors)
    // when integrating a real backend. See the developer guide, §API integration.
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideCharts(withDefaultRegisterables()),
    provideAppInitializer(() => registerBuiltInWidgets())
  ]
};
