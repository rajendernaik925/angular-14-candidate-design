import { AuthService } from 'src/app/auth.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-jobcode',
  templateUrl: './jobcode.component.html',
  styleUrls: ['./jobcode.component.sass', './jobcode.component.css']
})
export class JobcodeComponent implements OnInit {
  userData: any;
  sublocation: any;
  myDate: any;
  filteredJobs: any;
  rows: any;
  jobs: any[] = [];
  isLoading: boolean = false;
  sortColumn: string = '';
  jobCodeId: number | null = null;
  bindDataValue: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  managers: any;
  teams: any;
  jobTitleList: any[] = [];
  selectedManager: any;;
  searchTerm: string = null;
  submitted = false;
  yearMessage: string = null
  ctcMessage: string = null
  managerMessage: string = null;
  uploadedFile: File | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  searchQueryText: string = '';
  searchText: string = '';
  filteredManagers: any[] = [];
  showDropdown: boolean = false;
  jobTitleSearchText: string = '';
  filteredJobTitles: any[] = [];
  businessUnits: any[] = [];
  jobTitleDropdownVisible: boolean = false;
  selectedBusinessUnitName: string = '';
  dataNotFound: string = 'assets/img/icons/not-found.gif'
  @ViewChild('jobDialog', { static: true }) jobDialog!: TemplateRef<any>;
  @ViewChild('publishDialog', { static: true }) publishDialog!: TemplateRef<any>;

  private dialogRef: any;

  createJobForm!: FormGroup;
  searchQuery: FormControl = new FormControl();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.currentPage = 1;
    this.initializeForm();
    this.totalJobCodes();
    this.listOfManagers();
    this.listOfTeams();
    this.jobTitle();
    this.masterBu();
    this.userData = JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('userData') || '')));
    console.log("user data : ", this.userData.user.empID);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate') || ''));

    this.searchQuery.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        catchError((error) => {
          console.error('Error while searching:', error);
          return of('');
        })
      )
      .subscribe((value: string) => {
        // Always call API if value is cleared OR length is >= 2
        if (value.length === 0 || value.length >= 2) {
          this.searchQueryText = value;
          this.currentPage = 1;
          this.totalJobCodes();
        }
      });

    this.createJobForm.get('jobExperienceMinYear')?.valueChanges.subscribe((value) => {
      this.yearMessage = '';
    });

    this.createJobForm.get('jobExperienceMaxYear')?.valueChanges.subscribe((value) => {
      this.yearMessage = '';
    });

    this.createJobForm.get('jobCtcMin')?.valueChanges.subscribe((value) => {
      this.ctcMessage = '';
    });

    this.createJobForm.get('jobCtcMax')?.valueChanges.subscribe((value) => {
      this.ctcMessage = '';
    });
    this.createJobForm.get('jobReportingManager')?.valueChanges.subscribe((value) => {
      this.managerMessage = '';
    });
  }

  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escapedQuery = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span class="text-primary" style="font-weight: bold;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  initializeForm() {
    this.createJobForm = this.fb.group({
      jobTitle: ['', [Validators.required]],
      jobReportingManagerId: ['', [Validators.required]],
      teamId: ['', Validators.required],
      businessunitId: [null, Validators.required],
      jobExperienceMinYear: [null, Validators.required],
      jobExperienceMaxYear: [null, Validators.required],
      // jobCtcMin: [null, Validators.required],
      // jobCtcMax: [null, Validators.required],
      jobCtcMin: [null, [Validators.required, Validators.min(100000), Validators.max(10000000)]],
      jobCtcMax: [null, [Validators.required, Validators.min(100000), Validators.max(10000000)]],
      jobPreferableCompanies: [''],
      jobDescription: [null],
      jobDescriptionFile: [{ value: null, disabled: false }, Validators.required]
    });
    { validators: [this.ctcRangeValidator, this.experienceRangeValidator] }
  }

  listOfManagers(): void {
    this.isLoading = true;
    this.authService.ReportingManagers().subscribe({
      next: (res) => {
        // this.isLoading = false;
        this.managers = res;
      },
      error: (err: HttpErrorResponse) => {
        // this.isLoading = false;
        console.log("Error fetching managers:", err);
      }
    });
  }

  listOfTeams(): void {
    this.isLoading = true;
    this.authService.listofTeams().subscribe({
      next: (res) => {
        // this.isLoading = false;
        this.teams = res;
      },
      error: (err: HttpErrorResponse) => {
        // this.isLoading = false;
        console.log("Error fetching managers:", err);
      }
    });
  }

  masterBu() {
    this.authService.masterBu().subscribe({
      next: (res: any[]) => {
        this.businessUnits = [...res];
      },
      error: (err) => {
        console.error('Error fetching business unit data:', err);
      },
    });
  }


  jobTitle(): void {
    this.isLoading = true;
    this.authService.jobTitle().subscribe({
      next: (res) => {
        // this.isLoading = false;
        this.jobTitleList = res;
      },
      error: (err: HttpErrorResponse) => {
        // this.isLoading = false;
        console.log("Error fetching managers:", err);
      }
    });
  }

  totalJobCodes() {
    this.isLoading = true;
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


  onSelected(event: Event) {
    this.selectedManager = this.createJobForm.get('jobReportingManager')?.value;
  }

  createJob() {
    this.createJobForm.reset();
    this.submitted = false;
    this.ctcMessage = '';
    this.yearMessage = '';
    this.managerMessage = '';
    this.searchText = '';
    this.jobTitleSearchText = '';
    this.departmentSearchText = '';
    this.filteredDepartments = [];
    this.filteredJobTitles = [];
    this.filteredManagers = [];

    this.dialogRef = this.dialog.open(this.jobDialog, {
      width: '600px',
      height: 'auto',
      hasBackdrop: true
    });

    this.createJobForm.patchValue({
      jobReportingManager: 0
    });
  }

  // onFileSelect(event: Event): void {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     this.uploadedFile = file;
  //     const fileBlob = new Blob([file], { type: file.type });
  //     this.createJobForm.patchValue({ resume: fileBlob });
  //     this.createJobForm.get('jobDescriptionFile')?.updateValueAndValidity();
  //   } else {
  //     console.log('No file selected.');
  //   }
  // }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        Swal.fire({
          icon: 'error',
          title: 'File too large!',
          text: 'Please select a file smaller than 5 MB.',
        });
        (event.target as HTMLInputElement).value = '';
        return;
      }
      this.uploadedFile = file;
      const fileBlob = new Blob([file], { type: file.type });
      this.createJobForm.patchValue({ resume: fileBlob });
      this.createJobForm.get('jobDescriptionFile')?.updateValueAndValidity();
    } else {
      console.log('No file selected.');
    }
  }

  ctcRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const min = group.get('jobCtcMin')?.value;
    const max = group.get('jobCtcMax')?.value;
    if (min != null && max != null && min >= max) {
      return { invalidCtcRange: true };
    }
    return null;
  }

  experienceRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const minExp = group.get('jobExperienceMinYear')?.value;
    const maxExp = group.get('jobExperienceMaxYear')?.value;
    if (minExp != null && maxExp != null && (minExp >= maxExp || maxExp > 100)) {
      return { invalidExperienceRange: true };
    }
    return null;
  }

  onSubmit() {
    console.log("Form submitted.");

    this.submitted = true;
    this.isLoading = true;

    this.ctcMessage = '';
    this.yearMessage = '';
    this.managerMessage = '';

    const expMin = +this.createJobForm.get('jobExperienceMinYear')?.value || 0;
    const expMax = +this.createJobForm.get('jobExperienceMaxYear')?.value || 0;
    const ctcMin = +this.createJobForm.get('jobCtcMin')?.value || 0;
    const ctcMax = +this.createJobForm.get('jobCtcMax')?.value || 0;
    const managerSelected = this.createJobForm.get('jobReportingManagerId')?.value;

    let isValid = true;
    if (expMax <= expMin) {
      this.yearMessage = 'Max must be greater than Min';
      isValid = false;
    }

    if (ctcMax <= ctcMin) {
      this.ctcMessage = 'CTC Max must be greater than CTC Min';
      isValid = false;
    }

    if (!managerSelected) {
      this.managerMessage = 'Please select a reporting manager';
      isValid = false;
    }

    if (!isValid) {
      this.isLoading = false;
      console.warn("Validation failed. Submission stopped.");
      return;
    }

    const jobPayload = {
      jobTitle: this.createJobForm.get('jobTitle')?.value || '',
      departmentId: this.createJobForm.get('teamId')?.value || '',
      reportingId: managerSelected,
      ctcMin: ctcMin.toString(),
      ctcMax: ctcMax.toString(),
      expMin: expMin.toString(),
      expMax: expMax.toString(),
      preferredCompany: this.createJobForm.get('jobPreferableCompanies')?.value || '',
      description: this.createJobForm.get('jobDescription')?.value || '',
      createdBy: this.userData?.user?.empID || '',
      businessunitId: this.createJobForm.get('businessunitId')?.value || ''
    };

    console.log("Prepared JSON Payload:", jobPayload);

    const formData = new FormData();
    formData.append('data', JSON.stringify(jobPayload));

    if (this.uploadedFile) {
      formData.append('file', this.uploadedFile, this.uploadedFile.name);
      console.log("Attached file:", this.uploadedFile.name);
    }

    console.log("Submitting job creation request...");

    this.authService.createJobCode(formData).subscribe({
      next: (res: HttpResponse<any>) => {
        this.isLoading = false;
        console.log("API Response status:", res?.status);

        if (res?.status === 200) {
          this.closeDialog();
          Swal.fire({
            title: 'Success',
            text: 'Job Code Creation is Successful.',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'Close',
          });

          this.totalJobCodes();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error("Error from API:", err);

        Swal.fire({
          title: 'Error',
          text: err?.error?.message || 'Something went wrong!',
          icon: 'error',
          showConfirmButton: true
        });
      }
    });
  }

  preventNegativeInput(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  preventNegativeInputs(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  validateCTCDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  validateNonNegative(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    value = value.replace(/[^0-9.]/g, '');

    if (value.startsWith('.')) {
      value = '0' + value;
    }
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }

    const match = value.match(/^(\d{0,2})(\.(\d{0,1})?)?/);
    if (match) {
      value = match[1] + (match[2] || '');
    }

    inputElement.value = value;
  }



  publish() {
    this.dialog.open(this.publishDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true
    });
  }

  jobCodeDetails(id: number) {
    this.jobCodeId = id;
    this.router.navigate(['/jobcode', id]);
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filteredJobs.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return 0;
    });
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
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

  onSearchChange(value: string) {
    this.searchText = value;
    const search = value.toLowerCase();

    this.filteredManagers = this.managers.filter(manager =>
      manager.name.toLowerCase().includes(search) ||
      manager.id.toString().includes(search)
    );

    this.showDropdown = true;
  }

  selectManager(manager: any) {
    this.searchText = manager.name;
    this.createJobForm.get('jobReportingManagerId')?.setValue(manager.id);
    this.filteredManagers = [];
    this.showDropdown = false;
  }

  hideDropdownWithDelay() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }


  onJobTitleSearch(value: string) {
    this.jobTitleSearchText = value;

    const search = value.toLowerCase();

    this.filteredJobTitles = this.jobTitleList.filter(item =>
      item.name.toLowerCase().includes(search)
    );

    this.jobTitleDropdownVisible = true;
  }

  selectJobTitle(item: any) {
    this.jobTitleSearchText = item.name;
    this.createJobForm.get('jobTitle')?.setValue(item.id);
    this.jobTitleDropdownVisible = false;
    this.filteredJobTitles = [];
  }

  hideJobTitleDropdownWithDelay() {
    setTimeout(() => {
      this.jobTitleDropdownVisible = false;
    }, 200);
  }

  onJobTitleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const matchedItem = this.jobTitleList.find(item => item.name === this.jobTitleSearchText);
      if (matchedItem) {
        this.jobTitleSearchText = '';
        this.createJobForm.get('jobTitle')?.setValue(null);
        this.filteredJobTitles = this.jobTitleList;
        this.jobTitleDropdownVisible = true;
      }
    }
  }

  onManagerKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const matchedManager = this.managers.find(item => item.name === this.searchText);
      if (matchedManager) {
        this.searchText = '';
        this.createJobForm.get('jobReportingManagerId')?.setValue(null);
        this.filteredManagers = this.managers;
        this.showDropdown = true;
      }
    }
  }

  departmentSearchText: string = '';
  filteredDepartments: any[] = [];
  showDepartmentDropdown: boolean = false;

  onDepartmentSearchChange(value: string) {
    this.departmentSearchText = value;
    const search = value.toLowerCase();

    this.filteredDepartments = this.teams.filter(team =>
      team.name.toLowerCase().includes(search) || team.id.toString().includes(search)
    );

    this.showDepartmentDropdown = true;
  }

  selectDepartment(dept: any) {
    this.departmentSearchText = dept.name;
    this.createJobForm.get('teamId')?.setValue(dept.id);
    this.filteredDepartments = [];
    this.showDepartmentDropdown = false;
  }

  hideDepartmentDropdownWithDelay() {
    setTimeout(() => {
      this.showDepartmentDropdown = false;
    }, 200);
  }

  onDepartmentKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const matched = this.teams.find(item => item.name === this.departmentSearchText);
      if (matched) {
        this.departmentSearchText = '';
        this.createJobForm.get('teamId')?.setValue(null);
        this.filteredDepartments = this.teams;
        this.showDepartmentDropdown = true;
      }
    }
  }

  onBusinessUnitChange(event: any) {
    const selectedId = event.target.value;
    const selectedItem = this.businessUnits.find(item => item.id == selectedId);
    if (!this.createJobForm.contains('businessunitId')) {
      this.createJobForm.addControl('businessunitId', this.fb.control(selectedId, Validators.required));
    } else {
      this.createJobForm.get('businessunitId')?.setValue(selectedId);
    }
    this.selectedBusinessUnitName = selectedItem ? selectedItem.name : '';
    console.log('Selected ID:', selectedId);
    console.log('Selected Name:', this.selectedBusinessUnitName);
  }
}
