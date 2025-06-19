import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mastercreation',
  templateUrl: './mastercreation.component.html',
  styleUrls: ['./mastercreation.component.sass']
})
export class MastercreationComponent implements OnInit, OnDestroy {
  selectedView: string = 'create-university';
  selectedRadio: string = 'qualification';
  public isLoading: boolean = false;
  private routeSubscription: Subscription;
  loggedUser: any = {};
  userData: any;
  myDate: Date = new Date(); 
  departmentslist: any[] = [];
  selectedEducationLevelId: string | null = null; 
  departmentslists: any[] = [];
  designationslist:any[]=[];
  branchslist:any[]=[];
  designationslists:any[]=[];
  universityslist:any[]=[];
  qualificationslist:any[]=[];
  businessunitList:any[]=[];
  educationlevellist:any[]=[];
  qualificationlist:any[]=[];
  selectedQualification: any;
  searchTermBranch:any;
  branchlist:any[]=[];
  universityForm: FormGroup;
  departmentForm:FormGroup;
  searchTermDesignation:any;
  searchTermQualification:any;
  qualificationSearch:any;
  branchSearch:any;
  designationForm:FormGroup;
  qualificationForm:FormGroup;
  branchForm:FormGroup;
  universitycheck:boolean=false;
  selectedUniversityName: string | null = null;
  // selectedBusinessUnitDesignation: string | null = ""; 
  // selectedBusinessUnit: string | null = ""; 
  selectedBusinessUnitDesignation: string | null = ""; 
  selectedBusinessUnit: string | null = ""; 
  isEditing: boolean = false;
  isEditingqualification:boolean=false;
  isDesignation:boolean=false;
  isDepartment:boolean=false;
  searchTermUniversity:any;
  searchTermDepartment:any;
  selectedUniversityId: any;
  selectedDesignationId:any;
  designationSearchAssign:any;
  selectedqualificationid:any;
  departmentSearch:any;
  selectedDesignationName:any;
  selectedDesignationCode:any;
  selectedDesignationStatus:any;
  selectedDepartmentId:string;
  selectedDepartmentName:any;
  selectedDepartmentCode:any;
  selectedDepartmentStatus:any;
  universitySearch:any;
  designationSearch:any;
  searchTerm: any;
  searchTerms:any;
  searchTermAssignDepartment:any;
  empCode:any;
  departmentassignSearch:any;
  designationassignSearch:any;
  isBusinessUnitSelected: boolean = false; 
  isBusinessUnitDesignationSelected:boolean=false;
  selectedDepartments: any[] = []; 
  selectedDesignations:any[]=[];
  isEditingbranch:boolean=false;
  privil_eges:any= {}; 
  authBoolean:boolean
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute,private service:AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {


    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);

    let x =decodeURIComponent(window.atob(localStorage.getItem('privileges')));;
    this.privil_eges =   JSON.parse(x).Rights;

    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Mastercreations == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }

    


    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setSelectedViewBasedOnRoute(this.router.url);
        this.universityForm.reset();
        this.departmentForm.reset();
        this.departmentForm.patchValue({
          status: ''  
        });
        this.designationForm.reset();
        this.designationForm.patchValue({
          status: ''  
        }); 
        this.selectedBusinessUnit = ''; 
        this.businessUnit();  
        this.departments();
        this.isBusinessUnitSelected=false
        this.selectedBusinessUnitDesignation='';
        this.designations();
        this.isBusinessUnitDesignationSelected=false;
        // this.resetFormEducationlevel();
        this.searchTermQualification='';
        this.fetchqualification();
       // this.branchForm.reset();
       this.resetFormEducationlevel();
       this.resetFormbanch();
        this.searchTermBranch='';
        this.fetchbranch();
      }
    });

    

    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.setSelectedViewBasedOnRoute(this.router.url);
    this.departments();
    this.designations();
    this.universitys();
    this.businessUnit();
    this.universityForm = this.fb.group({
      name: ['',Validators.required] 
    });
   
    this.departmentForm=this.fb.group({
      name: ['', Validators.required],
      code:['',Validators.required],
      status:['',Validators.required]
    });
    this.designationForm=this.fb.group({
      name: ['', Validators.required],
      code:['',Validators.required],
      status:['',Validators.required]
    });
    this.qualificationForm = this.fb.group({
      qualificationId: [''],
      qualificationName: ['', [Validators.required, Validators.minLength(3)]],
      educationLevelId: ['', Validators.required],
      code: ['', [Validators.required]],
     // qualificationDisplayName: ['', [Validators.required, Validators.minLength(3)]],
    });
    
    this.branchForm = this.fb.group({
      qualificationid: ['', Validators.required],
      branchid: [''],
      branchname: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]]
    });
    this.educationLevel();
    this.fetchqualification();
    this.fetchbranch();
    this.qualificationlevel();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

  }
  setSelectedViewBasedOnRoute(url: string): void {
    if (url.includes('create-university')) {
      this.selectedView = 'create-university';
      this.resetFormAndFilters();
    } else if (url.includes('create-department')) {
      this.selectedView = 'create-department';
    } else if (url.includes('assign-department')) {
      this.selectedView = 'assign-department';
    } else if (url.includes('create-designation')) {
      this.selectedView = 'create-designation';
    } else if (url.includes('assign-designation')) {
      this.selectedView = 'assign-designation';
    }
    else if (url.includes('create-qualification')) {
      this.selectedView = 'create-qualification';
  }
}
businessUnit(){
this.empCode=this.userData.user.empID;
const formData=new FormData();
formData.append('empCode',this.empCode);
this.service.getBusinessunit(formData).subscribe((res:any)=>{
  //console.log("busines"+res);
  this.businessunitList=res;
})
}
//departments assign
onBusinessUnitChange() {
  this.isBusinessUnitSelected = this.selectedBusinessUnit !== ''; 
  this.isBusinessUnitSelected = this.selectedBusinessUnit ? true : false;
  const formData = new FormData();
  formData.append("Businessunitid", this.selectedBusinessUnit); 
  this.service.assignDepartments(formData).subscribe((res: any) => {
    //console.log("Assigned Business Unit Departments:", res);
    this.departmentslist.forEach(dept => {
      const assignedDept = res.find((assigned: any) => assigned.departmentid === dept.departmentid);
      if (assignedDept) {
        dept.isChecked = true; 
        dept.businessunitid = assignedDept.businessunitid; 
      } else {
        dept.isChecked = false;
        dept.businessunitid = this.selectedBusinessUnit;
      }
    });
    this.updateCheckedDepartments();
  });
}
onCheckboxChange(department: any) {
  if (department.isChecked) {
    //console.log(this.selectedBusinessUnit + "--" + department.departmentid);
    department.status = 1001; 
    this.selectedDepartments.push(department);
  } else {
    //console.log(`Department ${department.departmentid} unchecked, updating status to 1002.`);
    department.status = 1002;  
    if (department.departmentid && department.businessunitid) {
      this.selectedDepartments.push(department);
    }
  }
  this.updateCheckedDepartments();
}
updateCheckedDepartments() {
  this.selectedDepartments = []; 
  this.departmentslist.forEach(dept => {
    if (dept.departmentid && dept.businessunitid) {
      if (dept.isChecked) {
        dept.status = 1001;  
      } else {
        dept.status = 1002; 
      }
      this.selectedDepartments.push(dept);  
    } else {
      //console.warn(`Skipping department ${dept.departmentid} with invalid data.`);
    }
  });

  const result = this.selectedDepartments.map(department => ({
    departmentid: department.departmentid,
    businessunitid: department.businessunitid,
    status: department.status,
    sectionid:department.sectionid,
    createdby:this.userData.user.empID
  }));

  //console.log("Updated selected departments:", result);
  return result;
}
onSubmit(result: any[]) {
  const invalidDepartments = result.filter(department => 
    !department.departmentid || !department.businessunitid || department.status <= 0
  );
  
  if (invalidDepartments.length > 0) {
    //console.error("Invalid departments found:", invalidDepartments);
    return;
  }
  if (this.selectedBusinessUnit && result.length > 0) { 
    
    this.isLoading = true;
    //console.log("Submitting result:", result); 
    this.service.assignDepartmentinsert(result).subscribe(
      (res: any) => {
        this.isLoading = false;
       // console.log("Departments  assign inserted successfully:", res);
        Swal.fire({
          title: 'Success!',
          text: 'Departments Assign successfully updated!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.departments();
        this.selectedDepartments = []; 
      },
      (error) => {
        //console.error("Error inserting department:", error);
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: `Error inserting department.`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  } else {
    //console.error("Please select a Business Unit and at least one department.");
    this.isLoading = false;
    Swal.fire({
      title: 'Error!',
      text: `Please select a Business Unit and at least one department.`,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }
}
  departments(){
    this.service.getDepartments().subscribe((res:any)=>{
      this.departmentslist = res;
      this.departmentslists=res;
      this.departmentassignSearch = res;
      this.departmentSearch=res;
      if (this.selectedBusinessUnit) {
        ///console.log("selectedBusinessUnit"+this.selectedBusinessUnit)
        this.onBusinessUnitChange(); 
      }
    })
  }
  //designationassign
  designations(){
    this.service.getDesignations().subscribe((res:any)=>{
      this.designationslist = res;
      this.designationslists=res;
      this.designationSearch = res;
      this.designationSearchAssign=res;
      if (this.selectedBusinessUnitDesignation) {
        this.onBusinessUnitChangeDesignation(); 
      }
    })
  }
  onBusinessUnitChangeDesignation(){
    this.isBusinessUnitDesignationSelected = this.selectedBusinessUnitDesignation !== ''; 
    this.isBusinessUnitSelected = this.selectedBusinessUnitDesignation ? true : false;
    const formData = new FormData();
    formData.append("Businessunitid", this.selectedBusinessUnitDesignation); 
    this.service.assignDesignations(formData).subscribe((res: any) => {
      //console.log("Assigned Business Unit Designations:", res);
      this.designationslist.forEach(design => {
        const assignedDesignation = res.find((assigned: any) => assigned.designationid === design.designationid);
        if (assignedDesignation) {
          design.isChecked = true; 
          design.businessunitid = assignedDesignation.businessunitid; 
        } else {
          design.isChecked = false;
          design.businessunitid = this.selectedBusinessUnitDesignation;
        }
      });
      this.updateCheckedDesignations();
    });
  }
  onCheckboxChangeDesignation(designation: any) {
    designation.createdBy=this.userData.user.empID ;
    if (designation.isChecked) {
      //console.log(this.selectedBusinessUnitDesignation + "--" + designation.designationid);
      designation.status = 1001; 
      
      this.selectedDesignations.push(designation);
    } else {
      //console.log(`Designation ${designation.designationid} unchecked, updating status to 1002.`);
      designation.status = 1002;  
      if (designation.designtaionid && designation.businessunitid) {
        this.selectedDesignations.push(designation);
      }
    }
    this.updateCheckedDesignations();
  }
  updateCheckedDesignations() {
    this.selectedDesignations = []; 
    this.designationslist.forEach(design => {
        if (design.designationid && design.businessunitid) {
            if (design.isChecked) {
                design.status = 1001;  
            } else {
                design.status = 1002; 
            }
            // Set createdBy to 12779
            //design.createdBy = 12779;
            this.selectedDesignations.push(design);  
        } else {
            //console.warn(`Skipping designations ${design.designationid} with invalid data.`);
        }
    });

    const resultdesignations = this.selectedDesignations.map(designations => ({
        designationid: designations.designationid,
        businessunitid: designations.businessunitid,
        status: designations.status,
        createdBy: designations.createdBy,  // Add createdBy here
    }));

    //console.log("Updated selected designations:", resultdesignations);
    return resultdesignations;
}

  onSubmitDesignation(resultdesignations: any[]) {
    const invalidDesignations = resultdesignations.filter(designation => 
      !designation.designationid || !designation.businessunitid || designation.status <= 0
    );
    
    if (invalidDesignations.length > 0) {
      //console.error("Invalid designations found:", invalidDesignations);
      return;
    }
    this.isLoading = true;
    if (this.selectedBusinessUnitDesignation && resultdesignations.length > 0) {
      //console.log("Submitting result:", resultdesignations); 
      this.service.assignDesignationinsert(resultdesignations).subscribe(
        (res: any) => {
          this.isLoading=false;
          //console.log("Designations assign inserted successfully:", res);
          Swal.fire({
            title: 'Success!',
            text: 'Designations Assign successfully updated!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.designations();
          this.selectedDesignations = []; 
        },
        (error) => {
          this.isLoading=false;
          Swal.fire({
            title: 'Error!',
            text: `Error inserting designations.`,
            icon: 'error',
            confirmButtonText: 'OK',
          });
          //console.error("Error inserting designations:", error);
        }
      );
    } else {
      this.isLoading=false;
      //console.error("Please select a Business Unit and at least one designations.");
      Swal.fire({
        title: 'Error!',
        text: `Please select a Business Unit and at least one designations.`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  universitys(){
    this.service.getUniversitys().subscribe((res:any)=>{
      this.universityslist = res;
      this.universitySearch = res;
    })
  }
  insertUniversity(): void {
    this.universityForm.markAllAsTouched();
    if (this.universityForm.invalid) {
      return; 
    }
  
    const name = this.universityForm.get('name')?.value.toUpperCase();  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('createdBy', this.empCode);
    formData.append('type', 'UNIVERSITY');
  
    if (this.isEditing) {
      Swal.fire({
        title: 'Do you want to update this university?',
        text: `University Name: ${name}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update it!',
        cancelButtonText: 'No, Cancel',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          const universityId = this.selectedUniversityId;
          const type = 'UNIVERSITY';
          const createdby = this.userData.user.empID;
          this.service.updateUniversity(universityId, name, createdby, type).subscribe(
            (res: any) => {
              this.isLoading = false;
              if (res.statusCodeValue === 200) {
                this.universitys();  
                this.resetForm(); 
                Swal.fire({
                  title: 'Success!',
                  text: 'University successfully updated!',
                  icon: 'success',
                  confirmButtonText: 'OK',
                });
              } else if (res.statusCodeValue === 400) {
                Swal.fire({
                  title: 'Error!',
                  text: `University with the name '${name}' already exists.`,
                  icon: 'error',
                  confirmButtonText: 'OK',
                });
              }
            },
            (error: any) => {
              this.isLoading = false;
              Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred while updating the university, please contact Admin.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          );
        } else {
          this.resetForm();  
        }
      });
    } else {
      this.isLoading = true;
      this.service.insertUniversity(formData).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res.statusCodeValue === 200) {
            this.universitys();  
            this.resetForm();  
            Swal.fire({
              title: 'Success!',
              text: 'University successfully inserted!',
              icon: 'success',
              confirmButtonText: 'OK',
            });
          } else if (res.statusCodeValue === 400) {
            Swal.fire({
              title: 'Error!',
              text: `University with the name '${name}' already exists.`,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        },
        (error: any) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred while inserting the university, please contact Admin.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }
insertDepartment(): void {
  this.departmentForm?.markAllAsTouched();
  if (this.departmentForm.invalid) {
    return; 
  }
  const name = this.departmentForm.get('name')?.value.toUpperCase();
  const code = this.departmentForm.get('code')?.value.toUpperCase();
  const status = this.departmentForm.get('status')?.value;
  const formData = new FormData();
  formData.append('name', name);
  formData.append('code', code);
  formData.append('status', status);
  formData.append('createdby', this.empCode);
  formData.append('type', 'DEPARTMENT');
  if (!this.isDepartment) {
    this.isLoading = true;

    this.service.insertDepartment(formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.statusCodeValue === 200) {
          Swal.fire({
            title: 'Success!',
            text: 'Department successfully Inserted!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.departments(); 
          this.resetFormDepartments(); 
        } else if (res.statusCodeValue === 400) {
          Swal.fire({
            title: 'Error!',
            text: `Department with the name '${name}' already exists.`,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          this.isLoading = false;
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred while inserting the department.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      (error: any) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: 'An unexpected error occurred while inserting the department, please contact Admin.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  } else {
    // Show confirmation pop-up only when updating an existing department
    Swal.fire({
      title: `Are you sure you want to update the department?`,
      text: `Department Name: ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        // Proceed with Update
        const departmentId = this.selectedDepartmentId;
        const modifiedby = this.userData.user.empID;
        const type = 'DEPARTMENT';
    
        this.service.updateDepartment(departmentId, name, code, status, modifiedby, type).subscribe(
          (res: any) => {
            this.isLoading = false;
            if (res.statusCodeValue === 200) {
              Swal.fire({
                title: 'Success!',
                text: 'Department successfully Updated!',
                icon: 'success',
                confirmButtonText: 'OK',
              });
              this.departments(); // Refresh department list
              this.resetFormDepartments(); // Reset form
            } else if (res.statusCodeValue === 400) {
              Swal.fire({
                title: 'Error!',
                text: `Department with the name '${name}' already exists.`,
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          (error: any) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error!',
              text: 'An unexpected error occurred while updating the department, please contact Admin.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        );
      } else {
        this.resetFormDepartments();
      }
    });
  }
}

insertDesignation(): void {
  this.designationForm?.markAllAsTouched();
  if (this.designationForm.invalid) {
    return; 
  }

  const name = this.designationForm.get('name')?.value.toUpperCase(); 
  const code = this.designationForm.get('code')?.value.toUpperCase();
  const status = this.designationForm.get('status')?.value;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('code', code);
  formData.append('status', status);
  formData.append('createdby', this.empCode);
  formData.append('type', 'DESIGNATION');

  // If it's not an update, submit the form directly (no confirmation pop-up)
  if (!this.isDesignation) {
    this.isLoading = true;

    this.service.insertDesignation(formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.statusCodeValue === 200) {
          Swal.fire({
            title: 'Success!',
            text: 'Designation successfully Inserted!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.designations(); 
          this.resetFormDesignation(); 
        } else if (res.statusCodeValue === 400) {
          Swal.fire({
            title: 'Error!',
            text: `Designation with the name '${name}' already exists.`,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred while inserting the designation.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      (error: any) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: 'An unexpected error occurred while inserting the designation, please contact Admin.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  } else {
    Swal.fire({
      title: `Are you sure you want to update the designation?`,
      text: `Designation Name: ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const designationId = this.selectedDesignationId;
        const modifiedby = this.userData.user.empID;
        const type = 'DESIGNATION';

        this.service.updateDesignation(designationId, name, code, status, modifiedby, type).subscribe(
          (res: any) => {
            this.isLoading = false;
            if (res.statusCodeValue === 200) {
              Swal.fire({
                title: 'Success!',
                text: 'Designation successfully Updated!',
                icon: 'success',
                confirmButtonText: 'OK',
              });
              this.designations(); 
              this.resetFormDesignation(); 
            } else if (res.statusCodeValue === 400) {
              Swal.fire({
                title: 'Error!',
                text: `Designation with the name '${name}' already exists.`,
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          (error: any) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error!',
              text: 'An unexpected error occurred while updating the designation, please contact Admin.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        );
      } else {
        this.resetFormDesignation();
      }
    });
  }
}


  editDesignation(designationid: any, name: any, code: any, status: any): void {
    //alert(designationid + "-" + name + "-" + code + "-" + status);
    this.selectedDesignationId = designationid;
    this.selectedDesignationName = name;
    this.selectedDesignationCode = code;
    this.selectedDesignationStatus = status;
    this.isDesignation = true;
    this.designationForm.get('name')?.setValue(name);
    this.designationForm.get('code')?.setValue(code);
    this.designationForm.get('status')?.setValue(status);
  }
  editDepartment(parentdepartmentid: any, name: any, code: any, status: any,departmentid:any): void {
    //alert(departmentid + "-" + name + "-" + code + "-" + status);

    this.selectedDepartmentId = parentdepartmentid+","+departmentid;
    this.selectedDepartmentName = name;
    this.selectedDepartmentCode = code;
    this.selectedDepartmentStatus = status;
    this.isDepartment = true;
    this.departmentForm.get('name')?.setValue(name);
    this.departmentForm.get('code')?.setValue(code);
    this.departmentForm.get('status')?.setValue(status);
  }
  resetFormDesignation(): void {
    this.isDesignation = false;
    this.selectedDesignationId = null;
    this.selectedDesignationName = null;
    this.selectedDesignationCode = null;
    this.selectedDesignationStatus = null;
    this.designationForm.reset();
  }
  resetFormDepartments(): void {
    this.isDepartment = false;
    this.selectedDepartmentId = null;
    this.selectedDepartmentName = null;
    this.selectedDepartmentCode = null;
    this.selectedDepartmentStatus = null;
    this.departmentForm.reset();
  }
  editUniversity(UNIVERSITYID:any,universityname:string){
    //alert(UNIVERSITYID+"--"+universityname);
    this.selectedUniversityName = universityname;
    this.selectedUniversityId=UNIVERSITYID;
    this.isEditing = true;
    this.universityForm.get('name')?.setValue(universityname);
    // this.universitycheck=true;
  }
  // resetForm() {
  //   this.isEditing = false;
  //   this.selectedUniversityName = null;  
  //   this.universityForm.reset();  
  // }
  resetForm(): void {
    this.universityForm.reset(); 
    this.isEditing = false; 
    this.selectedUniversityId = null; 
    this.selectedUniversityName = ''; 
  }

  cancelEdit() {
    this.resetForm();
    this.resetFormDesignation();
  }
  applySearchFilter() {
    if (!this.searchTermUniversity) {
      this.universityslist = this.universitySearch;
      return;
    }
    this.universityslist = this.universitySearch.filter((item: any) => {
      const dataString = JSON.stringify(item).toLowerCase();
      const searchTermLowerCase = this.searchTermUniversity.toLowerCase();
      return (
        dataString.includes(searchTermLowerCase) 
      );
    });
}
// restrictInput(event: any): void {
//   const inputField = event.target as HTMLInputElement;
//   const currentValue = inputField.value;
//   inputField.value = currentValue.replace(/[^a-zA-Z\s.]/g, '');
//   this.searchTermUniversity = inputField.value;
// }
restrictInput(event: any): void {
  const inputField = event.target as HTMLInputElement;
  let currentValue = inputField.value;
  if (currentValue[0] === ' ') {
    currentValue = currentValue.slice(1);
  }
  inputField.value = currentValue.replace(/[^a-zA-Z\s.]/g, '');
  this.searchTermUniversity = inputField.value;
}



applySearchFilterDepartment() {
  if (!this.searchTermDepartment) {
    this.departmentslist = this.departmentSearch;
    return;
  }
  const searchTermLowerCase = this.searchTermDepartment.toLowerCase();
  this.departmentslist = this.departmentSearch.filter((item: any) => {
    return (
      item.NAME.toLowerCase().includes(searchTermLowerCase) ||
      item.code.toLowerCase().includes(searchTermLowerCase)
    );
  });
  this.searchTermDepartment = '';
}

applySearchDesignation() {
  if (!this.searchTermDesignation) {
    this.designationslist = this.designationSearch;
    return;
  }
  
  this.designationslist = this.designationSearch.filter((item: any) => {
    const dataString = JSON.stringify(item).toLowerCase();
    const searchTermLowerCase = this.searchTermDesignation.toLowerCase();
    return (
      dataString.includes(searchTermLowerCase) 
    );
  });
  this.searchTermDesignation = '';
}
applySearchDesignationassign(){
  if (!this.searchTerms) {
    this.designationslists = this.designationSearchAssign;
    return;
  }
  this.designationslists = this.designationSearchAssign.filter((item: any) => {
    const dataString = JSON.stringify(item).toLowerCase();
    const searchTermLowerCase = this.searchTerms.toLowerCase();
    return (
      dataString.includes(searchTermLowerCase) 
    );
  });
  this.searchTerms = '';
}
applySearchFilterDepartmentAssign(){
if (!this.searchTermAssignDepartment) {
  this.departmentslists = this.departmentassignSearch;
  return;
}
const searchTermLowerCase = this.searchTermAssignDepartment.toLowerCase();
this.departmentslists = this.departmentassignSearch.filter((item: any) => {
  return (
    item.NAME.toLowerCase().includes(searchTermLowerCase) ||
    item.code.toLowerCase().includes(searchTermLowerCase)
  );
});
this.searchTermAssignDepartment = '';

}
convertToUpperCase(event: any): void {
  const inputField = event.target;
  inputField.value = inputField.value.toUpperCase(); 
}
allowOnlyLettersAndSpaces(event: KeyboardEvent) {
  const charCode = event.key;
  const inputField = event.target as HTMLInputElement;
  const inputValue = inputField.value;
  if (charCode === "Backspace") {
    return; 
  }

  if (charCode === " " && inputValue.length === 0) {
    event.preventDefault(); 
  } else if (!/^[a-zA-Z\s.]$/.test(charCode)) {
    event.preventDefault(); 
  }
}


onCopy(event: ClipboardEvent) {
  event.preventDefault(); 
}

onPaste(event: ClipboardEvent) {
  event.preventDefault(); 
}
resetFormAndFilters(): void {
  this.searchTermUniversity = '';
  this.universitys(); 
  this.searchTermDesignation='';
  this.designations();
  this.searchTermDepartment=''; 
  this.departments();
  this.searchTermAssignDepartment='';
  this.departments();
  this.searchTermBranch='';
  this.fetchbranch();
  this.searchTermQualification='';
  this.fetchqualification();
  this.isEditingbranch=false;
  this.isEditingqualification=false;
  this.isEditing=false;
  this.isDepartment=false;
  this.isDesignation=false;
  this.qualificationlevel();
}

educationLevel(){
  this.service.getEduationLevel().subscribe((res:any)=>{
    //console.log("eduaction level"+res);
    this.educationlevellist=res;
  })
}
educationLevelS(event: any) {
   this.selectedEducationLevelId = event.target.value;
}
qualificationlevel() {
  const formdata = new FormData();
  this.service.getqualification().subscribe((res: any) => {
    //console.log('Qualification List:', res);
    this.qualificationlist = res;
  });
}
qualificationlevels(event:any){
  this.selectedqualificationid = event.target.value;
}

branchlevel(event:any){
  const selectedbranchid = event.target.value;
  //console.log('Selected branch Level ID:', selectedbranchid);
}
 setSelection(value: string): void {
  this.selectedRadio = value;
  this.fetchqualification();
  this.isEditingqualification=false;
  this.resetFormEducationlevel();
  this.fetchbranch();
  //this.branchForm.reset();
  this.resetFormbanch();
  this.isEditingbranch=false;
  this.qualificationlevel();
}
fetchqualification(){
  this.service.getqualification().subscribe((res:any)=>{
    this.qualificationslist=res;
    this.qualificationSearch=res;
    //console.log(res);
  })
}
fetchbranch(){
  this.service.getbranch().subscribe((res:any)=>{
    this.branchslist=res;
    this.branchSearch=res;
    //console.log(res)
  })
}
insertQualification() {
  console.log("Qualification ID during insertQualification:", this.qualificationForm.get('qualificationId')?.value);

  if (this.qualificationForm.invalid) {
    Object.keys(this.qualificationForm.controls).forEach(key => {
      const control = this.qualificationForm.get(key);
      if (control?.invalid) {
        control?.markAsTouched();
      }
    });
    return;
  }

  if (!this.selectedEducationLevelId) {
    Swal.fire({
      title: 'Error!',
      text: 'Education level is required.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }

  const formdata = new FormData();
  formdata.append("qualificationname", this.qualificationForm.get('qualificationName')?.value.toUpperCase());
  formdata.append("educationlevelid", this.selectedEducationLevelId);
  formdata.append("code", this.qualificationForm.get('code')?.value.toUpperCase());
  formdata.append("createdby", this.userData.user.empID);
  formdata.append("type", "Qualification");

  if (this.isEditingqualification) {
    const qualificationId = this.qualificationForm.get('qualificationId')?.value;
    const qualificationname = this.qualificationForm.get('qualificationName')?.value.toUpperCase();
    if (qualificationId) {
      formdata.append("qualificationid", qualificationId);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Qualification ID is missing.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    Swal.fire({
      title: 'Do you want to update the qualification',
      text: `Qualification Name: ${qualificationname}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.editqualification(formdata).subscribe(
          (res: any) => {
            if (res.statusCodeValue === 200) {
              this.fetchqualification(); 
              this.resetFormEducationlevel(); 
              this.isEditingqualification = false; 
              Swal.fire({
                title: 'Success!',
                text: 'Qualification successfully updated!',
                icon: 'success',
                confirmButtonText: 'OK',
              });
            } else if (res.statusCodeValue === 400) {
              Swal.fire({
                title: 'Duplicate Entry!',
                text: 'Qualification with the same name already exists.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          (error: any) => {
            Swal.fire({
              title: 'Error!',
              text: 'There was an error updating the qualification.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        );
      } else {
        console.log('Update canceled');
      }
    });
  } else {
    this.service.insertQualification(formdata).subscribe(
      (res: any) => {
        if (res.statusCodeValue === 200) {
          this.fetchqualification(); 
          this.resetFormEducationlevel(); 
          Swal.fire({
            title: 'Success!',
            text: 'Qualification successfully inserted!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } else if (res.statusCodeValue === 400) {
          Swal.fire({
            title: 'Duplicate Entry!',
            text: 'Qualification with the same Qualification name or QualificationId already exists.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      (error: any) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error inserting the qualification.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}

insertBranchs() {
  if (this.branchForm.invalid) {
    Object.keys(this.branchForm.controls).forEach(key => {
      const control = this.branchForm.get(key);
      if (control?.invalid) {
        control?.markAsTouched();
      }
    });
    return;
  }

  if (!this.selectedqualificationid) {
    Swal.fire({
      title: 'Error!',
      text: 'Qualification ID is missing.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }

  const formData = new FormData();
  formData.append("qualificationid", this.selectedqualificationid);
  formData.append("branchname", this.branchForm.get('branchname')?.value.toUpperCase());
  formData.append("createdby", this.userData.user.empID);
  formData.append("type", "Branch");

  if (this.isEditingbranch) {
    const branchid = this.branchForm.get('branchid')?.value;
    if (branchid) {
      formData.append("branchid", branchid);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Branch ID is missing.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const branchName = this.branchForm.get('branchname')?.value.toUpperCase();
    Swal.fire({
      title: `Are you sure you want to update the branch?`,
      text: `Branch Name: ${branchName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.editbranch(formData).subscribe(
          (res: any) => {
            if (res.statusCodeValue === 200) {
              this.fetchbranch();
              this.resetFormbanch();
              this.branchForm.get('qualificationid')?.enable();
              this.branchForm.get('branchid')?.enable();
              Swal.fire({
                title: 'Success!',
                text: 'Branch successfully updated!',
                icon: 'success',
                confirmButtonText: 'OK',
              });
            } else if (res.statusCodeValue === 400) {
              Swal.fire({
                title: 'Duplicate Entry!',
                text: 'Branch with the same Branch Name already exists.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred while updating the branch.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },
          (error: any) => {
            Swal.fire({
              title: 'Error!',
              text: 'There was an error updating the branch.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  } else {
    this.service.insertbranch(formData).subscribe(
      (res: any) => {
        if (res.statusCodeValue === 200) {
          this.fetchbranch();
          this.resetFormbanch();
          Swal.fire({
            title: 'Success!',
            text: 'Branch successfully inserted!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } else if (res.statusCodeValue === 400) {
          Swal.fire({
            title: 'Duplicate Entry!',
            text: 'Branch with the same BranchID or BranchName already exists.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred while inserting the branch.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      (error: any) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error inserting the branch.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}

resetFormEducationlevel() {
  this.qualificationForm.reset({
    educationLevelId: '',  
    qualificationId: '',
    qualificationName: '',
    code: '',
   // qualificationDisplayName: ''
  });
  this.selectedEducationLevelId = ''; 
  this.isEditingqualification = false;
  this.qualificationForm.get('educationLevelId')?.enable();
}

resetFormbanch() {
  this.branchForm.reset({
    qualificationid: '',  
    branchid: '',
    branchname: ''
    //branchdisplayname: ''
  });
  this.selectedqualificationid = '';  
  this.isEditingbranch = false;
   this.branchForm.get('qualificationid')?.enable();
  this.branchForm.get('branchid')?.enable();
}



editQualification(qualification: any) {
  //console.log('Qualification Object:', qualification);  // Check the structure of qualification
  if (qualification && qualification.QUALIFICATIONID) {
    this.qualificationForm.get('qualificationId')?.setValue(qualification.QUALIFICATIONID);
  } else {
    //console.log('Qualification ID is missing or undefined');
  }
  this.qualificationForm.get('qualificationName')?.setValue(qualification.QUALIFICATIONNAME);
  this.qualificationForm.get('code')?.setValue(qualification.CODE);
  this.qualificationForm.get('educationLevelId')?.setValue(qualification.EDUCATIONLEVELID);
  this.selectedEducationLevelId = qualification.EDUCATIONLEVELID;
  this.qualificationForm.get('qualificationId')?.disable();
  this.qualificationForm.get('educationLevelId')?.disable();
  this.isEditingqualification = true;
}
editbranch(branch: any) {
  this.branchForm.get('qualificationid')?.setValue(branch.qualificationid);
  this.branchForm.get('branchid')?.setValue(branch.branchid);
  this.branchForm.get('branchname')?.setValue(branch.branchname);
  this.selectedqualificationid = branch.qualificationid;
  this.isEditingbranch = true;
  this.branchForm.get('qualificationid')?.disable();
  this.branchForm.get('branchid')?.disable();
}


  applySearchFilterQualification() {
    if (!this.searchTermQualification) {
      this.qualificationslist = this.qualificationSearch; 
      return;
    }
    const searchTermLowerCase = this.searchTermQualification.toLowerCase();  
    //console.log("Searching for:", searchTermLowerCase);  
    this.qualificationslist = this.qualificationSearch.filter((item: any) => {
      //console.log("Checking item:", item);  
      return (
        item.QUALIFICATIONNAME?.toLowerCase().includes(searchTermLowerCase) ||  
        item.QUALIFICATIONID?.toLowerCase().includes(searchTermLowerCase) ||
        item.CODE?.toLowerCase().includes(searchTermLowerCase) 
        //item.QUALIFICATIONDISPLAYNAME?.toLowerCase().includes(searchTermLowerCase)
      );
    });
    this.searchTermQualification = '';
  }
  applySearchFilterBranch(){
    if (!this.searchTermBranch) {
      this.branchslist = this.branchSearch; 
      return;
    }
    const searchTermLowerCase = this.searchTermBranch.toLowerCase();  
    //console.log("Searching for:", searchTermLowerCase);  
    this.branchslist = this.branchSearch.filter((item: any) => {
      //console.log("Checking item:", item);  
      return (
        item.branchid?.toLowerCase().includes(searchTermLowerCase) ||  
        item.branchname?.toLowerCase().includes(searchTermLowerCase) 
      );
    });
    this.searchTermBranch = '';
  }
}
