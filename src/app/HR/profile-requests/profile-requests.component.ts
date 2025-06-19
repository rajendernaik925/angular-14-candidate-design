import { Component, OnInit,Renderer2  } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Observable, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment'; 
import 'moment/locale/es' ;

@Component({
  selector: 'app-profile-requests',
  templateUrl: './profile-requests.component.html',
  styleUrls: ['./profile-requests.component.sass']
})
export class ProfileRequestsComponent implements OnInit { 
  private updateSubscription: Subscription;
  constructor( public authService: AuthService, public router: Router,public http: HttpClient) { }
  myDate:any;   
  countArray:any;
  spinnr:boolean;
  isLoading:boolean = false;
  empObj: any;

  ngOnInit(): void { 
    //let loggedUser = atob(localStorage.getItem('userData'));
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    let userData = JSON.parse(loggedUser); 
    let emp = [{ 'empID': "" + userData.user.empID + "" }];
    this.empObj = emp[0];
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    this.getApiData();
     

    // *****auto hit api on every 10 seconds ***
    // this.updateSubscription = interval(10000).subscribe(
    //   (val) => { this.getApiData()
    // } );


    //after routing page load at top
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
 
  }


// onload and refresh click 
  getApiData(){
    this.spinnr = true;
    this.isLoading = true;
    // let param = {"REQUESTTYPE": ""};
    let param1 = {"REQUESTTYPE": "", "empID": this.empObj.empID}; 

    this.authService.empProfileEditReqstsCount(param1).subscribe(res=>{ 
      this.countArray = res.dashboard;
      if(res){
        this.isLoading = false;
        // this.spinnr =false;
        setTimeout(() => {
          this.spinnr =false;
        }, 2000);
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
      // console.log(this.countArray)
    },err => {
          console.log(err);
          this.router.navigate(['/errorPage', {errorType: err.status}]);
        })
  }


   
 


  

   

 

}
