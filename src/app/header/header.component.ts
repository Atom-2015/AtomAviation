import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  
  constructor(private router : Router){}
  userType = localStorage.getItem("user_type")
  logOut(){
    this.router.navigate(['/login'])
    localStorage.clear()
  }
}
