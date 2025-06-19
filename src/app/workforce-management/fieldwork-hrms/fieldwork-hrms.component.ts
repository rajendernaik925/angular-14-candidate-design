import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fieldwork-hrms',
  templateUrl: './fieldwork-hrms.component.html',
  styleUrls: ['./fieldwork-hrms.component.sass']
})
export class FieldworkHrmsComponent implements OnInit {


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
  selectAll: boolean = false;
  searchQueryText: string;
  dataNotFoundGif:string = 'assets/img/icons/not-found.gif'
  @ViewChild('aboutCandidateDialog', { static: true }) aboutCandidateDialog!: TemplateRef<any>;


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
      this.searchQueryText = value.trim().toLowerCase();
      this.filterRows(value);
    });
  }

  shortlistedCandidates() {
    this.isLoading = true
    this.authService.shortlistedCandidates(1,10,'').subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log("resss : ",res)

        // this.rows = res.map((item: any, index: number) => ({
        //   email: item.email || 'N/A',
        //   firstname: item.firstname || 'N/A',
        //   lastname: item.lastname || 'N/A',
        //   mobilenumber: item.mobilenumber || 'N/A',
        //   job_code: item.job_code || 'N/A',
        //   job_title: item.job_title || 'N/A',
        //   status: index % 3 === 0 ? 1001 : index % 3 === 1 ? 1003 : 1005,
        //   employeeid: item.employeeid
        // }));
        this.rows = res.list?.map((item: any) => ({
          job_code: item.jcReferanceId || '--',
          email: item.email || '--',
          firstname: item.name || '--',
          lastname: '--', // No last name in API response
          mobilenumber: item.mobileNumber || '--',
          job_title: item.jobTitleName || '--',
          employeeid: item.candidateId || '--',
        })) || [];

        // Ensure at least 100 dummy entries
        while (this.rows.length < 15) {
          this.rows.push({
            Id: `1343${this.rows.length + 1}`,
            email: `dummy${this.rows.length + 1}@example.com`,
            firstname: `First${this.rows.length + 1}`,
            lastname: `Last${this.rows.length + 1}`,
            mobilenumber: `987654${String(this.rows.length + 1).padStart(4, '0')}`,
            job_code: `JOB${1000 + this.rows.length + 1}`,
            job_title: `Job Title ${this.rows.length + 1}`,
            status: this.rows.length % 3 === 0 ? 1001 : this.rows.length % 3 === 1 ? 1003 : 1005,
            employeeid: `EMP${this.rows.length + 1}`
          });
        }
        this.originalRows = [...this.rows];

      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
      }
    });
  }

  generateColumns() {
    this.columns = [
      { key: 'Id', label: 'Id', uppercase: true },
      { key: 'email', label: 'User Mail Id', uppercase: true },
      { key: 'firstname', label: 'First Name', uppercase: true },
      { key: 'lastname', label: 'Last Name', uppercase: true },
      { key: 'mobilenumber', label: 'Mobile', uppercase: true },
      { key: 'job_code', label: 'Job Code', uppercase: true },
      { key: 'job_title', label: 'Job Title', uppercase: true },
      // { key: 'status', label: 'Status', center: true },
      { key: 'employeeid', label: 'Action', center: true, clickable: true }
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

  formatTime(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const formattedHour = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
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
    const phoneNumber = '9515742401';
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

  toggleAllSelection() {
    this.rows.forEach(row => row.selected = this.selectAll);
  }

  checkSelection() {
    this.selectAll = this.rows.every(row => row.selected);
  }

  
  moveToHRMS() {
    const isAnyRowSelected = this.rows.some(row => row.selected);
    if(isAnyRowSelected) {
      this.isLoading = true;

    setTimeout(() => {
      this.rows = this.rows.filter(row => !row.selected);
      this.selectAll = false;
      this.isLoading = false;
      Swal.fire({
        title: 'Success',
        text: 'Remainder Sent',
        icon: 'success',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      })
    }, 1000);
    } else {
      Swal.fire({
        title: 'error',
        text: "Please select checkbox",
        icon: 'error',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      })
    }

  }



}

