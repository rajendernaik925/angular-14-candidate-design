import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-assmnt-fill-form',
  templateUrl: './assmnt-fill-form.component.html',
  styleUrls: ['./assmnt-fill-form.component.sass']
})
export class AssmntFillFormComponent implements OnInit {
  assessMentForm:FormGroup; 
  empRating:FormGroup;
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  assmntAccess:any; 
  isLoading:boolean = false;
  isData:any;
  isMngr:any; 
  Ryts:any;
  authBoolean:boolean;
  assmntFormModeParams:any;
  prsdParams:any;
  assmnt_feedback_Data:any;
  assmntEmpProfleData:any;
  assmntfromviewData:any;
  isExtending:boolean = false;
  empRatingDisabled:boolean= false;
  isHODComnts:boolean= false;
  showAssmntFeedback:boolean = false;
  public submitted: boolean;
  public disableButton: boolean = false;
  public showValidatnError:boolean= false;
  public show_Other_Trainging: boolean = false;
  public show_Other_improvement: boolean = false;
  nxtApprval:any;
  nxtApprvalData:any;
  assmntFormViewLength:any;
  constructor(public router: Router,private authService: AuthService, public datepipe: DatePipe, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.submitted = false;
    // this.showValidatnError = false;
    // this.isMngr= JSON.parse(atob(localStorage.getItem('userData'))).Manger[0].is_MANAGER;
    // let y = atob(localStorage.getItem('privileges'));
    // this.Ryts =   JSON.parse(y).Rights;    
    // this.authBoolean=false;
    // for (let i = 0; i < this.Ryts.length; i++) {   
    //   if(this.Ryts[i].HRActions == "true"){ 
    //     this.authBoolean=true;
    //   }
    // }  
    // if(this.authBoolean== false){   
    //     this.router.navigate(['/errorPage', {isManager: this.isMngr}]); 
    // }
    // assessment_accesslink
    //this.assmntAccess =JSON.parse(atob(localStorage.getItem('othrPrevlgs'))).access; 

    this.assmntAccess =JSON.parse(decodeURIComponent(window.atob(localStorage.getItem('othrPrevlgs')))).access; 
    if(this.assmntAccess!= true){   
      let x= 'false';
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
  }
   // this.assmntFormModeParams = atob(localStorage.getItem('form_mode')); 
    this.assmntFormModeParams =decodeURIComponent(window.atob(localStorage.getItem('form_mode')));   
    // console.log( this.assmntFormModeParams)
    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);    
    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj =  emp[0];
    this.empRating = this.fb.group({ 
      category: ['', Validators.required],
      HOD_exptn_comments: [''],
      comments: [''],
      wrkKnwldge: [''],
      anlytclSkills: [''],
      CommnctnSkills: [''],
      intrPrsnlSkills: [''],
      teamWork: [''],
      attitude_bhvr: [''],
      cGMP: [''],
      othersImprvmnts:[''],
      othersImprvmnts_Value:[''],
      functnlTrng: [''],
      technclTrng: [''],
      bhvrlTrng: [''],
      otherTrng:[''],
      otherTrngValue:[''],
      probtnStatus: ['', Validators.required],
      probtn_extndMonths:[''],
      nextapproval_ID_NAME: [''],
    }); 
    
       
    // ??ée = 3
    if(this.assmntFormModeParams.length != 3){
      this.getApiData();
    }
     

  }
  // End of Ng Oninit
  get f() { return this.empRating.controls; }

  
  getApiData(){ 
    this.isLoading = true;
   
    this.prsdParams= JSON.parse(this.assmntFormModeParams) 
    
    if(this.prsdParams.mode == "VIEW"){
      this.empRatingDisabled= true;
    this.authService.assesment_fromview(this.assmntFormModeParams).subscribe(
      (res)=>{
        // console.log(Object.keys(res.assesmentfromview) );
       this.assmntFormViewLength =  Object.keys(res.assesmentfromview).length;
        if(this.assmntFormViewLength != 0){
        
        this.assmntfromviewData = res.assesmentfromview;
        this.isLoading = false; 
        this.empRating.get('category').setValue(this.assmntfromviewData.OVERALL_RATING)
        this.empRating.get('comments').setValue(this.assmntfromviewData.IMMEDIATE_CMNTS);
        if(this.assmntfromviewData.HOD_EXCEP_CMNTS!= null){
          this.isHODComnts = true;
          this.empRating.get('HOD_exptn_comments').setValue(this.assmntfromviewData.HOD_EXCEP_CMNTS);
        }

        for(let i=0; i<this.assmntfromviewData.FUNCTIONAL_RATING.split(',').length;i++ ){
          if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Work Knowledge'){
            this.empRating.get('wrkKnwldge').setValue('Work Knowledge'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Analytical Skills'){
            this.empRating.get('anlytclSkills').setValue('Analytical Skills'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Communication Skill'){
            this.empRating.get('CommnctnSkills').setValue('Communication Skill'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Interpersonal Skills'){
            this.empRating.get('intrPrsnlSkills').setValue('Interpersonal Skills'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Team Work'){
            this.empRating.get('teamWork').setValue('Team Work'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='Attitude/Behaviour'){
            this.empRating.get('attitude_bhvr').setValue('Attitude/Behaviour'); 
          }
          else if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]=='cGMP'){
            this.empRating.get('cGMP').setValue('cGMP'); 
          }
          else {
            this.empRating.get('othersImprvmnts').setValue('othersImprvmnts'); 
            if(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]!= 0){
              this.show_Other_improvement = true;
              this.empRating.get('othersImprvmnts_Value').setValue(this.assmntfromviewData.FUNCTIONAL_RATING.split(',')[i]); 
            }
            
            
             
          }
        }
        for(let i=0; i<this.assmntfromviewData.TRAINING_RATING.split(',').length;i++ ){
          if(this.assmntfromviewData.TRAINING_RATING.split(',')[i]=='Functional Training'){
            this.empRating.get('functnlTrng').setValue('Functional Training'); 
          }
          else if(this.assmntfromviewData.TRAINING_RATING.split(',')[i]=='Technical Training'){
            this.empRating.get('technclTrng').setValue('Technical Training'); 
          }
          else if(this.assmntfromviewData.TRAINING_RATING.split(',')[i]=='Behavioral Training'){
            this.empRating.get('bhvrlTrng').setValue('Behavioral Training'); 
          }
          else {
            this.empRating.get('otherTrng').setValue('Other_Training'); 
            if(this.assmntfromviewData.TRAINING_RATING.split(',')[i]!= 0){
              this.show_Other_Trainging = true;
              this.empRating.get('otherTrngValue').setValue(this.assmntfromviewData.TRAINING_RATING.split(',')[i]); 
            }
          }
        }
        this.empRating.get('probtnStatus').setValue(this.assmntfromviewData.PROB_STATUS);
        // this.otherFun();
        this.extendProbation();        
        this.empRating.get('probtn_extndMonths').setValue(this.assmntfromviewData.PROB_EXTEND_M0NTH);
        // this.empRating.get('nextapproval_ID_NAME').setValue(this.assmntfromviewData.NEXT_APPROVER);
      }
        // when probation extended 
        if(this.assmntFormViewLength == 0){
          this.get_assmntFeedback();
        }
      })
    
  }


  this.authService.assmnt_nextApproval(this.empObj).subscribe(res=>{
    // console.log(res.nextApproval[0]);
    this.nxtApprvalData= res.nextApproval[0];
    this.nxtApprval = res.nextApproval[0].nextapproval_ID_NAME;
    if(this.nxtApprval){
      this.empRating.get('nextapproval_ID_NAME').setValue(this.nxtApprval);
    }else{
      this.disableButton = true;
      // console.log(this.disableButton)
    }
  })
 
    //  let passingParam = {"userid": this.prsdParams.userid}
    this.authService.assmnt_emp_profiledata(this.assmntFormModeParams).subscribe(
      (res)=>{ 
        this.assmntEmpProfleData= res.assementemployeeprofiledata; 
        // console.log(this.assmntEmpProfleData, 'EMP Data');  
        this.isLoading = false;
        this.formData();
        // this.assessMentForm.get('empID').setValue(this.assmntEmpProfleData.EmpID);
        // this.assessMentForm.get('empName').setValue(this.assmntEmpProfleData.Empname);
      })  

    
  };

  
  formData(){
    this.assessMentForm = this.fb.group({  
      empID: [this.assmntEmpProfleData.EmpID], 
      empName: [this.assmntEmpProfleData.Empname],
      doj: [this.assmntEmpProfleData.DOJ],
      designation:[this.assmntEmpProfleData.Desig],
      dept:[this.assmntEmpProfleData.Dept],
      bu:[this.assmntEmpProfleData.Bu],
      past_exprnce:[this.assmntEmpProfleData.Past_Expe],
      hetero_exprnce:[this.assmntEmpProfleData.HeteroEx],
      total_exprnce:[this.assmntEmpProfleData.TotalEx] ,
      qualification:[this.assmntEmpProfleData.EduDetails]      
    })
  }
  get_assmntFeedback(){
    let passingParam = {"userid": ""+this.prsdParams.userid+"", "empID": ""+this.userData.user.empID+""};
    // console.log(passingParam)
      this.authService.assmnt_feedback(passingParam).subscribe(res=>{
          // console.log(res)
          if(res){ 
            this.showAssmntFeedback=true;
            this.assmnt_feedback_Data = res.assessmentfeedback;
            // console.log(this.assmnt_feedback_Data)
           
          }
         
        })
  }
    

  toggle_othersImprvmnts(val:any){
    this.show_Other_improvement= !this.show_Other_improvement;
    this.empRating.value.othersImprvmnts= val;
    if(this.empRating.value.othersImprvmnts_Value.length!=0){
      this.show_Other_improvement = true;
      this.empRating.get('othersImprvmnts').setValue(val)
    } 
  
  }
 
  // otherFun(){  
  //   if(this.empRating.value.otherTrng == 'Other_Training'|| this.empRating.value.otherTrngValue != ''){
  //     this.show_Other_Trainging = !this.show_Other_Trainging;  
  //   }
  // }
  toggle_Other_Trainging(val:any){
    this.show_Other_Trainging = !this.show_Other_Trainging; 
    this.empRating.value.otherTrng = val; 
    if(this.empRating.value.otherTrngValue.length!=0){
      this.show_Other_Trainging = true;
      this.empRating.get('otherTrng').setValue(val)
    } 
  }


  setNotification(notifyVia: string): void {
    const probControl = this.empRating.get('probtn_extndMonths');
    if (notifyVia === "NO") {
      probControl.setValidators(Validators.required);
    } else {
      probControl.clearValidators();
    }
    probControl.updateValueAndValidity();
}
// numbers input 
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  
  extendProbation(){
    if(this.empRating.value.probtnStatus == 'NO'){
      this.isExtending= true;
    }
    else{
      this.isExtending= false;
    }
  }
  setradio(val:any){
    // console.log(val);
    // this.empRating.value.probtnStatus = val;
    this.empRating.get('probtnStatus').setValue(val)
    this.extendProbation();
    this.setNotification(this.empRating.value.probtnStatus)
  }
  

 

  submitAssmntForm(){ 
    
    if(this.empRating.value.wrkKnwldge){
      this.empRating.get('wrkKnwldge').setValue('Work Knowledge')
    }
    if(this.empRating.value.anlytclSkills){
      this.empRating.get('anlytclSkills').setValue('Analytical Skills')
    }
    if(this.empRating.value.CommnctnSkills){
      this.empRating.get('CommnctnSkills').setValue('Communication Skills')
    }
    if(this.empRating.value.intrPrsnlSkills){
      this.empRating.get('intrPrsnlSkills').setValue('Interpersonal Skills')
    }
    if(this.empRating.value.teamWork){
      this.empRating.get('teamWork').setValue('Team Work')
    }
    if(this.empRating.value.attitude_bhvr){
      this.empRating.get('attitude_bhvr').setValue('Attitude/Behaviour')
    }
    if(this.empRating.value.cGMP){
      this.empRating.get('cGMP').setValue('cGMP')
    }
    if(this.empRating.value.othersImprvmnts){
      this.empRating.get('othersImprvmnts').setValue('othersImprvmnts')
    }
    if(this.empRating.value.functnlTrng){
      this.empRating.get('functnlTrng').setValue('Functional Training')
    }

    if(this.empRating.value.technclTrng){
      this.empRating.get('technclTrng').setValue('Technical Training')
    }
    if(this.empRating.value.bhvrlTrng){
      this.empRating.get('bhvrlTrng').setValue('Behavioral Training')
    }
    if(this.empRating.value.otherTrng){
      this.empRating.get('otherTrng').setValue('Other_Training')
    }
    // console.log(this.empRating.value);

     let x = {"userid": ""+this.prsdParams.userid+"", "empID": ""+this.userData.user.empID+""};
     let finalParams= Object.assign(this.empRating.value,x, this.nxtApprvalData)
    //  console.log('final Params======>>',finalParams)
    this.disableButton = true; 
    this.submitted= true;
    if (this.empRating.invalid) { 
      this.disableButton = false; 
      this.showValidatnError = true;
      return;
     
    }else { 
      this.authService.assmnt_submit(finalParams).subscribe(res=>{ 
        if(res){
          Swal.fire({  
            icon: 'success',  
            title: "You're Done",  
            text: "Record Successfully Submitted",
            showConfirmButton: false,  
            timer: 2000  
          }) 
          this.disableButton = false;  
          this.ngOnInit();
          this.router.navigate(['/assesmentForm', { replaceUrl: true }]); 
        }
      })
      this.showValidatnError = false;
      // this.disableButton = true; 
      this.submitted= true;
    }
  }
}
