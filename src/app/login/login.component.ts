import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../user';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Observable,BehaviorSubject } from 'rxjs';
import{Base64} from 'angular-base64/angular-base64';
import { PasswordValidator } from './password.validator';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CookieService } from 'ngx-cookie-service';
// import {CookieService} from 'angular2-cookie/core';
import { DeviceDetectorService } from "ngx-device-detector";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  capsOn: any;
  loginForm: FormGroup;
  frgtPswdForm: FormGroup;
  generatePswdForm: FormGroup;

  isSubmitted = false;
  isLoading = false;
  classNum: any;
  fieldTextType: boolean; 
  fieldTextType1: boolean; 
  showLoginForm:boolean = true;
  showForgtForm:boolean = false;
  isEmp:boolean = false;
  isDisabled:boolean= false;
  resendOtpBtn:boolean= false;
  RegMobNumber:any;
  hideEmpLabel:boolean= false;
  showEmpInput:boolean= true;
  emp_ID:any;
  otp_Params:any;
  public validCode:any;
  public otptimer:any; 
  
  showOtpForm:boolean= false;
  showPaswdForm:boolean= false; 
  isValidOTP:boolean= false;
  showAlert:boolean = false;
  public otp: string;  
  deviceInfo = null;

  @ViewChild('ngOtpInput', { static: false}) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: true,
    placeholder: '', 
  };
  constructor(private authService: AuthService, private renderer: Renderer2,
    public fb: FormBuilder, public router: Router, private deviceService: DeviceDetectorService,
    private cookieService: CookieService ) { }

  // numbers input 
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }


  // switching login bg images 
  classSwtich() {
    this.classNum = Math.floor((Math.random() * 3) + 1);
  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
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



  ngOnInit(): void {
  
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(5), Validators.pattern("^[0-9]*$")]],
      password: ['', [Validators.required, Validators.minLength(6), PasswordValidator.cannotContainSpace]],
      rememberMe: [true], 
    });


    //**** fetching device type of user
    this.deviceInfo = this.deviceService.getDeviceInfo(); 
    let deviceInfo:any = {'deviceInfo': this.deviceInfo}
    //localStorage.setItem('applction', btoa(JSON.stringify(deviceInfo)));

    localStorage.setItem('applction', window.btoa(encodeURIComponent(JSON.stringify(deviceInfo))));

    if(this.loginForm.value.rememberMe){
      if(localStorage['log_Data']){
       // let logParams = atob(localStorage.getItem('log_Data'));
       
       let logParams = decodeURIComponent(window.atob(localStorage.getItem('log_Data')));;
        let u = JSON.parse(logParams).userName;
        let p = JSON.parse(logParams).password;  
        this.loginForm.get('userName').setValue(u);
        this.loginForm.get('password').setValue(p); 
      }
    }  




    this.frgtPswdForm = this.fb.group({
      empID: ['', [Validators.required, Validators.minLength(5), Validators.pattern("^[0-9]*$")]],
    });
    this.generatePswdForm = this.fb.group({
      newPasswrd: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15), 
        Validators.pattern('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{6,}')]],
      confrmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
    }, {validator: this.checkIfMatchingPasswords('newPasswrd', 'confrmPassword')});
    

    this.classSwtich();
    if(localStorage.getItem('userData') == undefined)
    {
      this.router.navigate(['/'], { replaceUrl: true });
    }else{
      // this.router.navigate(['/dashboard'], { replaceUrl: true });
      this.router.navigate(['/home'], { replaceUrl: true });
    }
 
  }
  // End of ngOninit

  

  get f() { return this.loginForm.controls; }
  get g() { return this.frgtPswdForm.controls; }
  get h() { return this.generatePswdForm.controls; }

  login() {  
      if(this.loginForm.value.rememberMe === true){
          let myVar = JSON.stringify(this.loginForm.value);
          
          //localStorage.setItem('log_Data', btoa(myVar) );
          localStorage.setItem('log_Data',window.btoa(encodeURIComponent(myVar))); 
          this.loginForm.get('rememberMe').setValue(true);  
        }else{
          this.loginForm.get('rememberMe').setValue(false); 
          localStorage.removeItem('log_Data')
        }
    this.isSubmitted = true;
    this.isLoading = true;
      if (this.loginForm.invalid) {
        return;
      } 
      
      let logParams = {"userName": this.loginForm.value.userName, "password": this.loginForm.value.password, "application": this.deviceInfo.deviceType };
      // console.log(logParams)
    
    this.authService.sendPostRequest(logParams).subscribe(
      (res) => {
        // console.log('after api call===', res);
        if (res.status === 1) {   
          this.isLoading = false;
         // localStorage.setItem('userData', btoa(JSON.stringify(res)));
         // localStorage.setItem('currentDate', btoa(res.user.todaydate));

          localStorage.setItem('userData', window.btoa(encodeURIComponent(JSON.stringify(res))));
          localStorage.setItem('currentDate',window.btoa(encodeURIComponent(res.user.todaydate)));

          let myVar = JSON.stringify(this.loginForm.value);
         // localStorage.setItem('loginData', btoa(myVar) );

          localStorage.setItem('loginData', window.btoa(encodeURIComponent(myVar)));

          
          // this.router.navigate(['/dashboard'], { replaceUrl: true });
          this.router.navigate(['/home'], { replaceUrl: true });

          // console.log(localStorage.getItem('userData'));

          // setTimeout(function() { localStorage.clear(); }, (10 * 60 * 1000));
        }else if (res.status === 0) {
          // alert('Invalid Credentials');
          Swal.fire({  
            icon: 'error',  
            title: 'Login Failed',  
            text: 'Invalid Credentials! ',
            showConfirmButton: false,  
            timer: 2000  
          })  
          this.isLoading = false;
        }
        else{
          this.isLoading = false;
          this.router.navigate(['/'], { replaceUrl: true });
        }
      },err => {
        console.log(err.status);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      });
  }



  empVerify(){ 
    this.authService.empverify(this.frgtPswdForm.value).subscribe(
      (res) => {        
        // console.log(res); 
        if(res.verify && res.verify.moblength === "10"){
          this.RegMobNumber= res.verify.mobile; 
          this.emp_ID = res.verify.empID
          this.isEmp= true;
          // this.frgtPswdForm.disable()
          this.isDisabled = true;
          this.hideEmpLabel= true;
          this.showEmpInput= false;
          this.otp_Params = {'mobile': this.RegMobNumber, 'empID': this.emp_ID}; 
        }
       if(res.verify && res.verify.moblength === "0"){
         
        this.isEmp= true;
          Swal.fire({  
            icon: 'error',  
            title: 'Request Not Processed!',  
            text: 'Please contact HR to update your Mobile Number',
            showConfirmButton: true,  
            // timer: 2000  
          }) 
        }
        else if(res.verify === null){
          Swal.fire({  
            icon: 'error',  
            title: 'Invalid Employee ID',  
            text: 'Enter Valid Employee ID! ',
            showConfirmButton: false,  
            timer: 2000  
          }) 
        }
      })
  }


getOTP(){
  this.isLoading = true;  
  this.authService.getOtp(this.otp_Params).subscribe(
    (res) => {        
      // console.log(res);
      if(res.message =="Success"){
      this.isLoading = false;  
      this.showAlert = true;
      setTimeout(() => { this.showAlert = false; }, 20000);
      this.showOtpForm = true; 
      this.resendOtpBtn = false;
    }
    else{
      this.isLoading = false; 
      Swal.fire({  
        icon: 'error',  
        title: 'Invalid Mobile Number',   
        showConfirmButton: false,  
        timer: 2000  
      }) 
    }
    })
}
resendOTP(){
  this.getOTP()
  this.ngOtpInput.otpForm.enable();
  this.ngOtpInput.otpForm.reset()
}
hideAlert(){
  this.showAlert = false;
}
onOtpChange(otp) {
  this.otp = otp;
  // console.log(this.otp) 
  if(this.otp.length == 4){
    // alert(this.otp)
    this.isLoading = true; 
    let OTPVerifyParams = {'OTP': this.otp, 'empID': this.frgtPswdForm.value.empID}; 
    this.authService.otpverify(OTPVerifyParams).subscribe(
      res=>{
        this.isLoading = false; 
        // console.log(res);
        this.validCode= res.VALID;
        this.otptimer= res.OTPEXPIRE;
        if(res.VALID == 0 && res.OTPEXPIRE == 0){
          // alert("invalid OTP")
          Swal.fire({  
            icon: 'error',  
            title: 'invalid OTP',   
            showConfirmButton: false,  
            timer: 2000  
          }) 
        }
        else {
          this.ngOtpInput.otpForm.disable();
          this.showPaswdForm = true;
          this.isValidOTP = true;

          if( res.OTPEXPIRE == 0){
            // alert("Entered OTP is Expired");
            Swal.fire({  
              icon: 'error',  
              title: 'Entered OTP is Expired',   
              showConfirmButton: false,  
              timer: 2000  
            }) 
            this.resendOtpBtn = true;
            this.showPaswdForm = false;
          this.isValidOTP = false;
          }

        }
      }
    )
  } 
}

  forgtPswdForm(){        
      this.showLoginForm = false ;
      this.showForgtForm = true;    
      this.isDisabled = false; 
  }
  skipForgtForm(){
    this.showLoginForm = true ;
    this.showForgtForm = false;
    
    this.resetfrgtForm()

  }
  generatePassword(){
    this.onOtpChange(this.otp);
    if(this.otptimer == 1){
    
    let newpasswrdParams = {'OTP': this.otp, 'empID': this.frgtPswdForm.value.empID, 'password': this.generatePswdForm.value.confrmPassword };
    this.onOtpChange(this.otp);
    this.authService.forgotpassword(newpasswrdParams).subscribe(
      res=>{
          // console.log(res)
          if(res.VALID >=1){
             Swal.fire({  
            icon: 'success',  
            title: 'Password Updated Successfully',  
            showConfirmButton: false,  
            timer: 1000  
          }) 
          setTimeout(() => {this.skipForgtForm() }, 1000);
            
          }
      })  
    }else{
      if(this.otptimer == 0){
          // alert("OTP is Expired");
          Swal.fire({  
            icon: 'error',  
            title: 'OTP is Expired',   
            showConfirmButton: false,  
            timer: 2000  
          }) 

        }
    }
  }
  resetfrgtForm(){
    this.hideEmpLabel= false;
    this.showEmpInput= true;
    this.frgtPswdForm.reset(this.frgtPswdForm.value);
    this.generatePswdForm.reset(this.generatePswdForm.value);
    this.isDisabled = false;
    this.RegMobNumber= null;
    this.isEmp = false;
    this.showOtpForm = false;
    this.showPaswdForm = false;
    this.ngOnInit();
  }

// <!-- Switching method -->
togglePswd() {
  this.fieldTextType1 = !this.fieldTextType1;
}

}
