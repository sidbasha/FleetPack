import { Injectable, computed, signal } from '@angular/core';
import { AUTH_CONFIG, AuthUser } from '../constants/app.constants';

export type { AuthUser } from '../constants/app.constants';

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
    const found = AUTH_CONFIG.demoUsers.find(
      user => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password
    );

    if (!found) {
      return false;
    }

    const { password: _password, ...user } = found;
    const token = this.createDummyJwt(user);
    const session: AuthSession = { token, user };

    localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(session));
    this.session.set(session);
    return true;
  }

  logout(): void {
    localStorage.removeItem(AUTH_CONFIG.storageKey);
    this.session.set(null);
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_CONFIG.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;
      return session.token && this.isTokenValid(session.token) ? session : null;
    } catch {
      localStorage.removeItem(AUTH_CONFIG.storageKey);
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
      exp: now + AUTH_CONFIG.tokenTtlSeconds
    };

    return [
      this.base64UrlEncode(header),
      this.base64UrlEncode(payload),
      AUTH_CONFIG.tokenSignature
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
