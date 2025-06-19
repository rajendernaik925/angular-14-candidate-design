import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrls: ['./rejected.component.sass']
})
export class RejectedComponent implements OnInit {

  columns: { key: string; label: string; center?: boolean; uppercase?: boolean; clickable?: boolean; minKey?: string; maxKey?: string }[] = [];
  rows: any[] = [];
  originalRows: any[] = [];
  searchQuery: FormControl = new FormControl();
  filteredRows: any[] = [];
  filterOffcanvas: any;
  isOpen = false;
  private dialogRef: any;
  candidateData: any = null;
  isLoading: boolean = false;
  audio: any;
  currentPage = 1;
  pageSize = 10;
  comapnyLogo: string = 'assets/img/icons/company-name.png'
  @ViewChild('aboutCandidateDialog', { static: true }) aboutCandidateDialog!: TemplateRef<any>;
  searchQueryText: string;


  constructor(
    private render: Renderer2,
    private dialog: MatDialog,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.shortlistedCandidates();
    this.generateColumns();
    // this.generateRows();

    // this.filteredRows = [...this.rows];

    this.searchQuery.valueChanges.subscribe((value: string) => {
      console.log(value);
      this.currentPage = 1;
      this.searchQueryText = value.trim().toLowerCase(); // Store search text
      this.filterRows(value);
    });
  }

  shortlistedCandidates() {
    this.isLoading = true
    this.authService.rejectedCandidates().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.rows = res.map((item: any, index: number) => ({
          jobcodeId: item.jobcodeId || 'N/A',
          jcReferanceId: item.jcReferanceId || 'N/A',
          candidateId: item.candidateId || 'N/A',
          name: item.name || 'N/A',
          jobTitleName: item.jobTitleName || 'N/A',
          mobileNumber: item.mobileNumber || 'N/A',
          email: item.email || 'N/A',
          teamName: item.teamName || 'N/A',
          reportingManager: item.reportingManager || 'N/A',
          createdBy: item.createdBy || 'N/A',
          // status: item.status || 'N/A'
        }));

        // Ensure at least 100 dummy entries
        // while (this.rows.length < 100) {
        //   const dummyIndex = this.rows.length + 1;
        //   this.rows.push({
        //     jobcodeId: 1000 + dummyIndex,
        //     jcReferanceId: `JC${1000 + dummyIndex}`,
        //     candidateId: dummyIndex,
        //     name: `Candidate ${dummyIndex}`,
        //     jobTitleName: `Job Title ${dummyIndex}`,
        //     mobileNumber: `987654${String(dummyIndex).padStart(4, '0')}`,
        //     email: `dummy${dummyIndex}@example.com`,
        //     teamName: `Team ${dummyIndex}`,
        //     reportingManager: `Manager ${dummyIndex}`,
        //     createdBy: `Creator ${dummyIndex}`,
        //     status: dummyIndex % 3 === 0 ? 1001 : dummyIndex % 3 === 1 ? 1003 : 1005
        //   });
        // }
        this.originalRows = [...this.rows];

      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
      }
    });
  }



  generateColumns() {
    this.columns = [
      { key: 'jcReferanceId', label: 'Job Code', uppercase: true },
      { key: 'email', label: 'Mail ID', uppercase: true },
      { key: 'name', label: 'Candidate Name', uppercase: true },
      { key: 'mobileNumber', label: 'Mobile', uppercase: true },
      { key: 'jobTitleName', label: 'Job Title', uppercase: true },
      // { key: 'teamName', label: 'Team', uppercase: true },
      // { key: 'reportingManager', label: 'Reporting Manager', uppercase: true },
      // { key: 'createdBy', label: 'Created By', uppercase: true },
      // { key: 'status', label: 'Status', uppercase: true },
      { key: 'candidateId', label: 'Action', center: true, clickable: true }
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

  highlightMatch(text: any): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escapedQuery = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlightedText = String(text).replace(regex, `<span class="badge text-white" style="font-weight: bold; background-color: #198754;">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  handleAction(employeeId: any) {
    this.isLoading = true;
    this.authService.registeredData(employeeId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.candidateData = res;
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

  goBack() {
    window.history.back();
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

  formatTime(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const formattedHour = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  feedbackView(interview: any) {
      const feedBackformat = interview.candidateInterviewFeedBackDTO || [];
      const comments = interview.comments;
  
      const detailsHtml = `
    <div style="font-size:12px; width:100%;">
      <div style="margin-bottom: 10px;">
        <h5 style="margin: 0;">Interview Feedback</h5>
      </div>
  
      <div class="table-responsive">
        <table class="table table-bordered table-sm w-100">
          <tbody>
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
      </div>
  
      <div class="table-responsive">
        <table class="table table-bordered table-sm w-100 text-center">
          <thead class="table-dark">
            <tr>
              <th style="font-size: 12px;">S.No</th>
              <th style="font-size: 12px;">Factors</th>
              <th style="font-size: 12px;">Excellent</th>
              <th style="font-size: 12px;">Good</th>
              <th style="font-size: 12px;">Average</th>
              <th style="font-size: 12px;">Below Average</th>
            </tr>
          </thead>
          <tbody>
            ${feedBackformat.map((item: any, index: number) => {
        const getMark = (level: string) =>
          item.feedBackName === level
            ? '<span style="color:green;">✔️</span>'
            : '<span style="color:red;">❌</span>';
        return `
                <tr>
                  <td>${index + 1}</td>
                  <td class="text-start">${item.factorName}</td>
                  <td>${getMark('Excellent')}</td>
                  <td>${getMark('Good')}</td>
                  <td>${getMark('Average')}</td>
                  <td>${getMark('Below Average')}</td>
                </tr>
              `;
      }).join('')}
          </tbody>
        </table>
      </div>
  
      <div style="margin-top: 10px; text-align: left;">
        <strong>Comments:</strong>
        <p style="text-align: left; margin-top: 5px;">${comments || 'No comments available.'}</p>
      </div>
    </div>
  `;
  
  
      Swal.fire({
        html: detailsHtml,
        width: '900px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          popup: 'p-3'
        },
        buttonsStyling: false
      });
    }
  
  sendRemainder() {
    Swal.fire({
      title: 'Success',
      text: 'Remainder Sent',
      icon: 'success',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    })
    this.close()
  }

  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
  }

  get totalPages() {
    return Math.ceil(this.rows.length / this.pageSize);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.rows.length);
  }

  whatsapp() {
    const phoneNumber = '+919014843973';
    const message = encodeURIComponent(
      `Hello! This is a test message to check the functionality of sending WhatsApp messages through a web link.
    
    ✅ Purpose: To verify whether the WhatsApp API correctly opens a chat window with a pre-filled message.
    ✅ Expected Behavior: When clicking the button, it should open WhatsApp (app or web) and display this message.
    ✅ Testing Points:
    1. Does it work correctly on mobile devices?
    2. Does it open properly in WhatsApp Web on desktop?
    3. Does it handle long messages without truncation?
    4. Does the formatting remain intact when received?
    5. Is the phone number correctly passed?
    
    Thank you for testing! 🚀`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }


  //   whatsapp() {
  //     const phoneNumbers = ['+919014843973', '+917993344569', '+919390393064']; 
  //     const message = encodeURIComponent(
  //       `Hello! This is a test message to check the functionality of sending WhatsApp messages through a web link.

  //   ✅ Purpose: To verify whether the WhatsApp API correctly opens a chat window with a pre-filled message.
  //   ✅ Expected Behavior: When clicking the button, it should open WhatsApp (app or web) and display this message.
  //   ✅ Testing Points:
  //   1. Does it work correctly on mobile devices?
  //   2. Does it open properly in WhatsApp Web on desktop?
  //   3. Does it handle long messages without truncation?
  //   4. Does the formatting remain intact when received?
  //   5. Is the phone number correctly passed?

  //   Thank you for testing! 🚀`
  //     );          
  //     phoneNumbers.forEach((phoneNumber) => {
  //        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  //     });
  //  }



}

