import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to request if user is authenticated
    const currentUser = this.authService.getCurrentUser();
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn && currentUser) {
      const token = localStorage.getItem('authToken');
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.'));
        }

        if (error.status === 500) {
          // Internal server error
          console.error('Sunucu hatası:', error);
          return throwError(() => new Error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        }

        if (error.status === 0) {
          // Network error
          return throwError(() => new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.'));
        }

        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }
}
