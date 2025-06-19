import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({  
  selector: 'app-asset-data',
  templateUrl: './asset-data.component.html',
  styleUrls: ['./asset-data.component.sass']
})
export class AssetDataComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  domains:any;
  managerEmp: any = [];
  asset: any[] = [];
  EmployeeSeq: any;
  searchText: string = ''; 
  search: any[] = [];
  isLoading: boolean = false; 
  assetdata:any=[];
  raiseAssetRequestForm: FormGroup;
  buid: any;
  empid: any;
  assets:any=[];
  selectedAssetType: any; 
  constructor(private authService: AuthService, public router: Router, public route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    this.getManagerData();
    this.isLoading=false;
    this.getAssetList(); 
    this.isLoading=true;
    this.raiseAssetRequestForm = this.fb.group({
      items: this.fb.array([]) 
    });
    this.addItem(); 
    this.getDomians();
   this.onClearFilters();
   
  }

  getManagerData() {
    this.isLoading = true; 
    const formdata = new FormData();
    this.empid = this.userData.user.empID;
    this.authService.getEmployeeData(this.empid).subscribe((res: any) => {
      this.managerEmp = res;
      this.search = res;
     // //console.log("manageremp", res);
      this.isLoading = false; 
    });
    this.isLoading = false; 
  }

  selectedEmp: any = null;
  toggleViewMore(emp: any): void {
   //this.isLoading = true; 
   this.onClearFilters();
    ////console.log('Selected Employee:', emp); 
    if(this.selectedEmp === 'king'){
      //this.selectedEmp = emp;
      this.onRaiseButtonClick(emp);
      //this.isLoading = false; 
    }
    else if (this.selectedEmp === emp) {
     // this.isLoading = true; 
      this.selectedEmp = emp;
      //this.isLoading = false; 
    }
     else {
      this.isLoading = true; 
      this.selectedEmp = emp;
      this.EmployeeSeq = emp.EmpId;
      this.buid = emp.BU;
      ////console.log('Selected Emp:', this.selectedEmp);  
      this.authService.getAssignedAssets(this.EmployeeSeq).subscribe((res: any) => {
        this.assets = res;
         
        // alert(res.length);  
       // //console.log("myassets", res);
        if (this.assets.length > 0) {
          this.isLoading = true; 
          this.selectedAssetType = this.assets[0].asset_type_id;
          this.assignAsset(this.assets[0]);  
          this.isLoading = false;
        }

        else if (this.assets.length == 0) {
            this.selectedEmps = 'king';
            //this.selectedEmp = null;
          }
      });
      this.isLoading = false; 
    
    }
  }
  viewMoreClick(event: MouseEvent, emp: any): void {
  event.stopPropagation(); 
  this.toggleViewMore(emp); 
}

  get items() {
    return (this.raiseAssetRequestForm.get('items') as FormArray);
  }

  createItem() {
    return this.fb.group({
      assetType: ['', Validators.required], // Default to the first asset type
      description: ['', Validators.required]
    });
  }
  addItem() {
    const itemGroup = this.createItem(); 
    this.items.push(itemGroup); 
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }
  isRemoveDisabled(index: number): boolean {
    return index === 0; 
  }
  selectedEmps:any;
  onRaiseButtonClick(emp: any): void {
    this.toggleViewMore(emp);
    this.selectedEmps = 'king';
    this.selectedEmp = emp;
    //console.log('Selected Emp for Raise Request:', this.selectedEmp);  
  }
  
  getAssetList() {
    this.isLoading = true; 
    this.authService.getAssetType().subscribe(
      (res: any) => {
        //console.log('Asset List:', res);  
        this.asset = res;  
      //  alert(res.length);  
      this.isLoading = false; 
      },
      (error: any) => {
       // //console.error('Error fetching asset data:', error);
       this.isLoading = false; 
      }
    );
  }

  raiseAssetRequest() {
   // alert(this.EmployeeSeq);
    const items = this.raiseAssetRequestForm.value.items;
    const invalidItem = items.find(item => 
      item.assetType === 0 || isNaN(Number(item.assetType)) || item.description == null || item.description.trim() === ""
    );
    
    if (invalidItem) {
      this.markAllTouched(this.raiseAssetRequestForm);
      Swal.fire({
        title: 'Invalid Item',
        text: 'Please ensure all items have valid asset types and descriptions.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
     // //console.log('Invalid item found:', invalidItem);
      return;
    }
    //console.log('Manager ID:', this.userData.user.empID);
    //console.log('Employee Seq:', this.EmployeeSeq);
    //console.log('BU ID:', this.buid);
  
    const requestBody = {
      managerId: +this.userData.user.empID,
      employeeId: +this.EmployeeSeq,
      buId: +this.buid,
      //description: 'Assign the requested assets',
      items: this.raiseAssetRequestForm.value.items.map(item => ({
        assetTypeId: +item.assetType,
        description: item.description
      }))
    };

   // //console.log('Request Body:', requestBody);
    this.authService.getRaiseRequest(requestBody).subscribe(
      (response: string) => {
        Swal.fire({
          title: 'Success',
          text: 'Request raised successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
       this.onClearFilters();
        const initialItem = this.createItem(); 
        this.items.clear();  
        this.items.push(initialItem); 
        //this.selectedEmp = null;
      },
      (error: HttpErrorResponse) => {
        if (error.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Request raised successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          //this.isLoading = false;
         this.onClearFilters();
          this.selectedEmp = null;
        } else if (error.status === 400) {
          Swal.fire({
            title: 'Invalid Request',
            text: 'Bad request. Please check the data and try again.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        } else if (error.status === 500) {
          Swal.fire({
            title: 'Server Error',
            text: 'Internal server error. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    );
  }

  markAllTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  applySearchFilter() {
    if (!this.searchText) {
      this.managerEmp = this.search;  
      return;
    }
    this.managerEmp = this.search.filter(item => {
      const employeeId = item.EmpId ? item.EmpId.toString().toLowerCase() : ''; 
      const callName = item.Name ? item.Name.toLowerCase() : '';
      return (
        employeeId.includes(this.searchText.toLowerCase()) ||
        callName.includes(this.searchText.toLowerCase()) 
      );
    });
    this.searchText = '';
  }

  

  getDomians(){
    this.authService.getEmailDomains().subscribe((res:any)=>{
   this.domains=res;
   //console.log(res);
    })
  }
  assignAsset(asset: any) {
    this.isLoading = true; 
    this.selectedAssetType = asset.asset_type_id; 
    //console.log("Asset assigned:", asset.asset_type_id);
    this.authService.getAssignedAssetData(asset.asset_type_id, this.EmployeeSeq).subscribe((res: any) => {
      this.assetdata=res;
      this.isLoading = false; 
      //console.log("Assigned asset data:", res);
    }, (error) => {
      //console.error("Error fetching assigned asset data:", error);
      this.isLoading = false; 
    });
    
  }
  goBack() {
    this.selectedEmp = null;   
    this.selectedEmps = '';    
   
  }
  selectedAssets: number[] = [];
  onAssetTypeChange(event: any, index: number) {
    const selectedValue = +event.target.value;
    this.selectedAssets[index] = selectedValue;
  }
   
  getFilteredAssetList(index: number) {
    return this.asset.filter(asset => !this.selectedAssets.includes(asset.assetTypeId) || this.selectedAssets[index] === asset.assetTypeId);
  } 
  onClearFilters() {
    this.items.controls.forEach(item => {
      item.reset({
        assetType: '',  
        description: '' 
      });
    });

  }
  
}
