import { Component, OnInit, OnDestroy , Renderer2, ViewChild, ElementRef } from '@angular/core'; 
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgIdleService } from '../services/ng-idle-service.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common'; 
import * as moment from 'moment';
import 'moment/locale/es' ; // without this line it didn't work 


// import { PasswordValidator } from '../login/password.validator';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.sass'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class NavComponent implements OnInit  {
  myDate: any;
  latest_date:any;
  inToday:any;
  OutToday: any;
  dayType: any;
  public routerLinkVariable = "/dashboard";
  public showModal : boolean;
  public showDropDownMenu: boolean;
  public showDropDownMenu1: boolean;
  public PasswrdModal: boolean;
  location:any; 
  public submitted: boolean = false;
  LoginPaswd: any;
  passwordForm:FormGroup;
  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  payPeriodObj:any;
  inOutData: any = [];
  loggedUser: any = {};
  userData: any; 
  IsManager:any;
  empShortName:any; 
  
  idleTimerLeft: string;
  secondTimerLeft: string;
  timeRemain: number; 
  fieldTextType: boolean;
  public disableButton: boolean = false;
  LocalStorageKeysToRemove:any;
 showPopup = false;

  // @ViewChild('hidesettingPopup') hidesettingPopup;
  constructor(public router: Router,
    private ngIdle: NgIdleService, 
    public authService: AuthService,  
    private fb: FormBuilder, 
    public datepipe: DatePipe,
    private _eref: ElementRef, 
    private renderer: Renderer2) { }
  
 

  public options = ['select leave','select somethng' ];

  selectCheckbox(event){
    this.authService.updatedSelection(event.target.value);  
}





formatTimeLeft = (time: number) => {
  if (time > 0) {
    let seconds = Math.trunc(time / 1000);
 

    let min = 0;
    if (seconds >= 60) {
      min = Math.trunc(seconds / 60);
      // console.log(min);
      seconds -= (min * 60);
    }

    return `${min}:${seconds}`;
  } 
}

initTimer(firstTimerValue: number, secondTimerValue: number): void {
  // Timer value initialization
  this.ngIdle.USER_IDLE_TIMER_VALUE_IN_MIN = firstTimerValue;
  this.ngIdle.FINAL_LEVEL_TIMER_VALUE_IN_MIN = secondTimerValue;
  // end

  // Watcher on timer
  this.ngIdle.initilizeSessionTimeout();
  this.ngIdle.userIdlenessChecker.subscribe((status: string) => {
    this.initiateFirstTimer(status);
  });

  this.ngIdle.secondLevelUserIdleChecker.subscribe((status: string) => {
    this.initiateSecondTimer(status);
  });
  
 } 

 initiateFirstTimer = (status: string) => {
  switch (status) {
    case 'INITIATE_TIMER':
      break;

    case 'RESET_TIMER':
      break;

    case 'STOPPED_TIMER':
      this.showSendTimerDialog();
      break;

    default:
      this.idleTimerLeft = this.formatTimeLeft(Number(status)); 
      break;
  }
}

initiateSecondTimer = (status: string) => {
  switch (status) {
    case 'INITIATE_SECOND_TIMER':
      break;

    case 'SECOND_TIMER_STARTED':
      break;

    case 'SECOND_TIMER_STOPPED':
      this.sessionExpire();
      break;

    default:
      this.secondTimerLeft = status;
      break;
  }
}

showSendTimerDialog(): void {
  const modal = document.getElementById('myModal');
  modal.style.display = 'block';
  this.renderer.addClass(document.body, 'modal-open');
}

continue(): void {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
  this.renderer.removeClass(document.body, 'modal-open');
  // stop second timer and initiate first timer again
  NgIdleService.runSecondTimer = false;
  this.ngIdle.initilizeSessionTimeout();
}

sessionExpire(){  
  this.renderer.removeClass(document.body, 'modal-open');
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
  // stop all timer and end the session
  NgIdleService.runTimer = false;
  NgIdleService.runSecondTimer = false;

  // localStorage.clear();
  this.LocalStorageKeysToRemove.forEach(k =>
    localStorage.removeItem(k))

  this.router.navigate(['/'], { replaceUrl: true });
  Swal.fire({  
    icon: 'info',  
    title: 'Session Expired!',  
    text: "You've been loggedOut",
    showConfirmButton: true,  
    confirmButtonText: 'OK'
  }) 
}

logout(): void {
  
  this.renderer.removeClass(document.body, 'modal-open');
  
  this.LocalStorageKeysToRemove.forEach(k =>
    localStorage.removeItem(k))
  // localStorage.clear();

  this.router.navigate(['/'], { replaceUrl: true });
  //  window.location.href = "https://sso.heterohealthcare.com/"
}

 

// modal show/hide 
  closeSettings(){
    // this.hidesettingPopup.nativeElement.click();
    this.showModal = false; 
  }
  showmyModal(){
    this.showModal = ! this.showModal
  }

// modal show/hide 
closePasswrdModal() {
  this.PasswrdModal = false;
  this.renderer.removeClass(document.body, 'modal-open');
  // this.passwordForm.reset(); 
  this.ngOnInit();
  this.disableButton = false;
  this.submitted = false; 
}
showPasswrdModal() {
  this.PasswrdModal = !this.PasswrdModal
  this.renderer.addClass(document.body, 'modal-open');
  this.showDropDown()
}


  // menu dropdowns 
  showDropDown(){
    this.showDropDownMenu = !this.showDropDownMenu;
    this.showDropDownMenu1 = false
  } 
  
  showDropDown1(){
    this.showDropDownMenu1 = !this.showDropDownMenu1;
    this.showDropDownMenu = false
  }

  // outside click dropdown close 
  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target)) 
    this.showDropDownMenu = false;
   }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
          passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true})
      }
      else {
          return passwordConfirmationInput.setErrors(null);
      }
    }
  }
  
  checkIfMatchingPasswords1(passwordKey1: string, passwordConfirmationKey1: string) {
    return (group: FormGroup) => {
      let passwordInput1 = group.controls[passwordKey1],
          passwordConfirmationInput1 = group.controls[passwordConfirmationKey1];
      if (passwordInput1.value !== passwordConfirmationInput1.value) {
        return passwordConfirmationInput1.setErrors({notEquivalent1: true})
      }
      else {
          return passwordConfirmationInput1.setErrors(null);
      }
    }
  }


  ngOnInit(): void {  

    this.LocalStorageKeysToRemove = ["userData","loginData","applction", "currentDate","othrPrevlgs","privileges", "newParams"];
    if(localStorage['currentDate']){
       
       //this.myDate = atob(localStorage.getItem('currentDate'));
       this.myDate =decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
       moment.locale('en');
        // this.latest_date = this.datepipe.transform(this.myDate, 'dd-MM-yyyy');
        this.latest_date = moment(this.myDate).format( 'DD-MM-yyyy') ; 
        // let userData = atob(localStorage.getItem('userData'));
    } 
    // console.log(this.location)
  if(localStorage['loginData']){
      //let logParams = atob(localStorage.getItem('loginData'));
      let logParams = decodeURIComponent(window.atob(localStorage.getItem('loginData')));
      this.LoginPaswd = JSON.parse(logParams).password;
      // console.log(this.LoginPaswd);
    }
    this.passwordForm = this.fb.group({
      oldPassword: [this.LoginPaswd],
      curPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15), 
        Validators.pattern('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{6,}')]],
      confrmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
    },{validator: [this.checkIfMatchingPasswords('newPassword', 'confrmPassword'),this.checkIfMatchingPasswords1('oldPassword', 'curPassword')]});

    
  
    if(localStorage['userData']){
    //  this.loggedUser = atob(localStorage.getItem('userData'))
      this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
      this.userData = JSON.parse(this.loggedUser); 
      // getting Device Type of user loggedIn
     // let device = atob(localStorage.getItem('applction')); 
      let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));
      this.deviceInfo = JSON.parse(device).deviceInfo;
      // console.log(this.deviceInfo.deviceType);
    }
    if(this.userData){
      this.location = this.userData.user.location;
      
      // session expiring time inputs (minutes format)
      const inputValue = {"firstLevelTimer": 13, "secondLevelTimer" : 2 };
      this.initTimer(inputValue.firstLevelTimer, inputValue.secondLevelTimer);

      // passing empObj to api()
      this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
      this.empObj = this.emp[0];

      let emp = [{ 'empID': "" + this.userData.user.empID + "", "application": this.deviceInfo.deviceType }];
      this.emp_Obj =  emp[0];  
   
    let x = {'payperiodSwitch': true, 'payperiod': 'default'};
    this.payPeriodObj = Object.assign(this.emp[0],x)

    // shortname 
    let a = this.userData.user.firstname.substring(1, 0);   
    if(this.userData.user.lastname){
      var b = this.userData.user.lastname.substring(1, 0);  
    }  
    else{
      let mdlName = this.userData.user.name.split(' ')[1];
      b = mdlName.substring(1,0)
    }
    this.empShortName = a +""+b; 
    // let x =  this.userData.Manger[0].is_MANAGER 
    // this.IsManager = x
  
    this.getapiData() ;
  } 

  this.fetchNotifications(); // Call only if user is defined
  }
// End Of ngOnInit
// <!-- Switching method -->
toggleFieldTextType() {
  this.fieldTextType = !this.fieldTextType;
}
assmntAccess:boolean;
  getapiData() {
    this.authService.loginSession(this.emp_Obj).subscribe(res=>{ 
      if(res.session[0].flag=="false"){ 
        //  this.logout() ;
       // alert(this.emp_Obj);
        this.sessionExpire();
      }
    })
  //++++++++ TodayLoginTime Reader api +++++++++++
    this.authService.todayLoginTime(this.empObj).subscribe(
      (res) => { 
        // console.log(res);
        if(res != undefined){
        this.inToday = res.intime;
        this.OutToday = res.outtime;
        this.dayType = res.displayflag;
      }
      })

    


     //++++++++ Attendance api +++++++++++
    //  this.authService.attendance(this.payPeriodObj).subscribe(
    //   (res) => {
       
    //     this.inOutData = res.INOUT;
    //     console.log(  this.inOutData)
    //     let inTime: any;
    //     let outTime: any;
    //     let dayType: any;
    //     for (let i = 0; i < this.inOutData.length; i++) {   

    //     // Today In&Out Card data 
    //       if (this.inOutData[i].date == this.latest_date) {
    //         inTime = this.inOutData[i].in;
    //         outTime = this.inOutData[i].out;
    //         dayType = this.inOutData[i].dayType  
    //       }
    //     }
    //     this.inToday = inTime;
    //     this.OutToday = outTime;
    //     this.dayType = dayType;
    //     console.log(this.inToday)
    //   })
  }

  get f() { return this.passwordForm.controls; }

  checkFuntn(){ 
    
    if(this.LoginPaswd!= this.passwordForm.value.confrmPassword && this.passwordForm.value.confrmPassword != null){
    let x= {'confrmPassword': this.passwordForm.value.confrmPassword }
    let newPassword = Object.assign(this.emp_Obj, x);
      // console.log(newPassword);
       
      this.authService.changepassword(newPassword).subscribe(
      (res) => {
        if(res ===1){
          // this.disableButton = false;
          // this.submitted = false; 
          this.closePasswrdModal();     
          Swal.fire({  
            icon: 'success',  
            title: 'Password Updated Successfully',
            text: 'Kindly Login With New Password',   
            showConfirmButton: true,  
            // timer: 4000  
          }) 
          this.logout();
          // localStorage.removeItem('log_Data');
          
          // let logData = atob(localStorage.getItem('log_Data'))
          // let parsdLogData =  JSON.parse(logData); 
          // let pswdObj= {"password": ''}
          // Object.assign(parsdLogData,pswdObj)
          // console.log(parsdLogData);
          // localStorage.setItem('log_Data', btoa(parsdLogData) );
        }
      })
    }else if(this.passwordForm.value.curPassword == this.passwordForm.value.confrmPassword ){
      this.disableButton = false;
      Swal.fire({  
        icon: 'warning',  
        // title: "Existing, New Password Shouldn't be same" ,
        text: 'Existing Password & New Password Should Not be the same',   
        showConfirmButton: true,  
        // timer: 4000  
      }) 
    } 
    // else if(this.LoginPaswd != this.passwordForm.value.curPassword ){
    //   this.disableButton = false;
    //   Swal.fire({  
    //     icon: 'warning',   
    //     text: 'Existing Password is Wrong',   
    //     showConfirmButton: true,   
    //   }) 
    // } 

  }
  updatePasswrd(){
  this.disableButton = true;
  this.submitted = true; 

  // resetting curPassword: null value to empty for validation 
  var curpswd = this.passwordForm.value.curPassword;
   if(curpswd== null){
    this.passwordForm.get('curPassword').setValue("");
   }

  if (this.passwordForm.invalid) { 
    this.disableButton = false; 
    return;
   
  }else{
    this.checkFuntn()
  }
}
 notifications: any[] = [];
 fetchNotifications() {
  const formData = new FormData();
  formData.append('empId', this.userData.user.empID.toString()); 
// console.log("test",this.userData.user.empID);
  this.authService.getNotifications(formData).subscribe(
    (response: any) => {
      // console.log('Notifications fetched:', response);
      this.notifications = Array.isArray(response) ? response : [response]; 
    

    },
    (error) => {
      // console.error('Error fetching notifications:', error);
    }
  );
}  

  togglePopup() {
    this.showPopup = !this.showPopup;
  }

}
