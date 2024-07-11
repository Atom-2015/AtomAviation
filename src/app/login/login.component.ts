import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { StateService } from '../state/state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  validLogin = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService, // Inject ToastrService
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.stateService.signInAPI(this.loginForm.value).subscribe((res)=>{
      if(res.status === 200){
        this.auth.login()
        console.log("res =====================",res)
        localStorage.setItem("username",this.loginForm.value.email)
        localStorage.setItem("user_type",res.data.user_type)
        this.toastr.success('Login successful!', 'Success');
      } else {
        this.toastr.error('Login failed');
      }
    },()=>  this.toastr.error('Login failed.'))
  } 
}
