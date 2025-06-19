import { Component, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RefreshService } from './../refresh.service';
 
@Component({
  selector: 'app-qrmanagement',
  templateUrl: './qrmanagement.component.html',
  styleUrls: ['./qrmanagement.component.sass']
})
export class QRManagementComponent implements OnInit {
  LocalStorageKeysToRemove = ["userData", "loginData", "applction", "currentDate", "othrPrevlgs", "privileges", "newParams"];
  loggedUser: any;
  LoginParams: any;
  LogininputParams: any;
  LoggedParams: any;
  LoginUsername: string;
  LoginPassword: string;
  encryptedData: string;
  constructor(private refreshService: RefreshService, public router: Router, private dom:DomSanitizer,private renderer: Renderer2,public authservice:AuthService ) { }
 
 
  ngOnInit(): void {
 
   
    if (this.refreshService.checkForRefresh('qrmanagement')) {
      this.refreshService.refreshData('qrmanagement');
    } else {
      console.log('Apply leave refresh already done today');
    }
    // Decode user data from local storage
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData') || ''));
    this.LoginParams = JSON.parse(this.loggedUser || '{}');
 
    this.LogininputParams = decodeURIComponent(window.atob(localStorage.getItem('loginData') || ''));
    this.LoggedParams = JSON.parse(this.LogininputParams || '{}');
 
    this.LoginUsername = this.LoggedParams?.userName || '';
    this.LoginPassword = this.LoggedParams?.password || '';
 
    this.encryptedData = `itdeclaration.html?ID=${this.LoginParams?.user?.empID}&AuthCode=${this.LoginParams?.user?.pwd}`;
 
    if (!this.loggedUser) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
 
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
    this.renderer.setStyle(document.body, 'background', '#eaf1f3');
    this.renderer.setStyle(document.body, 'min-height', '95vh');
  }
 
  ngOnDestroy() {
    this.renderer.removeStyle(document.body, 'background');
  }
  navToExternalSite(baseURL: string): void {
    if (!this.LoginParams?.user) return;
   
    const { empID, proemail, name } = this.LoginParams.user;
    const url = `${baseURL}?type=userlogin&empid=${empID}&empemail=${proemail}&empname=${name}`;
    window.open(url, '_blank');
  }
  navToHetero(): void {
    this.navToExternalSite('https://www.hhclleaflets.com/request');
  }
  navToAzista(): void {
    this.navToExternalSite('https://www.azistaleaflets.com/request');
  }
 
  navToABHCL(): void {
    this.navToExternalSite('https://www.abhclleaflets.com/request');
  }
 
  updateHeteroQR(){
     this.navToExternalSite('https://www.hhclleaflets.com/update-request');
  }
  updateAzistaQR(){
    this.navToExternalSite('https://www.azistaleaflets.com/update-request');
  }
  updateABHCLQR(){
    this.navToExternalSite('https://www.abhclleaflets.com/update-request');
  }
}