import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guardGuard: CanActivateFn = (route, state) => {
  //  if (inject(AuthService).isLoggedInFn()) {
  //   console.log("Hwldsidkjfdk")
  //     return true;
  //   } else {
  //     inject(Router).navigate(['/login']);
  //     return false
  //   }
  if (localStorage.getItem('isLoggedIn') === 'true') {
    return true;
  } else {
    inject(Router).navigate(['/login']);
    return false;
  }
};

