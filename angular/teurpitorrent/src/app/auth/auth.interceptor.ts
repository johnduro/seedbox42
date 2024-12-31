import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token
      }
    });
  }
  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Navigate to the login page
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );;
};
