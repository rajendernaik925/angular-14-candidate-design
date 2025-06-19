import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.sass', './job-detail.component.css'],
})
export class JobDetailComponent implements OnInit {
  userData: any;
  jobCodeId: number | null = null;
  myDate: string = '';
  private dialogRef: any;
  jobCodeResData: any;
  base64String: string;
  safeUrl: SafeResourceUrl;
  isLoading: boolean = false;
  submitted: boolean = false;
  selectedBusinessUnits: string[] = [];
  publishForm: FormGroup;
  businessUnits: any[] = [];
  idBasedSubmit: number | null = null;


  @ViewChild('publishDialog', { static: true }) publishDialog!: TemplateRef<any>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authservice: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.publishForm = this.fb.group({
      publishMode: ['', Validators.required], // Ensure publishMode is always required
      businessUnit: this.fb.group({}) // Initially empty
    });

    // Subscribe to publishMode value changes
    this.publishForm.get('publishMode')?.valueChanges.subscribe((mode) => {
      if (mode === 'Online') {
        this.addBusinessUnitValidation();
      } else {
        this.resetBusinessUnits(); // Remove validation for Offline mode
      }
    });
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.jobCodeId = Number(params.get('id')) || null;
      this.idBasedSubmit = Number(params.get('id')) || null;
      console.log('Job Code ID:', this.idBasedSubmit);
    });

    const loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData') || ''));
    this.userData = loggedUser ? JSON.parse(loggedUser) : {};
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate') || ''));

    setTimeout(() => {
      document.querySelector('.slide-in')?.classList.add('visible');
    }, 100);

    this.jobCodeData();
  }

  createBusinessUnitControls() {
    const controls = {};
    this.businessUnits.forEach(unit => {
      controls[unit.name] = [false];
    });
    return controls;
  }



  addBusinessUnitValidation() {
    const businessUnitControl = this.publishForm.get('businessUnit');
    if (businessUnitControl) {
      businessUnitControl.setValidators([this.atLeastOneBusinessUnitSelected]);
      businessUnitControl.updateValueAndValidity();
    }
  }

  resetBusinessUnits() {
    const businessUnitControl = this.publishForm.get('businessUnit');
    if (businessUnitControl) {
      businessUnitControl.clearValidators();
      businessUnitControl.updateValueAndValidity();
    }
  }

  atLeastOneBusinessUnitSelected(control: AbstractControl): ValidationErrors | null {
    return Object.values(control.value).some(value => value === true)
      ? null
      : { required: true };
  }

  submit() {
    this.submitted = true;

    if (this.publishForm.invalid) {
      return;
    }

    const formValue = this.publishForm.value;
    console.log("Job Code ID Before Payload:", this.jobCodeId);
    console.log("ID Based Submit Before Payload:", this.idBasedSubmit);
    this.idBasedSubmit = this.idBasedSubmit || this.jobCodeId;
    if (!this.idBasedSubmit || this.idBasedSubmit === 0) {
      console.error("Job Code ID is invalid:", this.idBasedSubmit);
      return;
    }

    const payload: any = {
      jobcodeId: this.idBasedSubmit,
      mode: formValue.publishMode === 'Online' ? 1 : 2,
      publishedBy: this.userData.user.empID || '',
      buId: []
    };

    if (formValue.publishMode === 'Online') {
      this.selectedBusinessUnits = Object.entries(formValue.businessUnit)
        .filter(([key, value]) => value === true)
        .map(([key]) => this.businessUnits.find((unit) => unit.name === key)?.id);

      if (this.selectedBusinessUnits.length === 0) {
        return;
      }
      payload.buId = this.selectedBusinessUnits;
    }

    console.log("Final Payload Before API Call:", payload);
    this.authservice.publishMode(payload).subscribe({
      next: (res: any) => {
        this.dialog.closeAll();
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'Publish successfully completed.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
        this.jobCodeData();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.dialog.closeAll();
        console.error("Error in publishing:", err);

        if (err.status === 500 && err.error?.message) {
          alert("Server error: " + err.error.message);
        } else {
          alert("Something went wrong. Please try again.");
        }
      }
    });
  }

  hasSelectedBusinessUnit(): boolean {
    const businessUnitValue = this.publishForm.get('businessUnit')?.value;
    return Object.values(businessUnitValue).includes(true);
  }

  cancel() {
    this.publishForm.reset();
    this.dialog.closeAll();
  }

  mastrerBU() {
    this.authservice.masterBu().subscribe({
      next: (res: any) => {
        this.businessUnits = res;
        const businessUnitGroup = this.fb.group({});
        res.forEach((unit: any) => {
          businessUnitGroup.addControl(unit.name, new FormControl(false));
        });
        this.publishForm.setControl('businessUnit', businessUnitGroup);
      },
      error: (err) => {
        console.error('Error fetching business unit data:', err);
      },
    });
  }

  publish(): void {
    this.submitted = false;
    this.publishForm.reset();

    // Calling API or method to get the masterBU data
    this.mastrerBU();

    // Patching the values after opening the dialog
    this.dialogRef = this.dialog.open(this.publishDialog, {
      width: '400px',
      height: 'auto',
      hasBackdrop: true,
    });

    // Now patch the values from res.buMap
    if (this.jobCodeResData.buMap && this.jobCodeResData.buMap.length > 0) {
      console.log("Patching values...");
      const mode = [1, 2].includes(this.jobCodeResData?.modeId) ? 'Online' : 'Offline';
      this.publishForm.patchValue({
        publishMode: this.jobCodeResData?.modeName,
        businessUnit: this.jobCodeResData.buMap.length === 1 ? this.jobCodeResData.buMap[0] : this.jobCodeResData.buMap
      });
    }
  }


  jobCodeData() {
    this.isLoading = true;
    // const params = {
    //   jobCode: this.jobCodeId,
    // };
    this.authservice.getDataByJobCode(this.jobCodeId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.jobCodeResData = res.body;
        console.log("dett : ", this.jobCodeResData)

        if (this.jobCodeResData?.jobDescriptionFile) {
          this.setSafeUrl(this.jobCodeResData.jobDescriptionFile);
        }
        if (res.buMap && res.buMap.length > 0) {
          const mode = [1, 2].includes(this.jobCodeResData?.modeId) ? 'Online' : 'Offline';
          this.publishForm.patchValue({
            publishMode: this.jobCodeResData?.modeName,
            businessUnit: res.buMap.length === 1 ? res.buMap[0] : res.buMap
          });
        }

      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching job data:', err);
      },
    });
  }

  getFileType(base64String: string): 'pdf' | 'doc' | 'png' | 'jpg' {
    if (base64String.startsWith('JVBERi0x')) {
      return 'pdf';
    } else if (base64String.startsWith('iVBORw0KGgo')) {
      return 'png';
    } else if (base64String.startsWith('/9j/')) {
      return 'jpg';
    } else {
      return 'doc';
    }
  }



  setSafeUrl(base64String: string): void {
    const fileType = this.getFileType(base64String);
    const byteCharacters = atob(base64String);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);

    let blob: Blob;

    if (fileType === 'pdf') {
      blob = new Blob([byteArray], { type: 'application/pdf' });
    } else if (fileType === 'png') {
      blob = new Blob([byteArray], { type: 'image/png' });
    } else if (fileType === 'jpg') {
      blob = new Blob([byteArray], { type: 'image/jpeg' });
    } else if (fileType === 'doc') {
      blob = new Blob([byteArray], { type: 'application/msword' });
    } else {
      console.error('Unsupported file type');
      return;
    }

    const url = URL.createObjectURL(blob);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }



  close(): void {
    this.dialog.closeAll();
  }

  back() {
    this.router.navigate(['/jobcode']);
  }
}
