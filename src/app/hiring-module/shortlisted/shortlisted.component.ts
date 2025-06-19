import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-list',
  templateUrl: './shortlisted.component.html',
  styleUrls: ['./shortlisted.component.sass']
})
export class ProfileListComponent implements OnInit {
  applyFilter() {
    throw new Error('Method not implemented.');
  }
  columns = [
    { key: 'job_code', label: 'Job Code', uppercase: true },
    { key: 'email', label: 'Mail ID', uppercase: true },
    { key: 'firstname', label: 'Full Name', uppercase: true },
    { key: 'mobilenumber', label: 'Mobile Number', uppercase: true },
    { key: 'job_title', label: 'Designation', uppercase: true },
    { key: 'status', label: 'Status', uppercase: true },
    { key: 'employeeid', label: 'Action', center: true, clickable: true }
  ];

  rows: any[] = [];
  searchQuery = new FormControl();
  isOpen = false;
  employeeId: string | null = null;
  interviewStatusCode: Number | null = null;
  isLoading = false;
  candidateData: any = {};
  currentPage = 1;
  pageSize = 10;
  userData: any;
  searchQueryText: string = '';
  totalRecords: number = 0;
  totalPages: number = 1;
  fileURL: SafeResourceUrl | null = null;
  showPDF: boolean = false;

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

  @ViewChild('aboutCandidateDialog', { static: true }) aboutCandidateDialog!: TemplateRef<any>;
  private dialogRef: any;
  isSidebarOpen = true;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.currentPage = 1;
    this.pageSize = 10;
    this.fetchShortlistedCandidates();
    this.searchQuery.valueChanges.subscribe(value => {
      // this.currentPage = 1;
      // this.searchQueryText = value.trim();
      // this.fetchShortlistedCandidates();
      if (value?.length >= 3) {
        this.currentPage = 1;
        this.searchQueryText = value.trim();
        this.fetchShortlistedCandidates();
      }
    });


    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    console.log("rajender : ", this.userData.user.empID)
  }

  fetchShortlistedCandidates() {
    this.isLoading = true;
    const pageNo = this.currentPage || 1;
    const pageSize = this.pageSize || 10;
    const searchQuery = this.searchQueryText?.trim() || '';

    this.authService.shortlistedCandidates(pageNo, pageSize, searchQuery).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.rows = res.list?.map((item: any) => ({
          job_code: item.jcReferanceId || '--',
          email: item.email || '--',
          firstname: item.name || '--',
          mobilenumber: item.mobileNumber || '--',
          job_title: item.jobTitleName || '--',
          employeeid: item.candidateId || '--',
          status: item.status || '--',
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

  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const regex = new RegExp(`(${this.searchQueryText})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span style="font-weight: bold; color: #0072BC;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  handleAction(employeeId: any, interviewStatusCode: any) {
    this.employeeId = employeeId;
    this.interviewStatusCode = interviewStatusCode;
    if (this.isLoading) return; // prevent double call

    this.isLoading = true;
    this.authService.registeredData(employeeId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.candidateData = res || {};
        this.resumeFile = res?.candidatePersonalInformationDetails?.resumeFile || null;
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
        this.candidateData.candidateEducationDetails = this.candidateData.candidateEducationDetails || [];
        console.log("Updated Education Details: ", this.candidateData?.candidateEducationDetails);
        this.openDialog();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error fetching candidate data:", err);
      }
    });
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
    this.handleAction(this.employeeId, this.interviewStatusCode);
  }

  openDialog() {
    this.dialogRef = this.dialog.open(this.aboutCandidateDialog, {
      width: 'auto',
      height: 'auto',
      hasBackdrop: true
    });
  }

  close() {
    this.dialog.closeAll();
    // this.closeButton = true;
  }

  toggleOffcanvas() {
    this.isOpen = !this.isOpen;
  }

  closeOffcanvas() {
    this.isOpen = false;
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

  sendRemainder(id: any) {
    this.isLoading = true;
    this.authService.sendRemainder(id, this.userData.user.empID).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.candidateData = res;
        Swal.fire({
          title: 'Success',
          text: 'Reminder has been sent successfully.',
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'OK',
        });

      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.log("error : ", err)
      }
    })
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.fetchShortlistedCandidates();
    }
  }

  get startIndex(): number {
    return this.totalRecords > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }
}
