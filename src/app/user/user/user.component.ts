import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator'
import { UserPermissionComponent } from 'src/app/user-permission/user-permission.component';
import { MatDialog } from '@angular/material/dialog';
import { StateService } from 'src/app/state/state.service';
// export interface Element {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit{

  constructor(public dialog: MatDialog, public stateService: StateService,){}
  cities:any
  displayedColumns = ['serialNo', 'name', 'email', 'cities','user_type', 'action'];
  dataSource = new MatTableDataSource<any>
  checked = true
  users: any
  ngOnInit(): void {
    this.fetUserData() 
  }

  fetUserData(){
    this.stateService.fetchUsers().subscribe((resp:any)=>{
      console.log("res===================",resp.data)
      this.users = resp.data;
      this.dataSource.data = resp.data.map((user:any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cities: user.permission.flatMap((permission:any) => permission.cities),
        user_type: user?.userType ? user.userType : "user"  
      }));
    })
  }

  extractCities(permissions: any[]) {
    this.cities = permissions.flatMap(permission => permission.cities);
    console.log('All cities:', this.cities);
  }

  edit(row:any){
    console.log(row)
      this.stateService.fetchStateAPI().subscribe((resp:any)=>{
        console.log("resp ==================>>>",resp)
        this.dialog.open(UserPermissionComponent, {
          width: '450px',
          height: '300px',
          data: {
            user:row,
            stateData: resp.data
          }
         }).afterClosed().subscribe(() => {
          this.fetUserData()
      })
      })
  }
  remove(row:any){}

  enableAdmin(event:any,value:any){
    console.log(event,this.checked)
    console.log("value ================>>",value)
    const user = this.users.find((resp:any)=> resp.id === value.id)
      
    if(event.checked){
     user.userType = "admin" 
    } else {
      user.userType = "user"
    }
    this.stateService.setAdminPermission(user.userType, user.email).subscribe()
  }

  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

}
