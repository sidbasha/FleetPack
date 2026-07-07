import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  name: string;
  username: string;
  initials: string;
  role: string;
  email: string;
}

interface TokenPayload {
  sub: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  iat: number;
  exp: number;
}

interface AuthSession {
  token: string;
  user: AuthUser;
}

const SESSION_KEY = 'fam.auth.session';
const DUMMY_USERS: Array<AuthUser & { password: string }> = [
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
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession | null>(this.readSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => {
    const token = this.session()?.token;
    return !!token && this.isTokenValid(token);
  });

  login(username: string, password: string): boolean {
    const found = DUMMY_USERS.find(
      user => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
    );

    if (!found) {
      return false;
    }

    const { password: _password, ...user } = found;
    const token = this.createDummyJwt(user);
    const session: AuthSession = { token, user };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
    return true;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.session.set(null);
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;
      return session.token && this.isTokenValid(session.token) ? session : null;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  private createDummyJwt(user: AuthUser): string {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: TokenPayload = {
      sub: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      initials: user.initials,
      iat: now,
      exp: now + 60 * 60 * 8
    };

    return [
      this.base64UrlEncode(header),
      this.base64UrlEncode(payload),
      'dummy-signature-for-local-development'
    ].join('.');
  }

  private isTokenValid(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as TokenPayload;
      return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  private base64UrlEncode(value: unknown): string {
    return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
