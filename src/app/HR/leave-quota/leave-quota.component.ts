import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router'; 
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ;

@Component({
  selector: 'app-leave-quota',
  templateUrl: './leave-quota.component.html',
  styleUrls: ['./leave-quota.component.sass']
})
export class LeaveQuotaComponent implements OnInit {
  
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  userId:any;
  empInfo:any={};
  profle_imgURL:any;
  ProfileImg:boolean = false;
  isEmpInfo:boolean = false;  
  inValidEmpId:any;
  Responce:any;
  authBoolean:boolean;
  privil_eges:any= {};

  isLoading:boolean = false;
  colorTheme = 'theme-dark-blue';  
  constructor(public router: Router,
    public authService: AuthService) { 
   }
  
  ngOnInit(): void {    
   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    //this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    
    //let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights; 
    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].LeaveQuota == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }
    // passing empObj to api()
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj =  emp[0];
    
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
// End of NgOnint 


// numbers input 
numberOnly(event): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

onSearchChange(searchValue: string): void {  
  // console.log(searchValue);
  if(searchValue.length>=5){
    this.userId = { 'userid': "" + searchValue + "" };
    this.getApiData()
  }else{
   this.resetData();
  }
}

resetData(){
  // this.ngOnInit();    
  this.setradio(false);  
  this.isEmpInfo= false;
  // this.empInfo = false;
}


setradio(val:any){
  // console.log(val);
  
}


getApiData(){ 
 
  this.isLoading= true;
  this.authService.unfreeze_empinfo(this.userId).subscribe(res=>{
      // console.log(res);
      if(res){        
        this.inValidEmpId = res.info.length; 
        this.empInfo = res.info[0];
        this.isEmpInfo= true;
        this.isLoading= false;
      }else{
        this.isEmpInfo= false;
        this.isLoading= false;
        alert('something went wrong')
      } 
  });
  let param= { 'empID': "" + this.userId.userid + "" };
  this.authService.profilepicview(param).subscribe(res=>{
      if(res){
          this.profle_imgURL= this.authService.imgbase + res.profilepicview ; 
          // console.log(this.imgURL)
          if(res.profilepicview){
            let x = res.profilepicview.split('/');
            if(x[1]==this.userId.userid){
              this.ProfileImg =true;
            }else{
              this.ProfileImg =false;
            }
          }
          this.isLoading= false; 
      }else{
        this.isLoading= false;
        alert('something went wrong')
      }
  })
}

 
  
  
 
 


unfreezReqst(){  
  // this.isLoading= true;   
  let params= { 'userid': "" + this.userId.userid + "",  };
    
    // Swal.fire({  
    //   icon: 'success',  
    //   title: "You're Done",   
    //   text: 'Selected Date Unfreezed Successfuly',
    //   showConfirmButton: true,  
    //   // timer: 2000  
    // }); 
    
}


}
