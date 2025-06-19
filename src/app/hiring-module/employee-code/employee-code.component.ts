import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import * as moment from 'moment';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-code',
  templateUrl: './employee-code.component.html',
  styleUrls: ['./employee-code.component.sass']
})
export class EmployeeCodeComponent implements OnInit {
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

    this.authService.employeeOnboarding().subscribe({
      next: (res: any) => {
        console.log("hold candidates : ", res);
        this.isLoading = false;

        this.rows = res.map((item: any, index: number) => ({
          jcReferanceId: item.jcReferanceId || 'N/A',
          email: item.email || 'N/A',
          expectedCtc: item.expectedCtc || 'N/A',
          name: item.candidateName || 'N/A',
          deptName: item.deptName || 'N/A',
          joiningDate: item.joiningDate || 'N/A',  // format if needed
          employeeId: item.candidateId || 'N/A'
        }));


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
      { key: 'joiningDate', label: 'Date Of Join', uppercase: true },
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



  moveToHrms(id: any) {
    console.log("id: ", id);
    Swal.fire({
      title: 'Warning',
      text: 'Need to implement from backend',
      icon: 'warning',
      confirmButtonText: 'Close',
      allowOutsideClick: false
    });
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
        confirmButtonText: 'Close', // <-- Button label
        showConfirmButton: true,
        allowOutsideClick: false
      });
      return;
    }
    // this.GenerateOffer(row.employeeId);

  }


  updateJoiningDate(employeeId: string, joiningDate: string): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('employeeId', employeeId);
    formData.append('doj', joiningDate);

    this.authService.updateJoingDate(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Updated successfully');
        Swal.fire({
          title: 'Success',
          text: 'Date Updated Successfully!',
          icon: 'success',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
        this.offerCandidates();
      },
      error: (err) => {
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







}


