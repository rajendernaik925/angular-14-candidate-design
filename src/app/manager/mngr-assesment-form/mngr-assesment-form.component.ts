import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-mngr-assesment-form',
  templateUrl: './mngr-assesment-form.component.html',
  styleUrls: ['./mngr-assesment-form.component.sass']
})
export class MngrAssesmentFormComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  assmntAccess:any;
  assmntData:any;
  isLoading:boolean = false;
  isData:any;
  isMngr:any; 
  Ryts:any;
  authBoolean:boolean;
  constructor(public router: Router,private authService: AuthService, public datepipe: DatePipe) { }

  ngOnInit(): void {
    // this.isMngr= JSON.parse(atob(localStorage.getItem('userData'))).Manger[0].is_MANAGER;
    // if(this.isMngr == 'N'){     
    //   this.router.navigate(['/errorPage', {isManager: this.isMngr}]);  
    // } 
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
    //this.assmntAccess =JSON.parse(atob(localStorage.getItem('othrPrevlgs'))).access; 
    this.assmntAccess =JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('othrPrevlgs')))).access; 

    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);    
    // today date 
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj =  emp[0]; 
    
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

  if( this.assmntAccess != true) {
    let x= 'false';
    this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
  }  
  this.isLoading = true;
  this.authService.assessmentformlist(this.empObj).subscribe(
    (res)=>{
      this.isLoading = false;
      if(res){
        this.assmntData = res.assessmentform;
        this.isData = this.assmntData.length;
      }
        // console.log(res);        
    });
}
getThisData($event, item){ 
  let x = {"userid": "" + item.EMP_ID+ "", "empID": "" + this.userData.user.empID + "", "mode": "" + item.approver_by+ ""}
  //localStorage.setItem('form_mode', btoa(JSON.stringify(x)));
  localStorage.setItem('form_mode', window.btoa(encodeURIComponent(JSON.stringify(x))));
  this.router.navigate(['/assesmentFillForm'], { replaceUrl: true });  
}

}
