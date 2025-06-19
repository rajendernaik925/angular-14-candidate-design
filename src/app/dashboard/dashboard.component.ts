import { Component, OnInit, OnDestroy,  ViewChild, ElementRef, HostListener, Renderer2,Inject, Injectable  } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth.service'; 
import { DomSanitizer } from '@angular/platform-browser';
// import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
// import { Label } from 'ng2-charts';
import { AbstractControl,FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common'; 
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; // without this line it didn't work 
import { RefreshService } from '../refresh.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
@Injectable()
export class DashboardComponent implements OnInit {
  myDate: any;
  oldYear:any;
  inToday: any;
  OutToday: any;
  public loggedUser: any = {};
  public userData: any;
  public latest_date: any;
  public latest_dateFormtd: any;
  public inOutDataDescndng: any = [];
  public innerHtml: any;
  public empData: any;
  empWorkingDays: any;
  inOutData: any = [];
  leaveData: any;
  // todayLogins: any;
  holidayList: any;
  noHolydays: boolean = false; 

  birthdayList: any;

  TodaynetHours: any;
  dayType:any;
  availLeaves:any;
  sumOfUsedQuota: any;

  compreBdayDate: any;
  IsManager:any;
  // formatDate: any
  isMale = false;
  isFemale = false;
  imgURL:any;
  bdayProfleImg:any;
  isBday: any;
  noBday: any;
  profilepic:any;
  announc_ment:any[];
  // mySlide_Lines:any[];
  loginTime: any;
  public showLeaveData: boolean = true;
  public showOtherdiv: boolean; 
  public isLoading: boolean = true;
  user: any;
  emp: any;
  empObj: any
  emp_Obj: any

  public form16:any; 

  public finclYear:any;
  public leavePolicy:any;

  LoginParams: any
  tentatvOutTime:any;   
  public holidaysModal: boolean;  
  public NoticeModal: boolean;
  public leavePolicyModal: boolean;   
  public payslipModal: boolean;
  public form16Modal: boolean;
  public fy_Modal: boolean;  

  payPeriodObj:any;
  deductnHrs:any
  wrkHrs:any;
  prevligies:any;
  Ryts:any;
  assmntAccess:any;  
  pay_slips:any;
  pay_slip:any;
  pay_slip_mob:any;
  isAppraisal:any; 
  isHR:any; 
  masterview:any;
  LeaveQuota:any;
  AppointmentVIEW:any; 
  IDCARD:any;
  ASSETALLOCATION:any;
  ASSETITADMIN:any;
  worksheetview:any;
  Incrementview:any;
  Confirmationview:any;
  LocalStorageKeysToRemove:any; 



  public panVerifyModal:boolean;
  exist_PAN:any;
  PanInfoForm: FormGroup;
  thepanValue:any;
  empPanDisabled:boolean;
  datepickerElements:boolean;
  public panSubmitted: boolean ;
  public panSubmitted1: boolean ;

  disableUpdateBtn:boolean;
  disableValidateBtn:boolean;
  disableSubmitBtn: boolean;
  dateExprd:boolean;
  
  public panFile:any;
  public panFileName: any;
  public panNum:any;
  public fianlpanFile: any;
  public isFileUploaded:boolean =false; 
  inputPan:any;
  ExistPan:boolean=false;
  enableApi:boolean=false;
  noPan:boolean=false;
  xprdDate:boolean=true;
  showErr:boolean=false;
  showValidPAN:boolean= true;
  minDateVal: Date;
  maxDateVal: Date;
  colorTheme = 'theme-dark-blue';  
  get_date:any;
  showInProgress:boolean=false;
  reslt:any; 
  public deviceInfo:any;
  form16_mob:any;
  finclYear_mob:any;
  jd_Modal:any;
  Jdpdf_web:any;
  Jdpdf_mob:any;
  isJD:any;
  location:any;
  worksheet:any;
  public EditModal: boolean; // by d1

  
  constructor(private refreshService: RefreshService,public router: Router, public authService: AuthService, 
    @Inject(DOCUMENT) private document: Document,
    public datepipe: DatePipe,private renderer: Renderer2, private fb: FormBuilder, 
    private dom:DomSanitizer) { }
   
  //  mySlideLines:any ;
  //  mySlideLines:any = ["iconnect-2.0 New Version is Live Now!.", "Apply your leaves within 48hrs."];

   mySlideLines:any = [
    {
      title: "iconnect-2.0 New Version is Live Now!.",
      description: "The <b>Ionic Component Documentation</b> showcases a number of useful components that are included out of the box with Ionic.",
      image: "img/phone.png",
      color: "#7a86fa",
    },
    {
      title: "Apply your leaves within 48hrs.",
      description: "<b>Ionic Framework</b> is an open source SDK that enables developers to build high quality mobile apps with web technologies like HTML, CSS, and JavaScript.",
      image: "img/phone.png",
      color: "#FD4B4B",
    },
   ];
  // myCarouselImages =['../assets/images/image1.jpg','../assets/images/image2.jpeg','../assets/images/image3.jpg'];

  mySlideOptions =
  {
    items: 1,
    dots: false,
    // nav: true,
    nav: false,
    loop: true,
    autoplay: true,  
    navText: [
      '<img src="././assets/img/dashboard/announcement-left.svg" style="position: absolute; top: -50px; left: 170px; width: 24px;" />',
      '<img src="././assets/img/dashboard/announcement-right.svg" style="position: absolute; top: -50px;left: 220px;width: 24px;" />']
  };

// job openings carousel   
myCarouselOptions={
  items: 1, 
  margin:10,
  dots: false, 
  nav: true, 
  loop: false,
  autoplay: true,
  pauseOnHover: true,
  navText: [
    '<img src="././assets/img/dashboard/job-openings-left.svg" style="position: absolute; top: -40px; right: 45px; width: 16px;" />',
    '<img src="././assets/img/dashboard/job-openings-right.svg" style="position: absolute; top: -40px;right: 20px;width: 16px;" />']
};

  // tentative Out Time calculation addTimes(start, end) & addDurationToHours()
  
  addTimes(start, end) {
    if(this.inToday){
    var a = start.split(":");
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    var b = end.split(":");
    var seconds2 = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
  
    var date = new Date(1970, 0, 1);
    date.setSeconds(seconds + seconds2);
    var c = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    return c;
  }
  }
  
  addDurationToHours() {
    if(this.inToday){
    let hours = [this.inToday]; 
    let duration = [this.loginTime]; 
  
    let newArray = [];
    hours.forEach( ( hour, index ) => {
      newArray.push( this.addTimes(hour, duration[index]))
    })
    
    this.tentatvOutTime = newArray[0]
    // console.log (this.inToday, this.tentatvOutTime )
    return newArray;
  }
  }
 
 


  aboutOrgnztn() {
    const url = 'https://www.heterohealthcare.com/';
    window.open(url, '_blank');
  }

  
  // pie chart define 
  public pieChartLabels: string[];
  public pieChartData: number[];
  public pieChartType: string = 'doughnut';
  public colors: any[] = [{
    backgroundColor: ['#6665dd', '#ff715b', '#29e7cd', '#fef831'], 
  }];
  public chartOptions: any = {
    legend: {
      onClick: function (e) {
        e.stopPropagation();
      }
    }
  }

  // Holidays modal    
  showmyModal() {
    this.holidaysModal = !this.holidaysModal;
    this.renderer.addClass(document.body, 'modal-open');
  }
  closeHolidaysModal() {
    this.holidaysModal = false;
    this.renderer.removeClass(document.body, 'modal-open');
  }

  
  // FORM-16 Modal
  showForm16Modal(){
    this.authService.getITPdf(this.userData.user.empID, this.userData.user.pwd,"form16a").subscribe((responseMessage) => {
      let file = new Blob([responseMessage], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.form16 = fileURL;
      this.form16_mob=this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
    }) 
    this.form16Modal = !this.form16Modal;
    this.renderer.addClass(this.document.body, 'modal-open');
  }
  closeform16Modal(){
    this.form16Modal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  } 

  // Payslip Modal
  showPayslipModal(item:any){     
    // var one = "http://iconnect.heterohcl.com/EmployeeAuth/download/files_mydesk/";
    // var two = item.PAYPERIOD;
    // var three = '-PAYSLIP-';
    // var four = ".pdf#view=FitH"
    // var emp_ID = this.userData.user.empID;
    // let url= one+emp_ID+'/'+two+three+emp_ID+four;   
    // url = "http://iconnect.heterohcl.com/EmployeeAuth/download/files_mydesk/10515/202011-PAYSLIP-10515.pdf"
    
    var payperiod = item.PAYPERIOD;
    var bu = item.BUSINESSUNITID;
    this.authService.getPdf(this.userData.user.empID, this.userData.user.pwd,payperiod,bu).subscribe((responseMessage) => {
      let file = new Blob([responseMessage], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.pay_slip = fileURL; 
      // this.pay_slip_mob = "https://drive.google.com/viewerng/viewer?embedded=true&url=" +fileURL; 
      this.pay_slip_mob=this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file)); 
     // this.pdfViewer.nativeElement.data = fileURL;
     // this.renderer.addClass(document.body, 'modal-open');
    })

    this.payslipModal = !this.payslipModal;
    this.renderer.addClass(document.body, 'modal-open');

  } 
  closePayslipModal(){
    this.pay_slip = '';
    this.payslipModal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

  //Leave policy Modal
  showleavePolicyModal(){
    this.leavePolicyModal = !this.leavePolicyModal;
    this.renderer.addClass(this.document.body, 'modal-open');
  } 
  closeleavePolicyModal() {
    this.leavePolicyModal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

// Financial Year pdf modal 
  showFY_Modal(){    
    this.authService.getITPdf(this.userData.user.empID, this.userData.user.pwd,"forecast").subscribe((responseMessage) => {
      let file = new Blob([responseMessage], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.finclYear = fileURL; 
      this.finclYear_mob=this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file)); 
    }) ;
    this.fy_Modal = !this.fy_Modal
    this.renderer.addClass(this.document.body, 'modal-open'); 
  } 
  closeCommonModal(){  
    this.fy_Modal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  }
  showjd_Modal(){
     // view emp JD pdf 
     this.authService.getJDPdf(this.userData.user.empID).subscribe(res=>{ 
      //alert("1")     
      let Jdpdf = new Blob([res], { type: 'application/pdf' });
      // console.log(Jdpdf)
      //this.isJD = Jdpdf.size
      //alert(Jdpdf.size);
      // console.log(this.isJD)
      var JdpdfURL = URL.createObjectURL(Jdpdf);
      this.Jdpdf_web = JdpdfURL;
      this.Jdpdf_mob=this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(Jdpdf));
      // console.log(Jdpdf.size);
    })

   
    this.jd_Modal = !this.jd_Modal
    this.renderer.addClass(this.document.body, 'modal-open'); 
  }
  closejd_Modal(){
    this.jd_Modal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  }
  
  NoticeModel()
  {
   // alert("1");
    this.authService.NoticeModel(this.userData.user.empID).subscribe(
        
      (res) => { 
       // alert("2");
        let note= res.result; 
  
       
  
      })
  }

 // Utility function to introduce a delay (Promise-based)
 delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Async method to show modal and handle refresh logic
async handleNoticeAndRefresh() {
  // Show the modal
  this.showNoticeModal();

  // Wait for 2 seconds (to simulate bounce/delay after modal)
  await this.delay(2000);

  // Now check if refresh is allowed for 'dashboard'
  if (this.refreshService.checkForRefresh('dashboard')) {
    this.refreshService.refreshData('dashboard');
  } else {
    console.log('Dashboard refresh already done today');
  }
}
  ngOnInit(): void {  
    
    //this.handleNoticeAndRefresh();
      
    //this.log_Data = decodeURIComponent(window.atob(localStorage.getItem('log_Data')));

    // this.authService.demo('BUID').subscribe(res=>{
    //   console.log(res);
    // })
   // this.LoginParams = atob(localStorage.getItem('loginData'))
   
   this.LoginParams = decodeURIComponent(window.atob(localStorage.getItem('loginData')));
    // console.log(this.LoginParams)

    //console.log(this.LoginParams.password)
    
   // this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser =  decodeURIComponent(window.atob(localStorage.getItem('userData')));

    this.userData = JSON.parse(this.loggedUser); 

    this.worksheet=this.userData.user.worksheet
    //console.log(this.worksheet+"---");
     //console.log("userData>>>>>>>>>>>>" ,   this.userData )
    // getting Device Type of user loggedIn
    //let device = atob(localStorage.getItem('applction'));
    //alert("1"); 
    let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));
    this.deviceInfo = JSON.parse(device).deviceInfo;
    // console.log(device);

    
    let mngr =  this.userData.Manger[0].is_MANAGER 
    this.IsManager = mngr 

    // passing empObj to submitReason()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = this.emp[0]; 
    let emp = [{ 'empID': "" + this.userData.user.empID + "", "application": this.deviceInfo.deviceType }];
    this.emp_Obj =  emp[0]; 

    this.location=this.userData.user.sublocation
    // console.log(this.emp_Obj)

    // var one = "http://androidapp.heterohcl.com/officesisto/iconapp/files_mydesk_2021/";
    // var two = "/2-16AANDB-";
    // var three = ".pdf#view=FitH"
    // var emp_ID = this.userData.user.empID;
    // let form16= one+emp_ID+two+emp_ID+three;    
    // this.form16 = this.dom.bypassSecurityTrustResourceUrl(form16);   

      
    // let path1= "http://iconnect.heterohcl.com/EmployeeAuth/download/files_mydesk/";
    // let path2 = "/1-ITFORECAST-";
    // let path3 = ".pdf#view=FitH";
    // let finclYr = path1+this.userData.user.empID+path2+this.userData.user.empID+path3;
    // this.finclYear = this.dom.bypassSecurityTrustResourceUrl(finclYr);
    


    // this.authService.itsDocs(this.empObj).subscribe(res=>{
    //   // console.log(res.ITS[0].FORM16A);
    //   let form16 = res.ITS[0].FORM16A;
    //   let finclYr = res.ITS[0].FY;
    //   this.form16 = form16;   
    //   this.finclYear = finclYr;
    // })

    let fileBasepath= this.authService.imgbase;
    this.leavePolicy= fileBasepath + "Policydocuments/leave_policy.pdf#toolbar=0&view=FitH";

    let x = {'payperiodSwitch': true, 'payperiod': 'default', "application": this.deviceInfo.deviceType };
    this.payPeriodObj = Object.assign(this.emp[0],x)

    // today date 
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate'))); 
    


    moment.locale('en');// initiate date language 'english'

    //console.log(moment(this.myDate).format("dddd, MMMM Do YYYY, h:mm:ss a")); // Full Date Format of Moment
    // Monday, July 19th 2021, 4:28:18 pm
  
    // this.latest_date = moment(this.myDate).format( 'DD-MM-yyyy');
    this.latest_dateFormtd = moment(this.myDate).format( 'yyyy-MM-DD'); 
    var year:any = moment(this.myDate).format('YYYY');
    this.oldYear =  year;
     
    this.loginTime = moment(this.myDate).format('HH:mm:ss'); 

    //console.log(this.userData.user.notice)

    // if(this.userData.user.location=='AZISTA')
    //   {
    //     if(this.userData.user.notice=='FALSE')
    //       {
    //         this.showNoticeModal();
    //       }
       
    //   }

    const todayDateString = moment().format('YYYY-MM-DD'); // Current date in 'YYYY-MM-DD' format
    const userDateString = moment(this.userData.todayDate).format('YYYY-MM-DD'); // Assuming todayDate is in the user data

    // Check if the dates match
    if (userDateString === todayDateString) {
        console.log("Today's date matches the user data date.");
    } else {
        console.log("Dates do not match.");
    }

    this.showNoticeModal();
    this.getapiData();


    // checkbox card show/hide 
    this.authService.selectedCheckbox.subscribe((res) => {
      if (res === 'select leave') {
        this.showLeaveData = !this.showLeaveData;
      } else if (res === 'select somethng') {
        this.showOtherdiv = !this.showOtherdiv;
      }
    });
 

 
    // no user in session navigate to login 
    if (this.loggedUser == null || this.loggedUser == undefined) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    // Routing loads to top page
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  
    
    
    //LOCATION param
  } //End - ngOnInIt 
      
// by d1 
// showNoticeModal() {
//   //alert('hi');
//   this.NoticeModal = !this.NoticeModal;
//   this.renderer.addClass(document.body, 'modal-open');
// }
  
// closeNoticeModal() {
//   this.NoticeModal = false;
//   this.renderer.removeClass(document.body, 'modal-open');

//   this.NoticeModel();
// }

showNoticeModal() {
  const today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
  const lastShownDate = localStorage.getItem('leaveMessageShown'); // Get the stored date from localStorage
  // Show modal only if it's the first time today or location is not 'MUM'
  if (this.location !== 'MUM' && lastShownDate !== today) {
    this.NoticeModal = true; // Show modal
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is visible
    localStorage.setItem('leaveMessageShown', today); // Store today's date to prevent showing again
  }
}
 
closeNoticeModal() {

  if (this.refreshService.checkForRefresh('dashboard')) {
    this.refreshService.refreshData('dashboard');
  } else {
    console.log('Dashboard refresh already done today');
  }

  this.NoticeModal = false; // Close the modal
  document.body.style.overflow = 'auto'; // Allow scrolling once the modal is closed


}
 
 
ngAfterViewInit() {
  if (!this.NoticeModal) {
    document.body.style.overflow = 'auto'; // Ensure scrolling is allowed by default
  }
}
//
  showPanVerifyModal(){    
    this.panVerifyModal = !this.panVerifyModal
    this.renderer.addClass(this.document.body, 'modal-open'); 
  } 
  closePanVerifyModal(){  
    this.panVerifyModal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
    this.resetPanFile() ; 
  }

  public example:any = { PAN_Number: ""  }; 


  // user PAN Actions 
  setradio(e:any){
    this.resetPanFile(); 
    this.ExistPan = false;
    this.PanInfoForm.get('validtePAN').setValue(e);
    this.thepanValue = e;
    
    const panReason = this.PanInfoForm.get('panReason');
    const expctedDate = this.PanInfoForm.get('expctedDate');
    const Pan_file = this.PanInfoForm.get('Pan_file');
    const PAN_Number = this.PanInfoForm.get('PAN_Number');

    if(e == 'NEW'){
      this.empPanDisabled = false;
      // this.datepickerElements = true;
        PAN_Number.setValidators(Validators.required);
        PAN_Number.setValidators(checkPanInputValidator(/([A-Za-z]){5}([0-9]){4}([A-Za-z]){1}$/));
        Pan_file.setValidators(Validators.required);
        panReason.clearValidators();
        expctedDate.clearValidators();       
    }
    else {
      // panReason.setValidators(Validators.required);
      // expctedDate.setValidators(Validators.required);
    }
    // panReason.updateValueAndValidity();
    // expctedDate.updateValueAndValidity();
    
    if(e == 'YES'){
      panReason.clearValidators();
      expctedDate.clearValidators();   
      Pan_file.clearValidators();
      this.PanInfoForm.controls.PAN_Number.patchValue(this.exist_PAN);
      this.empPanDisabled = false;   
      // this.handleInput(this.PanInfoForm.value.PAN_Number); 
    }
    else if(e == 'NO'){
      // this.PanInfoForm.get("PAN_Number").setValue('');
      this.PanInfoForm.controls.PAN_Number.patchValue(''); 
      this.empPanDisabled = true;  
      PAN_Number.clearValidators();
      Pan_file.clearValidators();
      panReason.setValidators(Validators.required);
      expctedDate.setValidators(Validators.required);
    }
    panReason.updateValueAndValidity();
    expctedDate.updateValueAndValidity();
    Pan_file.updateValueAndValidity();
    PAN_Number.updateValueAndValidity();
  }


  handleInput(e: any) {  
    this.inputPan = e; 
    this.showErr = false;
    this.PanInfoForm.get('PAN_Number').setValidators(Validators.required);
    this.PanInfoForm.get('PAN_Number').setValidators(checkPanInputValidator(/([A-Za-z]){5}([0-9]){4}([A-Za-z]){1}$/));
    if(e.length=='10' && this.PanInfoForm.controls.PAN_Number.valid){ 
      this.getPanData(); 
      this.showErr = false;
    } 
    else{
      this.ExistPan = false;
    }
  }

  //check with existing PAN & input PAN
  getPanData(){
    let param = {"PAN": this.inputPan}
    this.authService.panverify(param).subscribe(res=>{      
      let x = res.count[0].COUNT;
      // console.log("pan verify:",x);
      if(x==1){
        this.ExistPan = true;
        this.disableUpdateBtn = true;
        // this.disableValidateBtn= true;
      }
      else{
        this.ExistPan = false;
        this.disableUpdateBtn = false;
        // this.disableValidateBtn= false;
        this.enableApi= true;
        //final api
      }
    })
  }

  uploadPan($event: any) {  
    // if(this.currentFile.size > 1048576){   
      if($event.target.files[0]){
    if($event.target.files[0].size > 2097152){ 
          Swal.fire({  
            icon: 'info',  
            title: 'File is too big!',  
            text: 'Maximum File Size Allowed 2 MB Only',
            showConfirmButton: true,  
            timer: 5000  
          })   
          this.resetPanFile() ;
       }
       
    else{  
      this.panFile= ($event.target as HTMLInputElement).files[0];  
      if(this.panFile){
        this.panFileName = this.panFile.name;   
        this.isFileUploaded = true;
        // File Reader 
        const reader = new FileReader();
        reader.onload = () => {
          this.panNum = reader.result;
        };
        reader.readAsText($event.target.files[0]); 
  
        // BLOB 
        var blob = $event.target.files[0].slice(0, $event.target.files[0].size, 'image/png');  
        const newFile = new File([blob], this.panFile.name, {type: 'image/png'}) 
        this.fianlpanFile = newFile;  
        // if(!this.inputPan) {
        //   this.handleInput(this.empData.pan)
        // }
      } 
      
    }
  }
  else{
    this.resetPanFile() 
  }
}
  
 resetPanFile(){ 
    this.panFile= '';
    this.panFileName= '';
    this.PanInfoForm.get('Pan_file').setValue(''); 
    this.panSubmitted =false;
  }

  dateCreated(event){
    this.get_date = this.datepipe.transform(this.PanInfoForm.value.expctedDate, 'yyyy-MM-dd'); 
  }


  // validate PAN & go
  validPan(){  
    this.disableValidateBtn =true;
    this.panSubmitted = true;
    if(this.PanInfoForm.invalid){
      this.disableValidateBtn = false;
      return;
    }
    else{
    let params = {"EMPLOYEEID": this.userData.user.empID,"REQUESTTYPE": "","PANTYPE": this.PanInfoForm.value.validtePAN, "PAN": this.PanInfoForm.value.PAN_Number,"EXPECTEDDATE": ""};
    // console.log(params)
    // return;
    this.authService.panValid(params).subscribe(res=>{
      // console.log(res);
      this.disableValidateBtn = false;
      this.panSubmitted = false;

      Swal.fire({  
        icon: 'success',  
        title: 'Verified PAN',  
        text: "You're In",
        showConfirmButton: false,  
        timer: 3000  
      })
      this.ngOnInit();
    })
  }
  }

  // wrong PAN correction & go
  correctionPan(){
    this.panSubmitted = true;    
    this.disableUpdateBtn = true;
    if(this.exist_PAN != "0"){
      this.handleInput(this.PanInfoForm.value.PAN_Number); 
    }
    if (this.PanInfoForm.invalid) { 
      this.disableUpdateBtn = false;
      return;     
    }
    else
    if(this.enableApi && this.PanInfoForm.valid){
      let PanNumber = (this.PanInfoForm.value.PAN_Number).toUpperCase( ) ;
      var formData2: FormData = new FormData(); 
      formData2.append("EMPLOYEEID", this.userData.user.empID ); 
      formData2.append("REQUESTTYPE", "PANADD"); 
      formData2.append("PANTYPE", "NEW"); 
      formData2.append('FILE', this.fianlpanFile);
      formData2.append("PAN", PanNumber); 
      formData2.append("EXPECTEDDATE", '');  
        
      
      this.authService.correctionPAN(formData2).subscribe(res => {
        // console.log(res)
        if(res){
          this.disableUpdateBtn=false;
          this.panSubmitted = false;
          Swal.fire({  
            icon: 'success',  
            title: "You're In",  
            text: "PAN Modification Request Accepted",
            showConfirmButton: true,  
            // timer: 3000 
            confirmButtonText: 'OK'
          })
          this.ngOnInit();
        }
      })
    }
  }

// Dont have PAN
  dontHavePan(){
    this.disableSubmitBtn = true;
    this.panSubmitted1 = true;  
    if(this.PanInfoForm.invalid){
      this.disableSubmitBtn =false;
      return;
    }
    else{
    let params = {
      "EMPLOYEEID": this.userData.user.empID,"REQUESTTYPE": "NOPAN","PANTYPE": this.PanInfoForm.value.validtePAN, 
      "PAN": this.PanInfoForm.value.panReason,"EXPECTEDDATE": this.get_date};

      if(this.get_date !=null && this.PanInfoForm.value.panReason!="" && this.PanInfoForm.value.validtePAN == "NO"){
        
      this.authService.panValid(params).subscribe(res=>{ 
        Swal.fire({  
          icon: 'success',  
          title: 'Request Submitted',  
          text: "You're In",
          showConfirmButton: false,  
          timer: 3000 
          // confirmButtonText: 'OK'
        })
        if(res){
          this.disableSubmitBtn = false;
          this.panSubmitted1 = false;
          this.ngOnInit();
        }
        
      })
    }
  }
  } 

  logout(){
    this.LocalStorageKeysToRemove.forEach(k =>
      localStorage.removeItem(k)) ;
    this.router.navigate(['/'], { replaceUrl: true });
  }

  getapiData() {
    this.dateExprd = true;
    this.minDateVal = new Date(this.myDate);
    this.maxDateVal = new Date(this.myDate);
    this.maxDateVal.setDate(this.maxDateVal.getDate() + 30);
    this.LocalStorageKeysToRemove = ["userData","loginData", "applction","currentDate","othrPrevlgs","privileges", "newParams","letterprivileges"];
    
    this.empPanDisabled = true;
    this.PanInfoForm= this.fb.group({  
      // updateOn: "keypress"
      PAN_Number: ['',[Validators.required, checkPanInputValidator(/([A-Za-z]){5}([0-9]){4}([A-Za-z]){1}$/)]],updateOn: "keypress",
      validtePAN: ['', Validators.required], 
      Pan_file: ['', [Validators.required, fileTypeValidator()]],  
      panReason: ['',[Validators.required]],
      expctedDate: ['',[Validators.required]],
    });
    
    this.authService.panFirstverify(this.empObj).subscribe(res=>{  
      // console.log(res);
      if(res.exist_pan.length == "1"){ 
        //res.exist_pan[0].PAN
        this.showPanVerifyModal();
        
        this.exist_PAN = res.exist_pan[0].PAN;
        // this.PanInfoForm.get('PAN_Number').setValue(this.existPAN); 
        this.PanInfoForm.controls.PAN_Number.patchValue(this.exist_PAN);
        if(this.exist_PAN == "0"){
          this.noPan = true;         

          // // this.PanInfoForm.get('PAN_Number').setValue('');
          this.PanInfoForm.controls.PAN_Number.patchValue('');   
        }

        // *******wrong pan number/ digits *******
        if(res.exist_pan[0].Valid==false){
          this.showValidPAN = false;
          this.showErr = true;
          // this.disableUpdateBtn= true;
        }
        

        //******* no pan exist case*******
        if(this.exist_PAN == "0" && res.exist_pan[0].Valid==false){
          this.showValidPAN = false;
          this.showErr = false;
        }
      } 
      if(res.pan_first_verify.length != "0"){
        this.reslt = res.pan_first_verify[0];
        if((this.reslt.FLAG === "A" && this.reslt.EXPECTEDDATE =='') || (this.reslt.FLAG === "P"&& this.reslt.EXPECTEDDATE =='')){          
          this.closePanVerifyModal();
        }
        
        // ********DON'T HAVE PAN CONDITIONS
        else if(this.reslt.FLAG === "N"&& this.reslt.PANCOUNT==="PROCESS"  && this.reslt.EXPECTEDDATE !=''){
          // this.showInProgress = true;
          this.closePanVerifyModal();

        }else if(this.reslt.FLAG === "N"&& this.reslt.PANCOUNT==="EXPIRED"&& this.reslt.EXPECTEDDATE !=''){
          this.dateExprd = false;
        }

        //***** NOTE: HR SIDE actions pending ****** below code applicable on HR Action
        else if(this.reslt.FLAG === "A"&& this.reslt.PANCOUNT=="PROCESS"&& this.reslt.EXPECTEDDATE !=''){
          this.showInProgress = true;
          this.closePanVerifyModal();
        }else if(this.reslt.FLAG === "A"&& this.reslt.PANCOUNT=="EXPIRED"&& this.reslt.EXPECTEDDATE !=''){
          this.showInProgress = false;
          this.showPanVerifyModal();
          this.xprdDate = false;
          this.noPan = false;
        }
      }
    });
   

    // login Session checker api
    this.authService.loginSession(this.emp_Obj).subscribe(res=>{
      // console.log(res);
      if(res.session[0].flag=="false"){
        this.LocalStorageKeysToRemove.forEach(k =>
          localStorage.removeItem(k));
          this.router.navigate(['/'], { replaceUrl: true });
        Swal.fire({  
          icon: 'info',  
          title: 'Session Expired!',  
          text: "You've been loggedOut",
          showConfirmButton: true,  
          confirmButtonText: 'OK'
        }) 
      }
    });
 
    //++++++++ profile data api++++++++++++
    let application = {"application": this.deviceInfo.deviceType};
    let LoginParams = JSON.parse(this.LoginParams);
    let finalParams = Object.assign(LoginParams, application);
    // console.log(finalParams)
    this.authService.sendPostRequest(finalParams).subscribe((res) => {
      this.empData = res.user;
      if(this.empData){
      this.empWorkingDays= this.empData.workingdays;
    }
    //  console.log(this.empData)

      // updating todaydate 
      // localStorage.setItem('currentDate', this.empData.todaydate);

      //  show profile image based on gender 
      if (this.empData.genderid == 1) {
        this.isMale = true;
      } else if (this.empData.genderid == 2) {
        this.isFemale = true;
      };
    })
    
     //++++++++ privileges data api++++++++++++
    this.authService.privileges(this.empObj).subscribe(
      (res)=>{
       
        this.Ryts=res.Rights;  
        this.isHR= false;
        // for (let i = 0; i < this.Ryts.length; i++) {   
        //   if(this.Ryts[i].HRActions == "true" || this.Ryts[i].parent == "1"){ 
        //     this.isHR=true;}else{
        //     this.isHR =false;
        //   }} 
        for (let i = 0; i < this.Ryts.length; i++) {   
          if(this.Ryts[i].HRActions == "true"){ 
            this.isHR=true; 
          }
          else if( this.Ryts[i].parent == "1") {
            this.isHR =true;
          }
        }

        //localStorage.setItem('privileges', btoa(JSON.stringify(res)));
        localStorage.setItem('privileges',window.btoa(encodeURIComponent(JSON.stringify(res))));
         //console.log(this.Ryts)
      });

      /// MASTER 

      //++++++++ privileges data api++++++++++++
    this.authService.privileges(this.empObj).subscribe(
      (res)=>{
        this.Ryts=res.Rights;  
        this.masterview= false;
        this.LeaveQuota= false;
        // for (let i = 0; i < this.Ryts.length; i++) {   
        //   if(this.Ryts[i].HRActions == "true" || this.Ryts[i].parent == "1"){ 
        //     this.isHR=true;}else{
        //     this.isHR =false;
        //   }} 
        for (let i = 0; i < this.Ryts.length; i++) {   
          if(this.Ryts[i].Mastercreations == "true"){ 
            this.masterview=true; 
            //alert("k");
          }

        }
          for (let i = 0; i < this.Ryts.length; i++) {   
            if(this.Ryts[i].LeaveQuota == "true"){ 
              
              this.LeaveQuota=true; 
              //alert("k");
            }
           
        }


        for (let i = 0; i < this.Ryts.length; i++) {   
          if(this.Ryts[i].IDCARD == "true"){ 
            
            this.IDCARD=true; 
           // alert("k");
          }

        }

        for (let i = 0; i < this.Ryts.length; i++) {   
          if(this.Ryts[i].assestallocation == "true"){ 
            
            this.ASSETALLOCATION=true; 
           // alert("k");
          }

        }

        for (let i = 0; i < this.Ryts.length; i++) {   
          if(this.Ryts[i].Asset_it_admin == "true"){ 
            
            this.ASSETITADMIN=true; 
           // alert("k");
          }

        }

      //     for (let i = 0; i < this.Ryts.length; i++) {   
      //       if(this.Ryts[i].worksheet == "true"){ 
              
      //         this.worksheetview=true; 
      //        // alert("k");
      //       }
      // } 
       // console.log(this.masterview+"this.masterview");
        //localStorage.setItem('privileges', btoa(JSON.stringify(res)));
        localStorage.setItem('privileges',window.btoa(encodeURIComponent(JSON.stringify(res))));
         //console.log(this.Ryts)
      });

  /////// letters
      this.authService.letterprivileges(this.empObj).subscribe(
        (res)=>{
          this.AppointmentVIEW=res.VIEW;  
          //localStorage.setItem('privileges', btoa(JSON.stringify(res)));
          localStorage.setItem('letterprivileges',window.btoa(encodeURIComponent(JSON.stringify(res))));
          // console.log(this.Ryts)
        }); 

        //// Increment view

        this.authService.incrementletterprivileges(this.empObj).subscribe(
          (res)=>{ 
           // alert(res.VIEW);
            this.Incrementview=res.VIEW;  
            //localStorage.setItem('privileges', btoa(JSON.stringify(res)));
            localStorage.setItem('incrementletterprivileges',window.btoa(encodeURIComponent(JSON.stringify(res))));
            // console.log(this.Ryts)
          }); 

    

          this.authService.confirmationletterprivileges(this.empObj).subscribe(
            (res)=>{
             // alert(res.VIEW);
              this.Confirmationview=res.VIEW;  
              //localStorage.setItem('privileges', btoa(JSON.stringify(res)));
              localStorage.setItem('confirmationletterprivileges',window.btoa(encodeURIComponent(JSON.stringify(res))));
              // console.log(this.Ryts)
            });
   

    //++++++++ assessment access api++++++++++++
    this.authService.assessment_accesslink(this.empObj).subscribe(
      (res)=>{
          // console.log(res.access);
          this.assmntAccess= res.access;
          // if( this.assmntAccess != true) {
          //   let x= 'false';
          //   this.router.navigate(['/errorPage', {MngrAssmntAccess: x}]); 
          // } 
          //localStorage.setItem('othrPrevlgs', btoa(JSON.stringify(res)));
          localStorage.setItem('othrPrevlgs', window.btoa(encodeURIComponent(JSON.stringify(res))));
      }); 

      //++++++++ announcement api++++++++++++
      // let BU = {"buid": ""+this.userData.user.buid+""};  
      // this.authService.announcement(BU).subscribe(res=>{        
      //   this.announc_ment= res.announcement ;   
      //   // console.log(this.announc_ment);   
      // })

    //++++++++ profile pic api++++++++++++  
    this.authService.profilepicview(this.empObj).subscribe(
      (res)=>{
        // console.log(res);
        this.profilepic = res.profilepicview;
        if(this.profilepic!=0){
          this.imgURL= this.authService.imgbase + this.profilepic ; 
        }
      }
    ) 
   
    //++++++++ TodayLogins api +++++++++++
    // this.authService.todayLogins(this.empObj).subscribe(
    //   (res) => {
    //     this.todayLogins = res.TodayLogins;
    //   })

    this.authService.empAppraisal(this.empObj).subscribe(
      (res)=>{
        // console.log(res)
        this.isAppraisal= res.appraisal;
      });

    //++++++++ Attendance api +++++++++++
    this.authService.attendance(this.payPeriodObj).subscribe(
      (res) => {
        
        this.inOutData = res.INOUT;
        if(this.inOutData.length!= 0){
          // console.log(this.inOutData.length)
        this.deductnHrs = this.inOutData[this.inOutData.length-1].DEDHOURS;
        this.wrkHrs =  this.inOutData[this.inOutData.length-1].WorkingHours; 

        let inTime: any;
        let outTime: any;
        let netHrs: any;
        let dayType:any;
        let today = new Date();
        this.latest_date =  moment(today).format( 'DD-MM-yyyy');
        // console.log(this.latest_date)
        for (let i = 0; i < this.inOutData.length; i++) {    
        // Today In&Out Card data 
          if (this.inOutData[i].date == this.latest_date) {
            inTime = this.inOutData[i].in;
            outTime = this.inOutData[i].out;

            netHrs = this.inOutData[i].netHours;
            dayType= this.inOutData[i].dayType;
          }
        } 
        this.inToday = inTime;
        this.OutToday = outTime;
        this.TodaynetHours = netHrs; 
        this.dayType = dayType;
    
        this.addDurationToHours(); 

  
        //  IN&OUT Table reverse array 
        this.inOutDataDescndng = this.inOutData.reverse();
        this.isLoading = false;
      }
      this.isLoading = false;
      },err => { 
        console.log(err);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      })



    //++++++++ leave quota api +++++++++++ 
     
      if(this.userData.user.costcenter!="FIELD"){
        this.authService.leavequota(this.emp_Obj).subscribe(
          (res) => {
            this.leaveData = res.LeaveQuota;
            // console.log(this.leaveData,this.leaveData.length)
        
            //  sum of user leaves 
            let leaveTypeArray:any=[];
            let leaveLableArray:any=[];
            let noAvailLeaves = 0;
            let sum = 0;
            for (let i = 0; i < this.leaveData.length; i++) {

              if (this.leaveData[i].leavetype == 'CL' || this.leaveData[i].leavetype == 'SL' ||
                this.leaveData[i].leavetype == 'EL' || this.leaveData[i].leavetype == 'MRL') {
                
                // if(this.leaveData[i].availqty != 0){
                  sum += parseFloat(this.leaveData[i].usedqty);
                  noAvailLeaves += parseFloat(this.leaveData[i].availqty);
                  leaveTypeArray.push(this.leaveData[i].leavetype);
                  leaveLableArray.push(this.leaveData[i].availqty);
                // }  
              }
            }
            this.availLeaves = noAvailLeaves;
            this.sumOfUsedQuota = sum;

            //  pieChartData 
            // this.pieChartLabels = [this.leaveData[0].leavetype, this.leaveData[1].leavetype, this.leaveData[2].leavetype, this.leaveData[3].leavetype];
           // this.pieChartData = [this.leaveData[0].availqty, this.leaveData[1].availqty, this.leaveData[2].availqty, this.leaveData[3].availqty];
            
            this.pieChartLabels = leaveTypeArray; 
            this.pieChartData = leaveLableArray; 
          });
       }
  

    this.authService.empPayslips(this.empObj).subscribe(
      (res) => { 
        this.pay_slips= res.payslips; 
      })
      


      this.authService.CheckJDFILE(this.empObj).subscribe(
        
        (res) => { 
        
          this.isJD= res.result; 

         // alert("1"+this.isJD);

        })

        

    //++++++++ Holiday List api +++++++++++
    this.authService.holidaylist(this.empObj).subscribe(
      (res) => {
        this.holidayList = res.Holidaylist;
        // console.log(res.Holidaylist); 
        var checkedCategoryList= [];
        for(let i=0; i<this.holidayList.length; i ++){ 
          if(this.holidayList[i].date >= this.latest_dateFormtd){ 
               checkedCategoryList.push(this.holidayList[i]);
          } 
        }
        if(checkedCategoryList.length!=0){
          this.noHolydays = false;
        }else{ 
          this.noHolydays = true; 
        }

      })

 
    //++++++++ Birthday List api +++++++++++
    this.isLoading= true;
    this.authService.birthdaylist(this.emp_Obj).subscribe(
      (res) => {
        this.isLoading= false;
        this.birthdayList = res.Birthdaylist;
        // console.log(this.birthdayList);
        
       // let currnt_Date = atob(localStorage.getItem('currentDate')); 
        let currnt_Date = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));; 
        // let bdayDate = this.datepipe.transform(currnt_Date, 'MM-dd'); 
        let bdayDate = moment(currnt_Date).format('MM-DD');  
        let dd=  bdayDate.toString();
        // today birthdays
        var z =  dd.split('-');
         let thisMonth = z[0];
         let thisDay = z[1]; 
        this.compreBdayDate =  thisMonth + "-" +  thisDay; 
        // this.compreBdayDate =  "08-24";

        for (let i = 0; i < this.birthdayList.length; i++) {
          if (this.birthdayList[i].birthdaydateformat == this.compreBdayDate) {
            this.isBday = 1;
            // console.log('success')
            this.bdayProfleImg= this.authService.imgbase; 
          }
          else {
            this.noBday = 0;
          };
        }
      })
     
      this.timeRemains()
 
  }; //getapi() end;



  get p(){ return this.PanInfoForm.controls;};

  // thisFun(item:any){ 
  //   var one = "http://iconnect.heterohcl.com/EmployeeAuth/download/files_mydesk/";
  //   var two = item.PAYPERIOD;
  //   var three = '-PAYSLIP-';
  //   var four = ".pdf#view=FitH"
  //   var emp_ID = this.userData.user.empID;
  //   let url= one+emp_ID+'/'+two+three+emp_ID+four;   
  //   // url = "http://iconnect.heterohcl.com/EmployeeAuth/download/files_mydesk/10515/202011-PAYSLIP-10515.pdf"    
  //   this.pay_slip = url;  
  // };


  ifnoManager(event){

    let custom_title = "Reporting Manager Not Exist";
    if(event == '1'){
      custom_title = "Reporting Manager Not Exist";
    }
    if(event == '2'){
      custom_title = "Reporting Manager is Resigned";
    }

    if(event == '3'){
      custom_title = "Reporting Manager Email Not Exist";
    }
    Swal.fire({  
      icon: 'warning',  
      title: custom_title,  
      text: 'Please Contact to HR',
      showConfirmButton: true,  
      // timer: 2000  
    }) 
  }
  
  onNavigate(){
    window.open("http://iconnect.heterohcl.com/IT/", "_blank");
  }
  
  apprisal_Nav(){
    let a = "https://services.heterohcl.com/php/appraisal/authenticate?username=";
    let b = this.userData.user.empID + "&password="; 
    let c = this.userData.user.pwd; 
    let d = "&submit=Login"
    const url = a+b+c+d;
    // const url = 'http://services.heterohcl.com/php/appraisal/authenticate?username=10515&password=11e48f522f94aca7b5a3fdc316b2d7379f634174720b1da609300db5c9acf8ce&submit=Login';
    window.open(url, '_blank');
    
  }
  
   payadjustments(){  
    ///let params = this.encryptedData;
    let pass = JSON.parse(this.LoginParams); 
    const url = 'https://sso.heterohealthcare.com/payadjustments/#/login?empCode=';
    let a = this.userData.user.empID + "&password="; 
   // let b = pass.password;
    let b = 'hetero';
    
    //const finalURL =  url+a+b;
    const finalURL = url + a +b;
   // this.dom.bypassSecurityTrustResourceUrl(finalURL)

   //window.location.href = finalURL;
   window.open(finalURL, '_blank');    
  }


//************login time substraction in seconds*******
  secondsToHHMMSS(totalSeconds: any): string { 
    let hours:any = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes:any = Math.floor(totalSeconds / 60);
    let seconds:any = totalSeconds % 60;
  
    // if you want strings with leading zeroes:
    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0"); 
    return (hours + ":" + minutes + ":" + seconds); 
  }
  
  secondsToHHMMSSRegex(seconds: any): any {  
      const date = new Date(1970,0,1);
      date.setSeconds(seconds);
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  };
  
  timeRemains(){
    // converting login time to seconds 
    var hms = this.loginTime;   // your input string
    var a = hms.split(':'); // split it at the colons 
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var logTimeInSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);  
 
    const timeDiff = Math.floor(new Date().getTime() / 1000)-logTimeInSeconds;
    // console.log('Time remaining: ' + this.secondsToHHMMSSRegex(timeDiff));
    
    // if (timeDiff <= 10800) {
    //   console.log('3 hours hasn\'t elapsed yet.');
    //   console.log('Time remaining: ' + this.secondsToHHMMSSRegex(timeDiff));
    // }
  }
  





}

//***************** custom validators for Form *************
export function fileTypeValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
      let fileName = control.value;
      let ext = fileName.substring(fileName.lastIndexOf('.') + 1);
      return (ext === 'PNG' ||ext === 'png' ||ext === 'JPEG' ||ext === 'jpg' || ext === 'jpeg' ||ext === 'pdf') ? null : {'invalidFile': true};
  };
}

export function checkPanInputValidator(nameRe: RegExp): ValidatorFn {
  return (control:AbstractControl): {[key:string]: any} | null => {
    // if input field is empty return as valid else test
    let ret = (control.value !== '') ? nameRe.test(control.value) : true;
    return !ret ? {'invalidNumber': {value: control.value}} : null;
  };
}

