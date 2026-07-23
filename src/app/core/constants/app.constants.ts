import { GlobalFilters } from '../models/models';

export interface AuthUser {
  name: string;
  username: string;
  initials: string;
  role: string;
  email: string;
}

export interface DemoAuthUser extends AuthUser {
  password: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const APP_ROUTES = {
  home: '/',
  login: '/login',
  fleetAvailabilityAnalysis: '/fleet-availability/up-time/analysis',
  fleetAvailabilityAvailability: '/fleet-availability/up-time/availability',
  alarmExplorer: '/alarm-explorer',
  fleetConfiguration: '/fleet-configuration',
  fleetProductivity: '/fleet-productivity',
  tqual: '/tqual',
  myReports: '/my-reports',
  innovationLab: '/innovation-lab',
  engineeringUtilities: '/engineering-utilities',
  devComponentCatalog: '/dev/components',
  devBasePlayground: '/dev/base'
} as const;

export const APP_ROUTE_PATHS = {
  root: '',
  wildcard: '**',
  login: 'login',
  fleetAvailabilityAnalysis: 'fleet-availability/up-time/analysis',
  fleetAvailabilityAvailability: 'fleet-availability/up-time/availability',
  heatmap: 'heatmap',
  gantt: 'gantt',
  events: 'events',
  segmentActivities: 'activities',
  alarmExplorer: 'alarm-explorer',
  alarmFleetDetail: 'alarm-explorer/fleet/:fleetId',
  alarmToolAlarms: 'alarm-explorer/fleet/:fleetId/tool/:toolId',
  alarmEvents: 'alarm-explorer/fleet/:fleetId/tool/:toolId/alarm/:alarmId',
  fleetConfiguration: 'fleet-configuration',
  fleetProductivity: 'fleet-productivity',
  tqual: 'tqual',
  myReports: 'my-reports',
  innovationLab: 'innovation-lab',
  engineeringUtilities: 'engineering-utilities',
  devComponentCatalog: 'dev/components',
  devBasePlayground: 'dev/base'
} as const;

export const PLACEHOLDER_ROUTE_PATHS = [
  APP_ROUTE_PATHS.fleetConfiguration,
  APP_ROUTE_PATHS.fleetProductivity,
  APP_ROUTE_PATHS.tqual,
  APP_ROUTE_PATHS.myReports,
  APP_ROUTE_PATHS.innovationLab,
  APP_ROUTE_PATHS.engineeringUtilities
] as const;

export const ROUTE_TITLES = {
  login: 'FAM · Login',
  fleetAvailabilityAnalysis: 'FAM · Fleet Up-Time Analysis',
  fleetAvailabilityAvailability: 'FAM · Fleet Up-Time Availability',
  alarmExplorer: 'FAM · Alarm Explorer',
  alarmFleetDetail: 'FAM · Alarm Explorer · Fleet',
  alarmToolAlarms: 'FAM · Alarm Explorer · Tool',
  alarmEvents: 'FAM · Alarm Explorer · Events',
  devComponentCatalog: 'FAM · Component Catalog',
  devBasePlayground: 'FAM · Base Module Playground'
} as const;

export const APP_BRAND = {
  mark: 'F',
  name: 'FleetPack',
  moduleName: 'FleetPack FAM',
  company: 'KLA Corporation',
  productName: 'Fleet Availability Module',
  version: 'v2.26.1.13100',
  confidentiality: 'KLA Confidential · Need-to-know only',
  copyright: '© 2026 KLA Corporation. All Rights Reserved.',
  sessionPrefix: 'Session'
} as const;

export const AUTH_CONFIG = {
  storageKey: 'fam.auth.session',
  tokenSignature: 'dummy-signature-for-local-development',
  tokenTtlSeconds: 60 * 60 * 8,
  fallbackUsername: 'unknown',
  defaultCredentials: {
    username: 'system-admin',
    password: 'admin123'
  },
  fallbackUser: {
    name: 'System Admin',
    username: 'system-admin',
    initials: 'SA',
    role: 'Administrator',
    email: 'system-admin@fleetpack.local'
  } satisfies AuthUser,
  demoUsers: [
    {
      name: 'System Admin',
      username: 'system-admin',
      initials: 'SA',
      role: 'Administrator',
      email: 'system-admin@fleetpack.local',
      password: 'admin123'
    },
    {
      name: 'Demo User',
      username: 'demo',
      initials: 'DU',
      role: 'Fleet Analyst',
      email: 'demo@fleetpack.local',
      password: 'demo123'
    }
  ] satisfies DemoAuthUser[]
} as const;

export const LOGIN_TEXT = {
  eyebrow: 'Secure operations workspace',
  headline: 'Sign in to monitor fleet health and uptime.',
  description: 'Access live availability views, alarm drill-downs, fleet filters, and engineering reports from one authenticated session.',
  title: 'Login',
  usernameLabel: 'Username',
  passwordLabel: 'Password',
  submitLabel: 'Sign in',
  invalidCredentials: 'Invalid username or password.'
} as const;

export const TOPBAR_TEXT = {
  fleetLabel: 'Fleet',
  durationLabel: 'Duration',
  notificationsTitle: 'Notifications',
  notificationsShortLabel: 'N',
  messagesTitle: 'Messages',
  messagesShortLabel: 'M',
  usernameLabel: 'Username',
  emailLabel: 'Email',
  signOutLabel: 'Sign out',
  rootBreadcrumb: 'Dashboard',
  breadcrumbSeparator: '/',
  breadcrumbReplacements: {
    upTime: 'Up+Time',
    tqual: 'TQual'
  }
} as const;

export const FILTER_OPTIONS = {
  durations: ['Last 4 Weeks', 'Last 13 Weeks', 'Last 52 Weeks'] satisfies GlobalFilters['duration'][]
} as const;

export const SIDEBAR_TEXT = {
  dashboardLabel: 'Dashboard',
  dashboardIcon: '▦',
  settingsLabel: 'Settings',
  settingsIcon: '⚙'
} as const;

export const SHARED_UI_TEXT = {
  loadingDefaultSubject: 'data',
  loadingPrefix: 'Loading',
  trendUpIcon: '▲',
  trendDownIcon: '▼',
  stateLegend: {
    production: 'Production',
    engineering: 'Engineering',
    standby: 'Standby',
    scheduledDowntime: 'Scheduled DT',
    unscheduledDowntime: 'Unscheduled DT',
    gap: 'Gap'
  },
  table: {
    noGroupKey: '__nogroup__',
    noValue: '-',
    rowsSuffix: 'rows',
    previousPage: '‹ Prev',
    nextPage: 'Next ›',
    pagePrefix: 'Page',
    pageConnector: 'of',
    emptyFooter: ''
  }
} as const;

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Modules · Fleet Availability',
    items: [
      { label: 'Up+Time Analysis', path: APP_ROUTES.fleetAvailabilityAnalysis, icon: '↗' },
      { label: 'Up+Time Availability', path: APP_ROUTES.fleetAvailabilityAvailability, icon: '▤' },
      { label: 'Alarm Explorer', path: APP_ROUTES.alarmExplorer, icon: '!' },
      { label: 'Fleet Configuration', path: APP_ROUTES.fleetConfiguration, icon: '⚒' },
      { label: 'Fleet Productivity', path: APP_ROUTES.fleetProductivity, icon: '▲' }
    ]
  },
  {
    heading: 'Workspace',
    items: [
      { label: 'TQual', path: APP_ROUTES.tqual, icon: '✓' },
      { label: 'My Reports', path: APP_ROUTES.myReports, icon: '▧' },
      { label: 'Innovation Lab', path: APP_ROUTES.innovationLab, icon: '✦' },
      { label: 'Engineering Utilities', path: APP_ROUTES.engineeringUtilities, icon: '⌘' }
    ]
  }
];
