import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-offer-letter',
  templateUrl: './offer-letter.component.html',
  styleUrls: ['./offer-letter.component.sass']
})
export class OfferLetterComponent implements OnInit {

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
  colorTheme = 'theme-dark-blue';
  fileURL: SafeResourceUrl | null = null;
  showPDF: boolean = false;
  today: Date = new Date();
  panAlertMessage: string | null = null;
  private panAlertTimeout: any;




  constructor(
    private render: Renderer2,
    private dialog: MatDialog,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.offerCandidates();
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

  offerCandidates() {
    this.isLoading = true;

    this.authService.offerCandidates().subscribe({
      next: (res: any) => {
        console.log("hold candidates : ", res);
        this.isLoading = false;

        this.rows = res.map((item: any, index: number) => ({
          jobcodeId: item.jobcodeId || 'N/A',
          jcReferanceId: item.jcReferanceId || 'N/A',
          email: item.email || 'N/A',
          employeeId: item.employeeId || 'N/A',
          candidateId: item.candidateId || 'N/A',
          name: item.candidateName || 'N/A',
          jobTitleName: item.jobTitleName || 'N/A',
          deptName: item.deptName || 'N/A',
          expectedCtc: item.expectedCtc || 'N/A',
          joiningDate: item.joiningDate,
          status: item.status || 'N/A',
          offerLink: item.offerLetterFile || 'N/A'
        }));
        // let i = this.rows.length;

        // while (i < 100) {
        //   this.rows.push({
        //     jobcodeId: 'JCID' + Math.floor(1000 + Math.random() * 9000),
        //     jcReferanceId: 'JC' + Math.floor(1000 + Math.random() * 9000),
        //     employeeId: 'EMP' + (i + 1),
        //     candidateId: 'CAND' + (i + 1).toString().padStart(4, '0'),
        //     name: ['Raj', 'Alice', 'John', 'Nina', 'Leo'][i % 5],
        //     jobTitleName: ['Software Engineer', 'Data Analyst', 'UI Designer', 'DevOps Engineer'][i % 4],
        //     deptName: ['IT', 'HR', 'Finance', 'Marketing'][i % 4],
        //     expectedCtc: (3 + Math.random() * 7).toFixed(2) + ' LPA',
        //     joiningDate: null,  // or use a fake date if required
        //     status: ['1001', '1002', 'Pending', 'Approved', 'Rejected'][i % 5],
        //     offerLink: 'N/A'
        //   });
        //   i++;
        // }

        this.originalRows = [...this.rows];
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error fetching candidates:', err);
      }
    });
  }





  generateColumns() {
    this.columns = [
      { key: 'jcReferanceId', label: 'Job Code', uppercase: true },
      { key: 'email', label: 'Mail Id', uppercase: true },
      { key: 'expectedCtc', label: 'Proposed CTC', uppercase: true },
      { key: 'name', label: 'Full Name', uppercase: true },
      { key: 'deptName', label: 'Department Name', uppercase: true },
      { key: 'joiningDate', label: 'Actual Date Of Join (editable)', uppercase: true },
      { key: 'employeeId', label: 'Action', center: true, clickable: true }
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

  GenerateOffer(employeeId: any) {
    this.isLoading = true;
    console.log("employeeId : ", employeeId);
    this.authService.GenerateOffer(employeeId).subscribe({
      next: (res: HttpResponse<any>) => {
        console.log(res)
        if (res.status === 200) {
          this.isLoading = false;
          console.log("res : ", res);
          this.offerCandidates();
          Swal.fire({
            title: 'Success',
            text: 'Generated Successfully',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          })
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log("error : ", err);
        this.isLoading = false;
      }
    })


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
    this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL);
    this.showPDF = true;
  }

  close() {
    this.dialog.closeAll();
  }

  closePDF() {
    this.showPDF = false; // Hide the modal
    this.fileURL = null; // Clear the URL
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

  goBack() {
    window.history.back();
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Handle the date change and update the row data
  onDateChange(date: string, row: any, key: string): void {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    row[key] = formattedDate;
    const offerLink = row.offerLink;

    if (offerLink && offerLink !== 'N/A') {
      Swal.fire({
        title: 'Warning',
        text: 'Offer letter has already been generated. Joining date cannot be changed.',
        icon: 'warning',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      });
      return;
    }

    // this.GenerateOffer(row.employeeId);
    this.updateJoiningDate(row.employeeId, formattedDate);
    console.log(row.employeeId)
  }


  updateJoiningDate(employeeId: string, joiningDate: string): void {
    console.log(employeeId)
    this.isLoading = true;
    const formData = new FormData();
    formData.append('employeeId', employeeId);
    formData.append('doj', joiningDate);

    this.authService.updateJoingDate(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('Updated successfully');
        // Swal.fire({
        //   title: 'Success',
        //   text: 'Date Updated Successfully!',
        //   icon: 'success',
        //   showConfirmButton: false,
        //   timer: 1000,
        //   timerProgressBar: true,
        // });
        this.showInvalidPanAlert('Date Updated Successfully!');
        this.offerCandidates();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        Swal.fire({
          title: 'OOPS',
          text: 'Date Is not updated',
          icon: 'warning',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      }
    });
  }

  private showInvalidPanAlert(message: string): void {
    this.panAlertMessage = message;

    clearTimeout(this.panAlertTimeout);
    this.panAlertTimeout = setTimeout(() => {
      this.panAlertMessage = null;
    }, 2000); // alert visible for 2 seconds
  }




  closeAlert() {
    this.panAlertMessage = null;
  }





}


