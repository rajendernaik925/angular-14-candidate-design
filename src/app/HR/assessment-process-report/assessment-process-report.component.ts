// import { stringify } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import * as XLSX from 'xlsx'; 
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-assessment-process-report',
  templateUrl: './assessment-process-report.component.html',
  styleUrls: ['./assessment-process-report.component.sass']
})
export class AssessmentProcessReportComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  assmntData:any;
  prcsdCls:any;
  isData:any;
  isLoading:boolean;
  authBoolean:boolean
  privil_eges:any= {};
  fileName= 'Assessment_Process_Report.xlsx';
  constructor(private authService: AuthService,public router: Router) { }
  
  ngOnInit(): void {
   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate =  decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
   // let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights;  
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];
    this.getapiData();



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
// End of ngOnInit 

getapiData(){  
  this.authBoolean=false;
  for (let i = 0; i < this.privil_eges.length; i++) {   
    if(this.privil_eges[i].Assessment_Approvals_Report == "true"){ 
      this.authBoolean=true;
    }
  }
  if(this.authBoolean== false){
    let x = 'false'; 
    this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
  }
 
  this.isLoading = true;
  this.authService.assesment_apprvlreport(this.empObj).subscribe(
    (res)=>{   
      this.isLoading = false; 
      this.assmntData = res.assesementapprovalreport;
      this.isData = this.assmntData.length;
      // console.log(this.isData)
  })
}
exportexcel(): void {
  // Get the table element by its ID
  let element = document.getElementById('assmnt_Table');

  // Check if the table element exists
  if (element) {
    // Convert the HTML table to a worksheet
    const ws = XLSX.utils.table_to_sheet(element);

    // Process each cell to format dates
    for (const cellAddress in ws) {
      if (ws.hasOwnProperty(cellAddress)) {
        const cell = ws[cellAddress];
        if (cell && typeof cell.v === 'string') {
          // Regular expression to match date format YYYY-MM-DD
          const dateMatch = /^\d{4}-\d{2}-\d{2}$/.test(cell.v);
          if (dateMatch) {
            // Parse the date string and format it as needed
            const date = new Date(cell.v);
            if (!isNaN(date.getTime())) { // Check if it's a valid date
              cell.v = XLSX.SSF.format('yyyy-mm-dd', date); // Format the date
            }
          }
        }
      }
    }

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Set a filename for the download
    const fileName = 'exported_data.xlsx'; // Set your file name here

    // Save the workbook to a file
    XLSX.writeFile(wb, fileName);
  } else {
    console.error('Table element not found');
  }
}

}
