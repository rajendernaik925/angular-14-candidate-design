import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth.service';
import * as moment from 'moment';
import 'moment/locale/es' ; 
@Component({
  selector: 'app-attendance-approvals',
  templateUrl: './attendance-approvals.component.html',
  styleUrls: ['./attendance-approvals.component.sass']
})
export class AttendanceApprovalsComponent implements OnInit {

  loggedUser: any = {};
  userData: any;
  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  public isLoading :boolean = true;
  noData:boolean;

  myDate: any;
  today_date: any;
  empParams:any;
  empParamsObj:any;
  ReasonForm: FormGroup;
  ReasonFormApprve: FormGroup;

  attndnceRests:any;
  mngerParam:any;
  finalCommntData:any;
  leaveObj: any;
  actionType: any;

  @ViewChild("outsideElement", { static: true }) outsideElement: ElementRef;
  @ViewChild('modalView', { static: true }) modalView$: ElementRef;
  constructor(public router: Router,
    public datepipe: DatePipe,
    private authService: AuthService,
    public fb: FormBuilder,
    private renderer: Renderer2) { }


    openModal() {
      this.modalView$.nativeElement.classList.add('visible');
      this.renderer.addClass(document.body, 'modal-open');
    }
  
    closeModal() {
      this.modalView$.nativeElement.classList.remove('visible');
      this.ReasonForm.reset();
      this.renderer.removeClass(document.body, 'modal-open');
    }
  
    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
      const outsideElement = this.outsideElement.nativeElement.contains(targetElement);
      // if (outsideElement) {
      //   this.modalView$.nativeElement.classList.remove('visible');
      // } 
    }

 

  ngOnInit(): void {
    //let x = JSON.parse(atob(localStorage.getItem('userData'))).Manger[0].is_MANAGER 
    let x = JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('userData')))).Manger[0].is_MANAGER 
    if(x =='N') {
      this.router.navigate(['/errorPage', {isManager: x}]); 
    } 

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
    this.isLoading = true;
    this.getapiData();


    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    // this.today_date = this.datepipe.transform(this.myDate, 'EEEE, MMM dd, yyyy, hh:mm a '); 

 // passing empObj to submitReason()
 this.empParams = [{ 'LOGINID': "" + this.userData.user.empID + "", 'LOGINNAME': "" + this.userData.user.name + "" }];
 this.empParamsObj = this.empParams[0];

   this.ReasonForm = this.fb.group({
     reasonComment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]]
   });
   this.ReasonFormApprve = this.fb.group({
    reasonComment: ['', [Validators.maxLength(150)]]
  })
 
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

  // Reason form validation 
  get f() { return this.ReasonForm.controls; }
  get g() { return this.ReasonFormApprve.controls; }

  leaveAction(event: any, item:any, a:any ) {
    this.ReasonForm.reset();
    this.ReasonFormApprve.reset();
    this.openModal();
    this.leaveObj = item;  
    this.mngerParam = { 'managereqflag': a};
    this.actionType = a;
  }


 // submit reason Approve
 submitApprveReason(){
  this.isLoading = true;
  var reason = this.ReasonFormApprve.value.reasonComment;
      if(reason==null){ 
        reason="";
      }
  let reasonParam  = {"reasonComment": reason}; 
  let finalCommntData = Object.assign( this.leaveObj,this.mngerParam,reasonParam, this.empParamsObj);
  // console.log(finalCommntData)
  this.authService.Leaveaccept(finalCommntData).subscribe(
      (res) => {
        if(res === 1){
        this.isLoading = false;
          this.closeModal();  
          this.ngOnInit();
        }
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      }) 
}

  // submit reason 
  submitReason() {       
    this.isLoading = true;
      this.finalCommntData = Object.assign( this.leaveObj,this.mngerParam,this.ReasonForm.value, this.empParamsObj);
      // console.log(this.finalCommntData)
       this.authService.Leaveaccept(this.finalCommntData).subscribe(
        (res) => {
          if(res === 1){
            this.closeModal(); 
            // this.getapiData();
            this.ngOnInit();
          }
        },err => {
          console.log(err.status);
          this.router.navigate(['/errorPage', {errorType: err.status}]);
        })
    //code here..
  }



  getapiData(){
    this.noData =  false;
    this.authService.managersummary(this.emp_Obj).subscribe(
      (res) => {
        if(res){
          this.attndnceRests = res.managerattendancereq;          
          // console.log(this.attndnceRests);
          this.isLoading = false;
          if(this.attndnceRests.length =='0'){
            this.noData =  true;
          } 
        }         
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      })
  }


}
