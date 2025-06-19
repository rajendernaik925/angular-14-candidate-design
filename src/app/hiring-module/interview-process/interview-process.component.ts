import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { debounceTime } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interview-process',
  templateUrl: './interview-process.component.html',
  styleUrls: ['./interview-process.component.sass']
})
export class InterviewProcessComponent implements OnInit {

  columns: { key: string; label: string; center?: boolean; uppercase?: boolean; clickable?: boolean; minKey?: string; maxKey?: string }[] = [];
  rows: any[] = [];
  searchQuery: FormControl = new FormControl();
  filteredRows: any[] = [];
  filterOffcanvas: any;
  isOpen = false;
  private dialogRef: any;
  candidateData: any = null;
  isLoading: boolean = false;
  interviewRounds: any[] = [];
  interviewStatus: any[] = [];
  feedbackFactorsData: any[] = [];
  interviewedByList: any[] = [];
  originalRows: any[] = [];
  selectedInterviewerName: any;
  showDropdown: boolean = false;
  feedbackForm: FormGroup;
  employeeId: string | null = null;
  userData: any; minDate: Date = new Date();
  colorTheme = 'theme-dark-blue';
  currentPage = 1;
  pageSize = 10;
  totalRecords: number = 0;
  totalPages: number = 1;
  UserId: number | null = null;
  interviewScheduleId: number | null = null;
  roundNo: number | null = null;
  candidateId: number | null = null;
  @ViewChild('aboutCandidateDialog', { static: true }) aboutCandidateDialog!: TemplateRef<any>;
  @ViewChild('newRoundDialog', { static: true }) newRoundDialog!: TemplateRef<any>;
  @ViewChild('feedbackform', { static: true }) feedbackform!: TemplateRef<any>;
  searchQueryText: string;
  selectedHrStatus: number;
  finalHrRound: boolean = false;
  disableFeedBack: boolean = false;
  selectedInterviewerId: string | null = null;
  totalDivisionsList: any;
  totalDesignationsList: any;
  totalDepartmentsList: any;
  totalRegionsList: any;
  totalStatesList: any;
  totalCitiesList: any;
  fileURL: SafeResourceUrl | null = null;
  showPDF: boolean = false;
  interviewStatusCode: Number | null = null;
  // isSidebarOpen = true;
  // closeButton: boolean = true;

  resumeFile: string | null = null;
  photoFile: string | null = null;
  aadharFile: string | null = null;
  pancardFile: string | null = null;
  tenthFile: string | null = null;
  InterFile: string | null = null;
  BTechFile: string | null = null;
  mTechFile: string | null = null;
  otherFile: string | null = null;
  ServiceLetterFile: string | null = null;
  paySlipFile: string | null = null;

  constructor(
    private render: Renderer2,
    private dialog: MatDialog,
    private authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {


    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.UserId = this.userData.user.empID;

    this.processCandidates();
    this.generateColumns();
    this.totalInterviewRounds();
    this.interviewstatus();
    this.feedbackFactors();
    this.initializeForm();

    this.searchQuery.valueChanges.subscribe(value => {
      this.currentPage = 1;
      this.searchQueryText = value.trim();
      this.processCandidates();
    });

    this.totalDivisions();
    this.totalDesignations();
    this.totalDepartments();
    this.totalRegions();
    this.totalStates();
    // this.totalCities();
  }

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }

  initializeForm() {
    this.feedbackForm = this.fb.group({
      comments: ['', Validators.required],
      status: [0, Validators.required],
      interviewRound: [null, Validators.required],
      interviewBy: ['', Validators.required],
      feedbackList: this.fb.array([]),
      joiningDate: ['', Validators.required],
      expectedCTC: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      division: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      state: ['', Validators.required],
      hq: ['', Validators.required],
      region: ['', Validators.required]
    });
  }


  searchInterviewer(query: string) {
    if (query.trim().length < 1) {
      this.interviewedByList = [];
      return;
    }
    const formData = new FormData();
    formData.append("name", query)
    // Debounce API call
    this.authService.interviewedBy(formData).pipe(debounceTime(300)).subscribe({
      next: (res: any) => {
        this.interviewedByList = Array.isArray(res) ? res : [];
        this.showDropdown = this.interviewedByList.length > 0;
      },
      error: (err: HttpErrorResponse) => {
        this.interviewedByList = [];
      }
    });
  }

  selectInterviewer(interviewer: any) {
    this.selectedInterviewerId = interviewer.id;
    this.selectedInterviewerName = interviewer.name;
    this.feedbackForm.patchValue({ interviewBy: interviewer.id });

    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200); // Delay to allow item selection before hiding
  }

  feedbackFactors() {
    this.authService.feedbackFactors().subscribe({
      next: (res: any) => {
        // // console.log("Feedback factors : ", res);
        this.feedbackFactorsData = res;

        const feedbackArray = this.feedbackArray;
        feedbackArray.clear();

        res.forEach((factor: any) => {
          feedbackArray.push(this.fb.group({
            factorId: [factor.id, Validators.required],
            feedbackId: ['', Validators.required]
          }));
        });
      },
      error: (err: HttpErrorResponse) => {
        // console.log("Error fetching feedback factors: ", err);
      }
    });
  }

  get feedbackArray(): FormArray {
    return this.feedbackForm.get('feedbackList') as FormArray;
  }




  interviewstatus() {
    this.authService.interviewstatus().subscribe({
      next: (res: any) => {
        // console.log("interview status : ", res);
        this.interviewStatus = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ", err)
      }
    })
  }

  // onHrStatusChange(value: string) {
  //   this.selectedHrStatus = Number(value);
  // }

  onHrStatusChange(value: number | string) {
    const status = +value;
    this.selectedHrStatus = status;
    const f = this.feedbackForm;

    // First clear all validators
    this.clearConditionalValidators();

    // Always validate status and comments
    f.get('status')?.setValidators([Validators.required]);
    f.get('comments')?.setValidators([Validators.required]);

    // HR Final Round - Approved
    if (status === 1004 && this.finalHrRound) {
      f.get('joiningDate')?.setValidators([Validators.required]);
      f.get('expectedCTC')?.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
      f.get('division')?.setValidators([Validators.required]);
      f.get('designation')?.setValidators([Validators.required]);
      f.get('department')?.setValidators([Validators.required]);
      f.get('state')?.setValidators([Validators.required]);
      f.get('hq')?.setValidators([Validators.required]);
      f.get('region')?.setValidators([Validators.required]);
    }
    // TR or other rounds - show interviewer and next round selection
    else if (status !== 1005 && status !== 1006 && !this.finalHrRound) {
      f.get('interviewRound')?.setValidators([Validators.required]);
      f.get('interviewBy')?.setValidators([Validators.required]);
    }

    // Update all controls validity
    Object.keys(f.controls).forEach(key => f.get(key)?.updateValueAndValidity());
  }


  clearConditionalValidators() {
    const fieldsToClear = [
      'joiningDate', 'expectedCTC', 'division', 'designation',
      'department', 'state', 'hq', 'region',
      'interviewRound', 'interviewBy'
    ];
    fieldsToClear.forEach(field => {
      const control = this.feedbackForm.get(field);
      if (control) {
        control.clearValidators();
        control.setValue(null); // optional: reset the value
      }
    });
  }




  totalInterviewRounds() {
    this.authService.interviewRounds().subscribe({
      next: (res: any) => {
        // console.log("interview rounds : ", res);
        this.interviewRounds = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ", err)
      }
    })
  }


  processCandidates() {
    this.isLoading = true;
    const pageNo = this.currentPage || 1;
    const pageSize = this.pageSize || 10;
    const searchQuery = this.searchQueryText?.trim() || '';

    this.authService.processCandidates(pageNo, pageSize, searchQuery, this.userData.user.empID).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.rows = res.list?.map((item: any) => ({
          job_code: item.jcReferanceId || '--',
          email: item.email || '--',
          firstname: item.name || '--',
          interviewDateTime: item?.candidateInterviewDetailsDTO?.interviewTime && item?.candidateInterviewDetailsDTO?.interviewDate
            ? `⏱️${item.candidateInterviewDetailsDTO.interviewTime} ( ${item.candidateInterviewDetailsDTO.interviewDate} )`
            : item.status,
          mobilenumber: item.mobileNumber || '--',
          job_title: item.jobTitleName || '--',
          employeeid: item.candidateId || '--',
          interviewStatus: item.candidateInterviewDetailsDTO?.status || null,
        })) || [];
        this.totalRecords = Number(res.totalCount) || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: () => (this.isLoading = false)
    });
  }


  viewFeedbackForm() {
    // this.close();
    // this.feedbackForm.reset();
    this.selectedHrStatus = null
    this.dialogRef = this.dialog.open(this.feedbackform, {
      width: '1000px',
      height: '500px',
      hasBackdrop: true,
    });
  }

  generateColumns() {
    this.columns = [
      { key: 'job_code', label: 'Job Code', uppercase: true },
      { key: 'email', label: 'Mail Id', uppercase: true },
      { key: 'firstname', label: 'Full Name', uppercase: true },
      { key: 'mobilenumber', label: 'Mobile Number', uppercase: true },
      { key: 'job_title', label: 'Designation', uppercase: true },
      // { key: 'status', label: 'Status', center: true },
      { key: 'interviewDateTime', label: 'Interview Timing', uppercase: true },
      { key: 'employeeid', label: 'Action', center: true, clickable: true }
    ];
  }

  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escapedQuery = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span style="font-weight: bold; color: #0072BC;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  handleAction(employeeId: any, interviewStatusCode: Number | null) {
    console.log("inter : ", interviewStatusCode)
    this.isLoading = true;
    this.employeeId = employeeId;
    this.interviewStatusCode = interviewStatusCode;
    this.authService.registeredData(employeeId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.candidateData = res;
        this.resumeFile = res?.candidatePersonalInformationDetails?.resumeFile || null; this.resumeFile = res?.candidatePersonalInformationDetails?.resumeFile || null;
        this.photoFile = res?.candidatePersonalInformationDetails?.imageFile || null;
        this.aadharFile = res?.candidateDocumentDetails?.aadharFile || null;
        this.pancardFile = res?.candidateDocumentDetails?.panFile || null;
        this.tenthFile = res?.candidateDocumentDetails?.tenthFile || null;
        this.InterFile = res?.candidateDocumentDetails?.intermediateFile || null;
        this.BTechFile = res?.candidateDocumentDetails?.degreeFile || null;
        this.mTechFile = res?.candidateDocumentDetails?.pgFile || null;
        this.otherFile = res?.candidateDocumentDetails?.otherFile || null;
        this.ServiceLetterFile = res?.candidateExperienceDetails?.candidateSalaryDetails?.serviceFile || null;
        this.paySlipFile = res?.candidateExperienceDetails?.candidateSalaryDetails?.paySlipFileA || null;
        console.log("candidate data : ", this.candidateData);
        const candidateInterviewDetails = this.candidateData.candidateInterviewDetails;

        // Check if there are interview details
        if (candidateInterviewDetails && candidateInterviewDetails.length > 0) {
          const lastInterview = candidateInterviewDetails[candidateInterviewDetails.length - 1];
          // console.log("last interview details: ", lastInterview);
          const lastInterviewRoundName = lastInterview.interviewRoundName;
          this.interviewScheduleId = lastInterview.interviewScheduleId;
          this.candidateId = lastInterview.candidateId;
          this.roundNo = lastInterview.roundNo;
          const lastfeedback = lastInterview.candidateInterviewFeedBackDTO.length;
          const lastInterviewDate = lastInterview.interviewTime;
          const lastInterviewStatus = lastInterview.status;
          // console.log("last feedback : ", lastfeedback);
          // console.log("last round : ", this.roundNo);
          console.log("last date : ", lastInterviewDate);
          // console.log("last Interview Status : ", lastInterviewStatus);

          // if (lastInterviewDate && lastInterviewStatus === 1001) {
          //   this.disableFeedBack = true;
          // }

          console.log("last date : ", lastInterviewDate);
          this.disableFeedBack = interviewStatusCode === 1001 && lastInterviewDate !== null ? true : false;


          // console.log("Last Interview Round Name:", lastInterviewRoundName);
          if (lastInterviewRoundName === 'HR') {
            this.finalHrRound = true;
          }
        } else {
          // console.log("No interview details found.");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // console.log("error : ", err)
      }
    })
    this.dialogRef = this.dialog.open(this.aboutCandidateDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      // this.closeButton = true;
    });
  }

  close() {
    this.dialog.closeAll();
  }

  toggleOffcanvas() {
    this.isOpen = !this.isOpen;
  }

  closeOffcanvas() {
    this.isOpen = false;
  }

  applyFilter() { }


  areRadioFieldsInvalid(): boolean {
    return this.feedbackArray.controls.some(control => !control.get('feedbackId')?.value);
  }

  // getLastInterviewEmployeeId(interviewScheduleDto: any[]): number | null {
  //   if (interviewScheduleDto.length > 0) {
  //     return interviewScheduleDto[interviewScheduleDto.length - 1].interview_employeeid;
  //   }
  //   return null;
  // }
  feedbackSubmit() {
    const f = this.feedbackForm;
    const formValue = f.value;
    const status = +formValue.status;

    // If not Rejected or Hold, check validity
    if (status !== 1005 && status !== 1006 && f.invalid) {
      f.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Format joining date
    if (formValue.joiningDate) {
      const dateObj = new Date(formValue.joiningDate);
      formValue.joiningDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    }

    // Build payload
    const payload: any = {
      ...formValue,
      loginId: this.UserId,
      candidateId: this.candidateId,
      interviewScheduledId: this.interviewScheduleId,
      status,
      ...(!this.finalHrRound ? { roundNo: ++this.roundNo } : {})
    };

    // Remove interviewer/round if it's the final HR round
    if (this.finalHrRound) {
      delete payload.interviewBy;
      delete payload.interviewRound;
    }

    // Filter out null/empty/undefined values manually
    const filteredPayload: any = {};
    for (const key in payload) {
      if (
        payload[key] !== null &&
        payload[key] !== undefined &&
        payload[key] !== ''
      ) {
        filteredPayload[key] = payload[key];
      }
    }

    // Submit
    this.authService.feedbackSubmitForm(filteredPayload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.close();
        this.processCandidates();
        this.disableFeedBack = false;
        Swal.fire({
          title: 'Success',
          text: res?.message || "Operation completed successfully",
          icon: 'success',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: (_: HttpErrorResponse) => {
        this.isLoading = false;
      }
    });
  }

  convertToDateObject(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(+year, +month - 1, +day); // month is 0-indexed
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

  formatTime(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const formattedHour = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.processCandidates();
    }
  }

  get startIndex(): number {
    return this.totalRecords > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  totalDivisions() {
    this.authService.masterBu().subscribe({
      next: (res: any) => {
        console.log("total divisions : ", res);
        this.totalDivisionsList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }
  totalDesignations() {
    this.authService.jobTitle().subscribe({
      next: (res: any) => {
        console.log("total designation: ", res);
        this.totalDesignationsList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }
  totalDepartments() {
    this.authService.totalDepartments().subscribe({
      next: (res: any) => {
        console.log("total designation: ", res);
        this.totalDepartmentsList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }
  totalRegions() {
    this.authService.totalRegions().subscribe({
      next: (res: any) => {
        console.log("total designation: ", res);
        this.totalRegionsList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }
  totalStates() {
    this.authService.states().subscribe({
      next: (res: any) => {
        console.log("total designation: ", res);
        this.totalStatesList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }

  onStateChange(event: Event) {
    const selectedStateId = (event.target as HTMLSelectElement).value;

    if (selectedStateId) {
      this.totalCities(selectedStateId);
    }
  }
  totalCities(id: any) {
    this.authService.cities(id).subscribe({
      next: (res: any) => {
        console.log("total designation: ", res);
        this.totalCitiesList = res;
      },
      error: (err: HttpErrorResponse) => {
        // console.log("error : ",err)
      }
    })
  }

  viewFile(file: any) {
    this.dialog.closeAll();
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
    this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL);
    this.showPDF = true;
  }

  closePDF() {
    this.showPDF = false; // Hide the modal
    this.fileURL = null; // Clear the URL
    this.handleAction(this.employeeId, this.interviewStatusCode);
  }

  allowNumericWithDot(event: KeyboardEvent): boolean {
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    // Allow navigation keys (backspace, arrow keys, delete)
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Tab'
    ) {
      return true;
    }

    // Allow digits and one decimal point
    const currentValue = (event.target as HTMLInputElement).value;
    const isDigit = /^[0-9]$/.test(inputChar);
    const isDot = inputChar === '.' && !currentValue.includes('.');

    if (!isDigit && !isDot) {
      event.preventDefault();
      return false;
    }

    return true;
  }

}
