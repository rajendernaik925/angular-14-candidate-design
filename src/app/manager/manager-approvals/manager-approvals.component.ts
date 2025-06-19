import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-manager-approvals',
  templateUrl: './manager-approvals.component.html',
  styleUrls: ['./manager-approvals.component.sass']
})
export class ManagerApprovalsComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  isMngr:any;
  assmntAccess: any;
  Ryts:any;
  authBoolean:boolean;
  constructor(public router: Router,private authService: AuthService, public datepipe: DatePipe) { }

  ngOnInit(): void {
    //this.isMngr= JSON.parse(atob(localStorage.getItem('userData'))).Manger[0].is_MANAGER;
    this.isMngr= JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('userData')))).Manger[0].is_MANAGER;
    if(this.isMngr == 'N'){     
      this.router.navigate(['/errorPage', {isManager: this.isMngr}]);  
    } 
    // let y = atob(localStorage.getItem('privileges'));
    // this.Ryts =   JSON.parse(y).Rights;    
    // this.authBoolean=false;
    // for (let i = 0; i < this.Ryts.length; i++) {   
    //   if(this.Ryts[i].HRActions == "true"){ 
    //     this.authBoolean=true;
    //   }
    // }  
    // if(this.authBoolean== false){
    //   if(this.isMngr == 'N'){     
    //     this.router.navigate(['/errorPage', {isManager: this.isMngr}]);  
    //   } 
    // }
    // assessment_accesslink
   // this.assmntAccess =JSON.parse(atob(localStorage.getItem('othrPrevlgs'))).access;
    this.assmntAccess =JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('othrPrevlgs')))).access; 

    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj =  emp[0]; 
    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
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

  } //End - ngOnInIt 

  getApiData(){
    // this.authService.assessment_accesslink(this.empObj).subscribe(
    //   (res)=>{ 
    //       this.assmntAccess= res.access;
    //   });  
  }
 

}
