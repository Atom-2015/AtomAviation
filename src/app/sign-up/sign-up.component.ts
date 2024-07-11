import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StateService } from '../state/state.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  regForm!: FormGroup;
  signup = false;

  constructor(private fb: FormBuilder, private toastr: ToastrService, private router: Router, private stateService: StateService) { }


  ngOnInit(): void {
    this.initRegForm();
  }

  initRegForm(): void {
    this.regForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    // this.stateService.signUpAPI().subscribe()

    if (this.regForm.valid) {
      this.signup = true;
      this.stateService.signUpAPI(this.regForm.value).subscribe(
        (res) => {
            console.log("res ====================>>>", res);
            this.toastr.success('Sign Up successful!', 'Success');
            this.router.navigate(['/login']);
          },
        (err) => this.toastr.error('plz enter valid details')
    );
    }
    else {
      this.toastr.error('plz enter valid details')
    }
  }
}
