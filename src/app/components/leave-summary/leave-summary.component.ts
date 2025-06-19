import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http'; 
import { AuthService } from '../../auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-leave-summary',
  templateUrl: './leave-summary.component.html',
  styleUrls: ['./leave-summary.component.sass']
})
export class LeaveSummaryComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  leaveData: any;
  leaveSummary: any;
  noData:boolean;
  myDate: any;
  today_date: any;
  dateCompre: any;
  // reasonComment: any;

  leaveSumry: any = [];
  finalCommntData: any;
  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  ReasonForm: FormGroup;
  item: any[];
  user: any;
  public isLoading :boolean = true;
  empParams:any;
  empParamsObj:any;

  @ViewChild("outsideElement", { static: true }) outsideElement: ElementRef;
  @ViewChild('modalView', { static: true }) modalView$: ElementRef;
  constructor(public router: Router,
    private authService: AuthService,
    public datepipe: DatePipe,
    public fb: FormBuilder,
    private renderer: Renderer2,
    private httpClient: HttpClient) { }


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
   // this.loggedUser = atob(localStorage.getItem('userData'));
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


    this.ReasonForm = this.fb.group({
      reasonComment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]]
    });

    

    // passing empObj to submitReason()
    this.empParams = [{ 'empID': "" + this.userData.user.empID + "", 'empName': "" + this.userData.user.name + "" }];
    this.empParamsObj = this.empParams[0];


    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');// initiate date language 'english' 
    // this.dateCompre = this.datepipe.transform(this.myDate, 'yyyy-MM-dd');
    this.dateCompre = moment(this.myDate).format( 'yyyy-MM-DD');


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


  // on cancle click 
  leaveCancl(event: any, item: any) {
    this.leaveSumry = item;  
  }

  // submit reason for leave cancle 
  submitReason() { 
    this.finalCommntData = Object.assign(this.leaveSumry, this.ReasonForm.value, this.empParamsObj);
    // console.log(this.finalCommntData); 
    this.isLoading = true;
    this.authService.cancleLeaveReq(this.finalCommntData).subscribe(
      (res) => {
        // console.log('val===', JSON.stringify(res));
        if (res === 1) {          
          this.closeModal();
          this.getapiData();  

        }
      })
  };




  getapiData() { 
    this.noData =  false;
    //++++++++ leave quota api +++++++++++
    this.authService.leavequota(this.emp_Obj).subscribe(
      (res) => {    
        if(res){    
        this.leaveData = res.LeaveQuota;    
      } 
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      });
 
        
    //++++++++ leave summary api +++++++++++
    this.authService.leavesummary(this.emp_Obj).subscribe(
      (res) => {        
        if(res){          
          this.leaveSummary = res.LeaveSummary;     
            this.isLoading = false;        
          if(this.leaveSummary.length =='0'){
            this.noData =  true;
          }   
        }        
        
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      });



  }



}
