import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StateNode {
  id: string;
  state: string;
  cities: CityNode[];
}

export interface User {
  id: string;
  name: string;
  permission:[];
  email: string;
  userType: string;
}

export interface CityNode {
  name: string;
  files?: FileNode[];
}

export interface FileNode {
  tableName: string;
  file: string;
}

@Injectable({
  providedIn: 'root'
})
export class  StateService {
  private apiUrl = 'https://futurelandplans.com/api';
  // private apiUserUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) { }

  signUpAPI(data:any){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    form.append("username", data.name)
    form.append("mail", data.email)
    form.append("password", data.password)

    return this.http.post<any>(`${this.apiUrl}/sign_up/`, form);
  }

  signInAPI(data:any){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    form.append("mail", data.email)
    form.append("password", data.password)
    return this.http.post<any>(`${this.apiUrl}/sign_in/`, form);
  }

  fetchStateAPI(){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    const username:any = localStorage.getItem("username")
    form.append("mail", username)
    return this.http.post<any>(`${this.apiUrl}/user_data_with_permission/`, form);
  }

  fetchUsers(){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    const username:any = localStorage.getItem("username")
    form.append("mail", username)
    return this.http.post<any>(`${this.apiUrl}/fetch_users_table/`, form);
}

  fetchGeoJsonData(value:any){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    form.append("input_tablename", value)
    return this.http.post<any>(`${this.apiUrl}/postgres_to_geo/`, form);
  }

  setAdminPermission(value:any, email:any){
    let form = new FormData() 
    form.append("dbpwd", "1234")
    form.append("usertype", value)
    form.append("mail", email)
    const permission = value === "admin" ? "wrd" : "wr"
    form.append("permission", permission)
    return this.http.post<any>(`${this.apiUrl}/admin_user_per/`, form);  
  }

  shareDataWithUser(checkedData:any, userValues:any){
    let form = new FormData() 
    const username:any = localStorage.getItem("username")
    form.append("dbpwd", "1234")
    form.append("admin_mail", username)
    form.append("mail", userValues.user.email)
    form.append("state_city", JSON.stringify(checkedData))
    console.log(checkedData)
    // form.append("city", checkedData.cities)
    const permission = userValues.user.user_type === "admin" ? "wrd" : "wr"
    form.append("permission", permission)
    return this.http.post<any>(`${this.apiUrl}/share_data_with_permission/`,form);  
  }
}
