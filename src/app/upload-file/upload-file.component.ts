import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { StateService } from '../state/state.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit{

  constructor(private http: HttpClient, private stateService: StateService,
    @Inject(MAT_DIALOG_DATA ) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadFileComponent>
  ){}

    states = [
      {
        "name": "Andhra Pradesh",
        "cities": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"]
      },
      {
        "name": "Arunachal Pradesh",
        "cities": ["Itanagar"]
      },
      {
        "name": "Assam",
        "cities": ["Guwahati", "Dispur", "Silchar", "Dibrugarh"]
      },
      {
        "name": "Bihar",
        "cities": ["Patna", "Gaya", "Bhagalpur"]
      },
      {
        "name": "Chhattisgarh",
        "cities": ["Raipur", "Bhilai", "Korba"]
      },
      {
        "name": "Goa",
        "cities": ["Panaji", "Margao"]
      },
      {
        "name": "Gujarat",
        "cities": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
      },
      {
        "name": "Haryana",
        "cities": ["Chandigarh", "Gurgaon", "Faridabad"]
      },
      {
        "name": "Himachal Pradesh",
        "cities": ["Shimla", "Dharamshala"]
      },
      {
        "name": "Jharkhand",
        "cities": ["Ranchi", "Jamshedpur", "Dhanbad"]
      },
      {
        "name": "Karnataka",
        "cities": ["Bangalore", "Mysore", "Hubli", "Mangalore"]
      },
      {
        "name": "Kerala",
        "cities": ["Thiruvananthapuram", "Kochi", "Kozhikode"]
      },
      {
        "name": "Madhya Pradesh",
        "cities": ["Bhopal", "Indore", "Gwalior", "Jabalpur"]
      },
      {
        "name": "Maharashtra",
        "cities": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"]
      },
      {
        "name": "Manipur",
        "cities": ["Imphal"]
      },
      {
        "name": "Meghalaya",
        "cities": ["Shillong"]
      },
      {
        "name": "Mizoram",
        "cities": ["Aizawl"]
      },
      {
        "name": "Nagaland",
        "cities": ["Kohima", "Dimapur"]
      },
      {
        "name": "Odisha",
        "cities": ["Bhubaneswar", "Cuttack", "Rourkela"]
      },
      {
        "name": "Punjab",
        "cities": ["Chandigarh", "Amritsar", "Ludhiana", "Patiala"]
      },
      {
        "name": "Rajasthan",
        "cities": ["Jaipur", "Udaipur", "Jodhpur", "Kota"]
      },
      {
        "name": "Sikkim",
        "cities": ["Gangtok"]
      },
      {
        "name": "Tamil Nadu",
        "cities": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"]
      },
      {
        "name": "Telangana",
        "cities": ["Hyderabad", "Warangal"]
      },
      {
        "name": "Tripura",
        "cities": ["Agartala"]
      },
      {
        "name": "Uttar Pradesh",
        "cities": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"]
      },
      {
        "name": "Uttarakhand",
        "cities": ["Dehradun", "Haridwar"]
      },
      {
        "name": "West Bengal",
        "cities": ["Kolkata", "Howrah", "Durgapur", "Siliguri"]
      }
    
    ]
    loading: boolean = false;
    city:any
    form: any;
    inputFile:any;
    fileNotUploaded = true;
  ngOnInit(): void {
    console.log(this.states)

    this.form = this.fb.group({
      name: new FormControl({ value: null, disabled: this.fileNotUploaded }, { validators: [Validators.required] }),
      state: new FormControl({ value: null, disabled: this.fileNotUploaded }, { validators: [Validators.required] }),
      city: new FormControl({ value: null, disabled: this.fileNotUploaded }, { validators: [Validators.required] }),
      tableRows: this.fb.array(this.initTableRows())
    })
  }

  initTableRows(): FormGroup[] {
    return Array(6).fill(null).map(() => this.fb.group({
      column1: [''],
      column2: ['']
    }));
  }

  get tableRows(): FormArray {
    return this.form.get('tableRows') as FormArray;
  }
  
  onSubmit() {
    console.log(this.form.value);
    const tableData = this.form.value.tableRows;
    console.log('Table Data:', tableData);
    const result = tableData
    .filter((item: any) => item.column1 !== "" && item.column2 !== "")
    .map((item: any) => [item.column1, item.column2]);
    this.data.tableData = result;
    this.dialogRef.close(this.data);
    // Process tableData as needed
  }
  

  getState(value:any){
    console.log(value.value.cities)
    this.city = value.value.cities
  }

  getCity(value:any){
    console.log(value.value)
    this.data.name = this.form.value.name
    this.data.state = this.form.value.state.name
    this.data.city = this.form.value.city
  }

  // uploadFile(e:Event){
  //   console.log(e)
  //   const data = e.target.files[0]
  // }

  uploadFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.data.input = input;
    this.fileNotUploaded = false
    this.form.get('name')?.enable();
    this.form.get('state')?.enable();
    this.form.get('city')?.enable();
  }
  
  postData(form:any){
    return   this.http.post<any>(`https://futurelandplans.com/api/kml_postgres/`, form);
  }

  selectedValue!: string;

}
