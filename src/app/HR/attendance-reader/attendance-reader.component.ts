import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment'; 
import 'moment/locale/es' ;

@Component({
  selector: 'app-attendance-reader',
  templateUrl: './attendance-reader.component.html',
  styleUrls: ['./attendance-reader.component.sass']
})
export class AttendanceReaderComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  constructor(public router: Router) { }

  ngOnInit(): void {
   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    moment.locale('en');//

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
}
