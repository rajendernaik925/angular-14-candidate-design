import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ;

@Component({
  selector: 'app-dept-attendance',
  templateUrl: './dept-attendance.component.html',
  styleUrls: ['./dept-attendance.component.sass']
})
export class DeptAttendanceComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  empData: any;
  isLoading:boolean = false;
  myDate: any;
  today_date: any; 
  empObj: any;
  deptAttendance:any;

  public payperiodSwitch:boolean;
  options:any; 
  public selectedLevel:any;
  payPeriodObj:any;
  payperiodArray:any;
  payPeriodTIme:any;
  id:any;
  newParams:any;
  LeadName:any;
  // public responceData= [{name: "jean", surname: "kruger"}, {name: "bobby", surname: "marais"}]
   

  constructor(
    public router: Router, public datepipe: DatePipe,
    private authService: AuthService,private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.payperiodSwitch = true;

    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    //this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
     
    this.userData = JSON.parse(this.loggedUser); 
    this.empData = this.userData.user;
    // passing empObj to getApiData()
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];

     // today date 
     //this.myDate = atob(localStorage.getItem('currentDate')); 
     this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
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
  let x = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': 'default'};
    this.payPeriodObj = Object.assign(this.empObj,x)
  this.getPayperiod();
  if (localStorage.getItem("newParams")!= null && this.id == 'true'){ 
   // let newPrams = atob(localStorage.getItem('newParams')); 
    let newPrams = decodeURIComponent(window.atob(localStorage.getItem('newParams')));
    let prsdData = JSON.parse(newPrams);
    let newEmpID = {"empID": ""+ prsdData.empID+ ""}
    this.LeadName = prsdData.empName;
    this.payPeriodObj = Object.assign(this.payPeriodObj,newEmpID); 
  }

} //End - ngOnInIt 

titleCaseWord(word: string) {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}



getPayperiod(){ 
  this.authService.transactiondates(this.payPeriodObj).subscribe(
    (res) => { 
      this.payperiodArray = res.Payperiod; 
      this.options = this.payperiodArray;         
      this.selectedLevel = this.options[0];
      // console.log(this.payperiodArray)
      let a = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.selectedLevel.payperiod};
      this.payPeriodObj = Object.assign(this.empObj,a);
      // console.log(this.selectedLevel)   
 
      this.getApiData();
    }, err => {
      console.log(err);
      this.router.navigate(['/errorPage', { errorType: err.status }]);
    });
    if(this.payperiodArray){
      // console.log(this.options)
    } 
};

public onChangeMonth(event:any) {
  const value = event  ; 

  this.payPeriodTIme = value.payperiod;
  // console.log(this.payPeriodTIme)
  // passing params to api 
    let y = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.payPeriodTIme};
    this.payPeriodObj = Object.assign(this.empObj,y);
    this.getApiData(); 
}





handleSelected() { 
  if (this.payPeriodTIme === undefined || this.payPeriodTIme === null) 
  {
    this.payPeriodTIme = this.selectedLevel.payperiod;
  }
  let z = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.payPeriodTIme};
  this.payPeriodObj = Object.assign(this.empObj,z);
  this.getApiData();
  this.isLoading = true;
}

getApiData(){ 
  this.isLoading=true;
  if (localStorage.getItem("newParams")!= null && this.id == 'true'){        
       
    this.authService.manager_DeptAttendance(this.payPeriodObj).subscribe(res=>{
      if(res){
        this.isLoading=false;
        this.deptAttendance = res.manager_attendance;
      }
    })
  }else{
    this.authService.manager_DeptAttendance(this.payPeriodObj).subscribe(res=>{
      // console.log(res)
      if(res){
        this.isLoading=false;
        this.deptAttendance = res.manager_attendance;
      }
    })
  }
  // console.log(this.deptAttendance )
}
  
nxtLevel(event:any){
  // console.log(event);
  this.newParams = {'empID': event.ID, 'empName': event.NAME}; 
  //localStorage.setItem('newParams', btoa(JSON.stringify(this.newParams))); 
  localStorage.setItem('newParams', window.btoa(encodeURIComponent(JSON.stringify(this.newParams)))); 
}

}
