import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interview-processed',
  templateUrl: './interview-processed.component.html',
  styleUrls: ['./interview-processed.component.sass']
})
export class InterviewProcessedComponent implements OnInit {

 
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
   userData: any;
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
     console.log("user data : ", this.userData.user.empID)
     this.UserId = this.userData.user.empID;
 
     this.processedCandidates();
     this.generateColumns();
     this.totalInterviewRounds();
     this.interviewstatus();
     this.feedbackFactors();
     this.initializeForm();
 
     this.searchQuery.valueChanges.subscribe(value => {
       this.currentPage = 1;
       this.searchQueryText = value.trim();
       this.processedCandidates();
     });
   }
 
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
     if (!query.trim()) {
       this.interviewedByList = [];
       return;
     }
 
     const formData = new FormData(); // Corrected syntax
     formData.append('name', query);
 
     this.authService.interviewedBy(formData).subscribe({
       next: (res: any) => {
         this.interviewedByList = Array.isArray(res) ? res : []; // Ensure it's an array
         console.log("rajjjjjjj", this.interviewedByList);
       },
       error: (err: HttpErrorResponse) => {
         console.error("Error fetching interviewers:", err);
         this.interviewedByList = [];
       }
     });
   }
 
   selectInterviewer(item: any) {
     this.feedbackForm.patchValue({
       interviewBy: item.employeeid, // Bind the value as employeeid
     });
     this.selectedInterviewerName = item.Name; // Display name in the input field
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
         console.log("Feedback factors : ", res);
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
         console.log("Error fetching feedback factors: ", err);
       }
     });
   }
 
   get feedbackArray(): FormArray {
     return this.feedbackForm.get('feedbackList') as FormArray;
   }
 
 
 
 
   interviewstatus() {
     this.authService.interviewstatus().subscribe({
       next: (res: any) => {
         console.log("interview status : ", res);
         this.interviewStatus = res;
       },
       error: (err: HttpErrorResponse) => {
         console.log("error : ", err)
       }
     })
   }
 
   onHrStatusChange(value: string) {
     this.selectedHrStatus = Number(value); // ✅ Update selectedHrStatus when HR status changes
   }
 
   totalInterviewRounds() {
     this.authService.modeOfInterview().subscribe({
       next: (res: any) => {
         console.log("interview rounds : ", res);
         this.interviewRounds = res;
       },
       error: (err: HttpErrorResponse) => {
         console.log("error : ", err)
       }
     })
   }
 
 
   processedCandidates() {
     this.isLoading = true;
     const pageNo = this.currentPage || 1;
     const pageSize = this.pageSize || 10;
     const searchQuery = this.searchQueryText?.trim() || '';
 
     this.authService.processedCandidates(pageNo, pageSize, searchQuery, this.userData.user.empID).subscribe({
       next: (res: any) => {
         this.isLoading = false;
 
         this.rows = res.list?.map((item: any) => ({
           job_code: item.jcReferanceId || '--',
           email: item.email || '--',
           firstname: item.name || '--',
          //  interviewDateTime: '--',
           mobilenumber: item.mobileNumber || '--',
           job_title: item.jobTitleName || '--',
           employeeid: item.candidateId || '--',
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
     this.dialogRef = this.dialog.open(this.feedbackform, {
       width: 'auto',
       height: 'auto',
       hasBackdrop: true,
     });
   }
 
   generateColumns() {
     this.columns = [
       { key: 'job_code', label: 'Job Code', uppercase: true },
       { key: 'email', label: 'User Mail Id', uppercase: true },
       { key: 'firstname', label: 'First Name', uppercase: true },
       { key: 'mobilenumber', label: 'Mobile', uppercase: true },
      //  { key: 'interviewDateTime', label: 'Interview Shift', uppercase: true },
       { key: 'job_title', label: 'Job Title', uppercase: true },
       // { key: 'status', label: 'Status', center: true },
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
 
   handleAction(employeeId: any) {
     this.isLoading = true;
     this.employeeId = employeeId
     this.authService.registeredData(employeeId).subscribe({
       next: (res) => {
         this.isLoading = false;
         this.candidateData = res;
         console.log("candidate data : ", this.candidateData);
         const candidateInterviewDetails = this.candidateData.candidateInterviewDetails;
 
         // Check if there are interview details
         if (candidateInterviewDetails && candidateInterviewDetails.length > 0) {
           const lastInterview = candidateInterviewDetails[candidateInterviewDetails.length - 1];
           const lastInterviewRoundName = lastInterview.interviewRoundName;
           this.interviewScheduleId = lastInterview.interviewScheduleId;
           this.candidateId = lastInterview.candidateId;
           this.roundNo = lastInterview.roundNo;
           const lastfeedback = lastInterview.candidateInterviewFeedBackDTO.length;
           console.log("last feedback : ", lastfeedback);
           console.log("last round : ", this.roundNo);
           if (lastfeedback) {
             this.disableFeedBack = true;
           }
 
           console.log("Last Interview Round Name:", lastInterviewRoundName);
           if (lastInterviewRoundName === 'HR') {
             this.finalHrRound = true;
           }
         } else {
           console.log("No interview details found.");
         }
 
 
       },
       error: (err: HttpErrorResponse) => {
         this.isLoading = false;
         console.log("error : ", err)
       }
     })
     this.dialogRef = this.dialog.open(this.aboutCandidateDialog, {
       width: 'auto',
       height: 'auto',
       hasBackdrop: true,
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
     console.log("this.feedbackForm.value", this.feedbackForm.value);
 
     this.isLoading = true;
     const formValue = this.feedbackForm.value;
     const statusValue = Number(formValue.status) || 0;
     let payload: any = {
       ...formValue,
       loginId: this.UserId,
       status: statusValue,
       candidateId: this.candidateId,
       interviewScheduledId: this.interviewScheduleId,
       ...(!this.finalHrRound ? { roundNo: this.roundNo } : {}) // Only add roundNo if finalHrRound is false
     };
 
     // Remove `interviewBy` if `finalHrStatus` is true
     if (this.finalHrRound) {
       delete payload.interviewBy;
     }
 
 
 
     // Manually filter out null and undefined properties
     let filteredPayload: any = {};
     Object.keys(payload).forEach((key) => {
       if (payload[key] !== null && payload[key] !== undefined) {
         filteredPayload[key] = payload[key];
       }
     });
 
     console.log("Filtered Payload:", filteredPayload);
 
     this.authService.feedbackSubmitForm(filteredPayload).subscribe({
       next: (res: any) => {
         this.isLoading = false;
         console.log(res);
         this.close();
         this.processedCandidates();
         Swal.fire({
           title: 'Success',
           text: res?.message || "Operation completed successfully",
           icon: 'success',
           showConfirmButton: false,
           timer: 1000,
           timerProgressBar: true,
         });
       },
       error: (err: HttpErrorResponse) => {
         this.isLoading = false;
         console.log(err);
       }
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
       this.processedCandidates();
     }
   }
 
   get startIndex(): number {
     return this.totalRecords > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
   }
 
   get endIndex(): number {
     return Math.min(this.currentPage * this.pageSize, this.totalRecords);
   }
 }
 

