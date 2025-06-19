import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-birthdays',
  templateUrl: './birthdays.component.html',
  styleUrls: ['./birthdays.component.sass']
})
export class BirthdaysComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  birthdayList: any;
  myDate: any;
  latest_dateFormtd: any;  

  selected_month: any;
  selectMonth: any;
  isBday: any;  
  noBday: any;
  isBdayy: any;

  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  public isLoading :boolean = true;
   
  constructor(private authService: AuthService, public router: Router, 
    public datepipe: DatePipe, public dom:DomSanitizer) { }


  public options: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  callDOB(e: any) {
    // console.log(e.target.value) 
    this.selected_month = e.target.value; 
    this.latest_dateFormtd = this.selected_month ; 
    this.getapiData();
  }


  // showing Current month Bdays on page load
  loadCurrntMonth() {
    this.selected_month = this.latest_dateFormtd;
    this.selectMonth = this.latest_dateFormtd;
  }



  ngOnInit(): void {
    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    // getting Device Type of user loggedIn
    //let device = atob(localStorage.getItem('applction')); 
    let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));
    this.deviceInfo = JSON.parse(device).deviceInfo;

    // passing empObj to getApiData()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = this.emp[0];
    let emp = [{ 'empID': "" + this.userData.user.empID + "", "application": this.deviceInfo.deviceType }];
    this.emp_Obj =  emp[0];
    this.getapiData();

    //this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');// initiate date language 'english'
    this.latest_dateFormtd = moment(this.myDate).format( 'MMM');  

    this.loadCurrntMonth();

    // no user in session navigate to login 
    if (this.loggedUser == null || this.loggedUser == undefined) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }


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

  } //End - ngOnInIt 


  getapiData() {
    this.isLoading = true;
    //++++++++ Birthday List api +++++++++++
    this.authService.birthdaylist(this.emp_Obj).subscribe(
      (res) => {
        this.birthdayList = res.Birthdaylist;
        // console.log(this.birthdayList)
        this.isLoading = false; 
        for (let i = 0; i < this.birthdayList.length; i++) {
          if (this.birthdayList[i].filtermonth == this.latest_dateFormtd) {
            this.isBday = 1; 
          }
          else {
            this.noBday = 0;
            // console.log("no bdays")
          }
        }
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      })
  };




}
