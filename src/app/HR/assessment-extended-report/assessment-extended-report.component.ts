import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import * as XLSX from 'xlsx'; 
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
@Component({
  selector: 'app-assessment-extended-report',
  templateUrl: './assessment-extended-report.component.html',
  styleUrls: ['./assessment-extended-report.component.sass']
})
export class AssessmentExtendedReportComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  assmntData:any;
  isData:any;
  isLoading:boolean;
  authBoolean:boolean
  privil_eges:any= {}; 
  fileName= 'Assessment_Extended_Report.xlsx';
  constructor(  private authService: AuthService,public router: Router) { }

  ngOnInit(): void {
    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    //let x = atob(localStorage.getItem('privileges'));
    let x =decodeURIComponent(window.atob(localStorage.getItem('privileges')));;
    this.privil_eges =   JSON.parse(x).Rights;  
    // console.log(this.privil_eges)
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];

    this.getApiData();



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
  //End of ngOninit

getApiData(){
  this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Assessment_Extended_Report == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }


  this.isLoading = true;   
  this.authService.assesment_extendreport(this.empObj).subscribe(
    (res)=>{   
      this.isLoading = false;
      // console.log(res)
      this.assmntData = res.assesementextendreport; 
      this.isData = this.assmntData.length; 
    })
}

 exportexcel(): void {
   /* table id is passed over here */   
   let element = document.getElementById('assmnt_Table'); 
   const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

   /* generate workbook and add the worksheet */
   const wb: XLSX.WorkBook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

   /* save to file */
   XLSX.writeFile(wb, this.fileName);  
}

}
