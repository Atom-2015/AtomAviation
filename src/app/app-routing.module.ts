import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { guardGuard } from './guard.guard';
// import { PracticComponent } from './practic/practic.component';
import { UserComponent } from './user/user/user.component';
import { NewPracticeComponent } from './new-practice/new-practice.component';
import { UserPermissionComponent } from './user-permission/user-permission.component';

const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'login', component: LoginComponent},
  { path: 'user',canActivate: [guardGuard], component: UserComponent },
  { path: "sign-up", component: SignUpComponent  },
  { path: 'map-box', canActivate: [guardGuard] , component: MapBoxComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
