import { Component, OnInit } from '@angular/core';
 import Swal from 'sweetalert2/dist/sweetalert2.js';
 import * as moment from 'moment'; 
 import 'moment/locale/es' ; 
import { AuthService } from 'src/app/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Console } from 'console';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { data } from 'autoprefixer';
import { RefreshService } from '../../refresh.service';
@Component({
  selector: 'app-asset-it-admin',
  templateUrl: './asset-it-admin.component.html',
  styleUrls: ['./asset-it-admin.component.sass']
})
export class AssetItAdminComponent implements OnInit {

  modalData: any[] = [];
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
 domain:any[]=[];
 filteredManagers: any[] = [];
 managers: any[] = [];
 reportingManager = new FormControl('');
 assets:any[]=[];
 assetList:any[]=[];

 uniqueDepartments: any[] = [];
 filteredAssetList: any[] = [];
 filteredAckList:any[]=[];
uniqueJoiningDate:any[]=[];
uniqueBu:any[]=[];
flattenedAssetList: any[] = [];
uniqueReportingManagers:any[]=[];
 selectedView: string = 'Inprogress';
 fromDate: string | null = null; 
 toDate: string | null = null;  
 filterForm:FormGroup;
 //filterForm:FormGroup;
 isToDateEnabled: boolean = false;
 minDate: Date = new Date(); 
 currentPage: number = 1; 
 currentAckPage:number=1;
pageSize: number = 10;  
//pageSize:number=10; 
totalProgressCount: number = 0; 
totalCount: number = 0;
totalAckCount:number=0;
isNextDisabled: boolean = false; 
isNextAckDisabled: boolean = false; 
totalPages: number = 1;  // Total number of pages
pagesArray: number[] = []; // Array for storing page numbers
router: any;
Ryts: any = {};
  constructor(private refreshService: RefreshService,private fb: FormBuilder,private authservice:AuthService) {
   
  }
  
  ngOnInit(): void {


    if (this.refreshService.checkForRefresh('assetitadmin')) {
      this.refreshService.refreshData('assetitadmin');
    } else {
      console.log('Dashboard refresh already done today');
    }

   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    
   // let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.Ryts =   JSON.parse(x).Rights;  



    this.authBoolean = false;
    for (let i = 0; i < this.Ryts.length; i++) {
      if (this.Ryts[i].Asset_it_admin == "true") {
        this.authBoolean = true;
      }
    }
    if (this.authBoolean == false) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
    }

    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];   
     
const loginId = String(this.userData.user.empID); // Ensure it's a string

this.authservice.getBu(loginId).subscribe({
 next: (data) => {
   this.bu = data;
 },
 error: (err) => {
   console.error('Error fetching BU:', err);
 }
});

this.authservice.getDepartment().subscribe((data)=>{
this.departments=data;
console.log("dept",this.departments);
});
this.authservice.getDesignation().subscribe((data)=>{
this.designations=data;
});
this.authservice.getAssetTypes().subscribe((data)=>{
this.assets=data;
});
this.authservice.getDomain().subscribe((data)=>{
this.domain=data;
});
this.authservice.getManagers().subscribe(
(data) => {
 this.managers = data; 
 console.log("managers",this.managers);
});
this.filterForm = this.fb.group({
 bu: [''],
 department: [''],
 assetType: [''],
 tentativeFromDate: [''],
 tentativeToDate: [''],
 status:['']
}); 
// this.filterForm = this.fb.group({
//   bu: [''],
//   department: [''],
//   assetType: [''],
//   tentativeFromDate: [''],
//   tentativeToDate: [''],
//   status:['']
// }); 
this.fetchAssetList();
this.fetchAckList();
}
changeView(view: string) {
 this.selectedView = view;
 this.onClearAckFilters();
 this.onClearFilters();
}
onFromDateChange() {
   const fromDate = this.filterForm.get('tentativeFromDate')?.value;
   this.isToDateEnabled = !!fromDate; 
 }
isConfirmationModalVisible: boolean = false;
isModalVisible: boolean = false;
 openModal(employee: any) {
   this.modalData = employee.items;  
   this.isConfirmationModalVisible = true;
 }

 closeModal() {
   this.isConfirmationModalVisible = false;
   this.modalData = []; 
 }
acknowledgeRequest() {
 if (!this.selectedEmployee || !this.selectedEmployee.requestId) {
   Swal.fire('Error', 'Invalid employee data!', 'error');
   return;
 }

 console.log("Acknowledging request for:", this.selectedEmployee); // Debugging log

 const formData = new FormData();
 formData.append('requestId', this.selectedEmployee.requestId.toString()); // Ensure requestId is a string
 formData.append('acknowledgeId', this.userData.user.empID.toString()); // Directly use empID
 
 console.log(formData);
 
 //return;
 this.isLoading = true;

 this.authservice.acknowledge(formData).subscribe(
   (response: HttpResponse<any>) => {
     if (response.ok) {  
       Swal.fire('Success', 'Acknowledgment recorded successfully!', 'success');
       
       // Fetch updated list after acknowledging the request
       const filterData = {
         loginId: this.userData.user.empID,
         pageSize: this.pageSize,
         pageNo: this.currentPage,
       };
       this.fetchFilteredAssetList(filterData);
       this.isModalVisible = false;
       this.isLoading = false;
     } else {
       Swal.fire('Warning', 'Unexpected response received!', 'warning');
     }
     this.isLoading = false;
   },
(error) => {
 this.isLoading = false;

 console.log("Full error response:", error); // Debugging log

 let errorMessage = 'An unknown error occurred. Please try again.';

 if (error.status === 403 || error.status === 409) {
   if (error.error) {
     if (typeof error.error === 'string') {
       errorMessage = error.error; // If backend returns plain text error
        this.isModalVisible = false;
     } else if (error.error.message) {
       errorMessage = error.error.message; // If backend returns JSON with message
        this.isModalVisible = false;
     } else {
       errorMessage = JSON.stringify(error.error); // If error structure is unknown
     }
   }
   Swal.fire('Error', errorMessage, 'error');
 } else {
   Swal.fire('Error', 'Failed to acknowledge request. Please try again.', 'error');
 }
   }
 );
}



// acknowledgeRequest(employee: any) {
//   const formData = new FormData();
//   formData.append('requestId', employee.requestId.toString()); // Ensure requestId is a string
//   formData.append('acknowledgeId', this.userData.user.empID.toString()); // Directly use empID
// this.isLoading=true;
// this.authservice.acknowledge(formData).subscribe(
//   (response: HttpResponse<any>) => {
//     if (response.ok) {  
//       Swal.fire('Success', 'Acknowledgment recorded successfully!', 'success');
//       const filterData = {
//       loginId: this.userData.user.empID,
//       pageSize: this.pageSize,
//       pageNo: this.currentPage,
//     };

//     this.fetchFilteredAssetList(filterData);
//        this.isModalVisible = false;
//         this.isLoading = false;
//     } else {
//       Swal.fire('Warning', 'Unexpected response received!', 'warning');
//     }
//     this.isLoading=false;
//   },
//   (error) => {
//     Swal.fire('Error', 'Failed to acknowledge request. Please try again.', 'error');
//     this.isLoading=false;
//   }
// );


// }

selectedEmployee: any = null; // Declare selectedEmployee

// Function to open the modal and store the selected employee
openModal1(employee: any) {
 this.selectedEmployee = employee; // Store the clicked employee in selectedEmployee
 this.isModalVisible = true; // Show the modal
}

 closeModal1(){
    this.isModalVisible = false;
 }



fetchAssetList(): void {
 const res = { 
   loginId: this.userData.user.empID,
   pageSize: this.pageSize,
   pageNo: this.currentPage
 };

 console.log(`Fetching Page ${this.currentPage} with Request:`, res);
 this.isLoading = true;

 this.authservice.getItApprovalList(res).subscribe(
   (data) => {
     console.log(`API Response for Page ${this.currentPage}:`, data);

     if (!data || !Array.isArray(data) || data.length === 0) {
       console.warn('No data found for this page.');
       this.filteredAssetList = [];
       this.totalCount = 0;
       this.totalPages = 1;
       this.pagesArray = [1];
       this.isNextDisabled = true;
       this.isLoading = false;
       return;
     }

     this.assetList = data;
     this.filteredAssetList = [...this.assetList];

     // ✅ Correctly set totalCount from the first record
     this.totalCount = data[0]?.totalCount || 0;
     this.totalPages = Math.ceil(this.totalCount / this.pageSize);
     this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

     // ✅ Disable "Next" only if it's the last page
     this.isNextDisabled = this.currentPage >= this.totalPages;  

     console.log('Total Count:', this.totalCount);
     console.log('Total Pages:', this.totalPages);
     console.log('Updated Filtered Asset List:', this.filteredAssetList);
     console.log('Next Disabled:', this.isNextDisabled);

     this.isLoading = false;
   },
   (error) => {
     console.error('Error fetching asset list:', error);
     this.isNextDisabled = true;
     this.isLoading = false;
   }
 );
}

 

 onFilterSubmit() {
     this.currentPage = 1; 
   const filters = this.filterForm.value;
   const filterData: any = { 
     loginId: this.userData.user.empID, 
     pageSize: this.pageSize, 
     pageNo: 1
   };
   let isFilterApplied = false;
 
   // Apply filters
   if (filters.department) {
     filterData.department = filters.department;
     isFilterApplied = true;
    // console.log('Applying Asset Type filter:',filters.department);
   }
 if (filters.status) {
   const statusMap = {
     'Acknowledged': 1002,
     'InProgress': 1001
   };
 
   const selectedStatus = filters.status;
 
   if (selectedStatus && statusMap[selectedStatus]) {
     filterData.status = statusMap[selectedStatus]; 
     // console.log(`Status Filter Applied: ${selectedStatus} (${statusMap[selectedStatus]})`);
     isFilterApplied = true;
   } 
 }
   if (filters.bu) {
     filterData.bu = filters.bu;
     isFilterApplied = true;
   }
 if (filters.assetType) {
     filterData.assetType = filters.assetType; 
     isFilterApplied = true;
    // console.log('Applying Asset Type filter:', filters.assetType);
   }
 
   if (filters.tentativeFromDate) {
     filterData.tentativeFromDate = filters.tentativeFromDate;
     isFilterApplied = true;
   }
   if (filters.tentativeToDate) {
     filterData.tentativeToDate = filters.tentativeToDate;
     isFilterApplied = true;
   }
 
   // Apply the filters or fetch all assets
   if (isFilterApplied) {
     console.log('Fetching filtered assets with applied filters');
     this.fetchFilteredAssetList(filterData);
   } else {
     console.log('No filters selected, fetching all assets');
     this.fetchAssetList();
   }
 console.log('Selected Filters:', filters);
   console.log('After Filters:', this.filteredAssetList);
 }
 
fetchFilteredAssetList(filterData: any): void {
 console.log('Filter Data being sent:', filterData);
 this.isLoading = true;

 this.authservice.getItApprovalList(filterData).subscribe(
   (data: any) => {
     console.log(`API Response for Filtered Data:`, data);

     if (!data || !Array.isArray(data) || data.length === 0) {
       console.warn('No data returned for filter.');
       this.filteredAssetList = [];
       this.totalCount = 0;
       this.totalPages = 1;
       this.pagesArray = [1];
       this.isNextDisabled = true;
       this.isLoading = false;
       return;
     }

     this.filteredAssetList = data;

     // ✅ Fix totalCount assignment
     this.totalCount = data[0]?.totalCount || 0;
     this.totalPages = Math.ceil(this.totalCount / this.pageSize);
     this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

     // ✅ Only disable "Next" on the last page
     this.isNextDisabled = this.currentPage >= this.totalPages;

     this.isLoading = false;
     console.log('Updated Filtered Asset List:', this.filteredAssetList);
     console.log('Total Count:', this.totalCount);
     console.log('Next Disabled:', this.isNextDisabled);
   },
   (error) => {
     console.error('Error fetching filtered assets:', error);
     this.isNextDisabled = true;
     this.isLoading = false;
   }
 );
}

 
 onClearFilters() {
   this.filterForm.reset({
     bu: '',
     department: '',
     assetType: '',
     tentativeFromDate: '',
     tentativeToDate: '',
     status: ''
   });
 
   this.isToDateEnabled = false;
   this.currentPage = 1; // ✅ Reset to first page
   this.totalPages = 1; // ✅ Reset total pages
   this.isNextDisabled = false; // ✅ Ensure "Next" button is enabled
 
   console.log('Clearing filters and resetting pagination');
   this.fetchAssetList();
 }
 
 // nextPage(): void {
 //   if (!this.isNextDisabled) {
 //     this.currentPage++; // Increase the current page number
 //     this.fetchFilteredAssetList({
 //      loginId: this.userData.user.empID,
 //       pageSize: this.pageSize,
 //       pageNo: this.currentPage,
 //       ...(this.isFilterApplied() ? this.filterForm.value : {})  // Apply filters if any, otherwise skip
 //     });
  
 //   }
 // }
 nextPage(): void {
 if (!this.isNextDisabled) {
   this.currentPage++; // ✅ Increase the page

   // ✅ Get applied filters
   const filters = this.getValidFilters();  

   this.fetchFilteredAssetList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentPage,
     ...filters  // ✅ Ensure filters are included when paginating
   });
 }
}
getValidFilters(): any {
 const filters = this.filterForm.value;
 const validFilters: any = {};

 // ✅ Add filters only if they are set
 if (filters.department) validFilters.department = filters.department;
 if (filters.status) validFilters.status = filters.status;
 if (filters.bu) validFilters.bu = filters.bu;
 if (filters.assetType) validFilters.assetType = filters.assetType;
 if (filters.tentativeFromDate) validFilters.tentativeFromDate = filters.tentativeFromDate;
 if (filters.tentativeToDate) validFilters.tentativeToDate = filters.tentativeToDate;

 return validFilters;
}

 isFilterApplied(): boolean {
     // Check if any filter value is set (i.e., not empty or null)
     return Object.values(this.filterForm.value).some(value => value);
   }
    isFilterAckApplied(): boolean {
     // Check if any filter value is set (i.e., not empty or null)
     return Object.values(this.filterForm.value).some(value => value);
   }
 // prevPage(): void {
 //   if (this.currentPage > 1) {
 //     this.currentPage--; // Decrease the current page number
 //     this.fetchFilteredAssetList({
 //       loginId: this.userData.user.empID,
 //       pageSize: this.pageSize,
 //       pageNo: this.currentPage,
 //       ...(this.isFilterApplied() ? this.filterForm.value : {})  // Apply filters if any, otherwise skip
 //     });
 //   }
 // }
 prevPage(): void {
 if (this.currentPage > 1) {
   this.currentPage--; // ✅ Decrease the page

   // ✅ Get applied filters
   const filters = this.getValidFilters();  

   this.fetchFilteredAssetList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentPage,
     ...filters  // ✅ Ensure filters are included when paginating
   });
 }
}

 // goToPage(pageNumber: number): void {
 //   this.currentPage = pageNumber;
 //   this.fetchFilteredAssetList({ pageNo: this.currentPage, pageSize: this.pageSize });
 // }

goToPage(pageNumber: number): void {
 this.currentPage = pageNumber;

 // ✅ Get applied filters
 const filters = this.getValidFilters();  

 this.fetchFilteredAssetList({
   loginId: this.userData.user.empID,
   pageSize: this.pageSize,
   pageNo: this.currentPage,
   ...filters  // ✅ Ensure filters are included when paginating
 });
}


 //ack
//655

fetchAckList(): void {
   const res = { 
     loginId:this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentAckPage
   };
 
   console.log(`Fetching Page ${this.currentAckPage} with Request:`, res);
 
   this.authservice.getItApprovedList(res).subscribe(
     (data) => {
       console.log(`API Response for Page ${this.currentAckPage}:`, data);
 
       if (!data || !Array.isArray(data)) {
         console.error('Error: API response is not an array', data);
         this.isNextAckDisabled = true;
         return;
       }
 
       this.assetList = data;
       this.filteredAckList = [...this.assetList];
 
       // ✅ Ensure totalCount is updated correctly
       this.totalAckCount = data.length > 0 ? data[0].totalCount : 0;
       this.totalPages = Math.ceil(this.totalAckCount / this.pageSize);
       this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
 
       // ✅ Update isNextDisabled correctly
       this.isNextAckDisabled = this.currentPage >= this.totalPages;
 
       console.log('Total Count:', this.totalAckCount);
       console.log('Total Pages:', this.totalPages);
       console.log('Updated Filtered Asset List:', this.filteredAckList);
       console.log('Next Disabled:', this.isNextAckDisabled);
     },
     (error) => {
       console.error('Error fetching asset list:', error);
       Swal.fire({
         title: 'Server Error',
         text: 'There was an issue fetching asset data. Please try again later.',
         icon: 'error',
         confirmButtonText: 'OK'
       });
     }
   );
 }
 

 onFilterAckSubmit() {
     this.currentAckPage = 1; 
   const filters = this.filterForm.value;
   const filterData: any = { 
     loginId: this.userData.user.empID, 
     pageSize: this.pageSize, 
     pageNo: 1
   };
   let isFilterApplied = false;
 
   // Apply filters
   if (filters.department) {
     filterData.department = filters.department;
     isFilterApplied = true;
    // console.log('Applying Asset Type filter:',filters.department);
   }
 if (filters.status) {
   const statusMap = {
     'Acknowledged': 1002,
     'InProgress': 1001
   };
 
   const selectedStatus = filters.status;
 
   if (selectedStatus && statusMap[selectedStatus]) {
     filterData.status = statusMap[selectedStatus]; 
     // console.log(`Status Filter Applied: ${selectedStatus} (${statusMap[selectedStatus]})`);
     isFilterApplied = true;
   } 
 }
   if (filters.bu) {
     filterData.bu = filters.bu;
     isFilterApplied = true;
   }
 if (filters.assetType) {
     filterData.assetType = filters.assetType; 
     isFilterApplied = true;
    // console.log('Applying Asset Type filter:', filters.assetType);
   }
 
   if (filters.tentativeFromDate) {
     filterData.tentativeFromDate = filters.tentativeFromDate;
     isFilterApplied = true;
   }
   if (filters.tentativeToDate) {
     filterData.tentativeToDate = filters.tentativeToDate;
     isFilterApplied = true;
   }
 
   // Apply the filters or fetch all assets
   if (isFilterApplied) {
     console.log('Fetching filtered assets with applied filters');
     this.fetchFilteredAckList(filterData);
   } else {
     console.log('No filters selected, fetching all assets');
     this.fetchAckList();
   }
 console.log('Selected Filters:', filters);
   console.log('After Filters:', this.filteredAckList);
 }
 
 fetchFilteredAckList(filterData: any): void {
   console.log('Filter Data being sent:', filterData); // Debugging log
 
   this.authservice.getItApprovedList(filterData).subscribe(
     (data:any) => {
       console.log(`API Response for Page ${this.currentAckPage}:`, data);
 
       if (!data || !Array.isArray(data) || data.length === 0) {
         console.warn(`No data returned for Page ${this.currentAckPage}`);
         this.filteredAckList = [];
         this.isNextAckDisabled = true;  
          this.totalAckCount = 0;
         this.totalPages = 1;
         this.pagesArray = [1];
         return;
       }
 
       this.filteredAckList = data;
       
       this.isNextAckDisabled = data.length < this.pageSize; 
         this.totalAckCount = data.length > 0 ? data[0].totalCount : 0;
       this.totalPages = Math.ceil(this.totalAckCount / this.pageSize);
       this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
       console.log('Filtered Asset List:', this.filteredAckList);
       console.log('Next Disabled:', this.isNextAckDisabled);
     },
     (error) => {
       console.error('Error fetching filtered assets:', error);
       this.isNextDisabled = true; 
     }
   );
 }
 
 onClearAckFilters() {
   this.filterForm.reset({
     bu: '',
     department: '',
     assetType: '',
     tentativeFromDate: '',
     tentativeToDate: '',
     status: ''
   });
 
   this.isToDateEnabled = false;
   this.currentAckPage = 1; // ✅ Reset to first page
   this.totalPages = 1; // ✅ Reset total pages
   this.isNextAckDisabled = false; // ✅ Ensure "Next" button is enabled
 
   console.log('Clearing filters and resetting pagination');
   this.fetchAckList();
 }
 
 // nextAckPage(): void {
 //   if (!this.isNextAckDisabled) {
 //     this.currentAckPage++; // Increase the current page number
 //     this.fetchFilteredAckList({
 //       loginId: this.userData.user.empID,
 //       pageSize: this.pageSize,
 //       pageNo: this.currentAckPage,
 //       ...(this.isFilterAckApplied() ? this.filterForm.value : {})  // Apply filters if any, otherwise skip
 //     });
 //   }
 // }

 nextAckPage(): void {
 if (!this.isNextAckDisabled) {
   this.currentAckPage++; // ✅ Increase the page

   // ✅ Get applied filters
   const filters = this.getValidFilters();  

   this.fetchFilteredAckList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentAckPage,
     ...filters  // ✅ Ensure filters are included when paginating
   });
 }
}
 
 // isFilterApplied(): boolean {
 //     // Check if any filter value is set (i.e., not empty or null)
 //     return Object.values(this.filterForm.value).some(value => value);
 //   }
 // prevAckPage(): void {
 //   if (this.currentAckPage > 1) {
 //     this.currentAckPage--; // Decrease the current page number
 //     this.fetchFilteredAckList({
 //       loginId: this.userData.user.empID,
 //       pageSize: this.pageSize,
 //       pageNo: this.currentAckPage,
 //       ...(this.isFilterAckApplied() ? this.filterForm.value : {})  // Apply filters if any, otherwise skip
 //     });
 //   }
 // }
prevAckPage(): void {
 if (this.currentAckPage > 1) {
   this.currentAckPage--; // ✅ Decrease the page

   // ✅ Get applied filters
   const filters = this.getValidFilters();  

   this.fetchFilteredAckList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentPage,
     ...filters  // ✅ Ensure filters are included when paginating
   });
 }
}
 goToPage1(pageNumber: number): void {
   this.currentAckPage = pageNumber;
   this.fetchFilteredAckList({ pageNo: this.currentAckPage, pageSize: this.pageSize });
 }
getTooltipText(items: any[]): string {
 return items.map(item => item.asset).join(', '); 
}

getPreviewText(items: any[]): string {
 if (items.length > 2) {
   return `${items[0].asset}, ${items[1].asset}...`; 
 }
 return items.map(item => item.asset).join(', ');
}
getDisplayedCount(): number {
 return Math.min(this.currentPage * this.pageSize, this.totalCount);
}
getDisplayedAckCount():number{
return Math.min(this.currentAckPage * this.pageSize, this.totalAckCount);
}


}
