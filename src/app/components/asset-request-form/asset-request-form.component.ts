import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
import { AuthService } from 'src/app/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Console } from 'console';
import { RefreshService } from '../../refresh.service';
@Component({
  selector: 'app-asset-request-form',
  templateUrl: './asset-request-form.component.html',
  styleUrls: ['./asset-request-form.component.sass','./asset-request-form.component.css']
})
export class AssetRequestFormComponent implements OnInit {
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
uniqueJoiningDate:any[]=[];
uniqueBu:any[]=[];
flattenedAssetList: any[] = [];
uniqueReportingManagers:any[]=[];
 selectedView: string = 'raiseAsset';
 fromDate: string | null = null; 
 toDate: string | null = null;  
 filterForm:FormGroup;
 isToDateEnabled: boolean = false;
 minDate: Date = new Date(); 
 currentPage: number = 1; 
pageSize: number = 10;   
totalRecords: number = 0; 
totalCount: number = 0;
isNextDisabled: boolean = false; 
totalPages: number = 1;  // Total number of pages
pagesArray: number[] = []; // Array for storing page numbers
router: any;
Ryts: any = {};
  constructor(private refreshService: RefreshService,private fb: FormBuilder,private authservice:AuthService) {
    this.employeeDeviceForm = this.fb.group({
   empName: ['', [Validators.required, Validators.maxLength(50)]],
   contactNum: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], 
   bu: ['', Validators.required],
   department: ['', Validators.required],
   designation: ['', Validators.required],
   reportingManager: ['',[Validators.required]],
   tentativeJoiningDate: ['', Validators.required],
    workLocation: ['', [Validators.required, Validators.maxLength(50)]],
   managerId: [''],
   fromDate: [''],
   toDate: [''],
   assetRows: this.fb.array([]),

 });
  }
  
  ngOnInit(): void {

    if (this.refreshService.checkForRefresh('assetrequest')) {
      this.refreshService.refreshData('assetrequest');
    } else {
      console.log('Dashboard refresh already done today');
    }

  this.addRow();
  
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
      if (this.Ryts[i].assestallocation == "true") {
        this.authBoolean = true;
      }
    }
    if (this.authBoolean == false) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
    }


    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];   
     const loginId = String(this.userData.user.empID); 
this.authservice.getBu(loginId).subscribe((data) => {
 this.bu = data;
});

this.authservice.getDepartment().subscribe((data)=>{
this.departments=data;
////console.log("dept",this.departments);
});
this.authservice.getDesignation().subscribe((data)=>{
this.designations=data;
});
this.authservice.getAssetTypes().subscribe((data)=>{
this.assets=data;
//console.log("assets",this.assets);
});
this.authservice.getDomain().subscribe((data)=>{
this.domain=data;
});
this.authservice.getManagers().subscribe(
(data) => {
 this.managers = data; 
 ////console.log("managers",this.managers);
});
this.filterForm = this.fb.group({
 bu: [''],
 department: [''],
 assetType: [''],
 tentativeFromDate: [''],
 tentativeToDate: [''],
 status:['']
}); 
this.fetchAssetList();
}
fetchAssetList(): void {
 const res = { 
   loginId: Number(this.userData.user.empID),
   pageSize: this.pageSize,
   pageNo: this.currentPage
 };

 ////console.log(`Fetching Page ${this.currentPage} with Request:`, res);

 this.authservice.getAssetList(res).subscribe(
   (data) => {
     ////console.log(`API Response for Page ${this.currentPage}:`, data);

     if (!data || !Array.isArray(data)) {
       console.error('Error: API response is not an array', data);
       this.isNextDisabled = true;
       return;
     }

     this.assetList = data;
     this.filteredAssetList = [...this.assetList];
     this.totalCount = data.length > 0 ? data[0].totalCount : 0;
     this.totalPages = Math.ceil(this.totalCount / this.pageSize);
     this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
     // Update isNextDisabled correctly
     this.isNextDisabled = this.currentPage >= this.totalPages;

     ////console.log('Total Count:', this.totalCount);
     ////console.log('Total Pages:', this.totalPages);
     ////console.log('Updated Filtered Asset List:', this.filteredAssetList);
     ////console.log('Next Disabled:', this.isNextDisabled);
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
 //console.log('Applying Asset Type filter department:',filters.department);
 }
if (filters.status) {
 const statusMap = {
   'Acknowledged': 1002,
   'InProgress': 1001
 };

 const selectedStatus = filters.status;

 if (statusMap.hasOwnProperty(selectedStatus)) {
   filterData.status = statusMap[selectedStatus];  // Ensure it's a number
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
 //console.log('Applying Asset Types filter:', filters.assetType);
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
   ////console.log('Fetching filtered assets with applied filters');
   this.fetchFilteredAssetList(filterData);
 } else {
   ////console.log('No filters selected, fetching all assets');
   this.fetchAssetList();
 }
////console.log('Selected Filters:', filters);
 ////console.log('After Filters:', this.filteredAssetList);
}

// fetchFilteredAssetList(filterData: any): void {
//   ////console.log('Filter Data being sent:', filterData); // Debugging log

//   this.authservice.getAssetList(filterData).subscribe(
//     (data:any) => {
//       ////console.log(`API Response for Page ${this.currentPage}:`, data);

//       if (!data || !Array.isArray(data) || data.length === 0) {
//         console.warn(`No data returned for Page ${this.currentPage}`);
//         this.filteredAssetList = [];
//         this.isNextDisabled = true;  
//          this.totalCount = 0;
//         this.totalPages = 1;
//         this.pagesArray = [1];
//         return;
//       }

//       this.filteredAssetList = data;
     
//       this.isNextDisabled = data.length < this.pageSize; 
//         this.totalCount = data.length > 0 ? data[0].totalCount : 0;
//       this.totalPages = Math.ceil(this.totalCount / this.pageSize);
//       this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
//       //console.log('Filtered Asset List:', this.filteredAssetList);
//       ////console.log('Next Disabled:', this.isNextDisabled);
//     },
//     (error) => {
//       console.error('Error fetching filtered assets:', error);
//       this.isNextDisabled = true; 
//     }
//   );
// }
fetchFilteredAssetList(filterData: any): void {
 this.authservice.getAssetList(filterData).subscribe(
   (data: any) => {
     if (!data || !Array.isArray(data) || data.length === 0) {
       console.warn(`No data returned for Page ${this.currentPage}`);
       this.filteredAssetList = [];
       this.isNextDisabled = true;  // ✅ Disable "Next" if no data
       this.totalCount = 0;
       this.totalPages = 1;
       this.pagesArray = [1];
       return;
     }

     this.filteredAssetList = data;
     this.totalCount = data.length > 0 ? data[0].totalCount : 0;
     this.totalPages = Math.ceil(this.totalCount / this.pageSize);
     this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

     // ✅ Properly disable "Next" if no more data
     this.isNextDisabled = this.currentPage >= this.totalPages || data.length < this.pageSize;

     //console.log('Filtered Asset List:', this.filteredAssetList);
     //console.log('Next Disabled:', this.isNextDisabled);
   },
   (error) => {
     console.error('Error fetching filtered assets:', error);
     this.isNextDisabled = true; 
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

 ////console.log('Clearing filters and resetting pagination');
 this.fetchAssetList();
}
nextPage(): void {
 if (!this.isNextDisabled) {
   this.currentPage++;
   const filters = this.getValidFilters();

   this.fetchFilteredAssetList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentPage,
     ...filters  
   });
 }
}

isFilterApplied(): boolean {
 return Object.values(this.filterForm.value).some(value => value);
}

prevPage(): void {
 if (this.currentPage > 1) {
   this.currentPage--; 
   this.fetchFilteredAssetList({
     loginId: this.userData.user.empID,
     pageSize: this.pageSize,
     pageNo: this.currentPage,
     ...this.getValidFilters()  
   });
 }
}

getValidFilters(): any {
 const filters = this.filterForm.value;
 let validFilters: any = {};
 const statusMap = {
   'Acknowledged': 1002,
   'InProgress': 1001
 };

 Object.keys(filters).forEach((key) => {
   if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "" && filters[key] !== " ") {
     if (key === "status" && statusMap[filters[key]]) {
       validFilters[key] = statusMap[filters[key]];
     } else {
       validFilters[key] = filters[key];
     }
   }
 });

 return validFilters;
}

goToPage(pageNumber: number): void {
 this.currentPage = pageNumber;
 this.fetchFilteredAssetList({ pageNo: this.currentPage, pageSize: this.pageSize });
}
changeView(view: string) {
 this.selectedView = view;
  this.onReset();
  this.onClearFilters();
}

searchManagers(): void {
 const query = this.reportingManager.value?.trim().toLowerCase();
 if (!query || query.length < 1) {
   this.filteredManagers = [];
   return;
 }
 this.filteredManagers = this.managers.filter((manager) =>
   manager.name.toLowerCase().includes(query) || manager.id.toString().includes(query)
 );
 
}

// selectManager(manager: any): void {
//   this.reportingManager.setValue(manager.name);
//   this.reportingManager.setValue(`${manager.id} - ${manager.name}`);
//   this.employeeDeviceForm.get('managerId')?.setValue(manager.id);
 
//   this.filteredManagers = [];

// }
selectManager(manager: any): void {

   this.reportingManager.setValue(manager.name);
 this.reportingManager.setValue(`${manager.id} - ${manager.name}`);
 this.employeeDeviceForm.get('managerId')?.setValue(manager.id);
 

 const reportingManagerControl = this.employeeDeviceForm.get('reportingManager');

 if (reportingManagerControl) {
   reportingManagerControl.setValue(`${manager.id} - ${manager.name}`);
   reportingManagerControl.markAsTouched();
   reportingManagerControl.markAsDirty();
   reportingManagerControl.updateValueAndValidity(); 
 }
this.filteredManagers = [];
 ////console.log("Updated Form:", this.employeeDeviceForm.value);
 ////console.log("Validation Errors:", reportingManagerControl?.errors);
}

onSubmit() {
 ////console.log("errors",this.employeeDeviceForm);
if (this.employeeDeviceForm.invalid) {
 this.employeeDeviceForm.markAllAsTouched();
 this.assetRows.controls.forEach(row => row.markAllAsTouched());
 Swal.fire('Error', 'Please fill in all required fields.', 'error');
 return;
}

 // Check if the input field is empty before storing managerId
 const managerValue = this.reportingManager.value?.trim();
 if (!managerValue) {
   this.employeeDeviceForm.get('managerId')?.setValue(null); // Clear old value if input is empty
 }
 const empData = {
   empId: this.employeeDeviceForm.get('empId')?.value || 0, 
   empName: this.employeeDeviceForm.get('empName')?.value,
   department: this.employeeDeviceForm.get('department')?.value,
   bu: this.employeeDeviceForm.get('bu')?.value,
   designation: this.employeeDeviceForm.get('designation')?.value,
   contactNum: this.employeeDeviceForm.get('contactNum')?.value,
  reportingManager: this.employeeDeviceForm.get('managerId')?.value || null, 
   tentativeJoiningDate: this.employeeDeviceForm.get('tentativeJoiningDate')?.value,
   loginId: this.userData.user.empID ,
   workLocation:this.employeeDeviceForm.get('workLocation')?.value
 };

 const formData = new FormData();
 formData.append('empData', JSON.stringify(empData));
  ////console.log("empData",empData);
const assets = this.assetRows.controls.map((row) => {
const domainValue = row.get('domain')?.value;
//////console.log('domainValue:', domainValue);  
//row.patchValue({ description: domainValue }); 

 const description = row.get('description')?.value;
//////console.log('domainValue1:', description); 
 return {
   assetTypeId: row.get('assetType')?.value, 
   count: row.get('count')?.value || 1,
   remarks: domainValue ? domainValue : description
 };
});

 formData.append('assets', JSON.stringify(assets));
// ////console.log("assets",assets);
 this.isLoading=true;
 this.authservice.getRaiseAssets(formData).subscribe(
 (response) => {
   ////console.log('Assets raised successfully', response);
   Swal.fire({
     title: 'Success!',
     text: 'Assets raised successfully.',
     icon: 'success',
     confirmButtonText: 'OK'
   }).then(() => {
     this.onReset();
     
   });
   this.fetchAssetList();
   this.isLoading=false;
 },
 (error) => {
   ////console.log(error.error)
 let errorMessage;
 if (error.status === 403) {
   errorMessage = error.error;
 }

 Swal.fire({
   title: "Access Denied",
   text: errorMessage,
   icon: "error",
   confirmButtonText: "OK"
 });

 this.isLoading = false;
});


}

onReset(): void {
 this.assetRows.clear(); 
 
 this.employeeDeviceForm.reset({
   empName: '',
   department: '',    
   bu: '',           
   designation: '',
   contactNum: '',
  // reportingManager: '',
   tentativeJoiningDate: '',
   assetRows: [],  
 });
 this.addRow();
   this.reportingManager.setValue('');
 this.reportingManager.markAsPristine();  // Mark as pristine
 this.reportingManager.markAsUntouched(); // Mark as untouched
  this.assetRows.controls.forEach((row) => {
   row.get('assetType')?.setValue('');
 });
}
   get assetRows() {
   return (this.employeeDeviceForm.get('assetRows') as FormArray);
 }
validateMaxLength(row: FormGroup, controlName: string) {
 const control = row.get(controlName);
 if (control) {
   control.updateValueAndValidity(); // Revalidate on every input
 }
}

addRow() {
 const assetRow = this.fb.group({
   assetType: ['', Validators.required],
   count: [''],
   description: ['', [Validators.maxLength(100)]],
   domain: [''],
 });

 // Get the FormArray correctly
 const assetRowsArray = this.employeeDeviceForm.get('assetRows') as FormArray;
 
 // Add new row
 assetRowsArray.push(assetRow);
}



 removeRow(index: number) {
   if (this.assetRows.length > 1) {
     this.assetRows.removeAt(index);
   } else {
     //alert('At least one row is required.');
      Swal.fire({
       title: 'Warning!',
       text: 'At least one row is required.',
       icon: 'warning',
       confirmButtonText: 'OK'
     });
   }
 }
preventExceedingMaxLength(event: KeyboardEvent, row: FormGroup, fieldName: string) {
 const field = row.get(fieldName);
 if (!field) return;

 let value = field.value || '';
 if (value.length >= 100) {
   event.preventDefault();
 }
}

allowOnlyDigits(event: KeyboardEvent): boolean {
   const charCode = event.which ? event.which : event.keyCode;
   if (charCode < 48 || charCode > 57) {
     event.preventDefault();
     return false;
   }
   return true;
 }

 handlePaste(event: ClipboardEvent): void {
   const pasteData = event.clipboardData?.getData('text') || '';
   if (!/^\d{10}$/.test(pasteData)) {
     event.preventDefault();
   }
 }

onPaste(event: ClipboardEvent, fieldName: string) {
 event.preventDefault(); // Prevent default paste behavior

 const field = this.employeeDeviceForm.get(fieldName);
 if (!field) return;

 const pastedText = event.clipboardData?.getData('text') || '';
 const currentValue = field.value || '';

 // Ensure total length does not exceed 50
 const newValue = (currentValue + pastedText).substring(0, 50);

 // Set trimmed value back to form control
 field.setValue(newValue);
 field.markAsTouched(); // Show error message if needed
}

onKeyPress(event: KeyboardEvent, fieldName: string) {
  const field = this.employeeDeviceForm.get(fieldName);
  if (!field) return;

  let value = field.value || '';

  // If the field value already has 50 characters, prevent further input
  if (value.length >= 50) {
    event.preventDefault();
    return;
  }

  // Regex to allow only alphabetic characters and a single space
  const regex = /^[a-zA-Z\s]$/;

  // Check if the key entered is not allowed (not alphabet or space)
  if (!regex.test(event.key)) {
    event.preventDefault();
    return;
  }

  // If the last character is a space, prevent another space
  if (event.key === ' ' && value.slice(-1) === ' ') {
    event.preventDefault();
  }
}


specialChar(event: KeyboardEvent): void {
  const char = event.key;
 const isValid = /^[a-zA-Z0-9\s\-]$/.test(char);
 
 if (!isValid) {
   event.preventDefault();  
 }
}
onFromDateChange() {
   const fromDate = this.filterForm.get('tentativeFromDate')?.value;
   this.isToDateEnabled = !!fromDate; 
 }
isConfirmationModalVisible: boolean = false;
 openModal(employee: any) {
   this.modalData = employee.items;  
   this.isConfirmationModalVisible = true;
 }

 closeModal() {
   this.isConfirmationModalVisible = false;
   this.modalData = [];
 }
 selectedAssets: number[] = [];
onAssetTypeChange(event: any, index: number) {
 const selectedValue = +event.target.value;
 this.selectedAssets[index] = selectedValue;
}

getFilteredAssetList(index: number) {
 return this.assets.filter(asset => !this.selectedAssets.includes(asset.id) || this.selectedAssets[index] === asset.id);
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
convertToUppercase(fieldName: string) {
  const field = this.employeeDeviceForm.get(fieldName);
  if (field) {
    let value = field.value.toUpperCase().replace(/[^A-Z\s]/g, ''); // Convert to uppercase & remove invalid characters
    field.setValue(value, { emitEvent: false });
  }
}

}

