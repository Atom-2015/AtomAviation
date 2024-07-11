import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn: boolean = false;

  constructor(private router:Router) { }
  
  login(): boolean {
      this.router.navigate(['/map-box']);
      this.isLoggedIn = true;
      localStorage.setItem('isLoggedIn','true')
      return true;
  }

  logout(): void {
    this.isLoggedIn = false;
  }

  isLoggedInFn(): boolean {
    return this.isLoggedIn;
  }

}
