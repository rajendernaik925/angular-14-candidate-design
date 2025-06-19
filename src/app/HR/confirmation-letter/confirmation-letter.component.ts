import { HttpClient } from '@angular/common/http';
import { Component, OnInit ,Renderer2,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'src/app/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-confirmation-letter',
  templateUrl: './confirmation-letter.component.html',
  styleUrls: ['./confirmation-letter.component.sass']
})
export class ConfirmationLetterComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  confirmationForm: FormGroup;
  editForm: FormGroup;
  status: any[] = [];
  department: any[] = [];
  designation: any[] = [];
  displaydata:any[]=[];
  privil_eges: any;
  currentPage = 1; 
  itemsPerPage = 10;
 totalPages = 0;
 filteredData: any[] = [];
searchTerm: string = '';
isPopupOpen: boolean = false;
selectedEmployee:any;
empid:any;
maxDate: Date = new Date();
 
  form16Modal: boolean;
  employmenttypeid:any;
   
  
  Ryts: any;
  letterprivileges: any;
  public Promotionview: any;
  Promotionview_mob: any;
  public PromotionviewModal: boolean;
  isLoading:Boolean=false;
  isUpdating = false;
  spinnr:boolean;
  authBoolean: boolean
  constructor(   @Inject(DOCUMENT) private document: Document,private renderer: Renderer2,private dom: DomSanitizer,private fb: FormBuilder, private authservice: AuthService, public router: Router) {}

  ngOnInit(): void {
    // Decode user data from local storage
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');

    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
      this.Ryts = JSON.parse(x).Rights;
      let y= decodeURIComponent(window.atob(localStorage.getItem('letterprivileges')));
      this.letterprivileges = JSON.parse(y);
      let z= decodeURIComponent(window.atob(localStorage.getItem('incrementletterprivileges')));



      this.authBoolean = false;
      for (let i = 0; i < this.Ryts.length; i++) {
        if (this.Ryts[i].employee_cnf == "true" || this.Ryts[i].parent == "1") {
          this.authBoolean = true;
        }
      }
      if (this.authBoolean == false) {
        let x = 'false';
        this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
      }


      
    // Initialize Form
    this.confirmationForm = this.fb.group({
      empid:['',  [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(5), Validators.maxLength(8)]],
      employeeid: [''],    
      department: ['', Validators.required],
      designation: ['', Validators.required],
      status: ['', Validators.required],
       confirmationDate: ['', Validators.required], 
      remarks: [''],
      sectionid:['']
    });
  this.editForm = this.fb.group({
    empid:[''],
    employeeid: [''],  
    department: [''],
    designation: [''],
    status: [''],
   confirmationDate: [new Date()],
    remarks: [''],
    sectionid:['']
  });
    this.getstatus();
    this.getDepartment();
    this.getDesignation();
    this.displayData();
 this.confirmationForm.get('empid')?.valueChanges
    .pipe(
      debounceTime(300), 
      distinctUntilChanged()
    )
    .subscribe(empId => {
      if (empId && empId.length >= 5) {
        this.fetchPromotionDetails(empId);
      }
    });

  this.confirmationForm.get('empid')?.valueChanges.subscribe(empId => {
    if (!empId || empId.length < 5) {
      this.clearFields();
    }
  });
  }
refreshTable() {
  this.spinnr = true; 
   this.displayData();
  setTimeout(() => {
    this.isLoading=false;
    this.spinnr = false; 
  }, 2000); 
}

fetchPromotionDetails(empid: string) {
 if (!empid || empid.toString().trim().length < 5) {
    console.warn("Employee ID is less than 5 characters, clearing form...");
    this.clearFields(); 
    return;
  }

  let formData = new FormData();
  formData.append('employeeseq', empid.toString()); 

  this.authservice.getPromotionbyempid(formData).subscribe(
    (res: any) => {
      // console.log("API Response:", res);

      if (res && res.length > 0) {
        const emp = res[0]; 

        this.confirmationForm.patchValue({
          empid: emp.empid,
          employeeid: emp.employeeid,
          department: emp.departmentid,
          designation: emp.designationid,
        });
        this.isLoading=false;
      } else {
        this.clearFields(); 
       
      }
    },
    (err) => {
   
      if (err.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Employee Not Found',
          text: `Employee not found for employee sequence number: ${empid}`,
          confirmButtonText: 'OK'
        });
         
      } else {
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
clearFields() {
  this.confirmationForm.patchValue({
    department: '',
    designation: '',
  }, { emitEvent: false });
}
getstatus() {
    this.authservice.getstatus().subscribe(
      (data) => { this.status = data; },
      (error) => { console.error('Error fetching status:', error); }
    );
  }

  getDepartment() {
    this.authservice.getdepartments().subscribe(
      (data) => { this.department = data;
      console.log("test1",this.department); 
    },
      (error) => { console.error('Error fetching departments:', error); }
    );
  }

  getDesignation() {
    this.authservice.getPromotionDesignation().subscribe(
      (data) => { this.designation = data; },
      (error) => { console.error('Error fetching designations:', error); }
    );
  }
displayData(){
    this.authservice.displayData().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.displaydata = data;
          this.filteredData = [...this.displaydata]; 
          this.calculateTotalPages();
           this.isLoading=false;
           console.log("TESt",data);
        } else {
          this.displaydata = [];
           this.isLoading=false;
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.displaydata = [];
      }
    );
  }
  search() {
    if (!this.searchTerm) {
      this.filteredData = [...this.displaydata]; 
    } else {
      this.filteredData = this.displaydata.filter((employee) => {
        const term = this.searchTerm.toLowerCase();
        return (
          employee.empid.toString().includes(term) || 
          employee.ONDATE.includes(term) 
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

openEditPopup(employee: any) {
  this.selectedEmployee = employee;
  this.isPopupOpen = true;

  this.editForm.patchValue({
    empid: employee.empid,
    employeeid:employee.employeeid,
    department: employee.DEPARTMENTID, 
    designation: employee.DESIGNATIONID, 
    status: employee.EMPLOYMENTTYPEID, 
    confirmationDate: employee.ONDATE,
    remarks: employee.COMMENTS
  });

  console.log("Patched Form Values:", this.editForm.value); // ✅ Correct Logging
}

  closePopup() {
    this.isPopupOpen = false;
    this.selectedEmployee = null;
    this.onReset();
  }
  onSubmit() {
  if (this.confirmationForm.invalid) {
    this.confirmationForm.markAllAsTouched();
    return;
  }

  if (this.confirmationForm.valid) {
    const selectedDepartment = this.department.find(
      (dept: any) => dept.departmentid === this.confirmationForm.value.department
    );

    const requestData = {
      empid: this.confirmationForm.value.empid,
      employeeid: this.confirmationForm.value.employeeid,
      designationid: this.confirmationForm.value.designation,
      departmentid: this.confirmationForm.value.department,
      employmenttypeid: this.confirmationForm.value.status,
      confirmationdate: this.confirmationForm.value.confirmationDate,
      comments: this.confirmationForm.value.remarks,
      sectionid: selectedDepartment ? selectedDepartment.sectionid : null,
    };
this.isLoading=true;
    this.authservice.getconfirmationregistation(requestData).subscribe(
      (response) => {
        console.log("✅ Success:", response);
        
        Swal.fire({
          title: "Success!",
          text: "Employee confirmation submitted successfully.",
          icon: "success",
          timer: 2000, // Auto-close after 2 seconds
          showConfirmButton: false,
        });
this.isLoading=false;
        this.onReset();
        this.displayData();
      },
      (error) => {
       this.isLoading=false;
        Swal.fire({
          title: "Error!",
          text: "Failed to submit employee confirmation. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    );
  } else {
    console.log("⚠ Form is invalid");
this.isLoading=false;
    Swal.fire({
      title: "Validation Error!",
      text: "Please fill all required fields correctly.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  }
}

isFormUnchanged(currentValues: any): boolean {
  if (!this.selectedEmployee) return true; 

  return (
    Number(this.selectedEmployee.DEPARTMENTID) === Number(currentValues.department) &&
    Number(this.selectedEmployee.DESIGNATIONID) === Number(currentValues.designation) &&
    Number(this.selectedEmployee.EMPLOYMENTTYPEID) === Number(currentValues.status) &&
    this.selectedEmployee.ONDATE === currentValues.confirmationDate &&
    this.selectedEmployee.COMMENTS === currentValues.remarks
  );
}

onUpdate() {
  if (this.editForm.invalid) {
    this.editForm.markAllAsTouched();
    return;
  }
   const currentValues = this.editForm.getRawValue();
  if (this.isFormUnchanged(currentValues)) {
    Swal.fire({
      title: "No Changes",
      text: "No changes. Please update fields before submitting.",
      icon: "info",
      confirmButtonText: "OK",
    });
    return;
  }

  const empid = this.editForm.value.empid;
  if (!empid) {
    return;
  }
 const selectedDepartment = this.department.find(
    (dept: any) => Number(dept.departmentid) === Number(this.editForm.value.department)
  );

  // if (!selectedDepartment) {
  //   console.warn("⚠ No matching department found for:", this.editForm.value.department);
  // } else {
  //   console.log("✅ Selected Department:", selectedDepartment);
  // }

  const requestData = {
    empid: this.editForm.value.empid,
    employeeid: this.editForm.value.employeeid,  
    designationid: Number(this.editForm.value.designation),
    departmentid: Number(this.editForm.value.department),
    employmenttypeid: Number(this.editForm.value.status),
    confirmationdate: this.editForm.value.confirmationDate,
    comments: this.editForm.value.remarks,
     sectionid: selectedDepartment ? selectedDepartment.sectionid : null,
  };
this.isLoading=true;
this.authservice.updateConfirmation(this.editForm.value.employeeid, requestData).subscribe(
  (response) => {
    console.log(" Update Successful:", response);
    this.closePopup();
    Swal.fire({
      title: "Success!",
      text: "Employee details updated successfully.",
      icon: "success",
      timer: 2000, 
      showConfirmButton: false,
    });

    setTimeout(() => {
      this.displayData();
    }, 500);
    this.isLoading=false;
  },
  (error) => {
    Swal.fire({
      title: "Error!",
      text: "Failed to update employee details.",
      icon: "error",
      confirmButtonText: "OK",
    });
     this.isLoading=false;
  }
);
}

onReset(){
   this.confirmationForm.reset({
          employeeid: '',
          department: '', 
          designation: '', 
          status: '', 
          confirmationDate: '',
          remarks: ''
        });
 this.editForm.reset({
          employeeid: '',
          department: '', 
          designation: '', 
          status: '', 
          confirmationDate: '',
          remarks: ''
        });
}

PromotionshowFormModal(employee:any) {
  // this.isLoading=true;
  this.authservice.getConfirmationPDF(employee.empid, "confimationletter").subscribe((responseMessage) => {
     
       this.isLoading=false;
    let file = new Blob([responseMessage], { type: 'application/pdf' });
    var fileURL = URL.createObjectURL(file);
    this.Promotionview = fileURL;
    this.Promotionview_mob = this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));

  });
    // this.isLoading=false;
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
isNumberKey(event: KeyboardEvent): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
    return false;
  }
  return true;
}
validateNumberInput() {
  const inputField = this.confirmationForm.get('empid');
  if (inputField) {
    inputField.setValue(inputField.value.replace(/\D/g, ''), { emitEvent: false });
  }
}

deleteConfirmation(employee: any) {
  this.empid=employee.empid;
  this.selectedEmployee = employee.employeeid;
  this.employmenttypeid = employee.EMPLOYMENTTYPEID;

  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete Employee ID: ${this.empid}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authservice.deleteConfirmation(this.selectedEmployee, this.employmenttypeid).subscribe(
        (response) => {
          Swal.fire(
            'Deleted!',
            `Employee ID ${this.empid} has been deleted.`,
            'success'
          );
          this.displayData();
        },
        (error) => {
          Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
        }
      );
    }
  });
}
disableTyping(event: KeyboardEvent) {
  event.preventDefault();
}
filterRemarks(event: Event) {
  const input = event.target as HTMLTextAreaElement;
  input.value = input.value.replace(/[^a-zA-Z0-9\s]/g, ''); // Allows only letters, numbers, and spaces
}

}
