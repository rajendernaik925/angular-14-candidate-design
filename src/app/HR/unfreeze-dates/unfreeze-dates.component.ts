import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'; 
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
@Component({
  selector: 'app-unfreeze-dates',
  templateUrl: './unfreeze-dates.component.html',
  styleUrls: ['./unfreeze-dates.component.sass']
})
export class UnfreezeDatesComponent implements OnInit {

  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  userId:any;
  empInfo:any={};
  profle_imgURL:any;
  ProfileImg:boolean = false;
  isEmpInfo:boolean = false;
  dsbleBtn:boolean = true;
  empLeaveTypes:any;
  selectedLeaveTypes = [];
  selectedAttndnceTypes = [];

  checkedIDs = [];
  checkedIDsAttendnce = [];

  finalData:any=[];
  finalDataAttendnce:any=[];

  bk_Date: any; 
  inValidEmpId:any;
  Responce:any;
  authBoolean:boolean;
  privil_eges:any= {};

  attndnceDate:any;
  theRadioVal:any;
  minDateFrom: Date;
  maxDateFrom: Date;
  isLoading:boolean = false;
  colorTheme = 'theme-dark-blue';  
  constructor(public router: Router,
    public authService: AuthService,
    public datepipe: DatePipe) {
    this.minDateFrom = new Date();
    this.maxDateFrom = new Date();
   }
  
  ngOnInit(): void {  
    // this.attndnceDate = [];  
    if(this.empLeaveTypes){
      this.fetchSelectedItems();
      this.fetchCheckedIDs(); 
    }
    else if (this.attndnceDate){
      this.fetchSelectedItems1();
      this.fetchCheckedIDs1();
    } 
    
   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate =  decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    
    //let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights; 
    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Unfreeze_dates == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }


    this.maxDateFrom = new Date(this.myDate)
    // passing empObj to api()
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj =  emp[0];
    
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
// End of NgOnint 


// numbers input 
numberOnly(event): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

onSearchChange(searchValue: string): void {  
  // console.log(searchValue);
  if(searchValue.length>=5){
    this.userId = { 'userid': "" + searchValue + "" };
    this.getApiData()
  }else{
   this.resetData();
  }
}

resetData(){
  // this.ngOnInit();    
  this.setradio(false);
  this.finalData = [];
  this.finalDataAttendnce = [];
  this.selectedLeaveTypes = [];
  this.selectedAttndnceTypes = [];
  this.checkedIDs = [];
  this.checkedIDsAttendnce = [];
  this.bk_Date= '';
  this.isEmpInfo= false;
  // this.empInfo = false;
}
 

setradio(val:any){
  this.bk_Date= '';
  this.finalData = [];
  this.finalDataAttendnce=[];
  // console.log(val);
  this.theRadioVal = val;
  this.minDateFrom = new Date();
  this.maxDateFrom = new Date();   
  if(val == 'unfreezeLeave'){
    this.isLoading= true; 
    this.authService.unfreeze_empTransctnDate(this.userId).subscribe(res=>{
      // console.log(res.info,'empTransctnDate' );
      this.minDateFrom = new Date(res.info);
      // this.minDateFrom= res.info;
    });
    this.authService.unfreeze_empshowleavetypes(this.userId).subscribe(res=>{
      this.isLoading= false; 
      // console.log(res.empshowleavetypes, 'empshowleavetypes');
      this.empLeaveTypes = res.empshowleavetypes; 
    });
  }
  else if(val == 'unfreezeAttendance'){
    this.isLoading= true; 
    this.authService.unfreezAttendanceReq(this.userId).subscribe(res=>{
      this.isLoading= false; 
      // console.log(res.UnAttendanceReq);
      this.attndnceDate = res.UnAttendanceReq;
    })
  }
  else {
    this.empLeaveTypes=[];
    this.attndnceDate=[];
  }
}


getApiData(){ 
 
  this.isLoading= true;
  this.authService.unfreeze_empinfo(this.userId).subscribe(res=>{
      // console.log(res);
      if(res){        
        this.inValidEmpId = res.info.length; 
        this.empInfo = res.info[0];
        // console.log(this.empInfo)
        this.isEmpInfo= true;
        this.isLoading= false;
      }else{
        this.isEmpInfo= false;
        this.isLoading= false;
        alert('something went wrong')
      } 
  });
  let param= { 'empID': "" + this.userId.userid + "" };
  this.authService.profilepicview(param).subscribe(res=>{
      if(res){
          this.profle_imgURL= this.authService.imgbase + res.profilepicview ; 
          // console.log(this.imgURL)
          if(res.profilepicview){
            let x = res.profilepicview.split('/');
            if(x[1]==this.userId.userid){
              this.ProfileImg =true;
            }else{
              this.ProfileImg =false;
            }
          }
          this.isLoading= false; 
      }else{
        this.isLoading= false;
        alert('something went wrong')
      }
  })
}

 
  
  

onChange() {
  this.finalData = []; 
  this.fetchSelectedItems();
  for(let i=0; i<this.selectedLeaveTypes.length; i++){
    if(this.selectedLeaveTypes[i].isSelected){
      this.finalData.push(JSON.parse(this.selectedLeaveTypes[i].TYPE));
    }
  }
}
fetchSelectedItems() {
  this.selectedLeaveTypes = this.empLeaveTypes.filter((value, index) => {
    return value.isSelected
  });
}

fetchCheckedIDs() {
  this.checkedIDs = [];  
  this.empLeaveTypes.forEach((value, index) => {
    if (value.isSelected) {
      this.checkedIDs.push(JSON.stringify(value.TYPE));    
    }
  });
}
 
 

unfreezReqst(){  
  this.isLoading= true; 
  let bk_Date = this.datepipe.transform(this.bk_Date , 'yyyy-MM-dd');
  // let x = JSON.parse(this.finalData)
  let params= { 'userid': "" + this.userId.userid + "", 'date': bk_Date, 'leavetypeid': ""+ this.finalData +"" ,'empID': "" + this.userData.user.empID + ""};
  if(bk_Date&& this.finalData.length!='0') {   
  this.authService.unfreeze_empReq(params).subscribe(res=>{
    // console.log(res);
   this.isLoading= false; 
   this.Responce =  res.count;
   if(this.Responce != 0){
    Swal.fire({  
      icon: 'success',  
      title: "You're Done",   
      text: 'Selected Date Unfreezed Successfuly',
      showConfirmButton: true,  
      // timer: 2000  
    }); 
    this.resetData();
   }else{
    Swal.fire({  
      icon: 'warning',  
      title: "Please Contact Admin",  
      text: this.Responce + ' - Data', 
      showConfirmButton: true,  
      // timer: 2000  
    });
   }
  })

  }
  this.isLoading= false; 
}

//************************************** Unfreeze Attendance ************
onDateCheck(){
  this.finalDataAttendnce=[];
  this.fetchSelectedItems1();
  for(let i=0; i<this.selectedAttndnceTypes.length; i++){
    if(this.selectedAttndnceTypes[i].isSelected){
      this.finalDataAttendnce.push(this.selectedAttndnceTypes[i].DATE);
    }
  } 
  // console.log(this.finalDataAttendnce.length);
  if(this.finalDataAttendnce.length >0){
    this.dsbleBtn = false;
  }
}

fetchSelectedItems1() {
  this.selectedAttndnceTypes = this.attndnceDate.filter((value, index) => {
    return value.isSelected
  });
}

fetchCheckedIDs1() {
  this.checkedIDsAttendnce = [];  
  this.attndnceDate.forEach((value, index) => {
    if (value.isSelected) {
      this.checkedIDsAttendnce.push(value.DATE);    
    }
  });
}


unfreezAttndnceReqst(){
  this.isLoading= true; 
  let params = { 'userid': "" + this.userId.userid + "", 'empID': "" + this.userData.user.empID + "",  'datelist': ""+ this.finalDataAttendnce +"" };
  
  this.authService.unfreez_Att_Req_add(params).subscribe(res=>{
    // console.log(res);
    this.isLoading= false; 
    var count = res.count;
    if(count!= 0){
      Swal.fire({  
        icon: 'success',  
        title: "You're Done",   
        text: 'Selected Dates Unfreezed Successfuly',
        showConfirmButton: true,  
        // timer: 2000  
      }); 
    this.resetData();
    }else{
      Swal.fire({  
        icon: 'warning',  
        title: "Please Contact Admin",  
        text: count + ' - Data', 
        showConfirmButton: true,  
        // timer: 2000  
      });
     }
  })
}

}
