import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators,FormControl, AbstractControl,ValidationErrors  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-family-details',
  templateUrl: './family-details.component.html',
  styleUrls: ['./family-details.component.css']
})
export class FamilyDetailsComponent implements OnInit {
   employeeForm!: FormGroup;
   savebtn:boolean=false;
   isUpdateMode = true;
  image: File | null = null;
 //  isDisabled: boolean = true;
  //selectedFileName: string | null = null;
 // uploadfile:boolean=true;
  //modalFirstImageUrl:string | null=null;
  //modalImageUrl: string | null = null;
  //modalPdfUrl: string | null = null;
  selectedImageUrl: string | null = null;
 // empFileUrl: string | null = null; // URL for the uploaded file
  isEmpFileModalOpen: boolean = false;
  //aadharFile:boolean=true;
  //employeeId: any=13337;
  employeeData: any;
  empfile:boolean=true;
  errorfileflag:boolean=true;
  pan: any;
  imageSrc: any | null = null;
  pdfSrc: SafeResourceUrl | null = null;
 pdfImageUrl:SafeResourceUrl | null = null;
  showbutton:boolean=false;
  errorMessage: string = '';
  datas: any;
  form: any = [{}];
  originalFilePath:string | null=null;
   isModalOpen: boolean = false; 
submitbtn:boolean=false;
edit:boolean=false;
update:boolean=false;
  isEditing: boolean = false;
  imageUrl: string | ArrayBuffer | null;
   familyMembers: any[] = [];
   imageUrls: string[] = [] ;
  familyDetailsFiles: File[] = [];
  empFile: File | null = null;
  isMarried: boolean = false;
  formGroup!: FormGroup;
  loggedUser: string;
  userData: any;
  myDate: string;
  privil_eges: any;
  empObj: { empID: string; };
  router: any;
  flag:any;
  relationOptions: any[] = [];
  showName:boolean=false;
  pdfUrl: string | null = null;
  isPdf: boolean = false;
  today:string;
  viewfile :boolean = true;
  uploadfile:boolean=false;
  isLoading:boolean;
  hasChanges: boolean = false;
   selectedFileName: string = '';
  constructor(private fb: FormBuilder,
    private http: HttpClient,
    private authservice: AuthService, private cd:ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.employeeForm = this.fb.group({
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}\d{4}[A-Z]$/)]],
      aadhar: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      whatsappNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      maritalStatus: new FormControl('', Validators.required),
      forms: this.fb.array([]),
      empFile: [null, this.isEditing ? Validators.required : null],

    });
  }
  nonEmptyFileValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const files: FileList = control.value;
      return files && files.length > 0 ? null : { emptyFile: true };
    };
  }
   fileInputs = [{ files: [], errors: [] }, { files: [], errors: [] }, { files: [], errors: [] }, { files: [], errors: [] }];

  ngOnInit(): void {
     this.convertFieldsToUppercase();
  
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
  this.userData = JSON.parse(this.loggedUser);
  this.employeeForm.get('maritalStatus')?.valueChanges.subscribe(value => {
     this.showbutton = value ? true : false;
    });
    this.employeeForm.get('maritalStatus')?.valueChanges.subscribe(() => {
      this.getRelationOptions();
    });
    this.myDate =  decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights;  
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];
  
    if (this.loggedUser == null || this.loggedUser == undefined) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
     const date = new Date();
    this.today = date.toISOString().split('T')[0];
      this.fetchEmpData();
  } 
 
  convertToUppercase(controlName: string): void {
    this.employeeForm.get(controlName)?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        this.employeeForm.get(controlName)?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
     
  }
  convertFieldsToUppercase(): void {
    const fields = ['pan', 'aadhar','name','forms'];
    fields.forEach(field => this.convertToUppercase(field));
  }
getRelationOptions() {
  const maritalStatus = this.employeeForm.get('maritalStatus')?.value;

  if (maritalStatus === 'married') {
    this.relationOptions = [
      { value: '', label: 'Select Relation' },
      { value: 'Spouse', label: 'Spouse' },
      { value: 'Son', label: 'Son' },
      { value: 'Daughter', label: 'Daughter' },
      { value: 'Mother', label: 'Mother' },
      { value: 'Father', label: 'Father' },
    ];
    
  } else if (maritalStatus === 'unmarried') {
    this.relationOptions = [
       { value: 'Mother', label: 'Mother' }, 
      { value: 'Father', label: 'Father' },
    ];
    
  }
  // this.addEmployeeDetails();
}


 fetchEmpData() {
    const formData = new FormData();
    formData.append("empCode", this.userData.user.empID);
     this.isLoading=true;
    this.authservice.getEmpData(formData).subscribe((res: any) => {
      //console.log(res); // Log the fetched data
      this.flag=res.flag;
      if ( this.flag=='1001'){
        this.edit=true;
        this.update=true;
        this.savebtn=true;
        this.submitbtn=false;
        this.empfile=false;
        this.viewfile=true;
        this.uploadfile=false;
     //   this.employeeForm.get('maritalStatus').disable();
       if(res.status.employeeData) {

        this.employeeData=res.status.employeeData;
       // console.log(res.status.employeeData);
        this.populateForm(res.status.employeeData);
      
        if (res.status.familyDataList) {
          this.populateFamilyForms(res.status.familyDataList);
        }
      }
       this.isLoading=false;
      }
    else if(this.flag=='1002'){
    this.edit=false;
    this.update=false;
    this.savebtn=false;
    this.submitbtn=true;
    this.isEditing = true;
    this.viewfile=false;
    this.uploadfile=true;
    }
    }, (error) => {
      console.error('Error fetching employee data:', error);
    });
    this.isLoading=false;
  }

populateForm(data: any) {
  this.employeeForm.patchValue({
    pan: data.pan || '',
    aadhar: data.aadhar || '',
    mobile: data.mobile || '',
    whatsappNumber: data.whatsappNumber || '',
    maritalStatus: data.maritalStatus || '',
    imageUrl: data.filePath || '',
    originalFilePath: data.originalFilePath || '',
  });
  this.selectedFileName=data.originalFilePath ;
  this.isLoading=false;
  this.update = false; 
  this.edit = true; 
  this.uploadfile=true;
  this.employeeForm.get('pan')?.disable();
  this.employeeForm.get('aadhar')?.disable();
  this.employeeForm.get('mobile')?.disable();
  this.employeeForm.get('whatsappNumber')?.disable();
  this.employeeForm.get('maritalStatus')?.disable();
// (document.getElementById("empFile") as HTMLInputElement).disabled = true;
 this.uploadfile=false;
  //this.employeeForm.get('empFile')?.disable();
  const base64String = data.filePath;
  if (base64String) {
    if (base64String.startsWith('iVBORw0KGgo')) {
      // PNG Image
      this.imageSrc = `data:image/png;base64,${base64String}`;
      console.log("1");
    } else if (base64String.startsWith('/9j/')) {
      // JPG Image
      this.imageSrc = `data:image/jpeg;base64,${base64String}`;
       console.log("2");
    } else if (base64String.startsWith('JVBERi0')) {
      // PDF File
      const binary = atob(base64String.replace(/\s/g, ''));
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
       console.log("3");
    } else {
      console.error("Unknown file type");
       console.log("4");
    }
  } else {
    console.error("No file path provided");
      console.log("5");
  } 
  }

   readFile(file: File): void {
    const reader = new FileReader();
    
    // File reader event when file is loaded
    reader.onload = (e: any) => {
      const result = e.target.result;
      if (file.type.startsWith('image/')) {
        // If it's an image, display it as base64
        this.imageSrc = result;
      } else if (file.type === 'application/pdf') {
        // If it's a PDF, convert to a Blob and display as an Object URL
        const blob = new Blob([result], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      }
    };
    
    // Read the file as data URL (base64)
    reader.readAsDataURL(file);
  }
allowPdfInteraction(): string {
  return ''; // No special permissions
}


populateFamilyForms(familyData: any[]) {
  this.familyMembers = []; // Reset family members array

  familyData.forEach(familyMember => {
    const base64String = familyMember.filePath || '';
    
    // Push family member details
    this.familyMembers.push({
      sno: familyMember.sno,
      name: familyMember.name,
      relation: familyMember.relation,
      gender: familyMember.gender,
      dob: familyMember.dob,
      bloodGroup: familyMember.bloodGroup,
      aadhar: familyMember.aadhar,
      occupation: familyMember.occupation,
      filePath: familyMember.filePath // Store filePath for later use
    });
  });
}

openSecondModal(member: any) {
  this.isModalOpen = true; // Open the modal
  const base64String = member.filePath || '';

  // Reset the URLs
  this.selectedImageUrl = null;
  this.pdfImageUrl = null;

  if (base64String) {
    if (base64String.startsWith('iVBORw0KGgo')) {
      this.selectedImageUrl = `data:image/png;base64,${base64String}`;
    } else if (base64String.startsWith('/9j/')) {
      this.selectedImageUrl = `data:image/jpeg;base64,${base64String}`;
    } else if (base64String.startsWith('JVBERi0')) {
      const binary = atob(base64String.replace(/\s/g, ''));
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      this.pdfImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
    }
  }
}

closeModal() {
  this.isModalOpen = false;
}

get forms(): FormArray {
    return this.employeeForm.get('forms') as FormArray;
  }
  
 
  addEmployeeDetails() {
  if (this.hasChanges) {
    Swal.fire({
      title: 'Warning!',
      text: 'You have unsaved changes. Please click "Update" before proceeding to the next section.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }else{
    const maritalStatus = this.employeeForm.get('maritalStatus')?.value; 
    const employeeDetail = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      relation: [maritalStatus === 'unmarried' ? 'Mother' : '', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      aadhar: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      occupation: ['', Validators.required],
     // familyDetailsFile: ['',Validators.required] 
       files: [null, Validators.required] // Ensure this control exists
    });
 employeeDetail.get('name')?.valueChanges.subscribe(value => {
    if (value && typeof value === 'string') {
      employeeDetail.get('name')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  });
  employeeDetail.get('occupation')?.valueChanges.subscribe(value => {
    if (value && typeof value === 'string') {
      employeeDetail.get('occupation')?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  });
  
    this.forms.push(employeeDetail);
      this.updateAddFamilyButtonState(); // Update button state after adding a new family member
  }
  }
  updateAddFamilyButtonState() {
    // Always visible but enabled only if all fields are valid
    const allFormsValid = this.forms.controls.every(control => control.valid);
    return allFormsValid && this.forms.length < 10;
  }

  get isAddFamilyButtonDisabled(): boolean {
    // This will return true if the button should be disabled
    return !this.updateAddFamilyButtonState();
  }

openEmpFileModal(): void {
  this.isEmpFileModalOpen = true; // Open the modal
} 
closeEmpFileModal(): void {
    this.isEmpFileModalOpen = false; // Close the modal
}
 onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
//alert("hhh")
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);
    const maxImageSize = 5 * 1024 * 1024; // 5MB for images
    const maxPdfSize = 6 * 1024 * 1024; // 8MB for PDFs

    const validFiles: File[] = [];
    let invalidFileFound = false; // Flag to track invalid files

    newFiles.forEach(file => {
      // Validate file size and type
      if (file.type.startsWith('image/') && file.size <= maxImageSize) {
        validFiles.push(file);
      } else if (file.type === 'application/pdf' && file.size <= maxPdfSize) {
        validFiles.push(file);
       // alert(file.size);
      } else {
        
        invalidFileFound = true;
        Swal.fire({
          title: 'Error!',
          text: `Invalid file: Ensure it is an image under 5MB or a PDF under 6MB.`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
//alert(validFiles.length);
    if (invalidFileFound) {
      // If any invalid file is found, reset form control and file input
      this.empFile = null;
      this.employeeForm.get('empFile')?.setValue(null);
      this.selectedFileName = ''; // Clear displayed file name
    } else {
      // If there are valid files, update the file input and form control
      const dataTransfer = new DataTransfer();
      validFiles.forEach(file => dataTransfer.items.add(file));
      target.files = dataTransfer.files; // Update the input's files
     //alert(validFiles.length );
      if (validFiles.length > 0) {
        this.empFile = validFiles[0]; // Handle only the first valid file
        this.employeeForm.get('empFile')?.setValue(this.empFile);
        this.employeeForm.get('empFile')?.markAsTouched();
        this.selectedFileName = this.empFile.name; // Update file name for display
      }
      else {
      // If no valid files, remove the file and reset the form control
      this.empFile = null;
      this.employeeForm.get('empFile')?.setValue(null);
      this.selectedFileName = ''; // Clear displayed file name
    }
    }
  }
  else{
    this.empFile = null;
      this.employeeForm.get('empFile')?.setValue(null);
      this.selectedFileName = ''; // Clear displayed file name
  }
}
 
onSubmit() {
  // Proceed with form submission if the form is valid
  if (this.employeeForm.valid) {
    const formData = new FormData();

    // Collect employee data
    const datas = {
      empCode: this.userData.user.empID,
      pan: this.employeeForm.get('pan')?.value,
      aadhar: this.employeeForm.get('aadhar')?.value,
      mobile: this.employeeForm.get('mobile')?.value,
      whatsappNumber: this.employeeForm.get('whatsappNumber')?.value,
      maritalStatus: this.employeeForm.get('maritalStatus')?.value,
    };
    formData.append('data', JSON.stringify(datas));
    
   const familyDetails = this.forms.controls.map((formGroup) => {
      return {
 
        sno: formGroup.value.sno,
        relation: formGroup.value.relation,
        name: formGroup.value.name,
        gender: formGroup.value.gender,
        dob: formGroup.value.dob,
        bloodGroup: formGroup.value.bloodGroup,
        aadhar: formGroup.value.aadhar,
        occupation: formGroup.value.occupation,
        //files: formGroup.value.files, // Collect files for this family member
      };
    });
    console.log(familyDetails);

    // Assuming files are structured similarly for each family member
const filesDetails = this.forms.controls.map((formGroup) => {
  return {
    file: formGroup.value.files ? formGroup.value.files[0] : null // Ensure we're getting a single file
  };
});

  const formsArray = familyDetails; // Use the familyDetails array created above
formData.append('forms', JSON.stringify(formsArray));

if (this.empFile) {
      formData.append('empFile', this.empFile, this.empFile.name);
    }

 // Use a different name to avoid redeclaration
    const familyFilesDetails = this.forms.controls.map((formGroup) => {
      return {
        file: formGroup.get('files')?.value ? formGroup.get('files')?.value[0] : null,
      };
    });

    familyFilesDetails.forEach((fileDetail) => {
      if (fileDetail.file instanceof File) {
        formData.append('familydetailsFile', fileDetail.file, fileDetail.file.name);
      } else {
        console.warn('Invalid file:', fileDetail.file);
      }
    });

    console.log('Submitting FormData:', formData); // Debugging line
    this.isLoading = true; // Show loading indicator

    // Call the service to submit the form data
    this.authservice.empSubmit(formData).subscribe(
      (response) => {
        console.log('Submission successful!', response);
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Data Updated Successfully',
          icon: 'success',
          confirmButtonText: 'OK',
        });
         this.isLoading=false;
        this.fetchEmpData();
         this.resetForm();
        this.isLoading = false; // Hide loading indicator

        // Re-initialize component data if needed
        this.ngOnInit();
      },
      (error) => {
        console.error('Submission failed!', error);
        this.isLoading = false; // Hide loading indicator

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Internal Server Error',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  } else {
    // If the form is invalid, show an error message
    Swal.fire({
      title: 'Error!',
      text: 'Form is invalid',
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  // Mark all form fields as touched to trigger validation messages
  this.employeeForm.markAllAsTouched();
}

removeFamilyMember(sno: any) {
  const index = this.familyMembers.findIndex(member => member.sno === sno);
  
  if (index === -1) {
    Swal.fire('Error!', 'Family member not found.', 'error');
    return;
  }
  this.isLoading=true;
  this.authservice.deleteEmployee(sno).subscribe(
    response => {
      console.log('Employee deleted successfully', response);
      this.familyMembers.splice(index, 1);
      Swal.fire('Success!', 'Family member deleted successfully.', 'success');
      this.isLoading=false;
    },
    error => {
      console.error('Error deleting employee', error);
      Swal.fire('Error!', 'Failed to delete family member.', 'error');
      this.isLoading=false;
    }
  );
}

  removeEmployeeDetails(index: number) {
  this.forms.removeAt(index);
  Swal.fire('Removed!', 'Family member has been removed.', 'success');
  this.fetchEmpData(); 
}

getErrorMessage(controlName: string, index: number): string | null {
    const control = this.forms.at(index).get(controlName);
    if (control && control.errors) {
      //alert(control.errors.fileErrors);
        if (control.errors.fileErrors) {
            return control.errors.fileErrors; // Return custom error messages for invalid files
        }
        if (control.errors.required) {
            return `${controlName} is required.`; // Return required error message
        }
        if (control.errors.emptyFile) {
            return 'At least one file must be uploaded.'; // Custom message for empty file
        }
        if (control.errors.minlength) {
            return `${controlName} must be at least ${control.errors.minlength.requiredLength} characters.`; // Min length error
        }
        if (control.errors.maxlength) {
            return `${controlName} must be at most ${control.errors.maxlength.requiredLength} characters.`; // Max length error
        }
        if (control.errors.pattern) {
            return `Invalid ${controlName} format.`; // Pattern error
        }
    }
    return null; // No errors
}

 onFamilyFilesSelected(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const filesControl = this.forms.at(index).get('files');
  const maxImageSize = 5 * 1024 * 1024; // 5 MB for images
  const maxPdfSize = 6 * 1024 * 1024; // 6 MB for PDFs

  // Clear previous errors
  filesControl?.setErrors(null);
  const validFiles: File[] = [];
  const invalidFiles: { file: File; reason: string }[] = [];

  if (input.files) {
    Array.from(input.files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const exceedsSize = isImage ? file.size > maxImageSize : isPdf ? file.size > maxPdfSize : true;

      if ((isImage && !exceedsSize) || (isPdf && !exceedsSize)) {
        validFiles.push(file);
      } else {
        const reason = exceedsSize ? 'Invalid file: Ensure it is an image under 5MB or a PDF under 6MB.' : 'Invalid file type.';
        invalidFiles.push({ file, reason });
      }
    });

    // Update valid files
    if (validFiles.length > 0) {
      const newFileList = new DataTransfer();
      validFiles.forEach(file => newFileList.items.add(file));
      filesControl?.setValue(newFileList.files);
      filesControl?.setErrors(null); // Clear errors if valid files are present
    } else {
      // If no valid files, set appropriate errors
      if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles.map(invFile => invFile.reason).join(' ');
        filesControl?.setErrors({ fileErrors: errorMessages });
          Swal.fire({
              title: 'Invalid File(s)',
              text: errorMessages,
              icon: 'error',
              confirmButtonText: 'OK'
            }); 
      } else if (filesControl?.touched) {
        filesControl?.setErrors({ required: true }); // Show required error only if touched
      }
    }

    // Mark the control as touched
    filesControl?.markAsTouched();
  }
}


onSaveFamilyDetails(): void { 
   const formData = new FormData();
  if(this.forms.valid){

   const familyDetails = this.forms.controls.map((formGroup) => {
      return {
        sno: formGroup.value.sno,
        relation: formGroup.value.relation,
        name: formGroup.value.name,
        gender: formGroup.value.gender,
        dob: formGroup.value.dob,
        bloodGroup: formGroup.value.bloodGroup,
        aadhar: formGroup.value.aadhar,
        occupation: formGroup.value.occupation,
        
      };
    });
    console.log(familyDetails);
     
    // Assuming files are structured similarly for each family member
const filesDetails = this.forms.controls.map((formGroup) => {
  return {
    file: formGroup.value.files ? formGroup.value.files[0] : null // Ensure we're getting a single file
  };
});

// Combine the two objects into a final structure
const finalOutput = {
  familyMembers: familyDetails,
  file: filesDetails
};

console.log(finalOutput);

  const formsArray = familyDetails; // Use the familyDetails array created above
//const formData = new FormData();
const empCode = this.userData.user.empID;
formData.append('empCode', empCode);
formData.append('forms', JSON.stringify(formsArray));
// this.isDisabled=true;
filesDetails.forEach((fileDetail) => {
  if (fileDetail.file instanceof File) { // Check if the file is valid
    formData.append('familydetailsFile', fileDetail.file, fileDetail.file.name);
  } else {
    console.warn('Invalid file:', fileDetail.file); // Log invalid file
  }
});
 this.isLoading=true;
 this.authservice.insertFamilyMember(formData).subscribe(
      response => {
        console.log('Family members added successfully', response);
        // Show success message using SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Family members added successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.isLoading=false;
        this.fetchEmpData();
        this.resetForm();
        //this.isDisabled=false;
      },
      error => {
        console.error('Error adding family members', error);
        this.isLoading=false;
        // Show error message using SweetAlert
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add family members. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );

// Utility function to convert FormData to an object
function formDataToObject(formData: FormData): { [key: string]: any } {
  const obj: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    obj[key] = value instanceof File ? value.name : value; // If it's a file, log the name
  });
  return obj;
}
}
 else {
   this.forms.controls.forEach(form => {
      form.markAllAsTouched();
   });
    // If the form is invalid, show an error message
    Swal.fire({
      title: 'Error!',
      text: 'Form is invalid',
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }
}

showError(message: string): void {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK'
  });
}
resetForm(): void {
  this.forms.clear(); 

}
 onEdit(): void {
  this.isEditing = !this.isEditing;
   this.update = true; 
  this.edit = false; 
   this.hasChanges = true;
this.employeeForm.get('pan')?.enable();
  this.employeeForm.get('aadhar')?.enable();
  this.employeeForm.get('mobile')?.enable();
  this.employeeForm.get('whatsappNumber')?.enable();
  this.employeeForm.get('maritalStatus')?.enable();
  //this.employeeForm.get('empFile')?.enable();
 // (document.getElementById("empFile") as HTMLInputElement).disabled = false;
   this.viewfile=false;
   this.uploadfile=true;
    
 }

  onUpdate() {  
// Clear previous error messages
    const errorElements = document.querySelectorAll('.text-danger');
    errorElements.forEach(element => (element as HTMLElement).innerHTML = '');
     
    // Get form values
    const pan = (document.getElementById('pan') as HTMLInputElement).value.trim();
    const aadhar = (document.getElementById('aadhar') as HTMLInputElement).value.trim();
    const mobile = (document.getElementById('mobile') as HTMLInputElement).value.trim();
    const whatsappNumber = (document.getElementById('whatsappNumber') as HTMLInputElement).value.trim();
    const maritalStatus = (document.getElementById('maritalStatus') as HTMLSelectElement).value;
    const empFile = (document.getElementById('empFile') as HTMLInputElement).files[0]; // Get the file input
    const selectedFileName = (document.getElementById('selectedFileName') as HTMLSelectElement).value;
   
    this.hasChanges = false;
    let isValid = true;
    // Compare form values with existing employee data to check for changes
    const isDataUnchanged = 
    this.employeeData.pan === pan &&
    this.employeeData.aadhar === aadhar &&
    this.employeeData.mobile === mobile &&
    this.employeeData.whatsappNumber === whatsappNumber &&
    this.employeeData.maritalStatus === maritalStatus &&this.employeeData.originalFilePath === selectedFileName;


    if (isDataUnchanged) {
        alert('No changes detected in employee details.');
      //  return; // Exit if no changes detected
       isValid = false;
       return false;
    }

    // PAN validation
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) {
        alert('PAN Number is required.');
        isValid = false;
    } else if (!panPattern.test(pan)) {
        alert('Invalid PAN format. Example: ABCDE1234F');
        isValid = false;
    }

    // Aadhaar validation
    if (!aadhar) {
        alert('Aadhaar Number is required.');
        isValid = false;
    } else if (aadhar.length !== 12) {
        alert('Aadhaar Number must be 12 digits long.');
        isValid = false;
    }

    // Mobile Number validation
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobile) {
        alert('Contact Number is required.');
        isValid = false;
    } else if (!mobilePattern.test(mobile)) {
        alert('Contact Number must be a 10-digit number.');
        isValid = false;
    }

    // WhatsApp Number validation
    if (!whatsappNumber) {
        alert('WhatsApp Number is required.');
        isValid = false;
    } else if (!mobilePattern.test(whatsappNumber)) {
        alert('WhatsApp Number must be a 10-digit number.');
        isValid = false;
    }

    // Marital Status validation
    if (!maritalStatus) {
        alert('Marital status is required.');
        isValid = false;
    }

    // empFile validation
    if (!empFile) {
        alert('Employee file is required.');
        isValid = false;
    }

    if (!isValid) {
        return; // Prevent form submission if validation fails
    }

   // console.log('Starting update process...');
     
    const formData = new FormData();
    const data = {
        empCode: this.userData.user.empID,
        pan: this.employeeForm.get('pan')?.value,
        aadhar: this.employeeForm.get('aadhar')?.value,
        mobile: this.employeeForm.get('mobile')?.value,
        whatsappNumber: this.employeeForm.get('whatsappNumber')?.value,
        maritalStatus: this.employeeForm.get('maritalStatus')?.value,
    };
    this.viewfile=false;
    this.uploadfile=true;
  
    formData.append('data', JSON.stringify(data));
    formData.append('empFile', empFile, empFile.name); // Append empFile to formData
    this.isLoading = true;
    this.authservice.updateEmployee(formData).subscribe(
        (response) => {
            console.log('Employee updated successfully', response);
            Swal.fire({
                title: 'Success!',
                text: 'Employee details have been updated successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
            //location.reload();
         
            this.fetchEmpData();
            this.isLoading = false;
        },
        (error) => {
            console.error('Error updating employee:', error);
             this.isLoading=false;
            alert('Update failed. Please try again.');
        }
    );
}
  // Restrict special characters and allow only uppercase letters and digits
  restrictSpecialChars(event: KeyboardEvent) {
    const char = event.key;
    // Allow only uppercase letters (A-Z), digits (0-9), and space
    if (!/^[A-Z0-9\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  // Allow only numbers for Aadhar, Mobile, and WhatsApp
  restrictToNumbers(event: KeyboardEvent) {
    const char = event.key;
    // Allow only numbers (0-9)
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
     const input = event.target as HTMLInputElement;

  if (input.value.length >= 12) {
    event.preventDefault(); 
  }
  }

  // Convert input to uppercase
  toUpperCase(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }
  restrictToLetters(event: KeyboardEvent) {
  const char = event.key;

  // Allow only letters (a-z, A-Z) and spaces
   if (!/^[a-zA-Z\s]$/.test(char)) { 
    event.preventDefault(); 
  }

  // Check the current input value length
  const input = event.target as HTMLInputElement;

  // Prevent input if the length exceeds 50
  if (input.value.length >= 50) {
    event.preventDefault(); // Prevent further input if length is 50 or more
  }
}
// Validate name length
validateNameLength(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value;
  if (value && (value.length < 3 || value.length > 50)) {
    return { invalidLength: true }; 
  }
  return null; 
}
restrictToPAN(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (event.ctrlKey || event.altKey || event.metaKey || event.key.length > 1) {
    return;
  }

  const char = event.key.toUpperCase(); 
  const position = value.length; 

  // Check the PAN format
  const isValid = (
    (position < 5 && /^[A-Z]$/.test(char)) || 
    (position >= 5 && position < 9 && /^\d$/.test(char)) || 
    (position === 9 && /^[A-Z]$/.test(char)) 
  );

  if (!isValid) {
    event.preventDefault();
  }
}
onPaste(event: ClipboardEvent): void {
  event.preventDefault();  // This prevents the paste action
  // Optionally, you can provide some feedback, for example:
  console.log('Pasting is disabled');
}
}

