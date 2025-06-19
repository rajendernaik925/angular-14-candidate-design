import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
@Component({
  selector: 'app-saturday-policy',
  templateUrl: './saturday-policy.component.html',
  styleUrls: ['./saturday-policy.component.sass']
})
export class SaturdayPolicyComponent  implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;

  default:any;
  BU_list:any;
  flexiPolcyForm:FormGroup;
  flxiTableData:any;
  isDisable:boolean;
  authBoolean:boolean;
  privil_eges:any= {};
  isData:any;
  isLoading:boolean;
  showError:boolean;
  public submitted: boolean; 
  inValidEmpId:any;
  empInfo:any={}; 
  isEmpInfo:boolean = false;
  empIdInput:any;
  constructor(public router: Router,public authService: AuthService, public fb: FormBuilder) { }

  ngOnInit(): void {     
    this.default = "--Select Division--"
    this.isDisable= false; 
    this.isLoading =false;
    this.showError= false;
    this.submitted = false;
    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    //this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    //let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights;  

    this.empObj = {'empID': "" + this.userData.user.empID + ""};
 
    this.getApiData();

    this.flexiPolcyForm= this.fb.group({
      businessunitid:['', Validators.required],      
      userid:[''],
      reporttype: ['', Validators.required]
    })
    this.flexiPolcyForm.get('businessunitid').setValue(this.default)

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
  // End of ngOninit
  get f() { return this.flexiPolcyForm.controls; }
  getApiData(){ 
    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Saturday_Policy == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }


    this.isLoading =true;
    this.authService.empFlexiPolcy_BU(this.empObj).subscribe(res=>{ 
      // console.log(res)
      this.BU_list = res.employeebusinessunit;
      this.isLoading =false;
    })
  }
  selectValidtn(){
    if(this.flexiPolcyForm.value.businessunitid==this.default){
      this.showError= true;
      // this.flexiPolcyForm.get('businessunitid').setValue('')
    }
    else{
      this.showError= false;
    }
  }
  onOptionsSelected(){
   this.selectValidtn()
  }

  setradio(item){ 
    this.flexiPolcyForm.get('reporttype').setValue(item)
  }
   
  getList(){
    this.submitted= true;
    this.isLoading =true;
    this.selectValidtn();
    if(this.flexiPolcyForm.invalid){  
      this.isLoading =false; 
      return;
    }else{
      if(this.empIdInput && this.empIdInput.length>=5){
        var userId = { 'userid': "" + this.empIdInput + "" };
        this.authService.saturdaypolicycheck(userId).subscribe(res=>{
          // console.log(res);
          this.empInfo = res.saturdaypolicycheck[0];  
          if(this.empInfo==1) return false; 
        });
    } 
      this.authService.saturdayflexilist(this.flexiPolcyForm.value).subscribe(res=>{
        // console.log(res)
        this.isLoading =false;
        this.flxiTableData = res.employeebusinessunit;
        this.isData = this.flxiTableData.length; 
        this.submitted= true;
      },err => {
        this.isLoading =false;
        console.log(err.status); 
      })


    } 
  }

  
// numbers input 
numberOnly(event): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;

}
onSearchChange(searchValue: string): void {  
     this.empIdInput = searchValue; 
}
 
  flxyAction(item:any, event:any){ 
    let params = {
      "userid": ""+item.Employeeid+"",
      "buttontype": ""+item.ADD+"",
      "empID": ""+this.userData.user.empID+""
    };
    // console.log('params:', params)  
   
    this.authService.saturdayAssignRemove(params).subscribe(res=>{
      // console.log(res)
      if(res.count == '1'){
        if(item.ADD =='ADD'){
          item.ADD = 'ASSIGNED';
          (event.target as HTMLButtonElement).disabled = true;
        }
        if(item.ADD =='Remove'){
          item.ADD = 'Removed';
          (event.target as HTMLButtonElement).disabled = true;
        }  
       
        
      }
    })
    
  }

 

}
