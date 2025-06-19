import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
 
 
@Component({
  selector: 'app-promotion-letter',
  templateUrl: './promotion-letter.component.html',
  styleUrls: ['./promotion-letter.component.sass']
})
export class PromotionLetterComponent implements OnInit {
  userData: any;
  myDate: any;
  showTransferFields: boolean = false;
  filterTransferTypes: any;
  showPopup: boolean;
  isLoading:boolean=false;
  universitySearch:any=[];
 showDropdown: boolean = false;
  showEditDropdown:boolean=false;
  reportiesList: any[] = [];
  searchTermUniversity:any;
  selectedReportie: any;
  currentPage = 1;
  itemsPerPage = 10;
 totalPages = 0;
 filteredData: any[] = [];
searchTerm: string = '';
  employeelist:any=[];
  searchText: string = '';
  search:any=[];
  loggedUser: any = {};
  Ryts: any = {};
  public Promotionview: any;
  Promotionview_mob: any;
  isBusinessUnitDisabled :boolean = false;
  public PromotionviewModal: boolean;
  letterprivileges: any;
  incrementletterprivileges: any;
  authBoolean: boolean;
  public form16Modal: boolean;
  public form16: any;
  form16_mob: any;
  transferTypesList: any[] = [];
  transferDetailsList:any[]=[];
  businessunitlist:any[]=[];
  departmentList:any[]=[];
  designationList:any=[];
  promotiondata:any=[];
  searchResults: any[] = [];
  reportingPerson:any;
  promotionToEdit:any;
  colorTheme = 'theme-dark-blue';  
  sectionId: any;
  spinnr:boolean;
  promotionForm: FormGroup;
  editPromotionForm:FormGroup;
  constructor(private service:AuthService,  private dom: DomSanitizer,  
    private renderer: Renderer2,    @Inject(DOCUMENT) private document: Document,private router:Router,private fb:FormBuilder) {
        this.promotionForm = this.fb.group({
      empid: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{5,8}$')  
      ]],
      employeeid: ['', Validators.required ],
      transferTypeId: ['', Validators.required],
      transferId: [2, Validators.required],
      businessUnitId: ['', Validators.required],
      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      // promotionTo: ['', Validators.required],
      transferredDate: ['', Validators.required],
      reportingDate:['',Validators.required],
      search: ['',Validators.required],
      reportingid:[''],
      currentdesignationId: ['']
    });
     }
    ngOnInit(): void {
      //this.promotionForm.get('transferId')?.disable();
      this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
      this.userData = JSON.parse(this.loggedUser);
      this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
      let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
      this.Ryts = JSON.parse(x).Rights;
      let y= decodeURIComponent(window.atob(localStorage.getItem('letterprivileges')));
      this.letterprivileges = JSON.parse(y);
      let z= decodeURIComponent(window.atob(localStorage.getItem('incrementletterprivileges')));
      this.incrementletterprivileges = JSON.parse(z);
      //console.log(this.incrementletterprivileges.VIEW);

      this.getApiData();
      

      moment.locale('en');
      this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
          return;
        }
        window.scrollTo(0, 0)
      });
      this.transferTypes();
      this.transferDetails();
      this.businessunit();
      this.departments();
      this.designation();
      this.fetchPromotionEmployees();
      // this.isLoading=true;
    this.promotionForm.get('empid')?.valueChanges
    .pipe(
      debounceTime(1000),
      distinctUntilChanged()
    )
    .subscribe(empId => {
      if (empId && empId.length >= 5) {
        this.fetchPromotionDetails(empId);
      } else if(empId && empId.length <= 2){
        debounceTime(1000),
        distinctUntilChanged()
        this.promotionForm.patchValue({
          // empid: '',
          employeeid: '',
          businessUnitId: '',
          departmentId: '',
          designationId: '',
          transferTypeId: ''
        });
      }
     
    });
    this.promotionForm.get('search')?.valueChanges.subscribe((value) => {
      this.onSearchChange(value);
    });
   
  this.editPromotionForm = this.fb.group({
     empid: ['', Validators.required],
        employeeid: ['', Validators.required],
        transferTypeId: ['', Validators.required],
        transferId: [2, Validators.required],
        businessUnitId: ['', Validators.required],
        departmentId: ['', Validators.required],
        designationId: ['', Validators.required],
        // promotionTo: ['', Validators.required],
        transferredDate: ['', Validators.required],
        reportingDate:['',Validators.required],
        search: ['',Validators.required],
        reportingid:[''],
        sectionid:[''],
        prev_des: [null]
  });
  this.promotionForm.get('transferTypeId')?.valueChanges.subscribe((selectedTransferTypeId) => {
    if (selectedTransferTypeId == '1') {
      this.promotionForm.get('businessUnitId')?.disable();
     
    } else {
      this.promotionForm.get('businessUnitId')?.enable();
    }
  });
 
    }
   
    

    getApiData(){
     // alert("hi")
      this.authBoolean=false;
  
      for (let i = 0; i < this.Ryts.length; i++) {   
        if(this.Ryts[i].promotionletter == "true"||this.Ryts[i].parent == "1"){
          // console.log(this.Ryts[i].HRActions)
          this.authBoolean=true;
         /// alert("hi2")
        }
      }
      if(this.authBoolean== false){
        
        let x = 'false'; 
        this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
      }
  

    }
    refreshTable(): void {
      this.spinnr = true;
      this.fetchPromotionEmployees();
      setTimeout(()=>{
        this.spinnr=false;
      },300);
    }
  
onSearchChange(searchValue: string | null, isEdit: boolean = false) {
  if (!searchValue || searchValue.length >= 6) {
    this.reportiesList = [];
    isEdit ? (this.showEditDropdown = false) : (this.showDropdown = false);
    if (isEdit) {
      this.promotionForm.patchValue({
        search: '',  
        reportingid: null,  
      });
    }
    return;
  }
  this.reportiesList = [];
  const formData = new FormData();
  formData.append('search', searchValue);
 
  this.service.getSearchReporties(formData).subscribe(
    (data) => {
      this.reportiesList = data.map((item: any) => ({
        id: item.id,
        name: `${item.id} - ${item.name}`,
      }));
      if (isEdit) {
        this.showEditDropdown = true;
        this.showDropdown = false;
      } else {
        this.showDropdown = true;
        this.showEditDropdown = false;
      }
    },
    (error) => {
      //console.error('Error fetching reporties:', error);
    }
  );
}
selectReportie(reportie: any, event: Event, isEdit: boolean = false) {
  event.preventDefault(); 
  if (isEdit) {
    this.editPromotionForm.patchValue({
      search: reportie.name,
      reportingid: reportie.id
    });
    this.showEditDropdown = false; 
  } else {
    this.promotionForm.patchValue({
      search: reportie.name,
      reportingid: reportie.id
    });
    this.showDropdown = false; 
  }
}
 
  getPromotionEmployees(){
  this.service.getPromotionEmployees().subscribe((res:any)=>{
    this.employeelist=res;
    this.search=res;
});
}
 
 
fetchPromotionDetails(empid: any) {
 
  let formData = new FormData();
  formData.append('employeeseq', empid.toString());
 
  this.service.getPromotionbyempid(formData).subscribe(
    (res: any) => {
      //console.log("API Response:", res);
 
      if (res && res.length > 0) {
        const emp = res[0]; 
 
        this.promotionForm.patchValue({
          empid: emp.empid,
          employeeid: emp.employeeid,
          businessUnitId: emp.buid,
          departmentId: emp.departmentid,
          currentdesignationId: emp.designationname,
          transferTypeId: emp.employmenttypeid
        });
 
        //console.log("Form Updated with:", this.promotionForm.value);
      } else {
        //console.warn("No data found for Employee ID:", empid);
        Swal.fire({
          icon: 'error',
          title: 'Employee Not Found',
          text: `Employee with ID ${empid} not found.`,
          confirmButtonText: 'OK'
        });
        this.resetForm();
      }
    },
    (err) => {
      //console.error("Error fetching promotion data:", err);
      if (err.status === 404) {
 
        Swal.fire({
          icon: 'error',
          title: 'Employee Not Found',
          text: `Employee not found for employee sequence number: ${empid}`,
          confirmButtonText: 'OK'
        });
      } else {
        // Other error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while fetching promotion details. Please try again later.',
          confirmButtonText: 'OK'
        });
      }
    }
  );
}
 
fetchPromotionEmployees() {
  //console.log("Fetching promotions...");
  this.isLoading = true;
  this.service.getPromotionEmployees().subscribe(
    (res: any[]) => {
      //console.log("Promotion Employees:", res);
      this.employeelist = res;
      this.universitySearch = res;
      this.filteredData = [...this.employeelist];
      this.calculateTotalPages(); 
      this.isLoading = false;
      //console.log(this.filteredData);
    },
    (err) => {
      //console.error("Error fetching promotion employees:", err);
      this.isLoading = false;
     // alert("There was an error fetching the promotion employees.");
    }
  );
}
 
 
transferTypes(){
  this.service.getTransferTypes().subscribe((res:any)=>{
    this.transferTypesList = res;
  })
}
 
 
transferDetails(){
  this.service.getTransferDetails().subscribe((res:any)=>{
    this.transferDetailsList = res;
  })
}
businessunit(){
  this.service.getBusinessUnit().subscribe((res:any)=>{
    this.businessunitlist=res;
    ////console.log("test",this.businessunitlist);
  })
}
departments(){
  this.service.getDepartmentAndSection().subscribe((res:any)=>{
    this.departmentList=res;
  })
}
designation(){
  this.service.getPromotionDesignation().subscribe((res:any)=>{
    this.designationList=res;
    ////console.log("testing",this.designationList);
  })
}
originalPromotionData: any;
editPromotion(emp: any) {
 this.resetForm();
  this.showPopup = true;
   this.originalPromotionData = emp;
  this.selectedTransactionId = emp.transactionid;
  const reportingManager = emp.reportingid && emp.reportername
    ? `${emp.reportingid} - ${emp.reportername}`
    : '';
 //alert(emp.prev_des)
  this.editPromotionForm.patchValue({
    empid: emp.empid,
    employeeid: emp.employeeid,
    businessUnitId: emp.businessUnitId,
    departmentId: emp.departmentId,
    designationId: emp.designationId,
    transferTypeId: emp.transferTypeId,
    transferId: emp.transferId,
    reportingDate: emp.reportingdate ? new Date(emp.reportingdate).toISOString().split('T')[0] : '',
    reportingid: emp.reportingid || '',
    search: reportingManager,
    prev_des: emp.prev_des || '',
    transferredDate: emp.transferredDate ? new Date(emp.transferredDate).toISOString().split('T')[0] : '',
  });
}
 
selectedTransactionId: number | null = null;
onBlurSearch() {
  const searchValue = this.editPromotionForm.get('search')?.value;
  if (searchValue && searchValue.trim() !== '') {
    this.editPromotionForm.patchValue({
      search: ''  
    });
  }
}
 
onSubmit() {
  //console.log("Form Valid:", this.promotionForm.valid);
  //console.log("Form Values:", this.promotionForm.value);
 
  if (!this.promotionForm.valid) {
    this.promotionForm.markAllAsTouched();
    Swal.fire("Validation Error", "Please fill all required fields!", "warning");
    return;
  }
  if (this.promotionForm.get('businessUnitId')?.disabled) {
    this.promotionForm.get('businessUnitId')?.enable();
  }
  const selectedDepartmentId = this.promotionForm.value.departmentId;
  const selectedDepartment = this.departmentList.find(department => department.departmentid === selectedDepartmentId);
  const sectionId = selectedDepartment ? selectedDepartment.sectionid : null;
  const formData = {
    employeeid: this.promotionForm.value.employeeid ? Number(this.promotionForm.value.employeeid) : null,
    transfertypeid: Number(this.promotionForm.value.transferTypeId),
    transferid: Number(this.promotionForm.value.transferId),
    businessunitid: Number(this.promotionForm.value.businessUnitId),
    departmentid: Number(this.promotionForm.value.departmentId),
    sectionid: sectionId,  
    designationid: Number(this.promotionForm.value.designationId),
    transferreddate: this.promotionForm.value.transferredDate || null,
    reportingid: this.promotionForm.value.reportingid ? Number(this.promotionForm.value.reportingid) : null,
    reportingdate: this.promotionForm.value.reportingDate || null,
    createdby: this.promotionForm.value.empid ? Number(this.promotionForm.value.empid) : null,
  };
  //console.log("Submitting Form Data:", formData);
 
  this.service.promotionRegistation(formData).subscribe(
    (response: any) => {
      //console.log("Insert Response:", response);
     
    if (response.statusCode === "BAD_REQUEST" && response.body.includes("Record already exists")) {
        Swal.fire("Warning!", response.body, "warning");
    } else if (response.statusCode === "OK" || response.statusCode === 200) {
        Swal.fire("Success!", "Employee added successfully!", "success");
        this.fetchPromotionEmployees();
        this.resetForm();
    } else {
        Swal.fire("Error!", "Something went wrong, please try again.", "error");
        this.fetchPromotionEmployees();
    }
    },
    (error) => {
      //console.error("Insert Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
      this.resetForm();
    }
  );
}
 
isFormUnchanged(currentValues: any): boolean {
  if (!this.editPromotionForm || !this.editPromotionForm.value || !currentValues) {
    return true;
  }
  const formValues = this.editPromotionForm.getRawValue();
 
  //console.log("Form Values:", formValues);
  //console.log("Current Values:", currentValues);
  return (
    formValues.empid === currentValues.empid &&
    formValues.employeeid === currentValues.employeeid &&
    formValues.businessUnitId === currentValues.businessUnitId &&
    formValues.departmentId === currentValues.departmentId &&
    formValues.designationId === currentValues.designationId &&
    formValues.transferTypeId === currentValues.transferTypeId &&
    formValues.transferId === currentValues.transferId &&
    formValues.reportingDate === currentValues.reportingdate &&
    formValues.reportingid === currentValues.reportingid &&
    formValues.search === `${currentValues.reportingid} - ${currentValues.reportername}` &&
    formValues.transferredDate === currentValues.transferredDate
  );
}
 
 
updatePromotion() {
  //console.log("Updating Promotion...");
  const formValues = this.editPromotionForm.getRawValue();
  const currentValues = this.originalPromotionData;
  //console.log("Form Values:", formValues);
  //console.log("Current Values:", currentValues);
 
  if (this.isFormUnchanged(currentValues)) {
    //console.warn("⚠️ No changes detected! Check the values in the logs above.");
    Swal.fire({
      title: "No Changes",
      text: "No changes detected. Please modify fields before submitting.",
      icon: "info",
      confirmButtonText: "OK",
    });
    return;
  }
 
  if (!this.editPromotionForm.valid) {
    Swal.fire("Validation Error", "Please fill all required fields!", "warning");
    return;
  }
  const formData = {
    empid: this.editPromotionForm.value.empid,
    employeeid: this.editPromotionForm.value.employeeid,
    transfertypeid: this.editPromotionForm.value.transferTypeId,
    transferid: this.editPromotionForm.value.transferId,
    businessunitid: this.editPromotionForm.value.businessUnitId,
    departmentid: this.editPromotionForm.value.departmentId,
    designationid: this.editPromotionForm.value.designationId,
    transferreddate: this.editPromotionForm.value.transferredDate,
    reportingid: this.editPromotionForm.value.reportingid,
    reportingdate: this.editPromotionForm.value.reportingDate,
    createdby: this.editPromotionForm.value.empid,
  };
 
  // Call the service to update the promotion
  this.service.updatepromotion(this.selectedTransactionId, formData).subscribe(
    (response: any) => {
      //console.log("Update Response:", response);
      if (response) {
        Swal.fire("Success!", "Employee updated successfully!", "success");
        this.editPromotionForm.reset();
        this.showPopup = false;
        this.fetchPromotionEmployees();
      } else {
        Swal.fire("Error", "Failed to update employee!", "error");
      }
    },
    (error) => {
      //console.error("Update Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  );
}
 
deletePromotion(employee: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete promotion for employee ID: ${employee.employeeid}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it'
  }).then((result) => {
    if (result.isConfirmed) {
      this.selectedTransactionId = employee.transactionid;
      this.service.deletepromotion(this.selectedTransactionId).subscribe((res: any) => {
        //console.log("Promotion deleted");
        this.fetchPromotionEmployees();  
        Swal.fire(
          'Deleted!',
          'The promotion has been deleted.',
          'success'
        );
      });
    } else {
      Swal.fire(
        'Cancelled',
        'The promotion was not deleted.',
        'error'
      );
    }
  });
}

resetForm() {
   this.promotionForm.reset();
  this.promotionForm.patchValue({
    empid: '',
    businessUnitId: '',
    departmentId: '',
    transferTypeId: '',
    transferId: '2',
    designationId: '',
    reportingDate: '',
    search: '',
    reportingid: '',
    transferredDate: ''
  });
 
  this.reportiesList = [];
  this.showDropdown = false;
  this.showEditDropdown = false;
 
}
PromotionshowFormModal(emp:any) {
  this.service.getPromotionPdf(emp.employeeid, emp.transactionid).subscribe((responseMessage) => {
    let file = new Blob([responseMessage], { type: 'application/pdf' });
    var fileURL = URL.createObjectURL(file);
    this.Promotionview = fileURL;
    this.Promotionview_mob = this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
  });
  this.PromotionviewModal = !this.PromotionviewModal;
  this.renderer.addClass(this.document.body, 'modal-open');
}
 
PromotioncloseformModal() {
  this.PromotionviewModal = false;
  this.renderer.removeClass(this.document.body, 'modal-open');
}
closeformModal() {
  this.form16Modal = false;
   this.renderer.removeClass(this.document.body, 'modal-open');
}
restrictInput(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  if (event.key < '0' || event.key > '9') {
    if (event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
  }
  if (input.value.length >= 8) {
    event.preventDefault();
  }
}
onInput(event: any): void {
  let value = event.target.value;
  value = value.replace(/[^0-9]/g, '');  
  event.target.value = value;
}
 
applySearchFilter(): void {
  if (!this.searchTermUniversity) {
    this.filteredData = [...this.universitySearch];
  } else {
    const searchTermLowerCase = this.searchTermUniversity.toLowerCase();
   
    this.filteredData = this.universitySearch.filter((item: any) => {
      return (
        item.employeeid.toString().includes(searchTermLowerCase) ||
        item.callname.toLowerCase().includes(searchTermLowerCase)
      );
    });
  }
 
  this.currentPage = 1;
  this.calculateTotalPages(); 
}
 
 
 
get paginatedData() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredData.slice(start, start + this.itemsPerPage);
}
 
calculateTotalPages() {
  this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }
}
 
get paginationRange() {
  const range: (number | string)[] = [];
  const visiblePages = 10;
  if (this.totalPages <= visiblePages) {
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
  } else {
    range.push(1);
    if (this.currentPage > visiblePages) {
      range.push("...");
    }
    let startPage = Math.max(2, this.currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + visiblePages - 2);
 
    if (endPage - startPage < visiblePages - 2) {
      startPage = Math.max(2, endPage - visiblePages + 2);
    }
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    if (endPage < this.totalPages) {
      range.push("...");
    }
  }
  return range;
}
 
 
nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}
 
prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
 
goToPage(page: number | string) {
  if (typeof page === "number") {
    this.currentPage = page;
  }
}
 
 
  }