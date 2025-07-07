import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interview-schedule',
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.sass']
})
export class InterviewScheduleComponent implements OnInit {

  columns: { key: string; label: string; center?: boolean; uppercase?: boolean; clickable?: boolean; minKey?: string; maxKey?: string }[] = [];
  rows: any[] = [];
  userData: any;
  searchQuery: FormControl = new FormControl();
  filteredRows: any[] = [];
  filterOffcanvas: any;
  isOpen = false;
  private dialogRef: any;
  candidateData: any = null;
  isLoading: boolean = false;
  minDate: Date = new Date();
  colorTheme = 'theme-dark-blue';
  timeSlots: string[] = [];
  interviewRounds: any;
  interviewLocationData: any
  employeeId: string | null = null;
  // userId: string | null = null;
  interviewedByList: any[] = [];
  originalRows: any[] = [];
  showDropdown: boolean = false;
  selectedInterviewerName: any;
  currentPage = 1;
  pageSize = 10;
  @ViewChild('interviewDialog', { static: true }) interviewDialog!: TemplateRef<any>;
  @ViewChild('aboutCandidateDialog', { static: true }) aboutCandidateDialog!: TemplateRef<any>;
  addNewRoundForm: FormGroup;
  searchQueryText: any;
  totalRecords: number = 0;
  totalPages: number = 1;
  selectedInterviewerId: string | null = null;
  roundNo: number | null = null;
  interviewScheduleTo: string | null = null;
  isMeetingLinkDisabled = false;
  InterviewerError: string = ''
  // isSidebarOpen = true;
  // closeButton: boolean = true;



  constructor(
    private render: Renderer2,
    private dialog: MatDialog,
    private authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.addNewRoundForm = this.fb.group({
      locationId: ['', Validators.required],
      mode: ['', Validators.required],
      interviewDate: ['', Validators.required],
      interviewTime: ['', Validators.required],
      interviewBy: ['', [Validators.required]], // ✅ SYNC validator
      link: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(https?:\/\/)?(www\.)?(zoom\.us|meet\.google\.com|teams\.microsoft\.com)\/.+$/)
        ]
      ]
    });
  }



  ngOnInit() {

    // const lastReloadDate = localStorage.getItem('lastReloadDate');
    // const today = new Date().toISOString().split('T')[0]; 

    // if (lastReloadDate !== today) {
    //   localStorage.setItem('lastReloadDate', today);
    //   window.location.reload();
    // }

    this.generateTimeSlots();
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    // console.log("rajender : ", this.userData.user.empID)
    this.scheduleCandidates();
    this.generateColumns();
    // this.totalInterviewRounds();
    this.modeOfInterview();
    this.interviewLocation();
    // this.generateRows();


    this.searchQuery.valueChanges.subscribe((value: string) => {
      this.currentPage = 1;
      this.searchQueryText = value.trim().toLowerCase();
      this.scheduleCandidates();
    });
  }

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }

  modeOfInterview() {
    this.authService.modeOfInterview().subscribe({
      next: (res: any) => {
        this.interviewRounds = res;
      },
      error: (err: HttpErrorResponse) => {
      }
    })
  }

  interviewLocation() {
    this.authService.interviewLocation().subscribe({
      next: (res: any) => {
        this.interviewLocationData = res;
      },
      error: (err: HttpErrorResponse) => {
      }
    })
  }

  scheduleCandidates() {
    this.isLoading = true;
    const pageNo = this.currentPage || 1;
    const pageSize = this.pageSize || 10;
    const searchQuery = this.searchQueryText?.trim() || '';

    this.authService.scheduleCandidates(pageNo, pageSize, searchQuery).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // this.rows = res.list?.map((item: any) => ({
        //   job_code: item.jcReferanceId || '--',
        //   email: item.email || '--',
        //   firstname: item.name || '--',
        //   mobilenumber: item.mobileNumber || '--',
        //   job_title: item.jobTitleName || '--',
        //   employeeid: item.candidateId || '--',
        //   status: item.status || '--',
        // })) || [];

        this.rows = res.list?.map((item: any) => {
  let statusText = item.status || '--';

  const round = item.interviewRoundInfo?.interviewRound;

  if (round !== undefined && round !== null) {
    let roundText = '';
    if (round === 0 || round === 1) {
      roundText = 'interviewer';
    } else if (round === 2) {
      roundText = 'manager';
    } else if (round === 3) {
      roundText = 'HR';
    }

    if (roundText) {
      statusText += ` (${roundText})`;
    }
  }

  return {
    job_code: item.jcReferanceId || '--',
    email: item.email || '--',
    firstname: item.name || '--',
    mobilenumber: item.mobileNumber || '--',
    job_title: item.jobTitleName || '--',
    employeeid: item.candidateId || '--',
    status: statusText,
  };
}) || [];

        this.totalRecords = Number(res.totalCount) || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: () => (this.isLoading = false)
    });
  }

  generateColumns() {
    this.columns = [
      { key: 'job_code', label: 'Job Code', uppercase: true },
      { key: 'email', label: 'Mail Id', uppercase: true },
      { key: 'firstname', label: 'Full Name', uppercase: true },
      { key: 'mobilenumber', label: 'Mobile Number', uppercase: true },
      { key: 'job_title', label: 'Designation', uppercase: true },
      { key: 'status', label: 'Status', uppercase: true },
      { key: 'employeeid', label: 'Action', center: true, clickable: true },
    ];
  }

  filterRows(query: string) {
    const lowerCaseQuery = query.toLowerCase().trim();
    this.searchQueryText = lowerCaseQuery; // Store for highlighting

    this.rows = this.originalRows.filter(row =>
      Object.keys(row).some(key =>
        String(row[key]).toLowerCase().includes(lowerCaseQuery)
      )
    );
  }

  // onModeChange(event: Event): void {
  //   const selectedValue = (event.target as HTMLSelectElement).value;

  //   if (selectedValue === '1') {
  //     this.isMeetingLinkDisabled = true;
  //     this.addNewRoundForm.removeControl('link');
  //   } else {
  //     this.isMeetingLinkDisabled = false;
  //     if (!this.addNewRoundForm.get('link')) {
  //       this.addNewRoundForm.addControl(
  //         'link',
  //         new FormControl('', [Validators.required, Validators.pattern(/https?:\/\/.+/)])
  //       );
  //     }
  //   }
  // }

  onModeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (!this.addNewRoundForm.contains('mode')) {
      this.addNewRoundForm.addControl('mode', new FormControl(selectedValue, Validators.required));
    } else {
      this.addNewRoundForm.get('mode')?.setValue(selectedValue);
    }
    if (selectedValue === '1') {
      this.isMeetingLinkDisabled = true;
      if (this.addNewRoundForm.contains('link')) {
        this.addNewRoundForm.removeControl('link');
      }

      // Add 'locationId' if not present
      if (!this.addNewRoundForm.contains('locationId')) {
        this.addNewRoundForm.addControl(
          'locationId',
          new FormControl('', Validators.required)
        );
      }

    } else if (selectedValue === '2') {
      this.isMeetingLinkDisabled = false;

      // Remove 'locationId' if exists
      if (this.addNewRoundForm.contains('locationId')) {
        this.addNewRoundForm.removeControl('locationId');
      }

      // Add 'link' if not present
      if (!this.addNewRoundForm.contains('link')) {
        this.addNewRoundForm.addControl(
          'link',
          new FormControl('', [
            Validators.required,
            Validators.pattern(/https?:\/\/.+/)
          ])
        );
      }
    }
  }



  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escapedQuery = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span style="font-weight: bold; color: #0072BC;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
  isDialogOpen = false;

  handleAction(employeeId: any) {
    if (this.isDialogOpen) return; // prevent double open
    this.isDialogOpen = true;

    this.interviewedByList = [];
    this.employeeId = employeeId;
    this.selectedInterviewerName = ''; // Ensure field is empty when opening dialog
    this.addNewRoundForm.reset();

    this.dialogRef = this.dialog.open(this.interviewDialog, {
      width: '500px',
      height: 'auto',
      hasBackdrop: true,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen = false;
    });
  }



  close() {
    this.dialog.closeAll();
  }

  onSubmit() {
    // console.log(this.addNewRoundForm.value);

    if (this.addNewRoundForm.invalid) {
      this.InterviewerError = 'please enter valid interviewer';
      Object.keys(this.addNewRoundForm.controls).forEach((field) => {
        const control = this.addNewRoundForm.get(field);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const formData = { ...this.addNewRoundForm.value };

    // Format interviewDate without using moment
    if (formData.interviewDate) {
      const date = new Date(formData.interviewDate);
      formData.interviewDate = this.formatDateToYMD(date);
    }

    const payload = {
      ...formData,
      candidateId: this.employeeId,
      interviewScheduledBy: this.userData.user.empID,
      roundNo: this.roundNo || 1
    };

    this.isLoading = true;
    this.authService.addInterviewRound(payload).subscribe({
      next: (res: HttpResponse<any>) => {
        this.isLoading = false;
        if (res.status === 200) {
          this.close();
          this.interviewScheduleTo = '';
          this.scheduleCandidates();
          this.roundNo = 0;
          Swal.fire({
            title: 'Scheduled!',
            text: 'The interview has been scheduled successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
      }
    });
  }


  formatDateToYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



  // searchInterviewer(query: string): void {
  //   this.InterviewerError = ''
  //   this.selectedInterviewerName = query;
  //   this.addNewRoundForm.patchValue({ interviewBy: '' }); // clear ID unless selected
  //   if (query.trim().length < 1) {
  //     this.interviewedByList = [];
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("name", query);
  //   this.authService.interviewedBy(formData).subscribe({
  //     next: (res: any[]) => {
  //       this.interviewedByList = Array.isArray(res) ? res : [];
  //       this.showDropdown = this.interviewedByList.length > 0;
  //     },
  //     error: () => {
  //       this.interviewedByList = [];
  //     }
  //   });
  // }



  // generateTimeSlots() {
  //   this.timeSlots = []; // Clear existing slots if needed
  //   const interval = 15; // 15-minute intervals

  //   for (let hour = 0; hour < 24; hour++) {
  //     for (let minutes = 0; minutes < 60; minutes += interval) {
  //       const h = hour.toString().padStart(2, '0');
  //       const m = minutes.toString().padStart(2, '0');
  //       this.timeSlots.push(`${h}:${m}`);
  //     }
  //   }
  // }
  searchInterviewer(query: string): void {
    this.InterviewerError = '';
    this.selectedInterviewerName = query;
    this.addNewRoundForm.patchValue({ interviewBy: '' }); // clear ID unless selected

    // Only trigger API if 2 or more characters are typed
    if (query.trim().length < 3) {
      this.interviewedByList = [];
      this.showDropdown = false;
      return;
    }

    const formData = new FormData();
    formData.append("name", query);

    this.authService.interviewedBy(formData).subscribe({
      next: (res: any[]) => {
        this.interviewedByList = Array.isArray(res) ? res : [];
        this.showDropdown = this.interviewedByList.length > 0;
      },
      error: () => {
        this.interviewedByList = [];
        this.showDropdown = false;
      }
    });
  }


  generateTimeSlots() {
    this.timeSlots = [];
    const interval = 15; // 15-minute intervals
    const startHour = 8; // 8:00 AM
    const endHour = 22;  // 10:00 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        if (hour === endHour && minutes > 0) break; // don't add times after 10:00 PM

        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minutes);

        let hours12 = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const minStr = minutes.toString().padStart(2, '0');

        this.timeSlots.push(`${hours12}:${minStr} ${ampm}`);
      }
    }
  }




  selectInterviewer(interviewer: any) {
    this.selectedInterviewerId = interviewer.id;
    this.selectedInterviewerName = interviewer.name;
    this.addNewRoundForm.patchValue({ interviewBy: interviewer.id });

    this.showDropdown = false;
  }


  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200); // Delay to allow item selection before hiding
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.scheduleCandidates();
    }
  }

  get startIndex(): number {
    return this.totalRecords > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }


  viewAction(id: string) {
    if (this.isDialogOpen) return;
    this.isDialogOpen = true;
    this.isLoading = true;
    this.employeeId = id;
    this.close();

    this.authService.registeredData(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // alert("res : "+res)

        const recordLength = res?.candidateInterviewDetails?.length || 0;
        const lastRecordStatus = recordLength
          ? res.candidateInterviewDetails[recordLength - 1].status
          : null;

        this.roundNo = (lastRecordStatus === 1001 || lastRecordStatus === 1002 || lastRecordStatus === 1006)
          ? recordLength
          : recordLength + 1;

        const lastRecordInterviewerName = recordLength
          ? res.candidateInterviewDetails[recordLength - 1].interviewBy
          : null;


        this.interviewScheduleTo = lastRecordInterviewerName;

        this.candidateData = res || {};
        this.candidateData.candidateEducationDetails = this.candidateData.candidateEducationDetails || [];

        this.openDialog();
      },
      error: (err) => {
        this.isLoading = false;
        this.isDialogOpen = false;
      }
    });
  }


  openDialog() {
    this.dialogRef = this.dialog.open(this.aboutCandidateDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.isDialogOpen = false;
    });
  }

  cancelInterview(id: string | null | undefined) {
    if (!id) {
      // console.warn("Invalid ID: Cannot cancel interview.");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this interview?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cancelInterview(id).subscribe({
          next: (res: HttpResponse<any>) => {
            if (res.status === 200) {
              this.close();
              this.scheduleCandidates();
              Swal.fire({
                title: 'Cancelled!',
                text: 'Interview has been cancelled successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
              });
            }
          },
          error: (err: HttpErrorResponse) => {
            // console.error("Error cancelling interview:", err);
            Swal.fire({
              title: 'Error',
              text: 'Failed to cancel the interview. Please try again.',
              icon: 'error'
            });
          }
        });
      }
    });
  }


  rescheduleInterview(id: string) {
    this.interviewedByList = [];
    this.employeeId = id;
    this.addNewRoundForm.reset();
    this.InterviewerError = '';

    if (this.employeeId && this.interviewScheduleTo) {
      // Call your existing search function to get interviewer by ID
      const formData = new FormData();
      formData.append("name", this.interviewScheduleTo); // assuming API returns single match

      this.authService.interviewedBy(formData).subscribe({
        next: (res: any[]) => {
          const matched = res.find(item => item.id === this.interviewScheduleTo);
          // console.log(matched)
          if (matched) {
            this.selectedInterviewerName = matched.name;
            this.addNewRoundForm.patchValue({
              interviewBy: matched.id
            });
          }

          this.dialogRef = this.dialog.open(this.interviewDialog, {
            width: '500px',
            height: 'auto',
            hasBackdrop: true,
          });
        },
        error: () => {
          // fallback if not found
          this.selectedInterviewerName = '';
          this.addNewRoundForm.patchValue({
            interviewBy: this.interviewScheduleTo
          });

          this.dialogRef = this.dialog.open(this.interviewDialog, {
            width: '400px',
            height: 'auto',
            hasBackdrop: true,
          });
        }
      });
    }
  }


  feedbackView(interview: any, name: any, mail: any) {
    const feedBackformat = interview.candidateInterviewFeedBackDTO || [];
    const comments = interview.comments;
    const statusCode = interview.status;

    const statusMap: any = {
      '1001': 'Interview pending',
      '1002': 'Interview Cancelled',
      '1004': 'Selected',
      '1005': 'Rejected',
      '1006': 'Interview Hold',
      // Add more statuses as needed
    };

    const statusLabel = statusMap[statusCode] || 'Unknown';

    const scoreMap: any = {
      'Excellent': 10,
      'Good': 8,
      'Average': 6,
      'Below Average': 4
    };

    let totalScore = 0;

    const feedbackRows = feedBackformat.map((item: any, index: number) => {
      const getMark = (level: string) =>
        item.feedBackName === level
          ? '<span style="color:green;">✔️</span>'
          : '<span style="color:red;">❌</span>';

      totalScore += scoreMap[item.feedBackName] || 0;

      return `
          <tr style="line-height: 1.2;">
            <td>${index + 1}</td>
            <td class="text-start">${item.factorName}</td>
            <td>${getMark('Excellent')}</td>
            <td>${getMark('Good')}</td>
            <td>${getMark('Average')}</td>
            <td>${getMark('Below Average')}</td>
          </tr>
        `;
    }).join('');

    const averageScore = (feedBackformat.length > 0)
      ? (totalScore / feedBackformat.length).toFixed(1)
      : 'N/A';


    const detailsHtml = `
        <div style="font-size:12px; width:100%; padding: 10px; ">
          
          <!-- Header with status label -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <span style="font-size: 16px; margin-left: 10px; font-weight: bold; color: #0072BC">
                Average Score ${averageScore}
              </span>
              <span style="font-size: 14px; margin-left: 10px; padding: 2px 6px; background-color: #d9edf7; color: #31708f; border-radius: 4px;">
                ${statusLabel}
              </span>
              
            </div>
          </div>
    
          <!-- Info Table -->
          <table class="table table-bordered table-sm w-100 mb-2" style="margin: 0;">
            <tbody>
              <tr>
                <th>Candidate Name</th>
                <td>${name ? name.charAt(0).toUpperCase() + name.slice(1) : '--'}</td>
                <th>Mail Id</th>
                <td>${mail || '--'}</td>
              </tr>
              <tr>
                <th>Interviewer Name</th>
                <td>${interview.interviewByName || 'N/A'} - ${interview.interviewBy || ''}</td>
                <th>Interview Date</th>
                <td>${interview.interviewDate || 'N/A'}</td>
              </tr>
              <tr>
                <th>Interview Time</th>
                <td>${interview.interviewTime || 'N/A'}</td>
                <th>Round Name</th>
                <td>${interview.interviewRoundName || 'Initial'}</td>
              </tr>
              <tr>
                <th>Level</th>
                <td>${interview.level || 'N/A'}</td>
                <th>Mode</th>
                <td>${interview.modeName || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
    
          <!-- Watermarked Average Score + Feedback Table -->
         <!-- <div style="position: relative; margin-top: 10px;">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 50px;
              color: #baca5a;
              z-index: 0;
              white-space: nowrap;
              pointer-events: none;
            ">
              Average ${averageScore}
            </div>  -->
    
            <table class="table table-bordered table-sm w-100 text-center mb-1" style="z-index: 1; position: relative; margin: 0;">
              <thead class="table-dark">
                <tr style="line-height: 1.2;">
                  <th style="font-size: 12px;">S.No</th>
                  <th style="font-size: 12px;">Factors</th>
                  <th style="font-size: 12px;">Excellent</th>
                  <th style="font-size: 12px;">Good</th>
                  <th style="font-size: 12px;">Average</th>
                  <th style="font-size: 12px;">Below Average</th>
                </tr>
              </thead>
              <tbody>
                ${feedbackRows}
              </tbody>
            </table>
          </div>
    
          <!-- Comments and Status Row -->
           <div style="margin-top: 5px; text-align: left;">
              <strong>Comments:</strong>
               <p style="margin: 0;">${comments || 'No comments available.'}</p>
            </div>
           </div>
        </div>
      `;

    Swal.fire({
      html: detailsHtml,
      width: '800px',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'p-2'
      },
      buttonsStyling: false
    });
  }

  validateInterviewerSelection(control: AbstractControl): ValidationErrors | null {
    const selectedId = control.value;
    const isValid = this.interviewedByList.some(item => item.id === selectedId);
    return isValid ? null : { invalidSelection: true };
  }

  convertToDateObject(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(+year, +month - 1, +day); // month is 0-indexed
  }

  onTimeChange(event: Event): void {
    const selectedTime = (event.target as HTMLSelectElement).value;
    this.addNewRoundForm.get('interviewTime')?.setValue(selectedTime);
    console.log('Selected Interview Time:', selectedTime);
  }

  onLocationChange(event: Event): void {
  const selectedId = (event.target as HTMLSelectElement).value;

  // Find corresponding location object by ID
  const selectedItem = this.interviewLocationData.find(item => item.id == selectedId);

  if (selectedItem) {
    // Set the ID (for backend) -- this happens via formControlName, but we ensure it manually too
    this.addNewRoundForm.get('locationId')?.setValue(selectedId);

    // Set the name (for UI display)
    this.addNewRoundForm.get('locationName')?.setValue(selectedItem.name);

    console.log('Selected Location ID:', selectedId);
    console.log('Selected Location Name:', selectedItem.name);
  } else {
    // If 'Select' option is picked
    this.addNewRoundForm.get('locationName')?.setValue('');
  }
}






}
