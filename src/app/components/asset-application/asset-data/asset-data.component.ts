import { Component, OnInit } from '@angular/core';
 import Swal from 'sweetalert2/dist/sweetalert2.js';
 import * as moment from 'moment'; 
 import 'moment/locale/es' ; 
import { AuthService } from 'src/app/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-asset-data',
  templateUrl: './asset-data.component.html',
  styleUrls: ['./asset-data.component.sass']
})
export class AssetDataComponent implements OnInit {
   loggedUser: any = {};
   userData: any;
   myDate:any;
   empObj:any;
   assmntData:any;
   isMasterSel:boolean;
   checkedCategoryList:any;
   finalData:any= [];
   isData:any;
   isLoading:boolean;
   authBoolean:boolean;
   privil_eges:any= {};
   bu:any[]=[];
  employeeDeviceForm: FormGroup;
  departments:any[]=[];
  designations:any[]=[];
  filteredManagers: any[] = [];
  managers: any[] = [];
  reportingManager = new FormControl('');
  assets:any[]=[];
  assetList:any[]=[];
  uniqueDepartments: string[] = [];
  filteredAssetList: any[] = [];
uniqueJoiningDate:any[]=[];
 uniqueBu:any[]=[];
 uniqueReportingManagers:any[]=[];
  selectedView: string = 'raiseAsset';
   constructor(private fb: FormBuilder,private authservice:AuthService) {
     this.employeeDeviceForm = this.fb.group({
    empName: ['', Validators.required],
    contactNum: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], 
    bu: ['', Validators.required],
    department: ['', Validators.required],
    designation: ['', Validators.required],
    reportingManager: [''],
    tentativeJoiningDate: ['', Validators.required],
    managerId: ['', Validators.required],
    assetRows: this.fb.array([]) 
  });
   }
   
   ngOnInit(): void {
    this.addRow();
    // this.loggedUser = atob(localStorage.getItem('userData'))
     this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
     this.userData = JSON.parse(this.loggedUser);
    // this.myDate = atob(localStorage.getItem('currentDate'));
     this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
     moment.locale('en');
     
    // let x = atob(localStorage.getItem('privileges'));
     let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
     this.privil_eges =   JSON.parse(x).Rights;  
     let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
     this.empObj = emp[0];   
     
     this.authservice.getBu().subscribe((data)=>{
      this.bu=data;
     });
     this.authservice.getDepartment().subscribe((data)=>{
      this.departments=data;
     });
     this.authservice.getDesignation().subscribe((data)=>{
      this.designations=data;
     });
      this.authservice.getAssetType().subscribe((data)=>{
      this.assets=data;
    });
     this.authservice.getManagers().subscribe(
      (data) => {
        this.managers = data; 
       // console.log("managers",this.managers);
      });
    this.fetchAssetList();
   }

  fetchAssetList(): void {
  const res = { loginId: this.userData.user.empID}; 
  this.authservice.getAssetList(res).subscribe(
    (data) => {
      this.assetList = data; 
      this.filteredAssetList = data; 
      this.uniqueDepartments = [
        ...new Set(data.map((item: any) => item.deptName))
      ]; 
      
      this.uniqueBu = [
        ...new Set(data.map((item: any) => item.buName))
      ]; 
      // this.uniqueReportingManagers = [
      //   ...new Set(data.map((item: any) => item.deptName))
      // ]; 
      // this.uniqueJoiningDate = [
      //   ...new Set(data.map((item: any) => item.deptName))
      // ]; 
    },
    (error) => {
      console.error("Error fetching asset list:", error);
    }
  );

    this.authservice.getAssetList(res ).subscribe(
      (data) => {
        this.assetList = data;
        this.filteredAssetList = data; // Initially show all data
        console.log('Fetched Data:', this.assetList);
      },
      (error) => {
        console.error('Error fetching asset list:', error);
      }
    );
  }


filterTable(selectedDepartment: string): void {
  if (selectedDepartment) {
    this.filteredAssetList = this.assetList.filter(
      (item) => item.deptName === selectedDepartment
    );
  } else {
    this.filteredAssetList = this.assetList; // Reset to show all data
  }
}

   changeView(view: string) {
    this.selectedView = view;
  }
  searchManagers(): void {
    const query = this.reportingManager.value?.trim().toLowerCase();
    if (!query || query.length < 1) {
      this.filteredManagers = [];
      return;
    }
    this.filteredManagers = this.managers.filter((manager) =>
      manager.name.toLowerCase().includes(query)
    );
  }
selectManager(manager: any): void {
  this.reportingManager.setValue(`${manager.id} - ${manager.name}`);
  this.employeeDeviceForm.get('managerId')?.setValue(manager.id);
  this.reportingManager.updateValueAndValidity();
  this.filteredManagers = [];
}
onSubmit(){
   if (this.employeeDeviceForm.invalid) {
    this.employeeDeviceForm.markAllAsTouched(); 
    Swal.fire('Error', 'Please fill in all required fields.', 'error');
    return;
  }
  const empData = {
    empId: this.userData.user.empID, 
    empName: this.employeeDeviceForm.get('empName')?.value,
    department: this.employeeDeviceForm.get('department')?.value,
    bu: this.employeeDeviceForm.get('bu')?.value,
    designation: this.employeeDeviceForm.get('designation')?.value,
    contactNum: this.employeeDeviceForm.get('contactNum')?.value,
   reportingManager: this.employeeDeviceForm.get('managerId')?.value, 
    tentativeJoiningDate: this.employeeDeviceForm.get('tentativeJoiningDate')?.value,
    loginId: this.userData.user.empID 
  };

  const formData = new FormData();
  formData.append('empData', JSON.stringify(empData));
console.log("empData",empData);
  const assets = this.assetRows.controls.map((row) => {
    return {
      assetTypeId: row.get('assetType')?.value, 
      count: row.get('count')?.value,
      remarks: row.get('description')?.value
    };
  });
  formData.append('assets', JSON.stringify(assets));
console.log("assets",assets);
  this.authservice.getRaiseAssets(formData).subscribe(
    (response) => {
      console.log('Assets raised successfully', response);
    },
    (error) => {
      console.error('Error raising assets', error);
    }
  );
}

 onReset(): void {
  this.employeeDeviceForm.reset({
    empName: '',
    department: '',    
    bu: '',           
    designation: '',
    contactNum: '',
    reportingManager: '',
    tentativeJoiningDate: '',
    assetRows: [],  
  });
   this.assetRows.controls.forEach((row) => {
    row.get('assetType')?.setValue('');
  });
}
    get assetRows() {
    return (this.employeeDeviceForm.get('assetRows') as FormArray);
  }

  addRow() {
  const assetRow = this.fb.group({
    assetType: ['',[Validators.required]], 
    count: ['', [Validators.required, Validators.min(1)]],  
    description: ['',[Validators.required]] 
  });
  this.assetRows.push(assetRow);  
}
  removeRow(index: number) {
    if (this.assetRows.length > 1) {
      this.assetRows.removeAt(index);
    } else {
      alert('At least one row is required.');
    }
  }
  allowOnlyDigits(event: KeyboardEvent): void {
  const inputElement = event.target as HTMLInputElement;
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }
  if (inputElement.value.length >= 10) {
    event.preventDefault();
  }
}
 
}
 
 
 
 
  

