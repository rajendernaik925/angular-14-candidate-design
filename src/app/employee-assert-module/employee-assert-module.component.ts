import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employee-assert-module',
  templateUrl: './employee-assert-module.component.html',
  styleUrls: ['./employee-assert-module.component.sass']
})
export class EmployeeAssertModuleComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empid: any;
  managerEmp: any = [];
  assets:any=[];
  search:any=[];
  assetdata:any=[];
  searchText: string = ''; 
  statusCode:any=[];
  ItemstatusCode:any=[];
  isLoading: boolean = false; 
  selectedAssetType: any; 
  selectedView: string = '/employeeasset/employeeassets'; 
    private routeSubscription: Subscription;
  constructor(private router:Router,private authService:AuthService) { }

  ngOnInit(): void {
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setSelectedViewBasedOnRoute(this.router.url);
      }
    });
    this.setSelectedViewBasedOnRoute(this.router.url);
    this.setSelectedViewBasedOnRoute(this.router.url);
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    this.getManagerData();
    this.getAssets();
  }
  setSelectedViewBasedOnRoute(url: string): void {
    if (url.includes('/employeeasset/employeeassets')) {
      this.selectedView = '/employeeasset/employeeassets';
    }
    // else if (url.includes('employeehistory')) {
    //   this.selectedView = '/employeeasset/employeehistory'; 
    // }
    else if (url.includes('/employeeasset/employeetable')) {
      this.selectedView = '/employeeasset/employeetable';
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  getManagerData() {
    this.isLoading = true; 
    const formdata = new FormData();
    this.empid = this.userData.user.empID;
    this.authService.getManagerData(this.empid).subscribe((res: any) => {
      this.managerEmp = res;
      this.search=res;
      //console.log("emp", res);
      this.authService.getRmHistorystatus().subscribe((res:any)=>{
        this.statusCode=res;
      })
      this.authService.getRmHistoryItemStatus().subscribe((res:any)=>{
        this.ItemstatusCode=res;
        this.isLoading = false; 
      })
    });
  }
  getStatus(requestStatus: number): string {
    const status = this.statusCode.find((item) => item.code === requestStatus);
    return status ? status.status : 'Unknown'; 
  }
  getItemStatus(ItemStatus:number):string{
    const status = this.ItemstatusCode.find((item) => item.code === ItemStatus);
    return status ? status.status : 'Unknown'; 
  }
  selectedEmp: any = null;
  toggleViewMore(emp: any): void {
    if (this.selectedEmp === emp) {
      this.selectedEmp = null;
    } else {
      this.selectedEmp = emp;
      //console.log("emp-asset", emp);
    }
  }
  goBack() {
    this.selectedEmp = null;  
    this.getManagerData();
  }
  applySearchFilter() {
    if (!this.searchText) {
      this.managerEmp = this.search;  
      return;
    }
    this.managerEmp = this.search.filter(item => {
      const employeeId = item.ManagerId ? item.ManagerId.toString().toLowerCase() : ''; 
      const callName = item.ManagerName ? item.ManagerName.toLowerCase() : '';
      return (
        employeeId.includes(this.searchText.toLowerCase()) ||
        callName.includes(this.searchText.toLowerCase()) 
      );
    });
    this.searchText = '';
  }
 
  AcknowledgeEmployee(item) {
    Swal.fire({
      icon: 'warning',
      text: "Are you sure? You won't be able to revert this!",
      input: 'textarea',
      inputPlaceholder: 'Enter your remarks (max 200 characters)',
      inputAttributes: {
        maxlength: '200',
        style: 'height: 100px;',
      },
      inputValidator: (value) => {
        if (!value || value.length < 1 || value.length > 200) {
          return 'Text must be between 1 and 200 characters!';
        }
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Continue',
    }).then((result) => {
      if (result.isConfirmed) {
        let finalRemarks = result.value;
        const requestBody = {
          requestId: item.ItemId,
          requestType: 'AC',
          remarks: finalRemarks,
        };
  
        //console.log("Employee acknowledged, remarks:", finalRemarks);
  
        this.authService.acknowledgeEmployee(requestBody).subscribe({
          next: (response) => {
            item.ItemStatus = 1006; 
            this.getManagerData();
            //console.log('Backend response:', response);
            Swal.fire({
              title: 'Success!',
              text: 'Acknowledgment successful!',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              this.getManagerData(); // Refresh data
              //this.selectedEmp=null;
            });
          },
          error: (error) => {
            //console.error('Error acknowledging employee:', error.message);
            Swal.fire({
              title: 'Error!',
              text: 'Acknowledgment failed. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }
  getAssets(){
    this.isLoading = true; 
    this.authService.getAssignedAssets(this.empid).subscribe((res:any)=>{
      this.assets=res;
      //console.log("myassets"+res);
      if (this.assets.length > 0) {
        this.selectedAssetType = this.assets[0].asset_type_id;
        this.assignAsset(this.assets[0]);  
        this.isLoading = false; 
      }
    })
  }
  assignAsset(asset: any) {
    this.isLoading = true; 
    this.selectedAssetType = asset.asset_type_id; 
    //console.log("Asset assigned:", asset.asset_type_id);
    this.authService.getAssignedAssetData(asset.asset_type_id, this.empid).subscribe((res: any) => {
      this.assetdata=res;
      this.isLoading = false; 
      //console.log("Assigned asset data:", res);
    }, (error) => {
      //console.error("Error fetching assigned asset data:", error);
      this.isLoading = false; 
    });
  }
}


