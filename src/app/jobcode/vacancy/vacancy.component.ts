import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vacancy',
  templateUrl: './vacancy.component.html',
  styleUrls: ['./vacancy.component.sass'],
})
export class VacancyComponent implements OnInit {
  myDate: string = '';
  userData: any;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filteredJobs: any[] = [];
  rows: any[] = [];
  viewMoreValue: boolean = false;
  vacancyValue: boolean = true;
  submitted = false;
  isLoading: boolean = true;
  jobCodeData: any;
  candidateId: string | null = null;
  searchQuery: FormControl = new FormControl();
  @ViewChild('addCandidateDialog', { static: true }) addCandidateDialog!: TemplateRef<any>;
  private dialogRef: any;
  addCandidateForm: FormGroup;
  uploadedFile: File | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  searchQueryText: string = '';
  dataNotFound: string = 'assets/img/icons/not-found.gif'
  referenceJobCode: string | null = null;
  fileURL: SafeResourceUrl | null = null;
  showPDF: boolean = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.addCandidateForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      workExperience: ['', [Validators.required]],
      jobCodeId: ['', Validators.required],
      resume: [{ value: null, disabled: false }],
    });
  }

  ngOnInit(): void {
    this.vacancyValue = true;
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate') || ''));
    this.totalJobCodes();
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.searchQuery.valueChanges.subscribe((value: string) => {
      if (!value) {
        this.filteredJobs = [...this.rows];
        return;
      }
      const lowerCaseValue = value.toLowerCase();
      this.filteredJobs = this.rows.filter(row =>
        row.job_code?.toString().toLowerCase().includes(lowerCaseValue) ||
        row.job_reportingManager?.toString().toLowerCase().includes(lowerCaseValue)
      );
    });
  }

  totalJobCodes() {
    this.isLoading = true;

    // Ensure values are valid
    const pageNo = this.currentPage || 1;
    const pageSize = this.pageSize || 10;
    const searchQuery = this.searchQueryText?.trim() || '';

    this.authService.getTotalJobCodes(pageNo, pageSize, searchQuery).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.rows = res.list || [];
        this.filteredJobs = [...this.rows];

        // Set totalRecords based on API response
        this.totalRecords = res.totalCount ?? this.rows.length;

        // ✅ Reset Page to 1 if No Data
        if (this.totalRecords === 0) {
          this.currentPage = 1;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error("Error fetching job codes:", err.message);
      }
    });
  }

  viewMore(id: string, jobcode: string): void {
    this.candidateId = id;
    this.referenceJobCode = jobcode;
    this.isLoading = true;
    this.authService.getJobCodeListData(id).subscribe({
      next: (res: any[]) => {
        this.jobCodeData = res;
        this.isLoading = false;
        this.viewMoreValue = true;
        this.vacancyValue = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        console.error('Error fetching job codes:', err.message);
      },
    });
  }

  addCandidate(): void {
    this.submitted = false;
    this.addCandidateForm.reset();
    this.dialogRef = this.dialog.open(this.addCandidateDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });
    this.uploadedFile = null;
    this.addCandidateForm.patchValue({
      jobCodeId: this.candidateId
    });
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        Swal.fire({
          icon: 'error',
          title: 'File too large',
          text: 'Please select a file less than 5 MB.'
        });
        (event.target as HTMLInputElement).value = '';
        return;
      }

      this.uploadedFile = file;

      const fileBlob = new Blob([file], { type: file.type });

      this.addCandidateForm.patchValue({ resume: fileBlob });
      this.addCandidateForm.get('resume')?.updateValueAndValidity();
    } else {
      // console.log('No file selected.');
    }
  }



  preventNegativeInput(event: KeyboardEvent, currentValue: string): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
    if (currentValue.length >= 10 && event.key !== 'Backspace' && event.key !== 'Delete' && event.key !== 'Tab') {
      event.preventDefault();
    }
  }


  onSubmit(): void {
    this.submitted = true;
    this.isLoading = true;
    if (this.addCandidateForm.invalid) {
      return;
    }
    const formValues = this.addCandidateForm.value;

    const data = {
      fullName: formValues.fullName,
      mobileNumber: formValues.mobileNumber,
      email: formValues.emailAddress,
      workExp: formValues.workExperience,
      createdBy: this.userData.user.empID,
      jobCodeId: this.candidateId,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('file', this.uploadedFile ?? new File([], 'empty.txt', { type: 'text/plain' }));

    console.log(formData);
    this.authService.CreateJobCandidate(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Candidate Added Successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.dialogRef.close();
          this.viewMore(this.candidateId, this.referenceJobCode)
          this.addCandidateForm.reset();
          this.uploadedFile = null;
        }
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.viewMore(this.candidateId, this.referenceJobCode)
        // this.addCandidateForm.reset();
        // this.uploadedFile = null;
        if (error.status === 409) {
          Swal.fire({
            title: 'Warning',
            text: error.error.message,
            icon: 'warning',
            confirmButtonText: 'OK',
          });

        } else if (error.status === 500) {
          Swal.fire({
            title: 'Error',
            text: 'Internal server error',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }

  // tracking(id: any) {
  //   this.candidateId = id;
  //   this.router.navigate(['/tracking',id]);
  // }

  tracking(data: any) {
    console.log("rajjj : ", data)
  }


  back(): void {
    this.viewMoreValue = false;
    this.vacancyValue = true;
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredJobs.sort((a, b) => {
      const valueA = a[column] ?? '';
      const valueB = b[column] ?? '';

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        return 0;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escapedQuery = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span class="text-primary" style="font-weight: bold;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }


  get paginatedRows() {
    return this.filteredJobs;
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.currentPage = newPage;
    this.totalJobCodes();
  }

  get totalPages() {
    if (this.totalRecords <= this.pageSize) {
      return 1;
    }
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get startIndex() {
    return this.totalRecords ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  viewResume(file: any) {
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
  }

  closePDF() {
    this.showPDF = false; // Hide the modal
    this.fileURL = null; // Clear the URL
  }
}
