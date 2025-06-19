import { Component, OnInit, Renderer2, Inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { DOCUMENT } from '@angular/common';
import * as moment from 'moment'; 
import 'moment/locale/es' ;

@Component({
  selector: 'app-hrpolicies',
  templateUrl: './hrpolicies.component.html',
  styleUrls: ['./hrpolicies.component.sass']
})
@Injectable()
export class HRpoliciesComponent implements OnInit {
  loggedUser: any = {};
  userData:any;
  empObj:any;
  myDate:any;
  hrDocs: any;
  public policyModal: boolean;
  public policyFile:any;
  public policyFileImg:any;
  public fileBasepath:any;

  constructor(public router: Router,private authService: AuthService, 
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    //this.loggedUser = atob(localStorage.getItem('userData')); 
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData'))); 
    this.userData = JSON.parse(this.loggedUser);
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate'))); 
    moment.locale('en');
    // passing empObj to getApiData() 
    let emp = [{ 'empID': "" +this.userData.user.empID+ "" }];
    this.empObj =  emp[0];
    this.fileBasepath= this.authService.imgbase;
    
    this.authService.HRpolicies(this.empObj).subscribe(res=>{
      // console.log(res);
      this.hrDocs = res.hrdocuments;
    })

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
  }// End of ngOnInIt

  closePolicyModal(){ 
      this.policyFile = "";
      this.policyFileImg = "";
      this.policyModal = false;
      this.renderer.removeClass(this.document.body, 'modal-open');
  }

  showPolicyModal(item:any){
    this.policyFile = this.fileBasepath + item.pdf_FILE + "#toolbar=0&view=FitH";
    this.policyFileImg = this.fileBasepath + item.image_FILE ;
    // console.log(this.policyFileImg);
    this.policyModal = !this.policyModal;
    this.renderer.addClass(document.body, 'modal-open');
    // window.frames["policyiFrame"].document.oncontextmenu = function(){ return false; };
  }

  
}
