
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router,NavigationEnd } from '@angular/router';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
@Component({
  selector: 'app-business-unit-attendance',
  templateUrl: './business-unit-attendance.component.html',
  styleUrls: ['./business-unit-attendance.component.sass']
})
export class BusinessUnitAttendanceComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  empData: any;

  myDate: any;
  today_date: any;
  emp: any = [];
  empObj: any;
  constructor(public router: Router, public datepipe: DatePipe) { }

  ngOnInit(): void {
    //this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);    
    this.empData = this.userData.user;

    // passing empObj to getApiData()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = this.emp[0];

     // today date 
     //this.myDate = atob(localStorage.getItem('currentDate')); 
     this.myDate =decodeURIComponent(window.atob(localStorage.getItem('currentDate')));; 
     moment.locale('en');

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

}
