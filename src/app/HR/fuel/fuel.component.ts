import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.sass']
})
export class FuelComponent implements OnInit {

  rows: any[] = [];
  filteredJobs: any[] = [];
  isLoading = false;
  dataNotFound: string = 'assets/img/icons/not-found.gif'

  searchQuery: FormControl = new FormControl('');
  searchQueryText: string = '';

  currentPage = 1;
  pageSize = 8;
  totalRecords = 0;
  fuelForm: FormGroup;
  months: any;
  selectedMonthName: string | null = null;
  selectedMonthValue: number;
  unClaimedCount: number = null;
  userData: any;
  userId: any;

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.selectedMonthValue = +(year.toString() + month.toString().padStart(2, '0'));
  }

  ngOnInit(): void {
    this.getPayPeriods();
    this.searchQuery.valueChanges.subscribe((value: string) => {
      this.applyFilter(value);
    });

    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    console.log("user data : ", this.userData);
    this.userId = this.userData.user.empID;
  }

  getPayPeriods() {
    this.isLoading = true;
    this.authService.getPayPeriods().subscribe({
      next: (res: any[]) => {
        this.isLoading = false;
        console.log("pay period data: ", res);
        this.months = res;

        this.selectBestAvailableMonth();
      },
      error: (err: HttpErrorResponse) => {
        console.error("error: ", err);
        this.isLoading = false;
      }
    });
  }

  selectBestAvailableMonth() {
    if (!this.months?.length) return;

    const sorted = this.months.sort((a, b) => +a.payperiod - +b.payperiod);

    const exact = sorted.find(m => +m.payperiod === this.selectedMonthValue);
    if (exact) {
      this.selectedMonthValue = +exact.payperiod;
      this.selectedMonthName = exact.monthYear;
      this.loadFuelData(this.selectedMonthValue);
      return;
    }


    const before = [...sorted]
      .reverse()
      .find(m => +m.payperiod < this.selectedMonthValue);

    if (before) {
      this.selectedMonthValue = +before.payperiod;
      this.selectedMonthName = before.monthYear;
      this.loadFuelData(this.selectedMonthValue);
      return;
    }

    const last = sorted[sorted.length - 1];
    this.selectedMonthValue = +last.payperiod;
    this.selectedMonthName = last.monthYear;
    this.loadFuelData(this.selectedMonthValue);
  }

  onMonthChange(monthValue: any) {
    console.log('Selected month value:', monthValue);

    const monthObj = this.months.find(m => m.payperiod === monthValue);

    this.selectedMonthValue = monthValue;
    this.selectedMonthName = monthObj?.monthYear || null;

    console.log('Selected month name:', this.selectedMonthName);

    this.loadFuelData(this.selectedMonthValue);
  }

  loadFuelData(payPeriodValue: any) {
    this.isLoading = true;
    this.searchQuery.setValue('');
    this.searchQueryText = '';
    const formData = new FormData
    formData.append('payPeriod', payPeriodValue)

    this.authService.getFuelData(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.rows = res;
        // this.filteredJobs = [...this.rows];
        this.unClaimedCount = this.rows.filter(row => row.claimedAmount === 'NA').length;
        // if (this.unClaimedCount > 0) {
        //   Swal.fire({
        //     icon: 'warning',
        //     title: 'Unclaimed Records',
        //     text: `You have ${this.unClaimedCount} unclaimed record(s). Please fill them before pay period.`,
        //     confirmButtonColor: '#d33',
        //   });
        // }
        console.log("NA count : ", this.unClaimedCount)
        this.filteredJobs = [...this.rows].sort((a, b) => {
          const aIsNA = a.claimedAmount === 'NA' ? 0 : 1;
          const bIsNA = b.claimedAmount === 'NA' ? 0 : 1;
          return aIsNA - bIsNA;
        });
        this.totalRecords = this.filteredJobs.length;
        this.currentPage = 1;
      },

      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // console.error("Error fetching job codes:", err.message);
      }
    });
  }

  applyFilter(value: string) {
    this.searchQueryText = value?.trim() || '';

    let result: any[] = [];

    if (!this.searchQueryText) {
      result = [...this.rows];
    } else {
      const q = this.searchQueryText.toLowerCase();
      result = this.rows.filter(row =>
        row.employeeSequenceNo?.toString().includes(q) ||
        row.employeeName?.toLowerCase().includes(q) ||
        row.driverSalary?.toLowerCase().includes(q) ||
        row.deptName?.toLowerCase().includes(q) ||
        row.desgName?.toLowerCase().includes(q) ||
        row.totalAmount?.toLowerCase().includes(q) ||
        row.fuelAndMaintenance?.toLowerCase().includes(q)
      );
    }


    this.filteredJobs = result.sort((a, b) => {
      const aIsNA = a.claimedAmount === 'NA' ? 0 : 1;
      const bIsNA = b.claimedAmount === 'NA' ? 0 : 1;
      return aIsNA - bIsNA;
    });

    this.totalRecords = this.filteredJobs.length;
    this.currentPage = 1;
  }


  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.currentPage = newPage;
  }

  submit(row: any) {
    this.isLoading = false;
    // row.amountError = false;
    console.log("actual amount : ", row.amount);
    console.log("total total amount : ", row.totalAmount);
    console.log("total comment : ", row.comment);
    console.log("total proccesed : ", row.processed);
    console.log("total recieve : ", row.received);

    if (!row.processed && !row.received) {
      Swal.fire({
        icon: 'question',
        // title: 'Please select at least one checkbox',
        text: 'You must select at least one checkbox before submitting.',
        confirmButtonText: 'OK',
      });
      return;
    }
    // if (row.amount == null || row.amount === '' || row.amount <= 0) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Missing Amount',
    //     text: 'Please enter a valid amount before saving.',
    //     confirmButtonColor: '#d33',
    //   });
    //   row.amountError = 'Amount is Required';
    //   return;
    // }
    // if (row.amount > row.totalAmount) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Invalid Amount',
    //     html: '<strong>Actual Amount</strong> cannot exceed <strong>Total Amount</strong>.',
    //     confirmButtonColor: '#d33',
    //   });

    //   return;
    // }
    // if (row.comment == null || row.comment === '') {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Missing Comment.',
    //     text: 'Please enter a comment before saving.',
    //     confirmButtonColor: '#d33',
    //   });
    //   row.commentError = 'comment is Required';
    //   return;
    // }

    console.log("row data : ", row);
    const payload = [{
      employeeId: row.employeeSequenceNo,
      payPeriod: row.payperiod,
      totalAmount: row.totalAmount,
      claimedAmount: row.totalAmount,
      billFlag: row.received ? 1 : 0,
      processedFlag: row.processed ? 1 : 0,
      comment: row.comment,
      createdBy: this.userId,
    }];
    console.log("payload : ", payload);
    this.isLoading = true;

    this.authService.postFuelData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log("post fule data responce : ", res);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `The claimed data for Employee ID ${row.employeeSequenceNo} has been submitted successfully`,
        });
        this.loadFuelData(this.selectedMonthValue);
      },
      error: (err: HttpErrorResponse) => {
        console.error("post fuel data error : ", err);
        this.isLoading = false;
      }
    });
  }

  edit(row: any) {
    const amount = row.claimedAmount;
    console.log(row.amount)
    const billFlag = row.billFlag;
    const comments = row.comments;
    row.amount = amount;
    row.received = billFlag == 1 ? true : false;
    row.comment = comments;
    row.claimedAmount = 'NA'
    row.billFlag = 'NA'

    this.cdr.detectChanges();
  }

  validateAmount(row: any) {
    if (row.amount > row.totalAmount) {
      row.amountError = 'Amount too high';
    } else {
      row.amountError = '';
    }
  }


  allowOnlyNumbers(event: KeyboardEvent, currentValue: string, totalValue: string) {
    const char = event.key;

    if (!/^\d$/.test(char)) {
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      return;
    }

    if (currentValue > totalValue) {
      event.preventDefault();
    }
  }

  clearCommentError(row: any) {
    if (row.commentError) {
      row.commentError = '';
    }
    // if(row.comment == '') {
    //   row.commentError = 'comment is required'
    // }
  }

  // reset() {
  //   this.rows.forEach(row => {
  //     row.amount = '';
  //     row.amountError = '';
  //     row.received = false;
  //     row.comment = ''
  //   });
  // }

  downloadExcel() {
    if (this.rows.length == 0) {
      Swal.fire({
        icon: 'question',
        title: 'Warning',
        text: `No data to download excel.!`,
      });
      return;
    }
    const exportData = this.rows.map(item => ({
      'Pay Period': this.selectedMonthName,
      'Employee Sequence No': item.employeeSequenceNo,
      'Employee Name': item.employeeName,
      'Department Name': item.deptName,
      'Designation': item.desgName,
      // 'Effective Date': item.effectiveDate,
      'Fuel & Maintenance': item.fuelAndMaintenance,
      'Driver Salary': item.driverSalary,
      'Total Amount': item.totalAmount,
      'Claimed Amount': this.getClaimedAmount(item.claimedAmount),
      'Bill Status': this.getBillStatus(item.billFlag),
      'Comments': this.getClaimedAmount(item.comments),
      'Status Recieved Date': this.getReceiveDate(item),
      "Processed Date": item.processedDate
    }));

    const header = Object.keys(exportData[0]);
    const data = exportData.map(obj => Object.values(obj));

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...data]);

    header.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      const cell = ws[cellAddress];
      if (cell) {
        cell.s = {
          fill: {
            fgColor: { rgb: 'FFFF00' }
          },
          font: {
            bold: true
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }
        };
      }
    });

    ws['!cols'] = header.map(h => ({ wch: h.length + 10 }));

    const wb: XLSX.WorkBook = {
      Sheets: { 'Fuel Data': ws },
      SheetNames: ['Fuel Data']
    };

    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    this.saveAsExcelFile(excelBuffer, 'Fuel_Data');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  highlightMatch(text: string): SafeHtml {
    if (!this.searchQueryText || !text) return text;
    const escaped = this.searchQueryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const highlighted = String(text).replace(regex, `<span class="text-primary fw-bold">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  getAbbreviation(text: string): string {
    if (!text) return '';
    return text
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  getEmployeeDisplay(name: string): string {
    if (!name) return '';

    const words = name.trim().split(/\s+/);

    if (words.length == 1 && words[0].length > 15) {
      return words[0].slice(0, 15);
    }

    const firstTwo = words.slice(0, 2).join(' ');

    if (firstTwo.length > 15) {
      return firstTwo.slice(0, 15);
    }

    return firstTwo;
  }

  getEmployeeTooltip(name: string): string {
    if (!name) return '';

    const display = this.getEmployeeDisplay(name);

    if (name === display) {
      return '';
    }

    return name;
  }

  getCommentPreview(comment: string): string {
    if (!comment) return '';

    const words = comment.trim().split(/\s+/);

    if (words.length <= 3) {
      return comment;
    }

    return words.slice(0, 3).join(' ') + '...';
  }

  getBillStatus(flag: string): string {
    if (flag == '1') return 'Received';
    if (flag == '0') return 'Not Received';
    if (flag == 'NA') return '--';
    return '';
  }

  getReceiveDate(item: any): string {
    if (item.billFlag == '0') {
      return 'Bill Not Received';
    }
    return item.receivedDate || ''; // fallback if null/undefined
  }


  getClaimedAmount(value: any): string {
    return value == 'NA' ? '--' : value;
  }

  get paginatedRows() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredJobs.slice(start, end);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  get startIndex() {
    return this.totalRecords ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }


  saveAll() {

    const validRows = [];
    let hasError = false;

    this.rows.forEach(row => {
      if (!row.totalAmount) {
        return;
      }

      row.amountError = '';
      row.commentError = '';

      // if (row.amount <= 0) {
      //   row.amountError = 'Amount must be > 0';
      //   hasError = true;
      // } else if (row.amount > row.totalAmount) {
      //   row.amountError = 'Amount cannot exceed Total Amount';
      //   hasError = true;
      //   Swal.fire({
      //     icon: 'warning',
      //     title: 'Warning',
      //     text: `The entered amount cannot exceed the total amount. Please review all the data.`,
      //   });
      // }

      validRows.push(row);
    });

    if (hasError) {
      console.warn('Please fix the errors before submitting');
      return;
    }

    if (validRows.length === 0) {
      Swal.fire({
        icon: 'question',
        title: 'No Data',
        text: 'There is no data to claim.',
      });
      return;
    }
    this.submitAll(validRows);
  }

  submitAll(rows: any[]) {
    const payloads = rows
      .filter(row => row.received || row.processed && row.claimedAmount === "NA")
      .map(row => {
        return {
          employeeId: row.employeeSequenceNo,
          payPeriod: row.payperiod,
          totalAmount: row.totalAmount,
          claimedAmount: row.totalAmount,
          billFlag: row.received ? 1 : 0,
          processedFlag: row.processed ? 1 : 0,
          comment: row.comment || '',
          createdBy: this.userId,
        };
      });
    console.log('Submitting payloads:', payloads);

    if (payloads.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'There is no data to claim.',
      });
      this.isLoading = false;
      return;
    }
    Swal.fire({
      icon: 'question',
      title: 'Are you sure?',
      text: 'Do you want to submit the claimed data?',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'No, cancel',
    }).then(result => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.authService.postFuelData(payloads).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            console.log("post fuel data response: ", res);

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'The claimed data has been submitted successfully.',
            });

            this.loadFuelData(this.selectedMonthValue);
          },
          error: (err: HttpErrorResponse) => {
            console.error("error: ", err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  // confirm(row: any) {
  //   if (!row.processed) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Missing Processed field!',
  //       text: 'Please select processed before confirm.',
  //       confirmButtonColor: '#d33',
  //     });
  //     return;
  //   }

  //   const payload = {
  //     processedBy: this.userId,
  //     fuelDriverId: row.fuelDriverId
  //   }
  //   console.log("payload : ", payload);
  //   this.isLoading = true;
  //   this.authService.processFuelBill(payload).subscribe({
  //     next: (res: any) => {
  //       this.isLoading = false;
  //       row.processed = 1;
  //       row.processedDate = this.getTodayFormatted();
  //       // this.loadFuelData(this.selectedMonthValue);
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Success',
  //         text: `The processed data for Employee ID ${row.employeeSequenceNo} has been submitted successfully`,
  //       });
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error(err)
  //     }
  //   })
  // }

  // saveAllChecked() {
  //   const payloads = this.rows
  //     .filter(row => row.processed === true || row.received === true)
  //     .map(row => ({
  //       employeeId: row.employeeSequenceNo,
  //       fuelDriverId: row.fuelDriverId,
  //       payPeriod: row.payperiod,
  //       totalAmount: row.totalAmount,
  //       claimedAmount: row.claimedAmount,
  //       billFlag: row.received ? 1 : 0,
  //       processedFlag: row.processed ? 1 : 0,
  //       comment: row.comment || '',
  //       createdBy: this.userId
  //     }));

  //   if (payloads.length === 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'No Data',
  //       text: 'There is no processed data to save.'
  //     });
  //     return;
  //   }

  //   console.log('Payloads:', payloads);

  //   Swal.fire({
  //     icon: 'question',
  //     title: 'Are you sure?',
  //     text: 'Do you want to submit the Processed data?',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, submit',
  //     cancelButtonText: 'No, cancel',
  //   }).then(result => {
  //     if (result.isConfirmed) {


  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Success',
  //         text: 'The claimed data has been submitted successfully.',
  //       });


  //     }
  //   });

  // }

  onBillFlagChange(event: Event, row: any): void {
    const checkbox = event.target as HTMLInputElement;
    console.log("row data : ", row)

    if (row.claimedAmount === row.totalAmount) {
      checkbox.checked = row.received;
      Swal.fire({
        icon: 'question',
        title: 'Are you sure?',
        text: `Are you sure you want to mark ${row.employeeSequenceNo} as received?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'No, cancel',
        allowOutsideClick: true,
        allowEscapeKey: true,
      }).then(result => {
        if (result.isConfirmed) {
          checkbox.checked = true;
          const payload = {
            processedBy: this.userId,
            fuelDriverId: row.fuelDriverId,
            "receivedFlag": true
          }
          console.log("payload : ", payload);
          this.authService.processFuelBill(payload).subscribe({
            next: (res: any) => {
              this.isLoading = false;
              row.billFlag = 1;
              row.received = false;
              console.log("post fule data responce : ", res);
              // Swal.fire({
              //   icon: 'success',
              //   title: 'Success',
              //   text: `The claimed data for Employee ID ${row.employeeSequenceNo} has been submitted successfully`,
              // });
              // this.loadFuelData(this.selectedMonthValue);
            },
            error: (err: HttpErrorResponse) => {
              console.error("post fuel data error : ", err);
              this.isLoading = false;
              row.received = false;
            }
          });
        } else {
          console.log("Cancelled or backdrop clicked");
          row.received = false;
          checkbox.checked = false;
        }
      });

    } else {
      checkbox.checked = row.received;
      console.log("Row data: ", row);
    }
  }

  onProcessedFlagChange(event: Event, row: any): void {
    const checkbox = event.target as HTMLInputElement;
    console.log("row data : ", row)

    if (row.claimedAmount === row.totalAmount) {
      checkbox.checked = row.processed;
      Swal.fire({
        icon: 'question',
        title: 'Are you sure?',
        text: `Are you sure you want to mark ${row.employeeSequenceNo} as processed?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'No, cancel',
        allowOutsideClick: true,
        allowEscapeKey: true,
      }).then(result => {
        if (result.isConfirmed) {
          console.log("Confirmed");
          checkbox.checked = true;
          const payload = {
            processedBy: this.userId,
            fuelDriverId: row.fuelDriverId,
            "receivedFlag": false
          }
          console.log("payload : ", payload);
          this.isLoading = true;
          this.authService.processFuelBill(payload).subscribe({
            next: (res: any) => {
              this.isLoading = false;
              row.processedFlag = 1;
              row.processedDate = this.getTodayFormatted();
              row.processed = false;
              // this.loadFuelData(this.selectedMonthValue);
              // Swal.fire({
              //   icon: 'success',
              //   title: 'Success',
              //   text: `The processed data for Employee ID ${row.employeeSequenceNo} has been submitted successfully`,
              // });
            },
            error: (err: HttpErrorResponse) => {
              console.error(err);
              this.isLoading = false;
              row.processed = false;
            }
          })
        } else {
          console.log("Cancelled or backdrop clicked");
          // row.billFlag = 0;
          row.processed = false;
          checkbox.checked = false;
        }
      });

    } else {
      checkbox.checked = row.received;
      console.log("Row data: ", row);
    }
  }

  getTodayFormatted(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'NA') return '';

    const [dd, mm, yyyy] = dateStr.split('-');
    const months = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = months[parseInt(mm, 10)];
    return `${dd}-${monthName}-${yyyy}`;
  }

}
