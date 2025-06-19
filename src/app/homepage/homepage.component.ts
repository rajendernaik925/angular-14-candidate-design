import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; 
import { DomSanitizer } from '@angular/platform-browser'; 
import { RefreshService } from '../refresh.service';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.sass']
})
export class HomepageComponent implements OnInit {
  LoginParams:any;
  encryptedData:any; 
  loggedUser:any;
  LocalStorageKeysToRemove:any;
  constructor( private refreshService: RefreshService,public router: Router, private dom:DomSanitizer,private renderer: Renderer2) { }

  ngOnInit(): void {

    this.LocalStorageKeysToRemove = ["userData","loginData","applction", "currentDate",
    "othrPrevlgs","privileges", "newParams"];
 
    if (this.refreshService.checkForRefresh('homepage')) {
      this.refreshService.refreshData('homepage');
    } else {
      console.log('Dashboard refresh already done today');
    }
  

    //this.loggedUser = atob(localStorage.getItem('userData'));
    this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
    let userData = JSON.parse(this.loggedUser); 
    this.LoginParams = JSON.parse(this.loggedUser); 
    // console.log(this.LoginParams.user.empID)
    var finalParammm = 'itdeclaration.html?ID='+userData.user.empID+'&AuthCode='+userData.user.pwd
    // console.log(finalParammm)
    this.encryptedData = finalParammm;  

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
  }


  navToDashboard(){
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  openITS(){ 
    let params = this.encryptedData;
    const url = 'http://iconnect.heterohcl.com/IT/';
    const finalURL =  url+ params;
    this.dom.bypassSecurityTrustResourceUrl(finalURL)

    window.open(finalURL, '_blank');    
  }
  openUtilities(){
    this.router.navigate(['/utilities'], { replaceUrl: true });   
  }
  
  logout(): void {  
    this.renderer.removeClass(document.body, 'modal-open');    
    this.LocalStorageKeysToRemove.forEach(k =>
      localStorage.removeItem(k))
    // localStorage.clear();
  
    this.router.navigate(['/'], { replaceUrl: true });
    //  window.location.href = "https://sso.heterohealthcare.com/"
  }
}
