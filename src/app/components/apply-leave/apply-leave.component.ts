import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { FormBuilder, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import { BsDatepickerModule  } from 'ngx-bootstrap/datepicker'; 
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
import { RefreshService } from '../../refresh.service';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.sass']
})
export class ApplyLeaveComponent implements OnInit { 
  public isLoading: boolean;
  LeaveApplyForm:FormGroup; 
  public submitted: boolean = false;
  public showLoctnInputs: boolean;
  public showHlfDayInputs: boolean = false;
  showToLoctnError:boolean= false;
  showFromLoctnError:boolean= false;
  public disableButton: boolean = false;
  // datesForm: FormGroup; 
  // reasonForm: FormGroup;
  loggedUser: any = {};
  userData: any;
  leaveData: any;
  emp: any = [];
  empObj: any;
  emp_Obj: any;
  public deviceInfo:any;
  isDatePickerDisabled:boolean = true;
  showNotfctn:boolean = false;
  showNotfctn1:boolean = false;
  notifyMsg:any;
  myDate: any;
  today_date: any; 
  leaveTypes:any;
  keyword1 = 'name'; 
  keyword2 = 'name';
 
  bkdays: any;
  minDateVal:number = 0;
  maxDateVal:number = 0;
  selectedLeaveType:any;
  selected_Leave:any;
  // selectedValue: string = '';
  halfDay:any;
  half_DayType:any;
  myval: string = ''; 

  minDateFrom: Date;
  maxDateFrom: Date;

  minDateTo: Date;
  maxDateTo:Date;
  colorTheme = 'theme-dark-blue';  

  actual_availblLeaves:any;
  minAvlDtes:any;
  maxAvlDates:any;
  selctdLeave:any;  
  data1:any;
  data2:any;
  frmLoctn:any;
  toLoctn:any; 
  oth_flag:any;
  leaveFormData:any;  
  defaultLeave:any;
  showError:boolean = false;
  public FYFromyear:any;
  public FYToyear:any;
  constructor(private refreshService: RefreshService,public router: Router, public authService: AuthService,
    public fb: FormBuilder, public datepipe: DatePipe) 
      {    
          this.minDateFrom = new Date(this.myDate);
          this.maxDateFrom = new Date(this.myDate);
          this.minDateTo = new Date(this.myDate);
          this.maxDateTo = new Date(this.myDate); 
      }
   
   
  // public leaveTypes:string [] = [ "Sick Leave", "Casual Leave", "Earned Leave","Loss Of Pay","Work From Home", "COMP-OFF", "On Duty"];
  
  
  public dayTypes:string [] = ["Full Day", "Half Day"];  

  

  public halfDayDates:any = [];
  public halfDayType:any = ["1st Half","2nd Half"];

  ngOnInit(): void {      


    if (this.refreshService.checkForRefresh('applyleave')) {
      this.refreshService.refreshData('applyleave');
    } else {
      console.log('Apply leave refresh already done today');
    }


    this.isDatePickerDisabled = true; 
    this.showLoctnInputs=false;
    this.defaultLeave = '--Select leave Type--'
    this.halfDay = '';  
    // this.half_DayType = this.halfDayType[0]; 
    //this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);   
    // getting Device Type of user loggedIn
    //let device = atob(localStorage.getItem('applction')); 
    let device = decodeURIComponent(window.atob(localStorage.getItem('applction')));
    this.deviceInfo = JSON.parse(device).deviceInfo;

    // passing empObj to api()
    this.emp = [{ 'empID': "" + this.userData.user.empID + "" },{ 'buid': "" + this.userData.user.buid + "" } ];
    this.empObj = this.emp[0]; 
    let emp = [{ 'empID': "" + this.userData.user.empID + "", "application": this.deviceInfo.deviceType }];
    this.emp_Obj =  emp[0];

    this.LeaveApplyForm = this.fb.group({  
      leaveType: ['', Validators.required], 
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      day_Type: [this.dayTypes[0]],
      hlfDay_Date: [''],
      hlfDay_Type: [this.halfDayType[0]],
      OD_FromLocation: ['',],
      OD_ToLocation: ['', ],
      reason: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300) ]]
    });
    this.LeaveApplyForm.get('leaveType').setValue(this.defaultLeave);
    this.LeaveApplyForm.value.day_Type= this.dayTypes[0];   
      
     
    // if(this.userData.Manger[0].mangeremail.length == 0){
    //   this.disableButton = true;
    //   Swal.fire({  
    //     icon: 'warning',  
    //     title: "Reporting Manager Not Exist",  
    //     text: 'Please Contact to HR',
    //     showConfirmButton: true,  
    //     // timer: 2000  
    //   }) 
    // }else{
    //   this.disableButton = false;
    // }
   
    this.getapiData();

    

    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate'));  
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    // this.today_date = this.datepipe.transform(this.myDate, 'EEEE, MMM dd, yyyy, hh:mm a ');
    moment.locale('en');// initiate date language 'english'


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


 


} //End - ngOnInIt 



get f() { return this.LeaveApplyForm.controls; }
 

  getapiData(){
    this.isLoading = true;  
     //++++++++ leave quota api +++++++++++
     this.authService.leavequota(this.emp_Obj).subscribe(
      (res) => {
        this.isLoading = false;  
        this.leaveData = res.LeaveQuota;
        // this.leaveTypes  = this.leaveData ;
        // console.log(this.leaveTypes)
      });
      
      this.authService.Leavetypes(this.empObj).subscribe(
        (res) => {  
          // this.isLoading = false;      
          this.leaveTypes  = res.Leavetypes;        
          // console.log(this.leaveTypes)
        //   this.bkdays =  res.Leavetypes[0].bkdays;
        //  let x =  res.Leavetypes[0].backdate;
        //   console.log(this.bkdays)
        })

        
      } //getapi() end;

      
  public onOptionsSelected(event) {
   
          this.showNotfctn1 = false;     
          
          if(this.LeaveApplyForm.value.leaveType==this.defaultLeave){
            this.isDatePickerDisabled = true; 
            this.showError = true;
          }else{
            this.isDatePickerDisabled = false; 
            this.showError = false;
          }
          

        //  this.isDatePickerDisabled = false; 
         this.LeaveApplyForm.get('fromDate').setValue('');
         this.LeaveApplyForm.get('toDate').setValue('');
         this.resetLeaveForm();
        //  this.LeaveApplyForm.get('day_Type').setValue(this.dayTypes[0]);
        //  this.LeaveApplyForm.get('hlfDay_Date').setValue('');         
        //  if(this.LeaveApplyForm.value.day_Type=='Half Day'){
        //   this.showHlfDayInputs = true;
        // }else{
        //   this.showHlfDayInputs = false;
        // }


        //  this.LeaveApplyForm.reset();
         
        // const value = event.target.value;  
        // this.selected = value;         

 
        this.LeaveApplyForm.value.leaveType = event.target['options'][event.target['options'].selectedIndex].text;  
        
        if(this.LeaveApplyForm.value.leaveType == 'ONDUTY'){
          this.showLoctnInputs = true;
        }
        else{
          this.showLoctnInputs = false;
        }

  // ++++++++ getting index based values of backdate & bkdays for MIN DATE OF FROM DATE CALENDER+++++
       var x = (event.target['options'].selectedIndex)-1;
      // var x = (event.target['options'].selectedIndex); 
      //alert(this.leaveTypes[x].shortname);
      //  alert(this.leaveTypes[x].bkdays+'>'+ this.leaveTypes[x].backdate)
      this.selectedLeaveType = this.leaveTypes[x].shortname;
      this.selected_Leave = this.leaveTypes[x].fullname;
      // alert(this.selectedLeaveType)
     if(this.leaveTypes[x].shortname == 'SL'){   
        if(parseInt(this.leaveTypes[x].bkdays) > parseInt(this.leaveTypes[x].backdate )){
          this.minDateVal =  this.leaveTypes[x].backdate; 
          this.maxDateVal = 0;
         }
         else{
          // this.minDateVal = this.leaveTypes[x].maxleave_C;
          this.minDateVal = this.leaveTypes[x].bkdays;
         }
     }
     else{
      // alert(JSON.stringify(this.leaveTypes[x]))
      if(parseInt(this.leaveTypes[x].bkdays) > parseInt(this.leaveTypes[x].backdate )){
        this.minDateVal =  this.leaveTypes[x].backdate; 
        // alert(this.minDateVal)
     }
     else { 
      this.minDateVal =  this.leaveTypes[x].bkdays;
   }
      this.maxDateVal= 90;
     }
        // console.log(this.minDateVal);        
        this.minDateFrom = new Date(this.myDate);
        this.maxDateFrom = new Date(this.myDate);
        this.minDateTo = new Date(this.myDate);
        this.maxDateTo = new Date(this.myDate); 
        this.enableDates(); 
        this.showNotfctn = false;
     }

    enableDates(){
        this.minDateFrom.setDate(this.minDateFrom.getDate() - this.minDateVal);
        this.maxDateFrom.setDate(this.maxDateFrom.getDate() + this.maxDateVal);      
        
    }



     
    dateCreated(event){
      this.resetLeaveForm();
      // console.log(this.LeaveApplyForm.value.fromDate )  
      // this.minDateTo = new Date(this.LeaveApplyForm.value.fromDate); 
    this.minDateTo = new Date(this.myDate);
    this.maxDateTo = new Date(this.myDate); 
    // alert(this.minDateTo);

     var get_date = this.datepipe.transform(this.LeaveApplyForm.value.fromDate, 'yyyy-MM-dd'); 
     let passingObj = {'fromdate': get_date, 'empID': this.userData.user.empID, 'leavetype': this.selectedLeaveType};
     
     this.minDateTo = new Date(get_date);
     this.maxDateTo = new Date(get_date);

     if(this.LeaveApplyForm.value.fromDate){
 
     this.isLoading = true;
     this.authService.eligibleleaves(passingObj).subscribe(
        (res) => {
          this.isLoading = false;
          // console.log(res);
          var response = res.eligibleleaves[0];
          if(this.selectedLeaveType==response.Shortname){
          this.showNotfctn = true;   
          this.showNotfctn1 = false; 
          
          this.FYFromyear = this.datepipe.transform(get_date, 'yyyy'); 
          // console.log("FromDate Year: "+this.FYFromyear);
        }
        //++++++++ notification or leaves count alert +++++++++++
          if(response.availableQuantity != null && (this.selectedLeaveType == 'CL'|| this.selectedLeaveType == 'SL'|| this.selectedLeaveType == 'EL'|| this.selectedLeaveType == 'MRL' )){
            this.actual_availblLeaves = response.ACTUALAVAIL;
            this.minAvlDtes = response.Min;
            this.maxAvlDates = response.Max;
            this.selctdLeave = response.Shortname;   
          } 
            // alert(this.minDateTo+"-----"+res.eligibleleaves[0].Max);
           // this.minDateTo = new Date(this.LeaveApplyForm.value.fromDate);
           if(this.selectedLeaveType == 'EL'){
            this.minDateTo.setDate(this.minDateTo.getDate() + parseInt(res.eligibleleaves[0].Min)-1); 
           }
           else{           
             this.minDateTo.setDate(this.minDateTo.getDate()-parseInt(res.eligibleleaves[0].Min));  
            }
            if(this.selectedLeaveType == 'MRL' || this.selectedLeaveType == 'CL' || this.selectedLeaveType == 'EL'){
              let theVal = res.eligibleleaves[0].availableQuantity;
              if(theVal == "0.5"){
                theVal=1;
              }
              this.maxDateTo.setDate(this.maxDateTo.getDate()+parseInt(theVal)-1);
            }
            else{
              // this.minDateTo.setDate(this.minDateTo.getDate() + parseInt(get_date)-1);
              this.minDateTo = new Date(get_date);
              // this.maxDateTo.setDate(this.maxDateTo.getDate()+ 29);
              if(this.selectedLeaveType == 'SL'){
                // this.maxDateTo = new Date(get_date);
                let theVal = res.eligibleleaves[0].SL_MX_LEAVE; 
                if(theVal == "0.5"){
                  theVal=1;
                }
                this.maxDateTo.setDate(this.maxDateTo.getDate()+parseInt(theVal)-1);                
              }
              else{
                this.maxDateTo.setDate(this.maxDateTo.getDate()+ 29);
              }
            }

            // resetting toDate input, onclick of fromDate input
            this.LeaveApplyForm.get('toDate').setValue('');

            //  console.log("min-to"+ ":" +this.minDateTo)
            //  console.log("max-to"+ ":" +this.maxDateTo)
        })
      }
       
     
    }
  
    maxDate_Clicks(event){ 
      
      this.resetLeaveForm();
    if(this.LeaveApplyForm.value.fromDate !=''&& this.LeaveApplyForm.value.toDate !=''){
      if(this.selectedLeaveType =="CL"||this.selectedLeaveType=="SL"){
        this.checkFY();
      }
      else{
        this.todateAPIcall();
      }
      }   
    };
    
   public checkFY(){
    this.FYToyear = this.datepipe.transform(this.LeaveApplyForm.value.toDate, 'yyyy'); 
    // console.log("ToDate Year: "+this.FYToyear);
    if(this.FYFromyear!=this.FYToyear){
      this.isLoading = false;
      Swal.fire({  
        icon: 'warning',  
        title: "Calender Year should be same",  
        text: 'Please Check',
        showConfirmButton: true,  
        // timer: 2000  
      }) 
      this.LeaveApplyForm.get('fromDate').setValue('');
       this.LeaveApplyForm.get('toDate').setValue('');
       this.showNotfctn1 = false;
       this.showNotfctn = false;
    }
    else{
      this.todateAPIcall();
    }
   } 

   public todateAPIcall(){
    this.oth_flag = '';
    this.get_params();  
    this.isLoading = true;
    this.authService.applyleave(this.leaveFormData).subscribe(
      (res) => {
        // console.log(res)
        if(res){
          this.isLoading = false;
          // console.log(res);
          this.showNotfctn1 = true;
            this.showNotfctn = false;
            this.notifyMsg = res.leaveapply.Message;
        }
        else{
          this.isLoading = false;
        }
       
      });
   }
  

    public onDayTypeSelected(event){
     // alert("1");
        if(this.LeaveApplyForm.value.day_Type == 'Half Day'){
          this.showHlfDayInputs = true;
          this.halfDay = this.datepipe.transform(this.LeaveApplyForm.value.fromDate, 'yyyy-MM-dd');
          // this.halfDay = this.LeaveApplyForm.value.hlfDay_Date;
          this.LeaveApplyForm.get('hlfDay_Date').setValue(this.halfDay); 
        }else{
          // this.LeaveApplyForm.value.hlfDay_Date = this.datepipe.transform(this.LeaveApplyForm.value.fromDate, 'yyyy-MM-dd');
          this.LeaveApplyForm.get('hlfDay_Date').setValue(''); 
          this.showHlfDayInputs = false;
        }

        this.LeaveApplyForm.value.day_Type = event.target['options'][event.target['options'].selectedIndex].text;  
       
         
      // console.log(this.selectedValue)

      // binding from-date & to-date to HalfDayDate select options
      let x = this.datepipe.transform(this.LeaveApplyForm.value.fromDate, 'yyyy-MM-dd');
      let y = this.datepipe.transform(this.LeaveApplyForm.value.toDate, 'yyyy-MM-dd'); 
      if(x==y){
        this.halfDayDates = [x]
      }
      if(x!=y){
        this.halfDayDates = [x, y]
      }
      this.LeaveApplyForm.get('hlfDay_Type').setValue(this.halfDayType[0]);
      if(this.LeaveApplyForm.value.fromDate!=''&&this.LeaveApplyForm.value.toDate!=''){
          this.checkingFunctn();
        }
    }  
    
    public halfDayDate(event){      
      let theSelctdOption = event.target['options'][event.target['options'].selectedIndex].text;
      let DateSelctd = this.datepipe.transform(theSelctdOption, 'yyyy-MM-dd');
      this.LeaveApplyForm.get('hlfDay_Date').setValue(DateSelctd); 
      
      
      // console.log(this.halfDay)    
      this.checkingFunctn();
    }

    public Half_dayType(event){
      let day = event.target['options'][event.target['options'].selectedIndex].text;
      this.LeaveApplyForm.get('hlfDay_Type').setValue(day); 
      this.half_DayType = this.LeaveApplyForm.value.hlfDay_Type;
      // console.log(this.half_DayType)
    }

 



  //+++++++++++ OD from location to location search filter +++++++++++
      selectEvent1(item) {
        // do something with selected item 
        let loctn_Val= item.name;
       this.LeaveApplyForm.get('OD_FromLocation').setValue(loctn_Val);
       this.frmLoctn = this.LeaveApplyForm.value.OD_FromLocation;
        if(this.frmLoctn != '' || this.frmLoctn != undefined){
          this.showFromLoctnError = false;
        }
      }     
      onChangeSearch1(val: string) {
        // fetch remote data from here
        // And reassign the 'data' which is binded to 'data' property.

        let x = [{"locationname": val}];
        // console.log(x)
        this.authService.locationsearch(x[0]).subscribe(
          (res) => {
            // console.log(res.locationsearch, "locatinResponce");
            this.data1 = res.locationsearch;
          })        
      }      
      onFocused1(e){
        // do something when input is focused
      }

      selectEvent2(item) {
        // do something with selected item 
       let loctn_Val= item.name;
       this.LeaveApplyForm.get('OD_ToLocation').setValue(loctn_Val);
       this.toLoctn = this.LeaveApplyForm.value.OD_ToLocation;        
        if(this.toLoctn != '' || this.toLoctn != undefined){
          this.showToLoctnError = false;
        }
      }     
      onChangeSearch2(val: string) {
        // fetch remote data from here
        // And reassign the 'data' which is binded to 'data' property.
        let y = [{"locationname": val}];
        // console.log(x)
        this.authService.locationsearch(y[0]).subscribe(
          (res) => { 
            this.data2 = res.locationsearch;
          })        
      }      
      onFocused2(e){
        // do something when input is focused
      }


      // Restrict Spl Characters  <textarea (keypress)="omit_special_char($event)"/>
      omit_special_char(event)
      {   
         var k;  
         k = event.charCode;  //         k = event.keyCode;  (Both can be used)
         return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
      }



 
      resetLeaveForm(){
        this.halfDayDates = [];
        // this.LeaveApplyForm.value.day_Type= this.dayTypes[0]; 
        // this.half_DayType = '';
        this.LeaveApplyForm.get('day_Type').setValue(this.dayTypes[0]);
        this.LeaveApplyForm.get('hlfDay_Date').setValue('');
        this.LeaveApplyForm.get('hlfDay_Type').setValue(this.halfDayType[0]);
        if(this.LeaveApplyForm.value.day_Type == 'Half Day'){
          this.showHlfDayInputs = true;
        }else{ 
          this.showHlfDayInputs = false;
        }
        this.LeaveApplyForm.get('OD_FromLocation').setValue('');
        this.LeaveApplyForm.get('OD_ToLocation').setValue('');
        this.frmLoctn ='';
        this.toLoctn = '';
        this.LeaveApplyForm.get('reason').setValue(''); 
       }


      get_params(){ 
        var LeaveFrom_date = this.datepipe.transform(this.LeaveApplyForm.value.fromDate, 'yyyy-MM-dd');
        var LeaveTo_date = this.datepipe.transform(this.LeaveApplyForm.value.toDate, 'yyyy-MM-dd');
        let subject= 'Request For '+ this.selected_Leave ;
         if(this.frmLoctn== undefined || this.toLoctn == undefined){
          this.frmLoctn = '';
          this.toLoctn = '';
         }
         if(this.LeaveApplyForm.value.hlfDay_Type == this.halfDayType[0]){
          this.LeaveApplyForm.value.hlfDay_Type = 'false';
         }
         else if(this.half_DayType){
          this.LeaveApplyForm.value.hlfDay_Type = this.half_DayType
         }
         if(this.LeaveApplyForm.value.hlfDay_Date == ''){
          this.LeaveApplyForm.value.hlfDay_Date = '0000-00-00';
         }

         this.oth_flag = 'Y'; 
        
       this.leaveFormData = { 
          'empID': this.emp[0].empID,
          'buid':  this.emp[1].buid,
          'othflag': this.oth_flag,
          'empEmail': this.userData.user.proemail,
          'leave_type': this.selectedLeaveType,
          'from_date': LeaveFrom_date,
          'to_date': LeaveTo_date,
          'hal_date': this.LeaveApplyForm.value.hlfDay_Date,
          'halfday': this.LeaveApplyForm.value.hlfDay_Type,
          'to_mail': this.userData.Manger[0].mangeremail,
          'cc_mail': '',
          'from_loc': this.frmLoctn,
          'to_loc': this.toLoctn,
          'maxleave': this.maxAvlDates, 
          'reason': this.LeaveApplyForm.value.reason,
          'subject': subject,
          'hr_att': '',
          'hr_att_user': '',
          'compoff': '',
          'comm_date': ''
          };
        // console.log( this.leaveFormData )
      };



      checkingFunctn(){
        this.get_params();  
        this.isLoading = true;
        this.authService.applyleave(this.leaveFormData).subscribe(
          (res) => {
            if(res){
              this.isLoading = false;
              // console.log(res);
              this.showNotfctn1 = true;
              this.showNotfctn = false;
              this.notifyMsg = res.leaveapply.Message;
          }       
          else{
            this.isLoading = false;
          }  
        });
      }



      apply_Leave(){
        this.isLoading = true;
        this.get_params(); 
        let x = {'othflag': 'N'}
        this.leaveFormData= Object.assign(this.leaveFormData,x);
        // console.log(this.leaveFormData)
        this.authService.applyleave(this.leaveFormData).subscribe(
          (res) => {
            if(res){
              this.isLoading = false;
              
              if(res.leaveapply.Flag == '1'){ 
                // alert(res.leaveapply.Message);
                Swal.fire({  
                  icon: 'success',  
                  title: res.leaveapply.Message,  
                  // text: 'Congratulations',
                  showConfirmButton: true,  
                  // timer: 2000  
                })  
                this.getapiData();
                this.submitted = false;
                this.showNotfctn1 = false;
                this.showNotfctn = false; 
                this.resetLeaveForm();
                this.selectedLeaveType='';
                this.ngOnInit();
              }
              else{
                this.showNotfctn1 = true;
                this.showNotfctn = false;
                this.notifyMsg = res.leaveapply.Message;
              }
            }            
          });
      }
      submitLeaveForm() { 
        this.disableButton = true;
        this.submitted = true;   
        // console.log(this.LeaveApplyForm.value.leaveType)
        if(this.LeaveApplyForm.value.leaveType == this.defaultLeave) {
          // this.isDatePickerDisabled = true; 
          this.showError = true;
        }else{
          // this.isDatePickerDisabled = false; 
          this.showError = false;          
        }  
        // from location Validation
        if(this.frmLoctn == '' || this.frmLoctn == undefined){
          this.showFromLoctnError = true;
        } else{
          this.showFromLoctnError = false;
        }
        // To location Validation
        if(this.toLoctn == '' || this.toLoctn == undefined){
          this.showToLoctnError = true;
        } else{
          this.showToLoctnError = false;
        } 
        if (this.LeaveApplyForm.invalid) { 
          this.disableButton = false;
          return;
         
        }else{
          let callApi= false;
          if(this.selectedLeaveType == 'OD'){
            if(this.frmLoctn.trim().length!=0 && this.toLoctn.trim().length!=0){
              callApi = true;
            }
          }
          else{
            callApi= true;
          }
          if(callApi){
          this.apply_Leave();   
          // this.LeaveApplyForm.get('leaveType').setValue(this.defaultLeave);
          // alert("Leave Applied") 
          this.disableButton = false;
        }
        else{
          // alert('please contact admin')
          Swal.fire({  
            icon: 'warning',  
            title: "Something Went Wrong",  
            text: 'Please Contact Admin',
            showConfirmButton: true,  
            // timer: 2000  
          }) 
        }
        }
      }
}
