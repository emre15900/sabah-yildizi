import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../../shared/services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loadingService = inject(LoadingService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Show loading indicator for API requests (not for assets)
    if (request.url.includes('/api/') || request.url.includes('northwind')) {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (request.url.includes('/api/') || request.url.includes('northwind')) {
          this.loadingService.hide();
        }
      })
    );
  }
}
