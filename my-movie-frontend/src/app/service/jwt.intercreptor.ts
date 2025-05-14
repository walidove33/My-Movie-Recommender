

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (
      request.url.endsWith('/account/login') ||
      request.url.endsWith('/account/register')
    ) {
      return next.handle(request);
    }

    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.authService.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
