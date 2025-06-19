import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BsDatepickerModule  } from 'ngx-bootstrap/datepicker'; 
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-vaccine-reg',
  templateUrl: './vaccine-reg.component.html',
  styleUrls: ['./vaccine-reg.component.sass']
})
export class VaccineRegComponent implements OnInit {
  loggedUser: any = {};
  empForm: FormGroup;
  teamForm: FormGroup;
  
  userData: any;
  myDate:any;  
  public empData:any;
  empObj: any; 
  vaccineTypes:any;
  defaultVal:any;
  defaultVal1:any;

  disableDose1Fields: boolean;
  disableDose2Fields: boolean; 
  
  public isLoading: boolean;
  public toggleFmlyVccntn: boolean;
  public fmlyData:any;
  submitted: boolean;
  disableButton: boolean;
  showError: boolean;

  colorTheme = 'theme-dark-blue'; 
  FromDatemin: Date; 
  ToDatemin: Date;
  Datemax: Date;
  dose2minDate: Date;

  fmlyParams:any;
  itemVal:any;

  constructor(public router: Router,private authService: AuthService,
    public fb: FormBuilder, public datepipe: DatePipe) {
     
   }

  ngOnInit(): void {
    this.defaultVal = '--Select Vaccine Type--';
    this.defaultVal1 = '--Select Vaccine Type--';
 
    this.toggleFmlyVccntn = false;
   // this.loggedUser = atob(localStorage.getItem('userData')); 
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));; 
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));; 
    moment.locale('en');
    // passing empObj to getApiData() 
    let emp = [{ 'empID': "" +this.userData.user.empID+ "" }];
    this.empObj =  emp[0];
    
    //in India Vaccine process not started before 'march2020'
    let march2020 = '2020-03-01';
    this.FromDatemin = new Date(march2020);
    this.Datemax = new Date(this.myDate);
    this.ToDatemin = new Date(march2020); 
    this.dose2minDate = new Date(march2020); 
    this.familyData();
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



  }
  // End of NgOninit 

  // numbers input 
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true; 
  }

    getApiData(){

      this.empForm= this.fb.group({
        VACCINEID: ['',[Validators.required]],
        FIRST_DOSE: ['',[Validators.required]],
        FIRST_DOSE_DATE: ['',[Validators.required]],
        SECOND_DOSE: [false],
        SECOND_DOSE_DATE: [null, [Validators.required]], 

      } );
      
      

      //  code here 
      this.authService.vaccinetypes(this.empObj).subscribe(res=>{
        // console.log(res)
        this.vaccineTypes  = res.vaccinetypes;
      })

      this.authService.empVaccineDetails(this.empObj).subscribe(res=>{
        // console.log(res.empvaccinedetails[0])
        this.empData = res.empvaccinedetails[0]; 
      if(this.empData.VACCINEID!= "0"){
        this.empForm.get('VACCINEID').setValue(this.empData.VACCINEID);
        this.empForm.controls.VACCINEID.disable();
      }
      else{
        this.empForm.get('VACCINEID').setValue(this.defaultVal)
      }

      if((this.empData.FIRST_DOSE_DATE && this.empData.SECOND_DOSE_DATE) || this.empForm.value.SECOND_DOSE == false){
        this.disableButton = true;
      }
      // Onload Disable Datepikcers 
      this.empForm.controls.FIRST_DOSE_DATE.disable();  
      this.empForm.controls.SECOND_DOSE_DATE.disable();


      // FIRST DOSE date if exist
      if(this.empData.FIRST_DOSE ==  'YES' ){ 
        this.empForm.patchValue({
          FIRST_DOSE: this.empData.FIRST_DOSE,
          FIRST_DOSE_DATE: this.datepipe.transform(this.empData.FIRST_DOSE_DATE, 'dd-MMM-yyyy'), 
        })  
         
        this.ToDatemin = new Date(this.empData.FIRST_DOSE_DATE);  
        this.ToDatemin.setDate(this.ToDatemin.getDate() + 1);
        this.empForm.controls.FIRST_DOSE.disable();
        this.empForm.controls.FIRST_DOSE_DATE.disable(); 
      };


      // SECOND DOSE date if exist
      if(this.empData.SECOND_DOSE ==  'YES'){ 
        this.empForm.patchValue({
          SECOND_DOSE: this.empData.SECOND_DOSE,
          SECOND_DOSE_DATE: this.datepipe.transform(this.empData.SECOND_DOSE_DATE, 'dd-MMM-yyyy'), 
        }) 
        this.empForm.controls.SECOND_DOSE.disable();
        this.empForm.controls.SECOND_DOSE_DATE.disable();
      }


    })
    }
    // End of Get EmpData 
    


    get f() { return this.empForm.controls; }

    familyData(){
      this.toggleFmlyVccntn= !this.toggleFmlyVccntn; 
      this.authService.FmlyVaccineDetails(this.empObj).subscribe(res=>{
        // console.log(res.Familydetails)
        this.fmlyData = res.Familydetails; 


        //teamForm Form Initializaton
        const groups = {}; 
        for(let i = 0; i< this.fmlyData.length; i++) {
          groups['aadhar' + i] = [this.fmlyData[i].AADHAR, [Validators.required,]];
          groups['mobile' + i] = [this.fmlyData[i].MOBILE, [Validators.required,]];
          groups['vaccineid' + i] = [this.defaultVal1, [Validators.required,]];
          groups['first_dose' + i] = [false, [Validators.required,]];
          groups['first_dose_date' + i] = [{value: this.fmlyData[i].FIRST_DOSE_DATE, disabled: true}, [Validators.required,]];
          groups['second_dose' + i] = [ false, [Validators.required,]];
          groups['second_dose_date' + i] = [{value:null, disabled: true}, [Validators.required,]]; 
        }; 
        this.teamForm = this.fb.group(groups); 
      });
      

     
    } // end of familyData() 


    onVaccineChange(i:any, e:any){ 
      let x = (e.target['options'].selectedIndex)-1; 
      this.teamForm.get('vaccineid'+ i).setValue(this.vaccineTypes[x].SNO); 
      // console.log(this.teamForm.value['vaccineid'+ i])
    }

    checkFmlyDose1(i:any, e:any){
      // alert(i+""+item)
      if(e.target.checked){
        this.teamForm.get('first_dose_date'+ i).enable(); 
        this.teamForm.get('first_dose'+ i).setValue('YES'); 
      }
      else{
        this.teamForm.get('first_dose_date'+ i).disable(); 
        this.teamForm.get('first_dose'+ i).setValue(''); 
        this.teamForm.get('first_dose_date'+ i).setValue('');  
        // dose2 reset 
        this.teamForm.get('second_dose_date'+ i).disable(); 
        this.teamForm.get('second_dose'+ i).setValue(null); 
        this.teamForm.get('second_dose_date'+ i).setValue(null); 
      }
    }
    
    
    checkFmlyDose2(i:any, e:any){  
      if( (this.teamForm.get('first_dose' + i).value=='YES' && this.teamForm.get('first_dose_date' + i).value!='')){
        var check = e.target.checked;
      }
      else{
        if(this.fmlyData[i].FIRST_DOSE =='YES'){
           check = e.target.checked;
        }
        else{
          check= '';
          alert("Fill 1st Dose Details")
        }
      }
      

      if(check){ 
        this.teamForm.get('second_dose'+ i).setValue('YES'); 
        this.teamForm.get('second_dose_date'+ i).enable();  
      }
      else{  
        this.teamForm.get('second_dose_date'+ i).disable(); 
        this.teamForm.get('second_dose'+ i).setValue(null); 
        this.teamForm.get('second_dose_date'+ i).setValue(null); 
      } 
    }

    dose1fdate(i:any, e:any){
      this.teamForm.get('second_dose_date'+ i).disable(); 
      this.teamForm.get('second_dose'+ i).setValue(null); 
      this.teamForm.get('second_dose_date'+ i).setValue(null); 

      // setting MIN date of dose-2 on selection of dose-1 Date 
      this.dose2minDate = new Date(this.teamForm.get('first_dose_date' + i).value);  
    }


    submitFmly(i:any, item:any){ 
      // alert(this.teamForm.get('aadhar' + i).value +"---"+this.teamForm.get('mobile' + i).value +"---"+item.NAME);
     
        

      if(this.teamForm.get('second_dose_date' + i).value != null){
        var second_doseDate= this.datepipe.transform(this.teamForm.get('second_dose_date' + i).value, 'yyyy-MM-dd'); 
      }
      else{
         second_doseDate= null;
      }
      
      
   

    this.fmlyParams = 
    {
    'second_dose':this.teamForm.get('second_dose' + i).value,
    'second_dose_date': second_doseDate, 
    'personname': item.NAME,
    'aadhar':this.teamForm.get('aadhar' + i).value,
    'mobile':this.teamForm.get('mobile' + i).value,
    'vaccineid':this.teamForm.get('vaccineid' + i).value,
    'relationid': item.RELATIONID,
    'employeeid': this.empData.EmpCode,
    'createdby': this.userData.user.empID
  }

      // insert first_dose params only on form action
      if(this.teamForm.get('first_dose'+ i).value=='YES'){
        let first_doseDate= this.datepipe.transform(this.teamForm.get('first_dose_date' + i).value, 'yyyy-MM-dd');   
        let params = {
        'first_dose': this.teamForm.get('first_dose' + i).value,
        'first_dose_date':first_doseDate, 
        }
        Object.assign(this.fmlyParams,params)
      }

      if(this.fmlyData[i].VACCINEID !=='0'){
        let params = {
          'vaccineid': this.fmlyData[i].VACCINEID, 
          }
          Object.assign(this.fmlyParams,params)
      }

      // *****************************Form Validations**************
      if(this.teamForm.get('aadhar' + i).value ==""){
        alert("please enter Adhar Number");
        return false;
      }
      else if(this.teamForm.get('aadhar' + i).value.length!=12)
      {
        alert("please enter Valid Adhar Number");
        return false;
      }
      else if(this.teamForm.get('mobile' + i).value =="")
      {
        alert("please enter MOBILE NUMBER");
        return false;
      }
      else if(this.teamForm.get('mobile' + i).value.length!=10)
      {
        alert("please enter Valid MOBILE NUMBER");
        return false;
      }
      else if(this.teamForm.get('vaccineid' + i).value == this.defaultVal1 && this.fmlyData[i].VACCINEID =='0')
        {
          // alert(this.teamForm.get('vaccineid' + i).value) 
            alert("please select Vaccine Type ");
            return false;
          
        }

      else if(this.teamForm.get('first_dose_date' + i).value =="" )
        {  
          alert("please select 1ST DOSE Date");
          return false;
        }
       else if( this.fmlyData[i].FIRST_DOSE_DATE){ 
       // alert(this.teamForm.get('second_dose' + i).value);  
        if(this.teamForm.get('second_dose_date' + i).value == null||this.teamForm.get('second_dose' + i).value==false||this.teamForm.get('second_dose' + i).value==null)
        {
          alert("please select 2ND DOSE Date");
          return false;
        } 
        }

      

      else if(this.teamForm.get('second_dose' + i).value == 'YES')
      { 
       // alert(this.teamForm.get('second_dose_date' + i).value);
          if(this.teamForm.get('second_dose_date' + i).value == null)
        {
          alert("please select 2ND DOSE Date");
          return false;
        }  
      }
 
      
        // console.log(this.fmlyParams);
        this.isLoading= true;
        this.authService.family_vaccine(this.fmlyParams).subscribe(res=>{
          // console.log(res)
           let message= item.NAME+' Data Submitted Successfully';
          if(res.count>=1){
            this.isLoading = false;  
            Swal.fire({  
              icon: 'success',  
              title: "You're Done",  
              text: message,
              showConfirmButton: true,  
              // timer: 2000  
            }) 
            this.ngOnInit();
          }
          else{
            this.isLoading = false;  
            Swal.fire({  
              icon: 'warning',  
              title: "Oops!",  
              text: 'Something went Wrong, try Again.',
              showConfirmButton: true,  
              // timer: 2000  
            }) 
          }
        },err => {
          console.log(err);
          this.router.navigate(['/errorPage', {errorType: err.status}]);
        })
       
  }


  getRow(i:any){
    // alert(JSON.stringify(item))
    this.itemVal= i;
    // console.log(this.itemVal.FIRST_DOSE_DATE)
    if(this.itemVal.FIRST_DOSE_DATE){
      this.dose2minDate =  new Date(this.itemVal.FIRST_DOSE_DATE);
        // this.dose2minDate.setDate(x.getDate() + 1);
    }
  }











//************** *  employeee actions************

    onVaccineSelected(e:any){
      // console.log(e.target.value);  
      let x = (e.target['options'].selectedIndex)-1; 
      this.empForm.get('VACCINEID').setValue(this.vaccineTypes[x].SNO); 
      // alert(this.empForm.value.VACCINEID)
      if(this.empForm.value.VACCINEID==this.defaultVal){ 
        this.showError = true;
      }else{ 
        this.showError = false;
      }
    }

    checkDose1(e:any){  
      if(e.target.checked){
        this.empForm.get('FIRST_DOSE').setValue('YES'); 
        this.empForm.controls.FIRST_DOSE_DATE.enable(); 
        this.disableButton = false;
      }
      else{
        this.empForm.get('FIRST_DOSE').setValue(''); 
        this.empForm.get('FIRST_DOSE_DATE').setValue('');  
        this.empForm.controls.FIRST_DOSE_DATE.disable();
        this.resetDose2() 
      }
      // console.log(this.empForm.value.FIRST_DOSE)
    }

    checkDose2(e:any){  
      if(this.empForm.value.FIRST_DOSE=='NO'||(this.empForm.value.FIRST_DOSE=='YES' && this.empForm.value.FIRST_DOSE_DATE!='')){
        var x = e.target.checked;
      }
      else{
        if(this.empData.FIRST_DOSE =='YES'){
          var x = e.target.checked;
        }
        else{
        x= '';
        alert("Fill 1st Dose Details")
      }
      };

      if(x){
        this.date2min(); 
        this.empForm.get('SECOND_DOSE').setValue('YES'); 
        this.empForm.controls.SECOND_DOSE_DATE.enable();
        this.disableButton = false;
      }
      else{
        // alert('disabled 2')
        if(!this.empForm.value.FIRST_DOSE){
          this.disableButton = true;
        }
        this.resetDose2()
      }
      // console.log(this.empForm.value.SECOND_DOSE)
    }
    
    resetDose2(){
      this.empForm.get('SECOND_DOSE').setValue(null); 
      this.empForm.get('SECOND_DOSE_DATE').setValue(null);  
      this.empForm.controls.SECOND_DOSE_DATE.disable(); 
    }

    trackByFn(index, item) { 
      return item.id; 
    }

    date2min(){
      if(this.empData.FIRST_DOSE!=  'YES' ){
        let z= this.datepipe.transform(this.empForm.value.FIRST_DOSE_DATE, 'yyyy-MM-dd'); 
        this.ToDatemin = new Date(z);
        this.ToDatemin.setDate(this.ToDatemin.getDate() + 1);
      }
    }
    date1Change(e:any){
      // console.log("date1", e)
      this.resetDose2()
    }
    date2Change(e:any){
      this.date2min();
      // code
    }





    submitEMPData(){ 
      this.disableButton = true;
      this.submitted = true;    
      // vaccine type custom validation 
      if(this.empForm.value.VACCINEID == this.defaultVal) { 
        this.showError = true;
      }else{ 
        this.showError = false;          
      }

      if (this.empForm.invalid) { 
        this.disableButton = false;
        return; 
      }else{
        this.disableButton = false;
        if(this.showError == false){ 
        let dates = { 
          "SECOND_DOSE": this.empForm.value.SECOND_DOSE,
          "SECOND_DOSE_DATE": this.datepipe.transform(this.empForm.value.SECOND_DOSE_DATE, 'yyyy-MM-dd'),
          "CREATEDBY": this.userData.user.empID,
          "EmpCode": this.empData.EmpCode,
          "VACCINEID": this.empData.VACCINEID
        } 
        //on SECOND_DOSE_DATE  push/pipe FIRST_DOSE_DATE form param only if user entry 
        if(this.empForm.value.FIRST_DOSE_DATE){
          let x={"FIRST_DOSE_DATE": this.datepipe.transform(this.empForm.value.FIRST_DOSE_DATE, 'yyyy-MM-dd')} 
            Object.assign(dates, x);
        }        
        //on SECOND_DOSE_DATE handling VACCINEID
        if(this.empForm.value.VACCINEID ){
          let x={"VACCINEID": this.empForm.value.VACCINEID} 
            Object.assign(dates, x);
        } 
        let params = Object.assign(this.empForm.value, dates); 


        // converting all keys lo lowercase 
        var finalParams = {}; 
        for (const [key, value] of Object.entries(params)) {
          finalParams[key.toLowerCase()] = value;
        }   
        this.isLoading = true;  
        this.authService.vaccine_entry(finalParams).subscribe(res=>{
          // console.log(res)
          if(res.count>=1){
            this.isLoading = false;  
            Swal.fire({  
              icon: 'success',  
              title: "You're Done",  
              text: 'Data Submitted',
              showConfirmButton: true,  
              // timer: 2000  
            }) 
            this.ngOnInit();
          }
          else{
            this.isLoading = false;  
            Swal.fire({  
              icon: 'warning',  
              title: "Something Went Wrong",  
              text: 'Please Contact Admin',
              showConfirmButton: true,  
              // timer: 2000  
            })  
          }
        },err => {
          console.log(err.status);
          this.router.navigate(['/errorPage', {errorType: err.status}]);
        }) 
        this.disableButton = false;
        this.submitted = false; 
      }
    } 
    }




    

}
