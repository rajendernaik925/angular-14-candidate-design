import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-department-info',
  templateUrl: './department-info.component.html',
  styleUrls: ['./department-info.component.sass']
})
export class DepartmentInfoComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  departmentList: any;
  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  myDate: any;
  today_date: any;
  public isLoading:boolean = true; 
  public searchText:any;
  imgBaseURL:any;
  constructor(private authService: AuthService, public router: Router,public datepipe: DatePipe) { }

  ngOnInit(): void {
    //this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));;
    this.userData = JSON.parse(this.loggedUser);

     // getting Device Type of user loggedIn
     //let device = atob(localStorage.getItem('applction')); 
     let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));; 
     this.deviceInfo = JSON.parse(device).deviceInfo;

    // passing empObj to getApiData()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = this.emp[0];
    let emp = [{ 'empID': "" + this.userData.user.empID + "", "application": this.deviceInfo.deviceType }];
    this.emp_Obj =  emp[0];
    this.getapiData();



   // today date 
   this.myDate = atob(localStorage.getItem('currentDate')); 

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
  //++++++++ leave quota api +++++++++++
  this.authService.department(this.emp_Obj).subscribe(
    (res) => {
      this.departmentList = res.department;
      // console.log(this.departmentList)
      this.imgBaseURL= this.authService.imgbase;  

      this.isLoading = false;
    });
  }
}
