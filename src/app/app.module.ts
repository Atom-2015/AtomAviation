import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChecklistDatabaseMap, MapBoxComponent } from './map-box/map-box.component';
import { HeaderComponent } from './header/header.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
// import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
// import {FlatTreeControl} from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import {MatButtonModule} from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrModule } from 'ngx-toastr';
// import {  PracticComponent } from './practic/practic.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UserComponent } from './user/user/user.component';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NewPracticeComponent } from './new-practice/new-practice.component';
import { UserPermissionComponent } from './user-permission/user-permission.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    MapBoxComponent,
    HeaderComponent,
    UploadFileComponent,
    // PracticComponent,
    UserComponent,
    NewPracticeComponent,
    UserPermissionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTreeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSlideToggleModule
    // MatTreeFlatDataSource,
    // MatTreeFlattener
    // BrowserAnimationsModule,  
  ],
  providers: [ ChecklistDatabaseMap],
  bootstrap: [AppComponent]
})
export class AppModule { }
