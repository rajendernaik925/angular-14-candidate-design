import { Component,ViewChild, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
import { RefreshService } from '../../refresh.service';
@Component({
  selector: 'app-attendance-report-assam',
  templateUrl: './attendance-report-assam.component.html',
  styleUrls: ['./attendance-report-assam.component.sass']
})
export class AttendanceReportAssamComponent implements OnInit {
  
  loggedUser: any = {};
  userData: any;
  emp: any;
  empObj: any;
  public deviceInfo:any;
  inOutData: any;
  inOutDataDescndng: any;
  myDate: any;
  today_date: any;
  latest_date: any;
  public colorVariables: any;
  public isLoading: boolean = true;
  public currntMonth: any;
  public latest_date_rev: any;
  isData:boolean =  true;
  ReasonForm: FormGroup;
  thisData: any; 
  reportingMangrData:any;
  reportingMangr:any;
  mngerEmail:any;
  myObj:any;
  finalCommntData:any;
  itmDte: any;
  myitem:any; 
  public selectedValue:any; 

  showTab:any;
  hideTab:any
  seletedValue:any;
  public payperiodSwitch:boolean = true;
  payPeriodObj:any;
  payperiodArray:any;

  options:any; 
 public selectedLevel:any;
  fromDate:any;
  toDate:any;
  curMnth:any;
  payPeriodTIme:any;
  payperiodfromDate:any;
  payperiodtoDate:any;
  payperiodcurMnth:any;
  public flexiPolicy:any;
  modalType :any;
  commonnModal:any;


  public doj:any
  deductnHrs:any;
  wrkHrs:any;
  @ViewChild("outsideElement", { static: true }) outsideElement: ElementRef;
  @ViewChild('modalView', { static: true }) modalView$: ElementRef; 
 
  constructor(private refreshService: RefreshService,private authService: AuthService,
    public router: Router,
    public fb: FormBuilder,
    private renderer: Renderer2,
    public datepipe: DatePipe) { } 

    public ReqOptions: string[] = ["Incomplete Hours", "Machine Not Working", "Forgot Swipe", "On Duty Request", "HOD Permission"];
     
    openModal() {
      this.modalView$.nativeElement.classList.add('visible');
      this.renderer.addClass(document.body, 'modal-open');
      
    }
  
    closeModal() {       
      this.modalView$.nativeElement.classList.remove('visible'); 
      this.ReasonForm.controls['reasonComment'].reset()
      this.renderer.removeClass(document.body, 'modal-open');
    }
  
    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
      const outsideElement = this.outsideElement.nativeElement.contains(targetElement);
      // if (outsideElement) {
      //   this.modalView$.nativeElement.classList.remove('visible');
      // } 
    }
 

// Deduction Hours policy pdf Modal   
showPolicyModal(e:any) {  
  this.modalType = e;
  this.commonnModal = !this.commonnModal
  this.renderer.addClass(document.body, 'modal-open'); 
}

closePolicyModal(){  
  this.modalType = '';
  this.commonnModal = false;
  this.renderer.removeClass(document.body, 'modal-open');
}




  ngOnInit(): void { 

    if (this.refreshService.checkForRefresh('attendanceassam')) {
      this.refreshService.refreshData('attendanceassam');
    } else {
      console.log('Dashboard refresh already done today');
    }

   // this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);

     // getting Device Type of user loggedIn
     //let device = atob(localStorage.getItem('applction')); 
     let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));
     this.deviceInfo = JSON.parse(device).deviceInfo;

  //  console.log(this.userData.user)
    // let dateOfJoin = this.userData.user.doj;   
    // this.doj =this.datepipe.transform(dateOfJoin, 'yyyyMM');
    // passing empObj to submitReason()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = this.emp[0];

    // payperiod checkbox value 
    // let payPeriod = [{'payperiodSwitch': this.payperiodSwitch}];
    // this.payPeriodObj = payPeriod[0];
    let fileBasepath = this.authService.imgbase;
    this.flexiPolicy = fileBasepath + "Policydocuments/assam.pdf#toolbar=0&view=FitH";

    let x = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': 'default'};
    this.payPeriodObj = Object.assign(this.emp[0],x)


    // params for Reason Form
    this.reportingMangrData = this.userData.user.reportee;
    this.reportingMangr = this.reportingMangrData.split("-")[1] ; 

    // params for attrequest api
    this.selectedValue = this.ReqOptions[0]
    this.mngerEmail = this.userData.Manger[0].mangeremail;


    // empty the array on api call to load new data
    this.inOutData = []; 
    this.colorVariables = [];

    // reason Form 
    this.ReasonForm = this.fb.group({
      reasonComment: ['', [Validators.required, Validators.minLength(5)]],
      ReqType: ['', [Validators.required]]

    });
    this.getPayperiod(); 


    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    // this.latest_date = this.datepipe.transform(this.myDate, 'dd-MM-yyyy'); 
    // this.currntMonth = this.datepipe.transform(this.myDate, 'MM');
    moment.locale('en');// initiate date language 'english'
    this.latest_date = moment(this.myDate).format( 'DD-MM-yyyy'); 
    this.currntMonth =  moment(this.myDate).format('MM');

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

  

  // on button click 
  getThisData(event: any, item: any) {
     console.log(item)
    let inTime = item.in;
    let outTime = item.out;
    let reqDate = item.date.split("-").reverse().join("-") ; 
    this.itmDte = reqDate;
    let dedHrs = item.LESSHRS;
    let netHrs = item.netHours;
    this.thisData = item.date;


    

    this.myObj = { 'EMPLOYEEID': "" + this.userData.user.empID + "",'RANDOMID': " ", 'FROM_DATE': inTime, 'TO_DATE': outTime,
     'TOTA_HOURS': "" + dedHrs+ "",'netHours': ""+ netHrs +"", 'REQ_DATE': reqDate, 'TO_EMAIL': ""+this.mngerEmail +""}
     //console.log(this.myObj) 
  }
 
  // post attendance request 
  submitRequest() {    
    this.finalCommntData = Object.assign(this.ReasonForm.value, this.myObj);
    // console.log(this.finalCommntData)       
    this.isLoading = true;
    this.authService.attrequest(this.finalCommntData).subscribe(
      (res) => {
        if (res === 1) { 
          this.closeModal();
          this.getapiData(); 
        }
      }, err => {
        console.log(err);
        this.router.navigate(['/errorPage', { errorType: err.status }]);
      }); 
  }
 
 

 
getPayperiod(){ 
  this.authService.transactiondates(this.payPeriodObj).subscribe(
    (res) => { 
      //console.log(res)
      this.payperiodArray = res.Payperiod; 
      this.options = this.payperiodArray;         
      this.selectedLevel = this.options[0];
      // console.log(this.payperiodArray)
      let a = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.selectedLevel.payperiod};
      this.payPeriodObj = Object.assign(this.emp[0],a);
      // console.log(this.selectedLevel)    

      this.payperiodfromDate = this.selectedLevel.payperiodfromdate;
      this.payperiodtoDate = this.selectedLevel.payperiodtodate;
      this.payperiodcurMnth = this.selectedLevel.payperiodmonthname;

      this.fromDate= this.selectedLevel.fromdate;
      this.toDate= this.selectedLevel.todate;
      this.curMnth = this.selectedLevel.monthname;
      this.getapiData();
    }, err => {
      console.log(err);
      this.router.navigate(['/errorPage', { errorType: err.status }]);
    });
    if(this.payperiodArray){
      console.log(this.options)
    }
  
 
};

// on change of Months select 
public onChangeMonth(event:any) {
  const value = event  ;
  // console.log(value); 
  
  this.payperiodfromDate = value.payperiodfromdate;
  this.payperiodtoDate = value.payperiodtodate;
  this.payperiodcurMnth = value.payperiodmonthname;
  this.fromDate = value.fromdate;
  this.toDate = value.todate;
  this.curMnth = value.monthname;

  this.payPeriodTIme = value.payperiod;
  // passing params to api 
    let y = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.payPeriodTIme};
    this.payPeriodObj = Object.assign(this.emp[0],y);
    this.getapiData();
    this.isLoading = true;
}

// payperiod checkbox click 
handleSelected() { 
  if(this.payPeriodTIme == (undefined || null)){
    this.payPeriodTIme = this.selectedLevel.payperiod;
  }
  let z = {'payperiodSwitch': this.payperiodSwitch, 'payperiod': this.payPeriodTIme};
  this.payPeriodObj = Object.assign(this.emp[0],z);
  this.getapiData();
  this.isLoading = true;
}
 

  // getapiData() {  
  //   //++++++++ Attendance api +++++++++++
  //   let deviceType = { "application": this.deviceInfo.deviceType}
  //   let finalParams = Object.assign(this.payPeriodObj, deviceType);
  //   this.authService.attendance(finalParams).subscribe(
  //     (res) => {
  //       console.log(res)
  //       this.inOutData = res.INOUT;
  //       this.colorVariables = res.colorcode;
  //       // console.log(this.inOutData) 
  //       //  IN&OUT Table reverse array 
  //       // this.inOutDataDescndng = this.inOutData.reverse();
  //       this.deductnHrs = this.inOutData[this.inOutData.length-1].DEDHOURS; 
  //       this.wrkHrs =  this.inOutData[this.inOutData.length-1].WorkingHours; 
  //       this.isLoading = false;
  //     }, err => {
  //       console.log(err);
  //       this.router.navigate(['/errorPage', { errorType: err.status }]);
  //     })
  // }



  getapiData() {  
    //++++++++ Attendance api +++++++++++
    let deviceType = { "application": this.deviceInfo.deviceType}
    let finalParams = Object.assign(this.payPeriodObj, deviceType);
    this.authService.attendance(finalParams).subscribe(
      (res) => {
        // console.log(res.INOUT)
        if(res.INOUT.length!='0'){
          
        this.isData = true; 
        this.inOutData = res.INOUT;
        this.colorVariables = res.colorcode;
        //console.log(this.inOutData) 
        //  IN&OUT Table reverse array 
        
        //this.deductnHrs = this.inOutData[this.inOutData.length-1].DEDHOURS;
         this.deductnHrs = "";
        //console.log(this.inOutData[this.inOutData.length-1].WorkingHours);

       // this.wrkHrs =  this.inOutData[this.inOutData.length-1].WorkingHours; 

        this.wrkHrs ="";
        this.isLoading = false;
      } 
      else{
        this.isLoading = false;
        this.isData = false; 
      }

      }, err => {
        console.log(err);
        this.router.navigate(['/errorPage', { errorType: err.status }]);
      })
  }



}