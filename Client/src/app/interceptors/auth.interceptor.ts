import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const withAuth =
    token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(withAuth).pipe(
    catchError((err) => {
      if (err.status !== 401 || req.url.includes('/auth/')) {
        return throwError(() => err);
      }
      return from(auth.refreshAccessToken()).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            return throwError(() => err);
          }
          const retry = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retry);
        })
      );
    })
  );
};
