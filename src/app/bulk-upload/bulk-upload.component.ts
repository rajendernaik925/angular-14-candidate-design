import { Component, OnInit, Renderer2, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'; 
@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.sass', './bulk-upload.component.css']
})
export class BulkUploadComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;

  default: "--Select --";
  fileForm: FormGroup;
  isDisable: boolean;
  privil_eges: any = {};
  isData: any;
  showError: boolean;
  public submitted: boolean;
  selectedFileType: any = '';
  csvError: string | null = null;
  isLoading: boolean = false;
  jsonFileData: any = null;
  fileToUpload: File | null = null;
  employeeData: any;
  uploadUrl: string = ''; // URL extracted from JSON

  fileSelected: boolean = false;
  fileName: string;
  payPeriods: string[] = ['UAN Number', 'PF', 'ESI'];
  selectedPayPeriod: string = '';
  selectedFileName: string = '';
  isFileSelected: boolean = false;
  selectedFile: File | null = null;
  employeData: any;
  responseData: any[] = [];
  //empFileName: any;
  empFileName: any = []; // ✅ Ensure it's an array
  showInputFile: boolean = false
  ifSelectNewFile: boolean = false
  empID: any; selectedEmployees: Set<any> = new Set();
  employePf: any;
  empolyeESi: any;
  selectedEmployeesPF: Set<unknown>;
  isShowtable: boolean = false
  employeUANData: { employeeSequenceNo: string; pfuan: string; }[];
  isChecked: any;
  placeholder: 'No file chosen';
  empFile: void;
  UanTotalCount: any;
  UanTotalCountRemark: any;
  newUanCount: any;
  newUanCounts: any;
  correctionUanCount: any;
  exitedUanCount: any;
  TotalCountRemark: number;
  newCount: number;
  correctionCount: number;
  exitedCount: number;
  invalidEmployee: number;
  isUploadDisabled = false;
  Ryts: any = {};
  authBoolean: boolean
  isSelected(employee: any): boolean {
    return this.selectedEmployees.has(employee);
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    public authService: AuthService,
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef) { }

  @ViewChild('fileInput') fileInput: any;
  ngOnInit(): void {
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    this.empID = this.userData.user.empID
    console.log("this.empID", this.empID)
    console.log("this.userData", this.userData)

    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.Ryts = JSON.parse(x).Rights;



    this.authBoolean = false;
    for (let i = 0; i < this.Ryts.length; i++) {
      if (this.Ryts[i].bulkupload == "true" || this.Ryts[i].parent == "1") {
        this.authBoolean = true;
      }
    }
    if (this.authBoolean == false) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
    }

    this.fileForm = this.fb.group({
      fileType: ['', Validators.required],
      filename: this.selectedFile
    })

    // no user in session navigate to login 
    if (this.loggedUser == null || this.loggedUser == undefined) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    //after routing page load at top
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });



  }



  toggleAllRemarks(event: any) {
    const isChecked = event.target.checked;
    this.responseData.forEach(employe => {
      if (employe.remark === 'New' || employe.remark === 'Correction') {
        employe.isSelected = isChecked;
      }
    })
  }



  moveToHrms() {
    const selectedEmployees = this.responseData.filter(employee => employee.isSelected);

    if (selectedEmployees.length > 0) {
      const formData = selectedEmployees.map(employee => {
        if (this.selectedFileType === 'UAN') {
          return {
            employeeSequenceNo: employee.employeeid,
            pfuan: employee.pfuan,
            createdby: this.empID
          };
        } else if (this.selectedFileType === 'PF') {
          return {
            employeeSequenceNo: employee.employeeid,
            pfno: employee.pfno,
            createdby: this.empID
          };
        } else if (this.selectedFileType === 'ESI') {
          return {
            employeeSequenceNo: employee.employeeid,
            esino: employee.esino,
            createdby: this.empID
          };
        }
        return null; // Return null if no valid file type is selected
      }).filter(data => data !== null); // Remove null values from the array

      if (formData.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'No employees match the selected file type!',
        });
        return;
      }
      
      console.log("move form data", formData);
      console.log("this.selectedFileType", this.selectedFileType);
     //  return;
      console.log("move form data", formData);
      this.authService.getBulkMove(formData, this.selectedFileType).subscribe(
        response => {
          console.log('Response:', response);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Successfully moved!',

          });
          this.onOptionsSelected({ target: { value: this.selectedFileType } });
        },
        error => {
          console.error('Error:', error);

          let errorMessage = 'There was an error in moving!';
          if (error?.error?.message) {
            if (error.error.message === "duplicate employees found.") {
              errorMessage = 'Duplicate employees found. Please review the selection!';
            } else {
              errorMessage = error.error.message; // Show the actual error from the API
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'No employees selected!',
      });
    }
  }



  onOptionsSelected(event: any) {
    
    this.isFileSelected = true;
    this.selectedFileType = event.target.value;
    console.log("this.selectedFileType", this.selectedFileType)
    // Reset file selection when type changes
    this.selectedFile = null;
    this.selectedFileName = '';
    this.isFileSelected = true;

    // Reset file input field in the DOM
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.isShowtable = true;    
    this.isLoading = true;
    this.responseData = [];
    this.authService.getFileType(this.selectedFileType).subscribe({
      next: (data: any) => {
        this.isLoading = false;

        console.log("API Response:", data);
        this.responseData = [];
        if (this.selectedFileType === 'UAN') {

          this.responseData = data.employeeuan;
          console.log("this.responseDataUAN", this.responseData);
          this.TotalCountRemark = this.responseData.length;
          this.newCount = this.responseData.filter(emp => emp.remark === "New").length;
          this.correctionCount = this.responseData.filter(emp => emp.remark === "Correction").length;
          this.exitedCount = this.responseData.filter(emp => emp.remark === "Existed").length;
          this.invalidEmployee = this.responseData.filter(emp => emp.remark === "Invalid employeeid").length
          console.log("this.newUanCounts", this.newUanCounts);

        }
        else if (this.selectedFileType === 'PF') {

          this.responseData = data.employeepf;
          console.log("pf data",this.responseData)
          this.TotalCountRemark = this.responseData.length;
          this.newCount = this.responseData.filter(emp => emp.remark === "New").length;
          this.correctionCount = this.responseData.filter(emp => emp.remark === "Correction").length;
          this.exitedCount = this.responseData.filter(emp => emp.remark === "Existed").length;
          this.invalidEmployee = this.responseData.filter(emp => emp.remark === "Invalid employeeid").length
          console.log("this.newUanCounts", this.newUanCounts);

        }
        else if (this.selectedFileType === 'ESI') {

          this.responseData = data.empolyeesi;
          this.TotalCountRemark = this.responseData.length;
          this.newCount = this.responseData.filter(emp => emp.remark === "New").length;
          this.correctionCount = this.responseData.filter(emp => emp.remark === "Correction").length;
          this.exitedCount = this.responseData.filter(emp => emp.remark === "Existed").length;
          this.invalidEmployee = this.responseData.filter(emp => emp.remark === "Invalid employeeid").length
          console.log("this.newUanCounts", this.newUanCounts);
        }

        console.log(" this.responseData", this.responseData);



        console.log("this.empolyeESi", this.empolyeESi);
        console.log("this.employePf", this.employePf);
        console.log("file name", data.fileStorageData);
        this.empFileName = data.fileStorageData;
        this.empFile = this.empFileName.filename
        console.log("this.placeholder", this.placeholder);
        console.log("emp file length", this.empFileName.length);

        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.responseData = []
      }
    });
  }
  onFileSelected(event: any) {
    if (!this.selectedFileType || this.selectedFileType === 'select') {
      Swal.fire({
        icon: 'warning',
        title: 'Select File Type',
        text: 'Please select a file type before attaching a file.',
      });

      // Reset file input to prevent accidental selection
      event.target.value = '';
      return;
    }
    this.isUploadDisabled = true;
    const file = event.target.files[0];
    this.selectedFile = file;
    if (this.selectedFile == undefined) {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.onOptionsSelected({ target: { value: this.selectedFileType } });
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
    console.log("onFileSelected", this.selectedFile)
    this.isFileSelected = true;
    console.log("this.selectedFile", this.selectedFile)
    this.selectedFileName = file.name;
    console.log("file", file)
    if (file) {

      // this.empFileName.push({ filename: file.name });

      if (!Array.isArray(this.empFileName)) {
        this.empFileName = [];  // Reinitialize if undefined or not an array
      }

      this.empFileName.push({ filename: file.name });

      this.selectedFileName = file.name;
      this.placeholder = file.name;
      this.isFileSelected = true;
      this.isUploadDisabled = true;
      this.isFileSelected = true;
      console.log("Selected file:", file.name);
      this.cdr.detectChanges(); // Ensure the view updates
    }
    else {
      this.selectedFileName = '';
      this.placeholder = 'No file chosen';
      this.isFileSelected = false;
      this.isUploadDisabled = false;
      this.isFileSelected = false;
    }
  }

  downloadExcelFormat() {
    // Check if a file type has been selected
    if (!this.selectedFileType) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Type Selected',
        text: 'Please select a file type to download.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Call API to get the file format
    this.authService.getDownLoadFormat(this.selectedFileType, { responseType: 'blob' }).subscribe({
      next: (data: Blob) => {
        console.log("Download API Response:", data);

        // Ensure valid data is received
        if (!data || data.size === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Download Error',
            text: 'Received empty file. Please check the server response.',
            confirmButtonText: 'OK'
          });
          return;
        }

        let mimeType = 'application/vnd.ms-excel'; // Default MIME type
        let fileExtension = 'xls'; // Default file extension

        // Set MIME type and file extension based on the selected file type
        switch (this.selectedFileType.toUpperCase()) {
          case 'xls':
            mimeType = 'application/vnd.ms-excel';
            fileExtension = 'xls';
            break;
          case '(xlsx)':
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileExtension = 'xlsx';
            break;



        }

        // Create the blob and trigger the download
        const blob = new Blob([data], { type: mimeType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${this.selectedFileType}.${fileExtension}`;
        document.body.appendChild(link); // Append to the body
        link.click();
        document.body.removeChild(link); // Remove after click

        // Clean up the URL object
        window.URL.revokeObjectURL(link.href);
      },
      error: (error) => {
        console.error('Download error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'An error occurred while downloading the file. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  getThirdHeader(): string {
    return this.selectedFileType === 'PF'
      ? 'PF Number'
      : this.selectedFileType === 'ESI'
        ? 'ESI Number'
        : 'PFUAN';
  }

  //  Validate headers
  validateHeaders(expected: string[], actual: string[]): boolean {
    return expected.every((header, index) => header === actual[index]);
  }

  //  Validate if a value is a number (allows leading zeros)
  isValidNumber(value: any): boolean {
    return /^[0-9]+$/.test(value);
  }

  //  Validate if a value is a string (only alphabets)
  isValidString(value: any): boolean {
    return /^[A-Za-z\s]+$/.test(value);
  }

  //  Validate UAN, PF, and ESI format
  validateUanPfEsiFormat(value: any): boolean {
    if (!value) return false;
    console.log("value", value)
    // Convert to string, remove hidden characters, and trim spaces
    value = value.toString().trim().replace(/[\u200B-\u200D\uFEFF\s]+/g, '');
    console.log(`Processed value: ${value}`);  // Debugging the value

    if (this.selectedFileType === 'UAN') {
      return /^[0-9]{12}$/.test(value);
    } else if (this.selectedFileType === 'PF') {
      const newPFRegex = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}[0-9]{10}$/;
      console.log("newPFRegex", newPFRegex)
      const isValid = newPFRegex.test(value);
      console.log(`Is PF valid: ${isValid}`);
      return isValid;
    } else if (this.selectedFileType === 'ESI') {
      return /^[0-9]{10}$/.test(value);
    }
    return false;
  }




  // onFileUpload(): void {
  //   console.log("file uploaded");
  //   if (!this.selectedFile) {
  //     this.csvError = "No file selected.";
  //     return;
  //   }

  //   const fileName = this.selectedFile.name;
  //   const fileExtension = fileName.split(".").pop()?.toLowerCase();
  //   console.log("fileExtension", fileExtension);

  //   // Validate file type (CSV or Excel)
  //   if (!["csv", "xls", "xlsx"].includes(fileExtension!)) {
  //     Swal.fire("Please upload a valid CSV or Excel file.");
  //     return;
  //   }

  //   this.csvError = ""; // Reset errors
  //   const reader = new FileReader();

  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: "array" });

  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];

  //     // Convert sheet to JSON
  //     const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  //     // Validate headers
  //     const fileHeaders = (rows[0] || []).map((h) => h.toString().trim().toLowerCase());
  //     const expectedHeaders = ["id", "member name", this.getThirdHeader().toLowerCase()];

  //     if (!this.validateHeaders(expectedHeaders, fileHeaders)) {
  //       Swal.fire("Invalid headers. Expected headers are: " + expectedHeaders.join(", "));
  //       return;
  //     }

  //     // Validate each row & Check for Duplicates
  //     let duplicateRows: number[] = [];
  //     let uniqueEntries = new Set();

  //     for (let i = 1; i < rows.length; i++) {
  //       const row = rows[i];
  //       const id = row[0]?.toString().trim();
  //       const memberName = row[1];
  //       const thirdHeaderValue = row[2]?.toString().trim();

  //       // Validate ID
  //       if (!this.isValidNumber(id)) {
  //         Swal.fire(`Invalid data at row ${i + 1}: ID should be a number.`);
  //         return;
  //       }

  //       // Validate Member Name
  //       if (!this.isValidString(memberName)) {
  //         Swal.fire(`Invalid data at row ${i + 1}: MEMBER NAME should be a string.`);
  //         return;
  //       }

  //       // Validate UAN/PF/ESI format
  //       if (!this.validateUanPfEsiFormat(thirdHeaderValue)) {
  //         Swal.fire(`Invalid data at row ${i + 1}: ${expectedHeaders[2]} format is incorrect.`);
  //         return;
  //       }

  //       // Check for duplicate ID or UAN/PF/ESI
  //       const uniqueKey = `${id}-${thirdHeaderValue}`;
  //       if (uniqueEntries.has(uniqueKey)) {
  //         duplicateRows.push(i + 1);
  //       } else {
  //         uniqueEntries.add(uniqueKey);
  //       }
  //     }

  //     // Show Alert for Duplicates
  //     if (duplicateRows.length > 0) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Duplicate Entries Found",
  //         text: `Duplicate entries found at rows: ${duplicateRows.join(", ")}`,
  //       });
  //       return;
  //     }

  //     // Proceed with Upload
  //     const formData = new FormData();
  //     formData.append("type", this.selectedFileType);
  //     formData.append("uploadedBy", this.empID);
  //     formData.append("file", this.selectedFile);

  //     return;
  //     this.isLoading = true;
  //     this.authService.uploadedFile(formData).subscribe({
  //       next: (response) => {
  //         this.isLoading = false;
  //         this.isUploadDisabled = true;
  //         console.log("response", response);

  //         if (response.message && response.message.includes("already exists")) {
  //           Swal.fire({
  //             icon: "info",
  //             title: "Duplicate Entry",
  //             text: "This file has already been uploaded.",
  //           });
  //         } else {
  //           Swal.fire("File uploaded successfully!", "", "success");

  //           // Clear file input after upload
  //           this.selectedFile = null;
  //           this.selectedFileName = "";
  //           this.onOptionsSelected({ target: { value: this.selectedFileType } });
  //           const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  //           if (fileInput) fileInput.value = "";
  //         }
  //       },
  //       error: (error) => {
  //         this.isLoading = false;
  //         console.error("Upload failed:", error);

  //         if (error.error && error.message.includes("No PF employee financial details found")) {
  //           Swal.fire({
  //             icon: "warning",
  //             title: "No Data Found",
  //             text: "No PF employee financial details found for this file type.",
  //           });
  //         } else {
  //           Swal.fire({
  //             icon: "error",
  //             title: "Upload Failed",
  //             text: error.message || "An unexpected error occurred. Please try again.",
  //           });
  //         }
  //       },
  //     });
  //   };

  //   reader.readAsArrayBuffer(this.selectedFile);
  // }

  onFileUpload(): void {
    console.log("File uploaded");

    if (!this.selectedFile) {
      this.csvError = "No file selected.";
      return;
    }

    const fileName = this.selectedFile.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (!["csv", "xls", "xlsx"].includes(fileExtension!)) {
      Swal.fire("Please upload a valid xlsx or xls");
      return;
    }

    this.csvError = "";
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      //  Check if the file only contains headers (no data)
      if (rows.length <= 1 || rows.slice(1).every(row => row.every(cell => !cell || cell.toString().trim() === ""))) {
        Swal.fire({
          icon: "error",
          title: "Empty Data",
          text: "The uploaded file contains only headers or empty rows. Please provide valid data.",
        });
        this.selectedFile = null;
        this.selectedFileName = "";
        this.onOptionsSelected({ target: { value: this.selectedFileType } });
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return;
      }

      // Validate headers
      const fileHeaders = (rows[0] || []).map((h) => h.toString().trim().toLowerCase());
      const expectedHeaders = ["id", "member name", this.getThirdHeader().toLowerCase()];

      if (!this.validateHeaders(expectedHeaders, fileHeaders)) {
        Swal.fire("Invalid headers. Expected headers are: " + expectedHeaders.join(", "));
        this.selectedFile = null;
        this.selectedFileName = "";
        this.onOptionsSelected({ target: { value: this.selectedFileType } });
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return;
      }

      let duplicateEntries: any[] = [];
      let idMap = new Map<string, any[]>();
      let pfuanMap = new Map<string, any[]>();

      let emptyRows: number[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        const id = row[0]?.toString().trim();
        const memberName = row[1];
        let thirdHeaderValue = row[2]?.toString().trim();

        // Ensure PFUAN/PF/ESI is treated as a string to avoid scientific notation issues
        if (!isNaN(Number(thirdHeaderValue))) {
          thirdHeaderValue = Number(thirdHeaderValue).toString();
        }

        //  Check for empty data in any required column
        if (!id || !memberName || !thirdHeaderValue) {
          emptyRows.push(i + 1);
          continue; // Skip further validation for this row
        }

        // Validate ID
        if (!this.isValidNumber(id)) {
          Swal.fire(`Invalid data at row ${i + 1}: ID should be a number.`);
          this.selectedFile = null;
          this.selectedFileName = "";
          this.onOptionsSelected({ target: { value: this.selectedFileType } });
          const fileInput = document.getElementById("fileInput") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          return;
        }

        // Validate Member Name
        if (!this.isValidString(memberName)) {
          Swal.fire(`Invalid data at row ${i + 1}: MEMBER NAME should be a string.`);
          this.selectedFile = null;
          this.selectedFileName = "";
          this.onOptionsSelected({ target: { value: this.selectedFileType } });
          const fileInput = document.getElementById("fileInput") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          return;
        }

        // Validate PFUAN/PF/ESI format
        if (!this.validateUanPfEsiFormat(thirdHeaderValue)) {
          Swal.fire(`Invalid data at row ${i + 1}: ${expectedHeaders[2]} format is incorrect.`);
          this.selectedFile = null;
          this.selectedFileName = "";
          this.onOptionsSelected({ target: { value: this.selectedFileType } });
          const fileInput = document.getElementById("fileInput") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          return;
        }

        // Check for duplicate ID
        if (!idMap.has(id)) {
          idMap.set(id, []);
        }
        idMap.get(id)?.push({ rowNumber: i + 1, rowData: row });

        // Check for duplicate PFUAN/PF/ESI
        if (!pfuanMap.has(thirdHeaderValue)) {
          pfuanMap.set(thirdHeaderValue, []);
        }
        pfuanMap.get(thirdHeaderValue)?.push({ rowNumber: i + 1, rowData: row });
      }

      // Show Alert for Empty Rows
      if (emptyRows.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Empty Data Found",
          text: `Empty fields found at rows: ${emptyRows.join(", ")}. Please fill all required columns.`,
        });
        return;
      }

      // Collect all duplicates (if an ID or PFUAN/PF/ESI appears more than once)
      idMap.forEach((entries) => {
        if (entries.length > 1) {
          duplicateEntries.push(...entries);
        }
      });

      pfuanMap.forEach((entries) => {
        if (entries.length > 1) {
          duplicateEntries.push(...entries);
        }
      });

      // Remove duplicate row entries in the final display
      const uniqueDuplicates = new Map();
      duplicateEntries.forEach((entry) => {
        uniqueDuplicates.set(entry.rowNumber, entry);
      });
      duplicateEntries = Array.from(uniqueDuplicates.values());

      // Show Alert for Duplicate Entries
      if (duplicateEntries.length > 0) {
        let duplicateTable = `
          <table border="1" style="width:100%; text-align:left; border-collapse: collapse;">
            <tr>
              <th style="padding: 5px;">Row</th>
              ${fileHeaders.map(header => `<th style="padding: 5px;">${header.toUpperCase()}</th>`).join('')}
            </tr>
            ${duplicateEntries
            .map(
              (entry) => `
                <tr>
                  <td style="padding: 5px;">${entry.rowNumber}</td>
                  ${entry.rowData.map((cell: any) => `<td style="padding: 5px;">${cell || ''}</td>`).join('')}
                </tr>`
            )
            .join('')}
          </table>`;

        Swal.fire({
          icon: "warning",
          title: "Duplicate Entries Found",
          html: `The following duplicate entries for ID and <b>${this.selectedFileType}</b> were found:<br><br>${duplicateTable}`,
          width: 'auto',
        });
        this.selectedFile = null;
        this.selectedFileName = "";
        this.onOptionsSelected({ target: { value: this.selectedFileType } });
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        return;
      }

      // Proceed with Upload
      const formData = new FormData();
      formData.append("type", this.selectedFileType);
      formData.append("uploadedBy", this.empID);
      formData.append("file", this.selectedFile);

      this.isLoading = true;
      this.authService.uploadedFile(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isUploadDisabled = true;
          // console.log("response", response);
          //alert(response.status)
          // if (response.message && response.message.includes("already exists")) {
          //   Swal.fire({
          //     icon: "info",
          //     title: "Duplicate Entry",
          //     text: "This file has already been uploaded.",
          //   });
          // } else {
          //   Swal.fire("File uploaded successfully!", "", "success");

          //   this.selectedFile = null;
          //   this.selectedFileName = "";
          //   this.onOptionsSelected({ target: { value: this.selectedFileType } });
          //   const fileInput = document.getElementById("fileInput") as HTMLInputElement;
          //   if (fileInput) fileInput.value = "";
          // }
          if (response.status === "Validation Error") {
            Swal.fire({
              icon: 'warning',
              title: 'Validation Error',
              text: response.message,
            });
          } else if (response.status === "Unexpected Error") {
            Swal.fire({
              icon: 'error',
              title: 'Unexpected Error',
              text: response.message,
            });
          } else if (response.status === "File Processing Error") {
            Swal.fire({
              icon: 'error',
              title: 'File Processing Error',
              text: response.message,
            });
          } else if (response.status === "FAILURE") {
            Swal.fire({
              icon: 'error',
              title: 'Failure',
              text: response.message,
            });
          } else if (response.status === "SUCCESS") {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: response.message,
            });

            //  this.selectedFile = null;
            // this.selectedFileName = "";
            // this.onOptionsSelected({ target: { value: this.selectedFileType } });
            // const fileInput = document.getElementById("fileInput") as HTMLInputElement;
            //  if (fileInput) fileInput.value = "";

          } else {
            Swal.fire({
              icon: 'info',
              title: 'Unhandled Status',
              text: response.message,
            });

          }
          this.selectedFile = null;
          this.selectedFileName = "";
          this.onOptionsSelected({ target: { value: this.selectedFileType } });
          const fileInput = document.getElementById("fileInput") as HTMLInputElement;
          if (fileInput) fileInput.value = "";

        },
        error: (error) => {
          this.isLoading = false;
          console.error("Upload failed:", error);

          if (error.error && error.message.includes("No employee financial details found")) {
            Swal.fire({
              icon: "warning",
              title: "No Data Found",
              text: "No employee financial details found for this file type.",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Upload Failed",
              text: error.message || "An unexpected error occurred. Please try again.",
            });
          }
        },
      });
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }










}
