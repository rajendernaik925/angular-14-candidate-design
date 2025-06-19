import { formatDate } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.sass']
})
export class RegistrationComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
    registrationForm: FormGroup;
    universityOptions: any[] = [];
    qualificationOptions: any[] = [];
    currentYear = new Date().getFullYear();
    years = Array.from({ length: 20 }, (_, i) => this.currentYear - i);
    activeTab: string = 'personal'
    showCommunicationAddress: boolean = false;
    isFresher: boolean = true;
    jobCodeData: any;
    personalInfoArray: any[] = [];
    selectedFiles: { [key: string]: File } = {};
    titleOptions: any[] = [];
    genderOptions: any[] = [];
    marriatalStatusOptions: any[] = [];
    joiningOptions: any[] = [];
    indianStates: any[] = [];
    communicationCities: any[] = [];
    permanentCities: any[] = [];
    experienceArray: any[] = [];
    isSidebarOpen: boolean = false;
    isLoading: boolean = false;
    isUpdateMode: boolean = false;
    isAllDataPresent: boolean = false;
    isAllAddressDataPresent: boolean = false;
    personalUpdate: boolean = false;
    addressUpadte: boolean = false;
    colorTheme = 'theme-dark-blue';
  
  
    resumeFile: string | null = null;
    photoFile: string | null = null;
    tenthFile: string | null = null;
    twelthFile: string | null = null;
    deplomaFile: string | null = null;
    degreeOrBTechFile: string | null = null;
    othersFile: string | null = null;
    fileURL: SafeResourceUrl | null = null;
    showPDF: boolean = false;
    updateDocumentFlag: boolean = false;
  
    // private readonly STORAGE_KEY = 'registrationFormData';
  
    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService,
      private sanitizer: DomSanitizer
    ) {
      this.registrationForm = this.fb.group({
        educationDetails: this.fb.array([this.createEducationFormGroup()]),
        jobCodeId: [{ value: '', disabled: false }, Validators.required],
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        maritalStatusId: ['', Validators.required],
        genderId: ['', Validators.required],
        titleId: ['', Validators.required],
        dob: ['', Validators.required],
        fatherName: ['', Validators.required],
        mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        district: ['', Validators.required],
        // pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
        pan: ['', [Validators.required]],
        adhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
        resume: ['', Validators.required],
        photo: ['', Validators.required],
        // address
        addressA: ['', Validators.required],
        addressB: ['', Validators.required],
        addressC: [''],
        stateId: ['', Validators.required],
        cityId: ['', Validators.required],
        postalCode: ['', Validators.required, Validators.pattern('^[0-9]{6}$')],
        addressFlag: ['no', Validators.required],
        permanentAddressA: ['', Validators.required],
        permanentAddressB: ['', Validators.required],
        permanentAddressC: [''],
        permanentStateId: ['', Validators.required],
        permanentCityId: ['', Validators.required],
        permanentPostalCode: ['', Validators.required, Validators.pattern('^[0-9]{6}$')],
        // education
        // educationTypeId: ['', Validators.required],
        // university: ['', Validators.required],
        // qualification: ['', Validators.required],
        // yearOfPassing: ['', Validators.required],
        // percentage: ['', Validators.required],
        //documents
        tenth: [],
        twelth: [],
        deploma: [],
        degreeOrBTech: [],
        others: [],
        //experience
        isFresher: ['fresher', Validators.required],
        joiningTime: ['', Validators.required],
        companyName: ['', Validators.required],
        totalExperience: ['', Validators.required],
        LastOrStill_Working_Date: ['', Validators.required],
        //salary
        currentSalary: ['', Validators.required],
        expectedSalary: ['', Validators.required],
        suitableJobDescription: ['', Validators.required]
      });
    }
  
    ngOnInit(): void {
      this.activeTab = 'personal'
      this.handleExperienceToggle('fresher');
      const loginData = JSON.parse(localStorage.getItem('hiringLoginData') || '{}');
      this.jobCodeData = loginData;
      console.log("hiring login data : ", this.jobCodeData.email)
      this.registrationForm.get('jobCodeId')?.setValue(this.jobCodeData?.jobCodeRefId);
      this.registrationForm.get('email')?.setValue(this.jobCodeData.email);
      this.registrationForm.get('firstName')?.setValue(this.jobCodeData.name);
      if (!this.jobCodeData.status) {
        this.router.navigate(['/hiring-login']);
      }
  
  
      if (this.jobCodeData.candidateId) {
        this.loadUserData();
      }
  
      this.title();
      this.gender();
      this.marriageStatus();
      this.university();
      this.qualification();
      this.joiningTime();
      this.states();
      // this.cities();
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    closeSidebar() {
      if (window.innerWidth < 768) {
        this.isSidebarOpen = false;
      }
    }
  
    formatDate(date: string): string {
      if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year}`;
    }
  
    loadUserData() {
      this.authService.registeredData(this.jobCodeData.candidateId).subscribe({
        next: (res: any) => {
          if (
            res?.candidatePersonalInformationDetails ||
            res?.candidateCommunicationAddressDetails ||
            res?.candidatePermanentAddressDetails ||
            (res?.candidateEducationDetails && res.candidateEducationDetails.length > 0) ||
            res?.candidateDocumentDetails ||
            res?.candidateExperienceDetails?.candidateJoiningDetails ||
            (res?.candidateExperienceDetails?.candidateCompanyDetails && res.candidateExperienceDetails.candidateCompanyDetails.length > 0) ||
            res?.candidateExperienceDetails?.candidateSalaryDetails
          ) {
            console.log("Registered Data:", res?.candidateCommunicationAddressDetails?.postalCode);
  
            this.resumeFile = res?.candidatePersonalInformationDetails?.resumeFile || null;
            this.photoFile = res?.candidatePersonalInformationDetails?.imageFile || null;
            this.tenthFile = res?.candidateDocumentDetails?.tenthFile || null;
            this.twelthFile = res?.candidateDocumentDetails?.intermediateFile || null;
            this.deplomaFile = res?.candidateDocumentDetails?.pgFile || null;
            this.degreeOrBTechFile = res?.candidateDocumentDetails?.degreeFile || null;
            this.othersFile = res?.candidateDocumentDetails?.otherFile || null;
  
            const isFresher = res?.candidateExperienceDetails?.candidateJoiningDetails?.is_Fresher ? 'fresher' : 'experienced';
            this.experienceArray = res?.candidateExperienceDetails?.candidateCompanyDetails || [];
  
            // Patch form data
            this.registrationForm.patchValue({
              firstName: res?.candidatePersonalInformationDetails?.firstName ? res.candidatePersonalInformationDetails.firstName : this.jobCodeData.name,
              middleName: res?.candidatePersonalInformationDetails?.middleName || '',
              lastName: res?.candidatePersonalInformationDetails?.lastName || '',
              maritalStatusId: res?.candidatePersonalInformationDetails?.maritalStatusId || null,
              genderId: res?.candidatePersonalInformationDetails?.genderId || null,
              titleId: res?.candidatePersonalInformationDetails?.titleId || null,
              dob: res?.candidatePersonalInformationDetails?.dob || '',
              fatherName: res?.candidatePersonalInformationDetails?.fatherName || '',
              mobileNumber: res?.candidatePersonalInformationDetails?.mobileNumber || '',
              district: res?.candidatePersonalInformationDetails?.district || '',
              pan: res?.candidatePersonalInformationDetails?.pan || '',
              adhar: res?.candidatePersonalInformationDetails?.adhar || '',
  
              // Communication Address
              addressA: res?.candidateCommunicationAddressDetails?.comAddressA || '',
              addressB: res?.candidateCommunicationAddressDetails?.comAddressB || '',
              addressC: res?.candidateCommunicationAddressDetails?.comAddressC || '',
              stateId: res?.candidateCommunicationAddressDetails?.stateId || null,
              cityId: res?.candidateCommunicationAddressDetails?.cityId || null,
              addressFlag: res?.candidateCommunicationAddressDetails?.addressFlag || 'no',
  
              // Permanent Address
              permanentAddressA: res?.candidatePermanentAddressDetails?.perAddressA || '',
              permanentAddressB: res?.candidatePermanentAddressDetails?.perAddressB || '',
              permanentAddressC: res?.candidatePermanentAddressDetails?.perAddressC || '',
              permanentStateId: res?.candidatePermanentAddressDetails?.stateId || null,
              permanentCityId: res?.candidatePermanentAddressDetails?.cityId || null,
  
              // Experience Details
              isFresher: isFresher,
              joiningTime: res?.candidateExperienceDetails?.candidateJoiningDetails?.joiningId || '',
              currentSalary: res?.candidateExperienceDetails?.candidateSalaryDetails?.currentSalary || '',
              expectedSalary: res?.candidateExperienceDetails?.candidateSalaryDetails?.expectedSalary || '',
              suitableJobDescription: res?.candidateExperienceDetails?.candidateSalaryDetails?.description || '',
            });
  
            console.log("Father Name:", res?.candidatePersonalInformationDetails?.fatherName);
  
            this.isAllDataPresent = [res?.candidatePersonalInformationDetails?.fatherName]
              .every(field => typeof field === 'string' && field.trim() !== '');
  
            this.isAllAddressDataPresent = [res?.candidateCommunicationAddressDetails?.comAddressA]
              .every(field => typeof field === 'string' && field.trim() !== '');
  
            this.handleExperienceToggle(isFresher);
  
            console.log("Rajender");
  
            // Handle Education Details
            if (res?.candidateEducationDetails?.length) {
              res.candidateEducationDetails.forEach((educationData: any) => {
                this.educationArray.push(this.createEducationFormGroup(educationData));
              });
            }
          } else {
            this.resumeFile = null;
            this.photoFile = null;
            this.tenthFile = null;
            this.twelthFile = null;
            this.deplomaFile = null;
            this.degreeOrBTechFile = null;
            this.othersFile = null;
          }
        },
  
        error: (err: HttpErrorResponse) => {
          console.log('HTTP Error:', err);
        }
      });
    }
  
  
  
    get educationArray(): FormArray {
      return this.registrationForm.get('educationDetails') as FormArray;
    }
  
    createEducationFormGroup(educationData: any = {}): FormGroup {
      const formGroup = this.fb.group({
        educationId: [educationData.educationId || null], // Ensure it's correctly mapped
        educationTypeId: [educationData.educationTypeId || '', Validators.required],
        universityId: [educationData.universityId || '', Validators.required],
        qualificationId: [educationData.qualificationId || '', Validators.required],
        yearOfPassing: [educationData.yearOfPassing || '', Validators.required],
        percentage: [educationData.percentage || '', Validators.required]
      });
  
      if (Object.keys(educationData).length > 0) {
        formGroup.disable(); // Disable only pre-existing education records
      }
  
      return formGroup;
    }
  
  
    deleteFile(fileId: any) {
      console.log("canddd : ", this.jobCodeData?.candidateId);
  
      if (!this.jobCodeData?.candidateId || !fileId) {
        console.error("Missing parameters: Employee ID or File ID is undefined.");
        return;
      }
  
      const candidateId = this.jobCodeData?.candidateId;
      const fileID = fileId
  
      this.authService.deleteFile(candidateId, fileId).subscribe({
        next: (res: HttpResponse<any>) => {
          this.loadUserData();
          if (res.status === 200) {
            console.log("res delete file : ", res);
            Swal.fire({
              title: 'Success',
              text: 'Successfully Deleted',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Delete Failed',
              icon: 'error',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log("error : ", err);
        }
      });
    }
  
    deleteExperience(experienceId: number, index: number) {
      if (confirm('Are you sure you want to delete this experience?')) {
        this.authService.deleteExperience(experienceId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success',
              text: 'Successfully Deleted',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            });
            this.experienceArray.splice(index, 1);
            if (this.experienceArray.length === 0) {
              this.registrationForm.patchValue({
                companyName: '',
                totalExperience: '',
                LastOrStill_Working_Date: '',
                // currentSalary: '',
                // expectedSalary: '',
                // suitableJobDescription: '',
              });
            }
          },
          error: (err: HttpErrorResponse) => {
            console.log('Error deleting experience:', err);
          }
        });
      }
    }
  
    viewFile(file: any) {
      if (!file) {
        console.error("No file available for download.");
        return;
      }
  
      const byteCharacters = atob(file);
      const byteNumbers = new Array(byteCharacters?.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
  
      const objectURL = URL.createObjectURL(blob);
  
      // ✅ Sanitize the URL before assigning
      this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL);
      this.showPDF = true;
      // if (!file) {
      //   console.error("No file available for download.");
      //   return;
      // }
  
      // const byteCharacters = atob(file); 
      // const byteNumbers = new Array(byteCharacters?.length)
      //   .fill(0)
      //   .map((_, i) => byteCharacters.charCodeAt(i));
      // const byteArray = new Uint8Array(byteNumbers);
      // const blob = new Blob([byteArray], { type: "application/pdf" }); 
  
      // const a = document.createElement("a");
      // a.href = URL.createObjectURL(blob);
      // a.download = "document.pdf";
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
    }
  
    closePDF() {
      this.showPDF = false; // Hide the modal
      this.fileURL = null; // Clear the URL
    }
  
    updateDocument(name: string) {
      if (name === 'tenth') {
        this.tenthFile = ''
      } else if (name === 'twelth') {
        this.twelthFile = ''
      } else if (name === 'deploma') {
        this.deplomaFile = ''
      } else if (name === 'degreeOrBTech') {
        this.degreeOrBTechFile = ''
      } else if (name === 'others') {
        this.othersFile = ''
      }
    }
  
  
    removeEducation(index: number, educationId: number | null | undefined): void {
      if (!educationId) {
        console.error("Invalid educationId:", educationId);
        Swal.fire({
          title: 'Error',
          text: 'Education ID is missing or invalid.',
          icon: 'error',
          showConfirmButton: true,
        });
        return;
      }
  
      this.isLoading = true;
      console.log("index: ", index);
      console.log("educationId: ", educationId);
  
      this.authService.deleteEducation(educationId).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          console.log(res);
          this.educationArray.removeAt(index);
          Swal.fire({
            title: 'Success',
            text: 'Successfully Deleted',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log("Error deleting education:", err);
        }
      });
    }
  
  
  
  
  
    onlyNumbers(event: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
      
      if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault();
    
        // Show SweetAlert warning
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Input',
          text: 'Only numbers (0-9) are allowed.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  
  
  
  onlyNumbersWithDot(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const input = event.key;
    const currentValue = (event.target as HTMLInputElement).value;
  
    // Allow control keys
    if (allowedKeys.includes(input)) {
      return;
    }
  
    // Allow numbers (0-9)
    if (/^\d$/.test(input)) {
      // Prevent entering more than two digits before the dot
      if (!currentValue.includes('.') && currentValue.length >= 2) {
        event.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Input',
          text: 'You cannot enter more than 2 digits before the dot.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      return;
    }
  
    // Allow only one dot (.)
    if (input === '.') {
      if (currentValue.includes('.')) {
        event.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Input',
          text: 'Only one dot (.) is allowed.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      return;
    }
  
    // Show SweetAlert for other invalid inputs
    event.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Input',
      text: 'Please enter only numbers (0-9) with a single dot (.) for decimal values.',
      timer: 2000,
      showConfirmButton: false
    });
  }
  
  
  checkDuplicateCompanyName() {
    const enteredCompanyName = this.registrationForm.get('companyName')?.value?.trim().toUpperCase();
    
    if (!enteredCompanyName) return; // Skip if input is empty
  
    const isDuplicate = this.experienceArray.some(exp => exp.companyName.toUpperCase() === enteredCompanyName);
  
    if (isDuplicate) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Entry',
        text: `Company "${enteredCompanyName}" is already added.`,
        timer: 2000,
        showConfirmButton: false
      });
  
      // Clear the input field
      this.registrationForm.get('companyName')?.setValue('');
    }
  
  }
  
    
    
  
    edit(value: string) {
      if (value === 'personal') {
        this.isAllDataPresent = false;
        this.personalUpdate = true;
      } else if (value == 'address') {
        this.isAllAddressDataPresent = false
        this.addressUpadte = true;
      }
    }
  
    onCommunicationAddressChange(value: string) {
      if (value === 'yes') {
        this.permanentCities = this.communicationCities
        const addressA = this.registrationForm.get('addressA')?.value;
        const addressB = this.registrationForm.get('addressB')?.value;
        const addressC = this.registrationForm.get('addressC')?.value;
        const stateId = this.registrationForm.get('stateId')?.value;
        const cityId = this.registrationForm.get('cityId')?.value;
        const postalCode = this.registrationForm.get('postalCode')?.value;
  
        this.registrationForm.patchValue({
          permanentAddressA: addressA,
          permanentAddressB: addressB,
          permanentAddressC: addressC,
          permanentStateId: stateId,
          permanentCityId: cityId,
          permanentPostalCode: postalCode
        });
  
        // Ensure the communication address is hidden when "yes" is selected
        setTimeout(() => {
          this.showCommunicationAddress = false;
        }, 0); // This triggers change detection
  
      } else if (value === 'no') {
        this.registrationForm.patchValue({
          permanentAddressA: '',
          permanentAddressB: '',
          permanentAddressC: '',
          permanentStateId: '',
          permanentCityId: '',
          permanentPostalCode: ''
        });
  
        // Ensure the communication address is shown when "no" is selected
        setTimeout(() => {
          this.showCommunicationAddress = true;
        }, 0); // This triggers change detection
      }
    }
  
  
    handleExperienceToggle(value: string): void {
      this.isFresher = value === 'fresher';
  
      if (this.isFresher) {
        // Clear validators for experience-related fields
        ['companyName', 'totalExperience', 'LastOrStill_Working_Date', 'currentSalary', 'expectedSalary',
          'suitableJobDescription'].forEach(field => {
            this.registrationForm.get(field)?.clearValidators();
            this.registrationForm.get(field)?.setValue('');
          });
  
        // Ensure only joiningTime is considered
        this.registrationForm.get('joiningTime')?.setValidators(Validators.required);
  
      } else {
        // Apply validators for experience fields
        ['companyName', 'totalExperience', 'LastOrStill_Working_Date', 'currentSalary', 'expectedSalary',
          'suitableJobDescription'].forEach(field => {
            this.registrationForm.get(field)?.setValidators(Validators.required);
          });
  
        // Remove validators from joiningTime since it is not required for experienced candidates
        // this.registrationForm.get('joiningTime')?.clearValidators();
        // this.registrationForm.get('joiningTime')?.setValue('');
      }
  
      // Update form validation
      Object.keys(this.registrationForm.controls).forEach(field => {
        this.registrationForm.get(field)?.updateValueAndValidity();
      });
    }
  
  
    onFileSelect(event: Event, fieldName: string): void {
      console.log("file name : ", fieldName)
      const fileInput = event.target as HTMLInputElement;
      const file = fileInput.files?.[0];
  
      if (file) {
        const selectedFile = new File([file], file.name, { type: file.type, lastModified: Date.now() });
  
        console.log(`Selected file for ${fieldName}:`, selectedFile);
  
        this.selectedFiles[fieldName] = selectedFile;
      } else {
        console.log(`No file selected for ${fieldName}`);
      }
    }
  
  
  
    setActiveSection(section: string) {
      this.activeTab = section;
  
      Object.keys(this.registrationForm.controls).forEach(field => {
        const control = this.registrationForm.get(field);
        if (control) {
          control.markAsUntouched();
          control.markAsPristine();
          control.updateValueAndValidity();
        }
      });
    }
  
    setValidation(Action: string) {
      let isValid = true;
      const sectionData: any = {};
  
      if (Action === 'personal') {
        const personalFields = [
          'candidateId', 'email', 'mobileNumber', 'dob', 'titleId',
          'firstName', 'middleName', 'lastName', 'maritalStatusId',
          'genderId', 'fatherName', 'district', 'pan', 'adhar', 'resume', 'photo'
        ];
  
        let sectionData: any = {}; // Object to store user data
        let isValid = true;
  
        personalFields.forEach((field) => {
          const control = this.registrationForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          } else {
            sectionData[field] = control?.value; // Store values dynamically
          }
        });
  
        if (!isValid) {
          // alert('Please fill out all required fields in the Personal section.');
          this.formFillMessageAlert();
          console.log("Fill data: ", sectionData);
          return;
        }
  
        let formData = new FormData();
  
        // Ensure candidateId is properly assigned
        sectionData.candidateId = this.jobCodeData?.candidateId;
  
        // Append JSON data as a single object instead of nested structure
        formData.append('personalInfo', JSON.stringify(sectionData));
  
        // Append resume and photo separately
        formData.append('personalImageFile', this.selectedFiles['photo']);
        formData.append('personalResumeFile', this.selectedFiles['resume']);
        formData.append('moduleId', '1');
  
        this.finalSave('address', formData);
      } else if (Action === 'address') {
        const communicationAddressFields = [
          'addressA', 'addressB', 'addressC',
          'stateId', 'cityId', 'postalCode', 'addressFlag'
        ];
        const permanentAddressFields = [
          'permanentAddressA', 'permanentAddressB', 'permanentAddressC',
          'permanentStateId', 'permanentPostalCode', 'permanentCityId'
        ];
  
        let isValid = true;
        let communicationAddress: any = {};
        let permanentAddress: any = {};
  
        // Collect communication address data
        communicationAddressFields.forEach((field) => {
          const control = this.registrationForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          } else {
            communicationAddress[field] = control?.value;
          }
        });
  
        // Collect permanent address data (keeping "permanent" prefix)
        permanentAddressFields.forEach((field) => {
          const control = this.registrationForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          } else {
            permanentAddress[field] = control?.value;
          }
        });
  
        if (!isValid) {
          // alert('Please fill in all required fields in the Address section.');
          this.formFillMessageAlert();
          return;
        }
  
        // Set up candidate ID and address flags
        communicationAddress.candidateId = this.jobCodeData?.candidateId;
  
        permanentAddress.candidateId = this.jobCodeData?.candidateId;
  
        let formData = new FormData();
  
        // Append both addresses as separate JSON objects
        formData.append("communicationAddress", JSON.stringify(communicationAddress));
        formData.append("permanentAddress", JSON.stringify(permanentAddress));
  
        formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
        formData.append('candidateId', this.jobCodeData?.candidateId);
        formData.append('moduleId', '2');
  
        this.finalSave('education', formData);
      } else if (Action === 'education') {
        let isValid = true;
        let educationData: any[] = [];
  
        this.educationArray.controls.forEach((group: FormGroup) => {
          let educationEntry: any = {};
          const educationFields = [
            'educationTypeId', 'universityId', 'qualificationId',
            'yearOfPassing', 'percentage'
          ];
  
          educationFields.forEach((field) => {
            const control = group.get(field);
            if (control?.invalid) {
              control.markAsTouched();
              isValid = false;
            } else {
              educationEntry[field] = control?.value;
            }
          });
          educationEntry['educationId'] = 1;
          educationEntry['candidateId'] = this.jobCodeData?.candidateId;
  
          educationData.push(educationEntry);
        });
  
        if (!isValid) {
          // alert('Please fill in all required fields in the Education section.');
          this.formFillMessageAlert();
          return;
        }
  
        let formData = new FormData();
        formData.append("education", JSON.stringify(educationData));
        formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
        formData.append('candidateId', this.jobCodeData?.candidateId);
        formData.append('moduleId', '3');
  
        this.finalSave('education', formData);
      } else if (Action === 'documents') {
        const documentsFields = ['tenth', 'twelth', 'deploma', 'degreeOrBTech', 'others'];
        let hasFile = false; // Flag to check if any file is present
  
        documentsFields.forEach((field) => {
          const control = this.registrationForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          } else {
            sectionData[field] = control?.value;
          }
        });
  
        if (!isValid) {
          // alert('Please fill in all required fields in the Documents section.');
          this.formFillMessageAlert();
          return;
        }
  
        this.personalInfoArray.push({ documentDetails: { ...sectionData } });
  
        let formData = new FormData();
        console.log("file array: ", this.selectedFiles);
        formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
  
        const documentData = {
          candidateId: this.jobCodeData.candidateId
        };
        formData.append('document', JSON.stringify(documentData));
        formData.append('moduleId', '4');
  
        // Check if at least one file is present
        if (this.selectedFiles['tenth']) {
          formData.append('tenthFile', this.selectedFiles['tenth']);
          hasFile = true;
        }
        if (this.selectedFiles['twelth']) {
          formData.append('interFile', this.selectedFiles['twelth']);
          hasFile = true;
        }
        if (this.selectedFiles['deploma']) {
          formData.append('pgFile', this.selectedFiles['deploma']);
          hasFile = true;
        }
        if (this.selectedFiles['degreeOrBTech']) {
          formData.append('degreeFile', this.selectedFiles['degreeOrBTech']);
          hasFile = true;
        }
        if (this.selectedFiles['others']) {
          formData.append('otherFile', this.selectedFiles['others']);
          hasFile = true;
        }
  
        // Only call finalSave if at least one file is selected
        if (hasFile) {
          this.finalSave('documents', formData);
        } else {
          Swal.fire({
            title: 'warning',
            text: 'Please upload File',
            icon: 'warning',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        }
      } if (Action === 'experience') {
        let isValid = true;
        const sectionData: any = {};
  
        const experienceFields = this.isFresher
          ? ['joiningTime', 'isFresher']
          : [
            'joiningTime', 'companyName', 'totalExperience',
            'LastOrStill_Working_Date', 'isFresher', 'currentSalary',
            'expectedSalary', 'suitableJobDescription'
          ];
  
        experienceFields.forEach((field) => {
          const control = this.registrationForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          } else {
            sectionData[field] = control?.value;
          }
        });
  
        if (!isValid) {
          // alert('Please fill in all required fields in the Experience section.');
          this.formFillMessageAlert();
          return;
        }
  
        const experienceData: any = {
          candidateId: this.jobCodeData.candidateId,
          isFresher: sectionData.isFresher === 'fresher',
          joiningId: sectionData.joiningTime
        };
  
        if (!this.isFresher) {
          experienceData.experienceMapDTO = [
            {
              companyName: sectionData.companyName,
              totalExp: sectionData.totalExperience,
              lastWorkingDate: sectionData.LastOrStill_Working_Date
            }
          ];
  
          experienceData.experienceSalaryDTO = {
            currentSalary: sectionData.currentSalary,
            expectedSalary: sectionData.expectedSalary,
            description: sectionData.suitableJobDescription
          };
        }
  
        this.personalInfoArray.push({ experience: { ...experienceData } });
  
        let formData = new FormData();
        formData.append("experience", JSON.stringify(experienceData));
        formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
        formData.append('candidateId', this.jobCodeData.candidateId);
        formData.append('moduleId', '5');
  
        this.finalSave('experience', formData);
      }
  
  
  
      // else if (Action === 'salary') {
      //   const educationFields = [
      //     'currentSalary', 'expectedSalary', 'suitableJobDescription',
      //   ];
  
      //   educationFields.forEach((field) => {
      //     const control = this.registrationForm.get(field);
      //     if (control?.invalid) {
      //       control.markAsTouched();
      //       isValid = false;
      //     } else {
      //       sectionData[field] = control?.value;
      //     }
      //   });
  
      //   if (!isValid) {
      //     alert('Please fill in all required fields in the Education section.');
      //     return;
      //   }
      //   let formData = new FormData();
      //   formData.append('candidates', JSON.stringify([{ salaryExpectation: sectionData }]));
      //   formData.append('jobCodeId', this.jobCodeData?.jobcodeId);
      //   formData.append('candidateId', this.jobCodeData.candidateId);
      //   formData.append('type', 'salary');
      //   this.finalSave('salary', formData);
      // }
    }
  
  
    finalSave(action: string, formData) {
      this.isLoading = true;
      console.log(" form data : ", formData)
      this.authService.hiringRegister(formData).subscribe({
        next: (res: HttpResponse<any>) => {
          this.isLoading = false;
          console.log("personal result : ", res);
          if (res.status === 200) {
            this.loadUserData();
            this.personalUpdate = false;
            this.addressUpadte = false;
            Swal.fire({
              title: 'Success',
              text: 'Successfully completed',
              icon: 'success',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            });
            this.setActiveSection(action);
            if (action === 'education') {
              const educationArray = this.registrationForm.get('educationDetails') as FormArray;
              if (educationArray) {
                educationArray.clear();
                educationArray.push(this.createEducationFormGroup());
              }
            } else if (action === 'documents') {
              this.selectedFiles = {}
              const educationArray = this.registrationForm.get('educationDetails') as FormArray;
              if (educationArray) {
                educationArray.clear();
                educationArray.push(this.createEducationFormGroup());
              }
              this.updateDocumentFlag = false;
              // this.fileInput.nativeElement.value = '';
            } else if (action === 'experience') {
              const educationArray = this.registrationForm.get('educationDetails') as FormArray;
              if (educationArray) {
                educationArray.clear();
                educationArray.push(this.createEducationFormGroup());
              }
              this.registrationForm.patchValue({
                companyName: '',
                totalExperience: '',
                LastOrStill_Working_Date: '',
                // currentSalary: '',
                // expectedSalary: '',
                // suitableJobDescription: '',
              });
            }
          }
        }, error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log("error : ", err)
          Swal.fire({
            title: 'error',
            text: err.error.message = 'failed',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      })
    }
  
    title() {
      this.isLoading = true;
      this.authService.title().subscribe({
        next: (res: any) => {
  
          this.isLoading = false;
          this.titleOptions = res;
        },
        error: (err: HttpErrorResponse) => {
  
          this.isLoading = false;
          console.log("error", err);
          Swal.fire({
            title: 'error',
            text: err.error.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      })
    }
    gender() {
      this.authService.gender().subscribe({
        next: (res: any) => {
          // console.log("titles : ",res);
          this.genderOptions = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("error", err)
        }
      })
    }
    marriageStatus() {
      this.authService.marriageStatus().subscribe({
        next: (res: any) => {
          // console.log("titles : ",res)
          this.marriatalStatusOptions = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("error", err)
        }
      })
    }
    university() {
      this.authService.university().subscribe({
        next: (res: any) => {
          // console.log("titles : ", res)
          this.universityOptions = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("error", err)
        }
      })
    }
    qualification() {
      this.authService.qualification().subscribe({
        next: (res: any) => {
          // console.log("titles : ",res);
          this.qualificationOptions = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("error", err)
        }
      })
    }
    joiningTime() {
      this.authService.joiningTime().subscribe({
        next: (res: any) => {
          // console.log("titles : ",res)
          this.joiningOptions = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("error", err)
        }
      })
    }
  
    states() {
      this.authService.states().subscribe({
        next: (res: any) => {
          this.indianStates = res;
        },
        error: (err: HttpErrorResponse) => {
          console.log("Error fetching states:", err);
        }
      });
    }
  
    // Function to handle state change separately for communication & permanent
    onStateChange(event: Event, addressType: 'communication' | 'permanent') {
      const selectedStateId = (event.target as HTMLSelectElement).value;
  
      if (selectedStateId) {
        this.getCities(selectedStateId, addressType);
      }
    }
  
    getCities(stateId: string, addressType: 'communication' | 'permanent') {
      this.authService.cities(stateId).subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            if (addressType === 'communication') {
              this.communicationCities = res;
              this.registrationForm.patchValue({
                cityId: res[0]?.id || null // Automatically patch the first city ID
              });
            } else {
              this.permanentCities = res;
              this.registrationForm.patchValue({
                permanentCityId: res[0]?.id || null // Automatically patch for permanent address
              });
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error("Error fetching cities:", err);
        }
      });
    }
  
  
    getProgressWidth(): string {
      const stepWidths = {
        personal: '20%',
        address: '40%',
        education: '60%',
        documents: '80%',
        experience: '100%'
      };
      return stepWidths[this.activeTab] || '0%';
    }
  
    formFillMessageAlert() {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill all required fields!',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  
    lastWorkingformatDate(dateString: string): string {
      if (!dateString) return ''; // Handle empty or undefined values
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Extracts YYYY-MM-DD
    }
    
  
  }
  