import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/core.module';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiBaseUrl = inject(API_BASE_URL);

  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isLoadingSignal = signal<boolean>(false);

  // BehaviorSubjects for components that need observables
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Public signals
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        this.setAuthState(user, true);
      } catch (e) {
        this.clearAuthState();
      }
    }
  }

  private setAuthState(user: User | null, isAuthenticated: boolean): void {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(isAuthenticated);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private clearAuthState(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.setAuthState(null, false);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    // For demo purposes, we'll use mock authentication
    // In real app, this would be: return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, credentials)

    return of({
      user: {
        id: 1,
        name: `${credentials.email.split('@')[0]}`,
        email: credentials.email,
        role: 'admin'
      },
      token: 'mock-jwt-token'
    }).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        this.setAuthState(response.user, true);
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Geçersiz email veya şifre'));
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    // For demo purposes, we'll use mock registration
    // In real app, this would be: return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, userData)

    return of({
      user: {
        id: Date.now(),
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: 'user'
      },
      token: 'mock-jwt-token'
    }).pipe(
      tap(response => {
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => new Error('Kayıt işlemi başarısız'));
      })
    );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<AuthResponse | null> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return of(null);
    }

    // For demo purposes, we'll return mock data
    // In real app, this would be: return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/refresh`, { token })

    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return of({
          user,
          token: 'new-mock-jwt-token'
        }).pipe(
          tap(response => {
            localStorage.setItem('authToken', response.token);
          })
        );
      } catch (e) {
        return of(null);
      }
    }

    return of(null);
  }

  // Helper methods
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user ? user.role === role : false;
  }
}
