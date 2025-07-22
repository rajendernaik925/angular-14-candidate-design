import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.sass']
})
export class personalInfoComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('hiddenTenthInput') hiddenTenthInput!: ElementRef;
  @ViewChild('hiddenAadharInput') hiddenAadharInput!: ElementRef;
  @ViewChild('hiddenPanInput') hiddenPanInput!: ElementRef;
  @ViewChild('hiddenTwelthInput') hiddenTwelthInput!: ElementRef;
  @ViewChild('hiddenDegreeOrBTechInput') hiddenDegreeOrBTechInput!: ElementRef;
  @ViewChild('hiddenDeplomaInput') hiddenDeplomaInput!: ElementRef;
  @ViewChild('hiddenOthersInput') hiddenOthersInput!: ElementRef;

  registrationForm: FormGroup;
  logo: string = 'https://sso.heterohealthcare.com/iconnect/assets/img/logo.svg';
  universityOptions: any[] = [];
  educationLevelOptions: any[] = [];
  qualificationOptions: any[] = [];
  branchOptions: any[] = [];
  existingEducationList: any[] = [];
  currentYear = new Date().getFullYear();
  years = Array.from({ length: 100 }, (_, i) => this.currentYear - i);
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
  bloodGroupOptions: any[] = [];
  indianStates: any[] = [];
  communicationCities: any[] = [];
  permanentCities: any[] = [];
  experienceArray: any[] = [];
  isSidebarOpen: boolean = false;
  isLoading: boolean = false;
  isUpdateMode: boolean = false;
  isAllDataPresent: boolean = false;
  isExperienceBoolean: boolean = false;
  isAllAddressDataPresent: boolean = false;
  personalUpdate: boolean = false;
  experienceUpdate: boolean = false;
  addressUpadte: boolean = false;
  colorTheme = 'theme-dark-blue';
  hovering = false;
  statusPercentage: number = 50;
  loadedData: any;
  editButtonDisplay: boolean = true;
  resumeFile: string | null = null;
  photoFile: string | null = null;
  tenthFile: string | null = null;
  twelthFile: string | null = null;
  aadharFile: string | null = null;
  panFile: string | null = null;
  deplomaFile: string | null = null;
  degreeOrBTechFile: string | null = null;
  othersFile: string | null = null;
  fileURL: SafeResourceUrl | null = null;
  showPDF: boolean = false;
  updateDocumentFlag: boolean = false;
  deleteStatus: true;
  payslipFile!: File;
  serviceLetterFile!: File;
  serviceFilePath: string | null = '';
  paySlipFilePath1: string | null = '';
  paySlipFilePath2: string | null = '';
  paySlipFilePath3: string | null = '';
  showSidebar = false;
  today: Date = new Date();
  selectedPayslip1FileName: string = 'Upload Payslip 1';
  selectedServiceLetterFileName: string = 'Upload Service Letter';
  hasExperince: boolean = false;
  experienceId: any;
  uploadResume: string = 'Upload Resume'
  uploadPhoto: string = 'Upload Photo'


  // sections = [
  //   { key: 'personalInfo', label: 'Personal Info' },
  //   { key: 'address', label: 'Address' },
  //   { key: 'education', label: 'Education' },
  //   { key: 'document', label: 'Documents' },
  //   { key: 'experience', label: 'Working Experience' },
  // ];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {
    this.registrationForm = this.fb.group({


      // educationDetails: this.fb.array([this.createEducationFormGroup()]),
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
      passport: [''],
      uan: [''],
      licence: [''],
      bloodGroupId: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      district: ['', Validators.required],
      // pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      pan: ['', [Validators.required]],
      adhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      resume: [''],
      photo: [''],
      // address
      addressA: ['', Validators.required],
      addressB: ['', Validators.required],
      addressC: [''],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressFlag: ['no', Validators.required],
      permanentAddressA: ['', Validators.required],
      permanentAddressB: ['', Validators.required],
      permanentAddressC: [''],
      permanentStateId: ['', Validators.required],
      permanentCityId: ['', Validators.required],
      permanentPostalCode: ['', Validators.required],
      // education
      educationTypeId: ['', Validators.required],
      university: ['', Validators.required],
      qualification: ['', Validators.required],
      yearOfPassing: ['', Validators.required],
      percentage: ['', Validators.required],

      educationId: [null],
      educationLevelId: ['', Validators.required],
      universityId: ['', Validators.required],
      branch: [''],
      college: ['', Validators.required],


      //documents
      tenth: [],
      twelth: [],
      panFile: [],
      aadharFile: [],
      deploma: [],
      degreeOrBTech: [],
      others: [],
      //experience
      isFresher: ['fresher', Validators.required],
      joiningTime: ['', Validators.required],
      companyName: ['', Validators.required],
      totalExperience: ['', Validators.required],
      LastOrStill_Working_Date: ['', Validators.required],
      payslipFile1: [null, Validators.required],
      payslipFile2: [null, Validators.required],
      payslipFile3: [null, Validators.required],
      serviceLetterFile: [null],
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
    // console.log("loggin data : ", this.jobCodeData);
    // console.log("hiring login data : ", this.jobCodeData.email)
    this.registrationForm.get('jobCodeId')?.setValue(this.jobCodeData?.jobCodeRefId);
    this.registrationForm.get('email')?.setValue(this.jobCodeData.email);
    this.registrationForm.get('firstName')?.setValue(this.jobCodeData.name);
    this.registrationForm.get('mobileNumber')?.setValue(this.jobCodeData.mobileNumber);
    if (!this.jobCodeData.status) {
      this.router.navigate(['/hiring-login']);
    }
    // this.checkIfLoginExpired();


    if (this.jobCodeData.candidateId) {
      this.loadUserData();
    }

    this.title();
    this.gender();
    this.marriageStatus();
    this.university();
    this.educationLevel();
    this.joiningTime();
    this.states();
    this.bloodGroup()
    // this.cities();
  }

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }
  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
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
    this.isLoading = true;
    this.authService.registeredData(this.jobCodeData.candidateId).subscribe({
      next: (res: any) => {
        this.loadedData = res;
        if (this.loadedData?.candidateTrackingDTO?.totalPercentage === '100' && !this.loadedData?.candidateInterviewDetails?.length) {
          this.completedStatus();
        }

        this.hasExperince = !res?.candidateExperienceDetails?.candidateJoiningDetails?.is_Fresher;
        this.experienceId = res?.candidateExperienceDetails?.candidateJoiningDetails?.experienceId;
        console.log("education details : ", res.candidateEducationDetails);
        this.existingEducationList = res.candidateEducationDetails;

        if (this.loadedData?.candidateInterviewDetails?.length) {
          this.editButtonDisplay = false;
          this.InterviewStatus();
          // this.setActiveSection('status');
          // Swal.fire({
          //   title: 'Notice',
          //   text: 'You do not have access to edit. Please check the status of your interview rounds.',
          //   icon: 'info',
          //   showConfirmButton: true,
          //   confirmButtonText: 'OK',
          //   timerProgressBar: true,
          // });
          // this.showAlert("You do not have access to edit. Please check the status of your interview rounds.",'success')
        }
        // console.log("rajender : ",res.candidatePersonalInformationDetails.candidateInterviewDetails)
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
          // console.log("Registered Data:", res?.candidateCommunicationAddressDetails?.postalCode);

          this.resumeFile = res?.candidatePersonalInformationDetails?.resumeFile || null;

          // const resumeControl = this.registrationForm.get('resume');

          // if (!this.resumeFile) {
          //   resumeControl?.setValidators(Validators.required);
          // } else {
          //   resumeControl?.clearValidators();
          // }

          // resumeControl?.updateValueAndValidity();
          this.photoFile = res?.candidatePersonalInformationDetails?.imageFile || null;
          this.tenthFile = res?.candidateDocumentDetails?.tenthFile || null;
          this.aadharFile = res?.candidateDocumentDetails?.aadharFile || null;
          this.panFile = res?.candidateDocumentDetails?.panFile || null;
          this.twelthFile = res?.candidateDocumentDetails?.intermediateFile || null;
          this.deplomaFile = res?.candidateDocumentDetails?.pgFile || null;
          this.degreeOrBTechFile = res?.candidateDocumentDetails?.degreeFile || null;
          this.othersFile = res?.candidateDocumentDetails?.otherFile || null;

          this.paySlipFilePath1 = res?.candidateExperienceDetails?.candidateSalaryDetails?.paySlipFileA || null;
          this.paySlipFilePath2 = res?.candidateExperienceDetails?.candidateSalaryDetails?.paySlipFileB || null;
          this.paySlipFilePath3 = res?.candidateExperienceDetails?.candidateSalaryDetails?.paySlipFileC || null;
          this.serviceFilePath = res?.candidateExperienceDetails?.candidateSalaryDetails?.serviceFile || null;

          // if (!this.paySlipFilePath1) {
          //   this.registrationForm.get('payslipFile')?.setValidators([Validators.required]);
          // } else {
          //   this.registrationForm.get('payslipFile')?.clearValidators();
          // }

          // if (!this.serviceFilePath) {
          //   this.registrationForm.get('serviceLetterFile')?.setValidators([Validators.required]);
          // } else {
          //   this.registrationForm.get('serviceLetterFile')?.clearValidators();
          // }

          // // Update validity status after changing validators
          // this.registrationForm.get('payslipFile')?.updateValueAndValidity();
          // this.registrationForm.get('serviceLetterFile')?.updateValueAndValidity();

          // console.log("file docs name : ",paySlipFile,serviceFile)

          const isFresher = res?.candidateExperienceDetails?.candidateJoiningDetails?.is_Fresher ? 'fresher' : 'experienced';
          this.experienceArray = res?.candidateExperienceDetails?.candidateCompanyDetails || [];

          // Patch form data
          this.registrationForm.patchValue({
            firstName: res?.candidatePersonalInformationDetails?.firstName ? res.candidatePersonalInformationDetails.firstName : this.jobCodeData.name,
            middleName: res?.candidatePersonalInformationDetails?.middleName || '',
            lastName: res?.candidatePersonalInformationDetails?.lastName || '',
            maritalStatusId: res?.candidatePersonalInformationDetails?.maritalStatusId || '',
            bloodGroupId: res?.candidatePersonalInformationDetails?.bloodGroupId || '',
            genderId: res?.candidatePersonalInformationDetails?.genderId || '',
            titleId: res?.candidatePersonalInformationDetails?.titleId || '',
            dob: this.dobFormat(res?.candidatePersonalInformationDetails?.dob) || '',
            fatherName: res?.candidatePersonalInformationDetails?.fatherName || '',
            passport: res?.candidatePersonalInformationDetails?.passport || '',
            uan: res?.candidatePersonalInformationDetails?.uan || '',
            // mobileNumber: res?.candidatePersonalInformationDetails?.mobileNumber || '',
            district: res?.candidatePersonalInformationDetails?.district || '',
            licence: res?.candidatePersonalInformationDetails?.licence || '',
            pan: res?.candidatePersonalInformationDetails?.pan || '',
            adhar: res?.candidatePersonalInformationDetails?.adhar || '',
            // resume: res?.candidatePersonalInformationDetails?.resume || '',
            photo: res?.candidatePersonalInformationDetails?.image || '',

            // Communication Address
            addressA: res?.candidateCommunicationAddressDetails?.comAddressA || '',
            addressB: res?.candidateCommunicationAddressDetails?.comAddressB || '',
            addressC: res?.candidateCommunicationAddressDetails?.comAddressC || '',
            stateId: res?.candidateCommunicationAddressDetails?.stateId || '',
            cityId: res?.candidateCommunicationAddressDetails?.cityId || '',
            postalCode: res?.candidateCommunicationAddressDetails?.postalCode,
            addressFlag: res?.candidateCommunicationAddressDetails?.addressFlag || 'no',

            // Permanent Address
            permanentAddressA: res?.candidatePermanentAddressDetails?.perAddressA || '',
            permanentAddressB: res?.candidatePermanentAddressDetails?.perAddressB || '',
            permanentAddressC: res?.candidatePermanentAddressDetails?.perAddressC || '',
            permanentStateId: res?.candidatePermanentAddressDetails?.stateId || '',
            permanentCityId: res?.candidatePermanentAddressDetails?.cityId || '',
            permanentPostalCode: res?.candidatePermanentAddressDetails?.postalCode,

            // Experience Details
            isFresher: isFresher,
            joiningTime: res?.candidateExperienceDetails?.candidateJoiningDetails?.joiningId || '',
            currentSalary: res?.candidateExperienceDetails?.candidateSalaryDetails?.currentSalary || '',
            expectedSalary: res?.candidateExperienceDetails?.candidateSalaryDetails?.expectedSalary || '',
            suitableJobDescription: res?.candidateExperienceDetails?.candidateSalaryDetails?.description || '',
          });

          if (res?.candidateCommunicationAddressDetails?.postalCode) {
            this.getCities(
              res?.candidateCommunicationAddressDetails?.stateId,
              'communication',
              res?.candidateCommunicationAddressDetails?.cityId
            );
          }

          if (res?.candidatePermanentAddressDetails?.postalCode) {
            this.getCities(
              res?.candidatePermanentAddressDetails?.stateId,
              'permanent',
              res?.candidatePermanentAddressDetails?.cityId
            );
          }

          this.isAllDataPresent = [res?.candidatePersonalInformationDetails?.fatherName]
            .every(field => typeof field === 'string' && field.trim() !== '');

          this.isAllAddressDataPresent = [res?.candidateCommunicationAddressDetails?.comAddressA]
            .every(field => typeof field === 'string' && field.trim() !== '');

          this.isExperienceBoolean = res?.candidateExperienceDetails?.candidateJoiningDetails?.experienceId;

          this.handleExperienceToggle(isFresher);

          // Handle Education Details
          // if (res?.candidateEducationDetails?.length) {
          //   res.candidateEducationDetails.forEach((educationData: any) => {
          //     this.educationArray.push(this.createEducationFormGroup(educationData));
          //   });
          // }

          // if (res?.candidateEducationDetails?.length) {
          //   res.candidateEducationDetails.forEach((educationData: any) => {
          //     const isDuplicate = this.educationArray.controls.some((control: AbstractControl) =>
          //       control.value.qualificationName?.trim().toLowerCase() === educationData.qualificationName?.trim().toLowerCase()
          //     );

          //     if (!isDuplicate) {
          //       this.educationArray.push(this.createEducationFormGroup(educationData));
          //     }
          //   });
          // }


          // const educationArray = this.educationArray;
          // educationArray.clear(); // clear existing form entries

          // Add existing education entries (disabled)
          // if (res?.candidateEducationDetails?.length) {
          //   res.candidateEducationDetails.forEach((educationData: any) => {
          //     const isDuplicate = educationArray.controls.some((control: AbstractControl) =>
          //       control.value.qualificationId === educationData.qualificationId
          //     );

          //     if (!isDuplicate) {
          //       educationArray.push(this.createEducationFormGroup(educationData)); // disabled row
          //     }
          //   });
          // }

          // educationArray.push(this.createEducationFormGroup());





        } else {
          this.resumeFile = null;
          this.photoFile = null;
          this.tenthFile = null;
          this.twelthFile = null;
          this.panFile = null;
          this.aadharFile = null;
          this.deplomaFile = null;
          this.degreeOrBTechFile = null;
          this.othersFile = null;
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        // console.log('HTTP Error:', err);
        this.isLoading = false
      }
    });
  }



  // get educationArray(): FormArray {
  //   return this.registrationForm.get('educationDetails') as FormArray;
  // }
  // get educationArray(): FormArray {
  //   return this.registrationForm.get('educationDetails') as FormArray;
  // }


  // createEducationFormGroup(educationData: any = {}): FormGroup {
  //   const formGroup = this.fb.group({
  //     educationId: [educationData.educationId || null],
  //     educationTypeId: [educationData.educationTypeId || '', Validators.required],
  //     educationLevelId: [educationData.educationLevelId || '', Validators.required],
  //     qualification: [educationData.qualificationName || '', Validators.required],
  //     universityId: [educationData.universityId || '', Validators.required],
  //     branch: [educationData.branch || ''], // make required later conditionally
  //     yearOfPassing: [educationData.yearOfPassing || '', Validators.required],
  //     percentage: [educationData.percentage || '', Validators.required],
  //     college: [educationData.collegeName || '', Validators.required]
  //   });

  //   if (educationData.educationId) {
  //     formGroup.disable(); // mark existing record rows as readonly
  //   }

  //   return formGroup;
  // }




  // deleteFile(fileId: any) {
  //   console.log("canddd : ", this.jobCodeData?.candidateId);

  //   if (!this.jobCodeData?.candidateId || !fileId) {
  //     console.error("Missing parameters: Employee ID or File ID is undefined.");
  //     return;
  //   }

  //   const candidateId = this.jobCodeData?.candidateId;
  //   this.authService.deleteFile(candidateId, fileId).subscribe({
  //     next: (res: HttpResponse<any>) => {
  //       this.loadUserData();
  //       if (res.status === 200) {
  //         console.log("res delete file : ", res);
  //         this.showAlert('Successfully Deleted','success')
  //         // Swal.fire({
  //         //   title: 'Success',
  //         //   text: 'Successfully Deleted',
  //         //   icon: 'success',
  //         //   showConfirmButton: false,
  //         //   timer: 1000,
  //         //   timerProgressBar: true,
  //         // });
  //       } else {
  //         // Swal.fire({
  //         //   title: 'Error',
  //         //   text: 'Delete Failed',
  //         //   icon: 'error',
  //         //   showConfirmButton: false,
  //         //   timer: 1000,
  //         //   timerProgressBar: true,
  //         // });

  //         this.showAlert("Delete Failed", 'danger')
  //       }
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.log("error : ", err);
  //     }
  //   });
  // }
  deleteFile(fileId: any): void {
    if (!this.jobCodeData?.candidateId || !fileId) {
      console.error("Missing parameters: Employee ID or File ID is undefined.");
      return;
    }

    Swal.fire({
      html: `
      <div class="mb-3">
         <img src="https://cdn.dribbble.com/userupload/24380574/file/original-2070b7f112d8cdc5b374a8b7d80f1fc7.gif" alt="delete" style="width:60px; height:60px; border-radius: 15px;" />
      </div>
      <h5 class="mb-2" style="font-weight: bold;">Are you sure you want to delete this file?</h5>
      <p class="text-muted mb-0" style="font-size: 14px;">
        Deleting this may affect your application records.
      </p>
    `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        actions: 'd-flex justify-content-center gap-2',
        confirmButton: 'btn btn-danger btn-sm shadow-none',
        cancelButton: 'btn btn-sm btn-outline-secondary mr-2',
      },
      buttonsStyling: false,
      width: '500px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        const candidateId = this.jobCodeData?.candidateId;

        this.authService.deleteFile(candidateId, fileId).subscribe({
          next: (res: HttpResponse<any>) => {
            this.loadUserData();
            if (res.status === 200) {
              this.showAlert('Successfully Deleted', 'success');
            } else {
              this.showAlert("Delete Failed", 'danger');
            }
          },
          error: (err: HttpErrorResponse) => {
            // console.log("error : ", err);
            this.showAlert("Something went wrong", 'danger');
          }
        });
      }
    });
  }


  deleteExperience(experienceId: number, index: number) {
    Swal.fire({
      html: `
    <div class="mb-3">
      <img src="https://cdn.dribbble.com/userupload/24380574/file/original-2070b7f112d8cdc5b374a8b7d80f1fc7.gif" alt="delete" style="width:60px; height:60px; border-radius: 15px;" />
    </div>
    <h5 class="mb-2" style="font-weight: bold;">Are you sure you want to remove this Experience?</h5>
    <p class="text-muted mb-0" style="font-size: 14px;">
      Deleting this may affect your application records.
    </p>
  `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        actions: 'd-flex justify-content-center',
        confirmButton: 'btn btn-danger btn-sm shadow-none',
        cancelButton: 'btn btn-outline-secondary btn-sm shadow-none mr-2'
      },
      buttonsStyling: false,
      width: '550px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteExperience(experienceId).subscribe({
          next: () => {
            // Swal.fire({
            //   title: 'Deleted!',
            //   text: 'Successfully Deleted',
            //   icon: 'success',
            //   confirmButtonText: 'OK'
            // });
            this.showAlert("Successfully Deleted", "success")
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
            // console.log('Error deleting experience:', err);
          }
        });
      }
    });

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
    } else if (name === 'aadharFile') {
      this.aadharFile = ''
    } else if (name === 'panFile') {
      this.panFile = ''
    } else if (name === 'deploma') {
      this.deplomaFile = ''
    } else if (name === 'degreeOrBTech') {
      this.degreeOrBTechFile = ''
    } else if (name === 'others') {
      this.othersFile = ''
    }
  }


  removeEducation(educationId: number | null | undefined): void {
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

    Swal.fire({
      html: `
    <div class="mb-3">
      <img src="https://cdn.dribbble.com/userupload/24380574/file/original-2070b7f112d8cdc5b374a8b7d80f1fc7.gif" alt="delete" style="width:60px; height:60px; border-radius: 15px;" />
    </div>
    <h5 class="mb-2" style="font-weight: bold;">Are you sure you want to delete this Record?</h5>
    <p class="text-muted mb-0" style="font-size: 14px;">
      Deleting this may affect your application records.
    </p>
  `,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Delete',
      reverseButtons: true,
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        actions: 'd-flex justify-content-center',
        cancelButton: 'btn btn-outline-secondary btn-sm shadow-none mr-2',
        confirmButton: 'btn btn-danger btn-sm shadow-none'
      },
      buttonsStyling: false,
      width: '550px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        // console.log("index: ", index);
        // console.log("educationId: ", educationId);

        this.authService.deleteEducation(educationId).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            this.showAlert("Education record has been deleted.", "success");
            this.loadUserData();
            // console.log(res);
            // Swal.fire({
            //   title: 'Deleted!',
            //   text: 'Education record has been deleted.',
            //   icon: 'success',
            //   showConfirmButton: false,
            //   timer: 1000,
            //   timerProgressBar: true,
            // });
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            // console.log("Error deleting education:", err);
          }
        });
      }
    });
  }

  onlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
      this.showAlert("Only numbers (0-9) are allowed.", 'danger')
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
        this.showAlert("You cannot enter more than 2 digits before the dot.", "danger")
        // Swal.fire({
        //   icon: 'warning',
        //   title: 'Invalid Input',
        //   text: 'You cannot enter more than 2 digits before the dot.',
        //   timer: 2000,
        //   showConfirmButton: false
        // });
      }
      return;
    }

    // Allow only one dot (.)
    if (input === '.') {
      if (currentValue.includes('.')) {
        event.preventDefault();
        this.showAlert("Only one dot (.) is allowed.", "danger")
        // Swal.fire({
        //   icon: 'warning',
        //   title: 'Invalid Input',
        //   text: 'Only one dot (.) is allowed.',
        //   timer: 2000,
        //   showConfirmButton: false
        // });
      }
      return;
    }

    // Show SweetAlert for other invalid inputs
    event.preventDefault();
    this.showAlert("Please enter only numbers (0-9) with a single dot (.) for decimal values.", "danger")
    // Swal.fire({
    //   icon: 'warning',
    //   title: 'Invalid Input',
    //   text: 'Please enter only numbers (0-9) with a single dot (.) for decimal values.',
    //   timer: 2000,
    //   showConfirmButton: false
    // });
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
      this.uploadResume = 'Upload Resume'
      this.uploadPhoto = 'Upload Photo'
    } else if (value == 'address') {
      this.isAllAddressDataPresent = false
      this.addressUpadte = true;
    } else if (value == 'experience') {
      this.isExperienceBoolean = false
      this.experienceUpdate = true;
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


  // onFileSelect(event: Event, fieldName: string): void {
  //   console.log("file name : ", fieldName)
  //   const fileInput = event.target as HTMLInputElement;
  //   const file = fileInput.files?.[0];

  //   if (file) {
  //     const selectedFile = new File([file], file.name, { type: file.type, lastModified: Date.now() });

  //     console.log(`Selected file for ${fieldName}:`, selectedFile);

  //     this.selectedFiles[fieldName] = selectedFile;
  //   } else {
  //     console.log(`No file selected for ${fieldName}`);
  //   }
  //   let hasFile = false;
  //   let formData = new FormData();
  //   console.log("file array: ", this.selectedFiles);
  //   formData.append('jobCodeId', this.jobCodeData?.jobCodeId);

  //   const documentData = {
  //     candidateId: this.jobCodeData.candidateId
  //   };
  //   formData.append('document', JSON.stringify(documentData));
  //   formData.append('moduleId', '4');

  //   // Check if at least one file is present
  //   if (this.selectedFiles['tenth']) {
  //     formData.append('tenthFile', this.selectedFiles['tenth']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['aadharFile']) {
  //     formData.append('aadharFile', this.selectedFiles['aadharFile']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['panFile']) {
  //     formData.append('panFile', this.selectedFiles['panFile']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['twelth']) {
  //     formData.append('interFile', this.selectedFiles['twelth']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['deploma']) {
  //     formData.append('pgFile', this.selectedFiles['deploma']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['degreeOrBTech']) {
  //     formData.append('degreeFile', this.selectedFiles['degreeOrBTech']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['others']) {
  //     formData.append('otherFile', this.selectedFiles['others']);
  //     hasFile = true;
  //   }

  //   // Only call finalSave if at least one file is selected
  //   if (hasFile) {
  //     this.finalSave('documents', formData);
  //   }
  //   // else {
  //   //   Swal.fire({
  //   //     title: 'warning',
  //   //     text: 'Please upload File',
  //   //     icon: 'warning',
  //   //     showConfirmButton: false,
  //   //     timer: 1000,
  //   //     timerProgressBar: true,
  //   //   });
  //   // }
  // }

  // onFileSelect(event: Event, fieldName: string): void {
  //   console.log("file name : ", fieldName);
  //   const fileInput = event.target as HTMLInputElement;
  //   const file = fileInput.files?.[0];

  //   if (file) {
  //     const maxSizeInMB = 5;
  //     const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  //     if (file.size > maxSizeInBytes) {
  //       Swal.fire({
  //         title: 'File Too Large',
  //         text: 'File size must be less than 5 MB.',
  //         icon: 'error',
  //         confirmButtonText: 'OK'
  //       });
  //       fileInput.value = ''; // Clear the input
  //       return;
  //     }

  //     const selectedFile = new File([file], file.name, { type: file.type, lastModified: Date.now() });
  //     console.log(`Selected file for ${fieldName}:`, selectedFile);
  //     this.selectedFiles[fieldName] = selectedFile;
  //   } else {
  //     console.log(`No file selected for ${fieldName}`);
  //   }

  //   let hasFile = false;
  //   let formData = new FormData();
  //   console.log("file array: ", this.selectedFiles);
  //   formData.append('jobCodeId', this.jobCodeData?.jobCodeId);

  //   const documentData = {
  //     candidateId: this.jobCodeData.candidateId
  //   };
  //   formData.append('document', JSON.stringify(documentData));
  //   formData.append('moduleId', '4');

  //   if (this.selectedFiles['tenth']) {
  //     formData.append('tenthFile', this.selectedFiles['tenth']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['aadharFile']) {
  //     formData.append('aadharFile', this.selectedFiles['aadharFile']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['panFile']) {
  //     formData.append('panFile', this.selectedFiles['panFile']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['twelth']) {
  //     formData.append('interFile', this.selectedFiles['twelth']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['deploma']) {
  //     formData.append('pgFile', this.selectedFiles['deploma']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['degreeOrBTech']) {
  //     formData.append('degreeFile', this.selectedFiles['degreeOrBTech']);
  //     hasFile = true;
  //   }
  //   if (this.selectedFiles['others']) {
  //     formData.append('otherFile', this.selectedFiles['others']);
  //     hasFile = true;
  //   }

  //   if (hasFile) {
  //     this.finalSave('documents', formData);
  //   }
  // }

  onFileSelect(event: Event, fieldName: string): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        Swal.fire({
          title: 'File Too Large',
          text: 'File size must be less than 5 MB.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        fileInput.value = ''; // Clear the input
        return;
      }

      if (fieldName == 'resume') {
        this.uploadResume = file.name
      }
      if (fieldName == 'photo') {
        this.uploadPhoto = file.name
      }

      // Store a clean copy of the file
      const selectedFile = new File([file], file.name, {
        type: file.type,
        lastModified: Date.now()
      });

      // console.log(`Selected file for ${fieldName}:`, selectedFile);
      this.selectedFiles[fieldName] = selectedFile;
    } else {
      // console.log(`No file selected for ${fieldName}`);
      return;
    }

    const formData = new FormData();
    let hasFile = false;

    // Append common fields
    formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
    formData.append('moduleId', '4');
    formData.append('document', JSON.stringify({
      candidateId: this.jobCodeData?.candidateId
    }));

    // Map of fieldName => FormData key
    const fileFieldMap: { [key: string]: string } = {
      'tenth': 'tenthFile',
      'aadharFile': 'aadharFile',
      'panFile': 'panFile',
      'twelth': 'interFile',
      'deploma': 'pgFile',
      'degreeOrBTech': 'degreeFile',
      'others': 'otherFile'
    };

    // Append only the selected files
    for (const [key, formField] of Object.entries(fileFieldMap)) {
      const selected = this.selectedFiles[key];
      if (selected) {
        formData.append(formField, selected);
        hasFile = true;
      }
    }

    if (hasFile) {
      this.finalSave('documents', formData);
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

    // if (section === 'documents' && !this.loadedData?.candidateInterviewDetails?.length && this.loadedData?.candidateTrackingDTO?.totalPercentage != '100') {
    //   this.loadUserData();
    // }
  }

  setValidation(Action: string) {
    let isValid = true;
    const sectionData: any = {};

    if (Action === 'personal') {
      const personalFields = [
        'email', 'mobileNumber', 'dob', 'titleId',
        'firstName', 'middleName', 'lastName', 'maritalStatusId', 'bloodGroupId', 'uan', 'passport',
        'genderId', 'fatherName', 'district', 'licence', 'pan', 'adhar', 'resume', 'photo'
      ];

      let sectionData: any = {};
      let isValid = true;

      personalFields.forEach((field) => {
        const control = this.registrationForm.get(field);
        if (control?.invalid) {
          control.markAsTouched();
          isValid = false;
        } else {
          sectionData[field] = control?.value;
        }
      });

      if (!isValid) {
        this.showAlert("Please fill required fields!", 'danger');
        // console.log("Form incomplete: ", sectionData);
        return;
      }

      // ✅ Format DOB (from dd-mm-yyyy or dd-MMM-yyyy to yyyy-mm-dd)
      if (sectionData.dob) {
        const formattedDob = this.convertToStandardDateFormat(sectionData.dob);
        if (formattedDob) {
          sectionData.dob = formattedDob;
        } else {
          console.error('Invalid DOB format:', sectionData.dob);
        }
      }

      let formData = new FormData();
      sectionData.candidateId = this.jobCodeData?.candidateId;
      formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
      formData.append('candidateId', this.jobCodeData?.candidateId);
      formData.append('personalInfo', JSON.stringify(sectionData));
      formData.append('personalImageFile', this.selectedFiles['photo']);
      formData.append('personalResumeFile', this.selectedFiles['resume']);
      formData.append('moduleId', '1');
      if (!this.selectedFiles['resume']) {
        this.showAlert("Resume file is required", "danger");
        formData.append('personalResumeFile', null);
      }

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
        // this.formFillMessageAlert();
        this.showAlert("Please fill required fields!", 'danger');
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
    }
    // else if (Action === 'education') {
    //   let isValid = true;
    //   let educationData: any[] = [];

    //   const newEducationControls = this.educationArray.controls.filter(ctrl => !ctrl.disabled);
    //   const existingEducationControls = this.educationArray.controls.filter(ctrl => ctrl.disabled);

    //   if (newEducationControls.length === 0) {
    //     // this.formFillMessageAlert();
    //     this.showAlert("Please fill required fields!", 'danger');
    //     return;
    //   }

    //   // Collect existing qualificationIds and normalize to string
    //   const existingQualificationIds = existingEducationControls
    //     .map(ctrl => String(ctrl.get('qualificationId')?.value))
    //     .filter(id => !!id); // Remove null/undefined

    //   const newQualificationIds: string[] = [];
    //   let hasDuplicate = false;

    //   for (let group of newEducationControls) {
    //     const qualificationId = String(group.get('qualificationId')?.value);

    //     if (!qualificationId || qualificationId === 'null') continue;

    //     if (existingQualificationIds.includes(qualificationId) || newQualificationIds.includes(qualificationId)) {
    //       hasDuplicate = true;
    //       break;
    //     }

    //     newQualificationIds.push(qualificationId);
    //   }

    //   if (hasDuplicate) {
    //     // Swal.fire({
    //     //   title: 'Duplicate Qualification',
    //     //   text: 'You have already selected this qualification. To update, please delete the existing entry and add again.',
    //     //   icon: 'warning',
    //     //   confirmButtonText: 'OK'
    //     // });
    //     this.showAlert("Duplicate Qualification", "danger")
    //     return;
    //   }

    //   newEducationControls.forEach((group: FormGroup) => {
    //     let educationEntry: any = {};
    //     const educationFields = [
    //       'educationTypeId', 'universityId', 'qualification',
    //       'yearOfPassing', 'percentage', 'branch', 'educationLevelId', 'college'
    //     ];

    //     educationFields.forEach((field) => {
    //       const control = group.get(field);
    //       if (control?.invalid) {
    //         control.markAsTouched();
    //         isValid = false;
    //       } else {
    //         educationEntry[field] = control?.value;
    //       }
    //     });

    //     educationEntry['educationId'] = 1;
    //     educationEntry['candidateId'] = this.jobCodeData?.candidateId;

    //     educationData.push(educationEntry);
    //   });

    //   if (!isValid) {
    //     // this.formFillMessageAlert();
    //     this.showAlert("Please fill required fields!", 'danger');
    //     return;
    //   }

    //   let formData = new FormData();
    //   formData.append("education", JSON.stringify(educationData));
    //   formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
    //   formData.append('candidateId', this.jobCodeData?.candidateId);
    //   formData.append('moduleId', '3');

    //   this.finalSave('education', formData);
    // } 
    if (Action === 'education') {
      const educationFields = [
        'educationTypeId',
        'educationLevelId',
        'qualification',
        'universityId',
        'branch',
        'yearOfPassing',
        'percentage',
        'college'
      ];

      let educationSection: any = {};
      let isValid = true;

      educationFields.forEach((field) => {
        const control = this.registrationForm.get(field);
        if (control?.invalid) {
          control.markAsTouched();
          isValid = false;
        } else {
          educationSection[field] = control?.value;
        }
      });

      if (!isValid) {
        this.showAlert("Please fill required fields!", 'danger');
        return;
      }

      educationSection.educationId = this.registrationForm.get('educationId')?.value || 1;
      educationSection.candidateId = this.jobCodeData?.candidateId;

      const formData = new FormData();
      formData.append("education", JSON.stringify([educationSection]));
      formData.append("jobCodeId", this.jobCodeData?.jobCodeId);
      formData.append("candidateId", this.jobCodeData?.candidateId);
      formData.append("moduleId", "3");

      this.finalSave('education', formData);
    }

    else if (Action === 'documents') {
      const documentsFields = ['tenth', 'twelth', 'panFile', 'aadharFile', 'deploma', 'degreeOrBTech', 'others'];
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
      // console.log("file array: ", this.selectedFiles);
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
      if (this.selectedFiles['aadharFile']) {
        formData.append('aadharFile', this.selectedFiles['aadharFile']);
        hasFile = true;
      }
      if (this.selectedFiles['panFile']) {
        formData.append('panFile', this.selectedFiles['panFile']);
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
    } if (Action === 'experienceWithCtc') {
      let isValid = true;
      const sectionData: any = {};

      const experienceFields = this.isFresher
        ? ['joiningTime', 'isFresher']
        : [
          'joiningTime', 'isFresher', 'currentSalary', 'expectedSalary', 'suitableJobDescription',
          // 'LastOrStill_Working_Date','totalExperience','companyName',
          // 'payslipFile', 'serviceLetterFile'
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
        // this.formFillMessageAlert();
        this.showAlert("Please fill required fields!", "danger")
        return;
      }

      const experienceData: any = {
        candidateId: this.jobCodeData.candidateId,
        isFresher: sectionData.isFresher === 'fresher',
        joiningId: sectionData.joiningTime
      };

      if (!this.isFresher) {
        // experienceData.experienceMapDTO = [
        //   {
        //     companyName: sectionData.companyName,
        //     totalExp: sectionData.totalExperience,
        //     lastWorkingDate: this.datePipe.transform(sectionData.LastOrStill_Working_Date, 'dd-MM-yyyy')
        //   }
        // ];

        // experienceData.experienceSalaryDTO = {
        //   currentSalary: sectionData.currentSalary,
        //   expectedSalary: sectionData.expectedSalary,
        //   description: sectionData.suitableJobDescription
        // };
        experienceData.currentSalary = sectionData.currentSalary;
        experienceData.expectedSalary = sectionData.expectedSalary;
        experienceData.description = sectionData.suitableJobDescription;

      }

      this.personalInfoArray.push({ experience: { ...experienceData } });

      let formData = new FormData();
      formData.append("experience", JSON.stringify(experienceData));
      formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
      formData.append('candidateId', this.jobCodeData.candidateId);
      formData.append('moduleId', '5');
      if (this.payslipFile) {
        formData.append('paySlips', this.payslipFile);
      }
      // else {
      //   formData.append('paySlips', null);
      // }
      if (this.serviceLetterFile) {
        formData.append('expService', this.serviceLetterFile);
      }
      //  else {
      //   formData.append('expService', null);
      // }

      this.finalSave('experience', formData);
    }
    else if (Action === 'experienceWithCompany') {
      console.log("rajender");
      if (!this.experienceId) {
        this.showAlert("Experience ID is not available!", "danger");
        return;
      }
      let isValid = true;
      const sectionData: any = {};
      const experienceFields = ['LastOrStill_Working_Date', 'totalExperience', 'companyName'];
      experienceFields.forEach((field) => {
        const control = this.registrationForm.get(field);
        if (control?.invalid) {
          control.markAsTouched();
          isValid = false;
        } else {
          sectionData[field] = control.value;
        }
      });

      if (!isValid) {
        this.showAlert("Please fill required fields!", "danger");
        return;
      }
      const experienceData: any = {
        companyName: sectionData.companyName,
        totalExp: sectionData.totalExperience,
        lastWorkingDate: this.datePipe.transform(sectionData.LastOrStill_Working_Date, 'yyyy-MM-dd'),
        experienceId: this.experienceId
      };
      const experiencePayload = {
        experienceId: experienceData.experienceId,
        companyName: experienceData.companyName,
        totalExp: experienceData.totalExp,
        lastWorkingDate: experienceData.lastWorkingDate,
        jobCodeId: this.jobCodeData?.jobCodeId,
        candidateId: this.jobCodeData?.candidateId,
        moduleId: '5'
      };
      this.authService.ExperienceAdd(experiencePayload).subscribe({
        next: (res: any) => {
          this.showAlert("Experience added Successfully.", 'success');
          this.loadUserData();
          this.registrationForm.get('LastOrStill_Working_Date')?.reset();
          this.registrationForm.get('totalExperience')?.reset();
          this.registrationForm.get('companyName')?.reset();
        },
        error: (err: HttpErrorResponse) => {
          console.log("error : ", err);
        }
      })
    }

  }


  finalSave(action: string, formData) {
    formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
    formData.append('candidateId', this.jobCodeData?.candidateId);
    // console.log("education jobcode id : ", this.jobCodeData?.jobCodeId, "candidate id: ", this.jobCodeData?.candidateId)
    this.isLoading = true;
    // console.log(" form data : ", formData)
    // return false
    this.authService.hiringRegister(formData).subscribe({
      next: (res: HttpResponse<any>) => {
        this.isLoading = false;
        // console.log("personal result : ", res);

        if (res.status === 200) {
          this.loadUserData();
          // const educationArray = this.registrationForm.get('educationDetails') as FormArray;
          // if (educationArray) {
          //   educationArray.clear();
          //   educationArray.push(this.createEducationFormGroup());
          // }
          this.selectedFiles = {}
          this.personalUpdate = false;
          this.addressUpadte = false;
          // Swal.fire({
          //   title: 'Success',
          //   text: 'Successfully completed',
          //   icon: 'success',
          //   showConfirmButton: true,
          // });

          this.showAlert("Successfully completed", "success");
          this.setActiveSection(action);
          if (action === 'education') {
            const educationFields = [
              'educationTypeId',
              'educationLevelId',
              'qualification',
              'universityId',
              'branch',
              'yearOfPassing',
              'percentage',
              'college'
            ];

            educationFields.forEach(field => {
              this.registrationForm.get(field)?.setValue('');
              this.registrationForm.get(field)?.markAsPristine();
              this.registrationForm.get(field)?.markAsUntouched();
            });
          } else if (action === 'documents') {
            this.selectedFiles = {}
            const educationArray = this.registrationForm.get('educationDetails') as FormArray;
            if (educationArray) {
              educationArray.clear();
              // educationArray.push(this.createEducationFormGroup());
            }
            this.updateDocumentFlag = false;
            // this.fileInput.nativeElement.value = '';
          } else if (action === 'experience') {
            // this.loadUserData();
            const educationArray = this.registrationForm.get('educationDetails') as FormArray;
            // this.selectedFiles = {}
            // this.payslipFile = null;
            // this.serviceLetterFile = null;
            if (educationArray) {
              educationArray.clear();
              // educationArray.push(this.createEducationFormGroup());
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
        } else if (res.status === 500) {
          const errorMessage = (res as any).message || 'Failed';
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }

      }, error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // console.log("error : ", err);
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
    // this.isLoading = true;
    this.authService.title().subscribe({
      next: (res: any) => {

        // this.isLoading = false;
        this.titleOptions = res;
      },
      error: (err: HttpErrorResponse) => {

        // this.isLoading = false;
        // console.log("error", err);
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
        // console.log("error", err)
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
        // console.log("error", err)
      }
    })
  }
  university() {
    this.authService.university().subscribe({
      next: (res: any) => {
        // console.log("univercities : ", res)
        this.universityOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error", err);
      }
    })
  }

  educationLevel() {
    this.authService.educationLevel().subscribe({
      next: (res: any) => {
        // console.log("univercities : ", res)
        this.educationLevelOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error", err);
      }
    })
  }

  onEducationLevelChange(selectedId: string): void {
    if (selectedId) {
      const educationLevelId = parseInt(selectedId, 10);
      console.log("Education level ID:", educationLevelId);
      this.qualificationOptions = [];
      this.branchOptions = [];
      this.registrationForm.get('qualification')?.setValue('');
      this.registrationForm.get('branch')?.setValue('');

      this.getQualificationsByEducationLevelId(educationLevelId);
    } else {
      this.qualificationOptions = [];
      this.branchOptions = [];
      this.registrationForm.get('qualification')?.setValue('');
      this.registrationForm.get('branch')?.setValue('');
    }
  }

  getQualificationsByEducationLevelId(educationLevelId: number): void {
    this.authService.qualification(educationLevelId).subscribe({
      next: (qualifications: any) => {
        this.qualificationOptions = qualifications;
      },
      error: (err) => {
        console.error('Error fetching qualifications', err);
      }
    });
  }

  onQualificationChange(event: Event): void {
    const selectedName = (event.target as HTMLSelectElement).value;
    console.log('Selected name:', selectedName);

    if (selectedName) {
      const formData = new FormData();
      formData.append('qualificationName', selectedName);

      this.branch(formData);
    }
  }

  branch(formData: FormData) {
    console.log(formData)
    this.authService.branch(formData).subscribe({
      next: (res: any) => {
        this.branchOptions = res;
      },
      error: (err) => {
        console.error('Branch API error:', err);
      }
    });
  }

  joiningTime() {
    this.authService.joiningTime().subscribe({
      next: (res: any) => {
        // console.log("titles : ",res)
        this.joiningOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error", err)
      }
    })
  }

  bloodGroup() {
    this.authService.bloodGroup().subscribe({
      next: (res: any) => {
        // console.log("titles : ",res)
        this.bloodGroupOptions = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error", err)
      }
    })
  }

  states() {
    this.authService.states().subscribe({
      next: (res: any) => {
        this.indianStates = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("Error fetching states:", err);
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

  getCities(
    stateId: string,
    addressType: 'communication' | 'permanent',
    backendCityId?: string
  ) {
    this.authService.cities(stateId).subscribe({
      next: (cities: any[]) => {
        if (!cities || cities.length === 0) {
          this.setCitiesAndPatch(null, addressType, null);
          return;
        }

        const isValidCity = cities.some(city => city.id === backendCityId);
        const finalCityId = isValidCity ? backendCityId : null;

        this.setCitiesAndPatch(cities, addressType, finalCityId);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching cities:', err);
        this.setCitiesAndPatch([], addressType, null);
      }
    });
  }


  private setCitiesAndPatch(cities: any[] | null, addressType: 'communication' | 'permanent', cityId: string | null) {
    const patchedCityId = cityId ?? '';

    if (addressType === 'communication') {
      this.communicationCities = cities ?? [];
      setTimeout(() => {
        this.registrationForm.get('cityId')?.patchValue(patchedCityId);
      });
    } else {
      this.permanentCities = cities ?? [];
      setTimeout(() => {
        this.registrationForm.get('permanentCityId')?.patchValue(patchedCityId);
      });
    }
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

  // lastWorkingformatDate(dateString: string): string {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   return date.toISOString().split('T')[0];
  // }

  logout(): void {
    Swal.fire({
      html: `
      <div class="mb-3">
        <img src="assets/img/job-code/logout-gif.gif" alt="logout" style="width:60px; height:60px; " />
      </div>
      <h5 class="mb-2" style="font-weight: bold;">Are you sure you want to log out?</h5>
      <p class="text-muted mb-0" style="font-size: 14px;">
        You will need to log in again to access your profile and application details.
      </p>
    `,
      showCancelButton: true,
      confirmButtonText: 'Log Out',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        // actions: 'd-flex justify-content-center',
        confirmButton: 'btn btn-primary btn-sm w-100 mb-2 shadow-none',
        cancelButton: 'btn btn-sm btn-outline-secondary w-100',
      },
      buttonsStyling: false,
      width: '500px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('hiringLoginData');
        this.router.navigate(['/hiring-login']);
      }
    });
  }



  checkDuplicateQualification(index: number): boolean {
    const educationArray = this.registrationForm.get('educationDetails') as FormArray;
    const currentQual = educationArray.at(index).get('qualification')?.value;

    if (!currentQual) return false;

    // Count how many times this qualification appears in the form
    const duplicates = educationArray.controls.filter((control, i) => {
      return i !== index && control.get('qualification')?.value === currentQual;
    });

    return duplicates.length > 0;
  }

  alertMessage: string | null = null;
  private panAlertTimeout: any;

  panCardKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const value = input?.value;
    const pos = input.selectionStart ?? value?.length;

    if (
      ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key) ||
      (event.ctrlKey || event.metaKey)
    ) {
      return;
    }

    if (value?.length >= 10 && input.selectionStart === input.selectionEnd) {
      event.preventDefault();
      this.showInvalidPanAlert('PAN number cannot be more than 10 characters.');
      return;
    }

    if (pos < 5) {
      if (!/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        this.showInvalidPanAlert('Only letters (A-Z) allowed in first 5 characters');
      }
    } else if (pos >= 5 && pos < 9) {
      if (!/^[0-9]$/.test(key)) {
        event.preventDefault();
        this.showInvalidPanAlert('Only digits (0-9) allowed in positions 6–9');
      }
    } else if (pos === 9) {
      if (!/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        this.showInvalidPanAlert('Last character must be a letter (A-Z)');
      }
    } else {
      event.preventDefault();
    }
  }

  private showInvalidPanAlert(message: string): void {
    this.alertMessage = message;

    clearTimeout(this.panAlertTimeout);
    this.panAlertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 2000); // alert visible for 2 seconds
  }




  openTenthFileInput(): void {
    this.hiddenTenthInput.nativeElement.click();
  }

  openAadharFileInput(): void {
    this.hiddenAadharInput.nativeElement.click();
  }

  openPanFileInput(): void {
    this.hiddenPanInput.nativeElement.click();
  }

  openTwelthFileInput(): void {
    this.hiddenTwelthInput.nativeElement.click();
  }

  openDegreeOrBTechInput(): void {
    this.hiddenDegreeOrBTechInput.nativeElement.click();
  }
  openDeplomaInput(): void {
    this.hiddenDeplomaInput.nativeElement.click();
  }
  openOthersInput(): void {
    this.hiddenOthersInput.nativeElement.click();
  }


  // onFileChange(event: any, controlName: string) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.registrationForm.get(controlName)?.setValue(file);
  //     console.log("file : ", file);


  //     if (controlName === 'payslipFile') {
  //       this.payslipFile = file;
  //       this.selectedPayslip1FileName = file.name;
  //     } else if (controlName === 'serviceLetterFile') {
  //       this.serviceLetterFile = file;
  //       this.selectedServiceLetterFileName = file.name
  //     }
  //   }
  // }
  onFileChange(event: any, controlName: string, fileId: any) {
    const file = event.target.files[0];
    console.log("file id : ", fileId);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'File Too Large',
        text: 'File size must be less than 5 MB.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.registrationForm.get(controlName)?.setValue(file);
    console.log("Selected file:", file);

    const formData = new FormData();
    formData.append('jobCodeId', this.jobCodeData?.jobCodeId);
    formData.append('moduleId', '5');
    formData.append('experienceId', this.experienceId);
    formData.append('candidateId', this.jobCodeData?.candidateId);
    formData.append('fileNo', fileId);
    formData.append('file', file);

    this.isLoading = true;
    this.authService.experienceFileAdd(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showAlert("File uploaded successfully.", 'success');
        this.loadUserData();
      },
      error: (err: HttpErrorResponse) => {
        console.error("Upload error:", err);
        this.isLoading = false;
      }
    });
  }



  deleteExpericeFile(id: any) {
    if (!this.experienceId) {
      this.showAlert("Experience ID is not available!", "danger");
      return;
    }

    Swal.fire({
      html: `
    <div class="mb-3">
      <img src="https://cdn.dribbble.com/userupload/24380574/file/original-2070b7f112d8cdc5b374a8b7d80f1fc7.gif" alt="delete" style="width:60px; height:60px; border-radius: 15px;" />
    </div>
    <h5 class="mb-2" style="font-weight: bold;">Are you sure you want to delete this File?</h5>
    <p class="text-muted mb-0" style="font-size: 14px;">
      Deleting this may affect your application records.
    </p>
  `,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Delete',
      reverseButtons: true,
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        actions: 'd-flex justify-content-center',
        cancelButton: 'btn btn-outline-secondary btn-sm shadow-none mr-2',
        confirmButton: 'btn btn-danger btn-sm shadow-none'
      },
      buttonsStyling: false,
      width: '550px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("id : ", id);
        this.authService.ExperienceFileDelete(this.experienceId, id).subscribe({
          next: (res: any) => {
            this.showAlert("File Deleted successfully.", "success");
            this.loadUserData();
          },
          error: (err: HttpErrorResponse) => {
            this.showAlert("error while deleting file!", "danger")
          }
        })
      }
    })
  }



  checkIfLoginExpired(): void {
    const createdDateStr = this.jobCodeData?.createdDateTime;

    if (createdDateStr) {
      // Convert string to valid Date (replace space with T for ISO format)
      const createdDate = new Date(createdDateStr.replace(' ', 'T'));
      const now = new Date();

      // Calculate difference in milliseconds
      const diffInMs = now.getTime() - createdDate.getTime();

      // Convert to days
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // console.log('Days since login:', diffInDays);

      // If more than 5 days have passed, redirect
      if (diffInDays > 5) {
        this.logout();
      }
    }
  }

  dobFormat(dobStr: string | null | undefined): Date | '' {
  if (!dobStr) return '';

  const [dd, mm, yyyy] = dobStr.split('-');
  const day = Number(dd);
  const month = Number(mm) - 1; // JS months are 0-based
  const year = Number(yyyy);

  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 || month < 0 || month > 11 || year < 1000
  ) {
    return '';
  }

  return new Date(year, month, day);
}


  UpdatePayslip() {
    this.paySlipFilePath1 = null;
    this.serviceFilePath = null;
  }

  // Place this function outside your component method for reuse
  convertToStandardDateFormat(inputDate: string): string | null {
    if (!inputDate || typeof inputDate !== 'string') return null;

    const monthMap: { [key: string]: string } = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const parts = inputDate.split('-');
    if (parts.length !== 3) return null;

    const [day, monthRaw, year] = parts;
    const month = isNaN(Number(monthRaw))
      ? monthMap[monthRaw] // "Jun" → "06"
      : ('0' + monthRaw).slice(-2); // "6" → "06"

    if (!month) return null;

    return `${year}-${month}-${day}`;
  }


  alertType: 'success' | 'danger' = 'success';

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;


    clearTimeout(this.panAlertTimeout);
    this.panAlertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 2000);
  }

  closeAlert() {
    this.alertMessage = null;
  }

  InterviewStatus() {
    Swal.fire({
      html: `
        <div class="mb-3">
          <img src="assets/img/job-code/document-gif.gif" alt="delete" style="width:60px; height:60px;" />
        </div>
        <h5 class="mb-2" style="font-weight: bold;">Interview Process Started!</h5>
        <p class="text-muted mb-0" style="font-size: 14px;">
        Your interview has started. Please stay updated and be available as per the schedule. Updates will follow via email.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Track Interview Status',
      cancelButtonText: 'Close',
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        confirmButton: 'btn btn-primary btn-sm shadow-none w-100 mb-2',
        cancelButton: 'btn btn-outline-secondary btn-sm shadow-none'
      },
      buttonsStyling: false,
      width: '550px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.setActiveSection('status');
      }
    });
  }

  completedStatus() {
    Swal.fire({
      html: `
    <div class="mb-3">
      <img src="assets/img/job-code/document-gif.gif" alt="delete" style="width:60px; height:60px;" />
    </div>
    <h5 class="mb-2" style="font-weight: bold;">Submission Successful!</h5>
    <p class="text-muted mb-0" style="font-size: 14px;">
      Your application has been submitted. All further updates will be shared with you via email.
    </p>
  `,
      showCancelButton: true,
      confirmButtonText: 'Track Interview Status',
      cancelButtonText: 'Close',
      customClass: {
        popup: 'p-3 rounded-4',
        htmlContainer: 'text-center',
        confirmButton: 'btn btn-primary btn-sm shadow-none w-100 mb-2',
        cancelButton: 'btn btn-outline-secondary btn-sm shadow-none'
      },
      buttonsStyling: false,
      width: '550px',
      backdrop: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.setActiveSection('status');
      }
    });
  }


  formatFullDateForInterview(dateStr: string): string {
    if (!dateStr) return '';

    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    const dayStr = day.toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'long' });

    return `${dayStr} ${monthName} ${year}`;
  }

}
