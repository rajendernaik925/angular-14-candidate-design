import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-hrms',
  templateUrl: './hrms.component.html',
  styleUrls: ['./hrms.component.sass']
})
export class HrmsComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  Ryts:any= {};
  authBoolean:boolean ;
  constructor( public authService: AuthService,public router: Router) { }
  
  ngOnInit(): void {
   // this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    //this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    //let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.Ryts =   JSON.parse(x).Rights;  
    // console.log(this.Ryts)
    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0]; 
    this.getApiData();
    moment.locale('en');// initiate date language 'english'
    // no user in session navigate to login 
    // if (this.loggedUser == null || this.loggedUser == undefined) {
    //   this.router.navigate(['/login'], { replaceUrl: true });
    // }


    //after routing page load at top
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  getApiData(){

    this.authBoolean=false;

    //console.log(this.Ryts);
    for (let i = 0; i < this.Ryts.length; i++) {   
      if(this.Ryts[i].HRActions == "true"|| this.Ryts[i].parent =="1"){
        // console.log(this.Ryts[i].HRActions)
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }



  // this.authService.privileges(this.empObj).subscribe(
  //   (res)=>{
  //     this.Ryts=res.Rights; 
  //     // console.log(res);  
  //     for (let i = 0; i < this.Ryts.length; i++) {        
  //       if(this.Ryts[i].HRActions!= "true" ){
  //         let x = 'false';
  //         // console.log(this.Ryts[i].HRActions);
  //         this.router.navigate(['/errorPage', {AuthrzdUser: x}]);          
  //       }else{
  //         break;
  //       }      
  //     } 
  //   });




  }


}
