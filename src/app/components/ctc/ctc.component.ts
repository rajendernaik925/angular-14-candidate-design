import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-ctc',
  templateUrl: './ctc.component.html',
  styleUrls: ['./ctc.component.sass']
})
export class CtcComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  EmpInfo:any;
  LoginParams:any;
  empObj: any;
  public isLoading: boolean;
  privil_eges:any= {}; 
  authBoolean:boolean
  constructor(public router: Router,private authService: AuthService) { }

  ngOnInit(): void {
   // this.loggedUser = atob(localStorage.getItem('userData'));
   // let LoginParams = atob(localStorage.getItem('loginData'))

    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    let LoginParams = decodeURIComponent(window.atob(localStorage.getItem('loginData')));
    this.LoginParams= JSON.parse(LoginParams);
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    let x =decodeURIComponent(window.atob(localStorage.getItem('privileges')));;
    this.privil_eges =   JSON.parse(x).Rights;

    // passing empObj to getApiData() 
    let emp = [{ 'empID': "" +this.userData.user.empID+ "", 
                'Password': ""+this.LoginParams.password+"",
                'HRMSEMPLOYEEID': "" +this.userData.user.hrmsemployeeid+ "" }];
    this.empObj =  emp[0];
    // console.log( this.empObj )
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


    getApiData(){



      this.authBoolean=false;
      for (let i = 0; i < this.privil_eges.length; i++) {   
        if(this.privil_eges[i].CTC_VIEW == "true"){ 
          this.authBoolean=true;
        }
      }
      if(this.authBoolean== false){
        let x = 'false'; 
        this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
      }



      
      this.isLoading = true;

      this.authService.empCtc_view(this.empObj).subscribe(res=>{
        // console.log(res.ctcview[0])
        if(res){
          this.isLoading = false;
          this.EmpInfo = res.ctcview;
        }
        
      },err => {
        console.log(err);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      }) 
    }


}
