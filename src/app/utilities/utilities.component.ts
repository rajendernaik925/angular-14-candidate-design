import { Component, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RefreshService } from './../refresh.service';
@Component({
  selector: 'app-utilities',
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.sass']
})
export class UtilitiesComponent implements OnInit {

  LoginParams:any;
  LogininputParams:any;
  LoggedParams:any;
  encryptedData:any; 
  loggedUser:any;
  LocalStorageKeysToRemove:any;
  employeeData: any;
  loading: boolean = false;  
  isInvalidCredentials: boolean = false; 

  LoginUsername:any;
  LoginPassword:any;

    constructor( private refreshService: RefreshService, public router: Router, private dom:DomSanitizer,private renderer: Renderer2,public authservice:AuthService ) { }
  
    ngOnInit(): void {


      if (this.refreshService.checkForRefresh('utilites')) {
        this.refreshService.refreshData('utilites');
      } else {
        console.log('Apply leave refresh already done today');
      }
  
      this.LocalStorageKeysToRemove = ["userData","loginData","applction", "currentDate",
      "othrPrevlgs","privileges", "newParams"];
      //this.loggedUser = atob(localStorage.getItem('userData'));
      this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
      let userData = JSON.parse(this.loggedUser); 
      this.LoginParams = JSON.parse(this.loggedUser); 
       //  console.log("userdata",userData);
      this.LogininputParams = decodeURIComponent(window.atob(localStorage.getItem('loginData')));
       
      this.LoggedParams= JSON.parse(this.LogininputParams);
       this.LoginUsername=this.LoggedParams.userName;
       this.LoginPassword=this.LoggedParams.password;

       //console.log( this.LoginUsername+"iiiii"+this.LoginPassword)
     
      var finalParammm = 'itdeclaration.html?ID='+userData.user.empID+'&AuthCode='+userData.user.pwd
      this.encryptedData = finalParammm;  
      if (this.loggedUser == null || this.loggedUser == undefined) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
      this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
          return;
        }
        window.scrollTo(0, 0)
      });
        this.renderer.setStyle(
      document.body,
      'background',
      '#eaf1f3'
    );
      this.renderer.setStyle(document.body, 'min-height', '95vh');
      this.fetchEmployeeData( `${this.LoginParams.user.empID}`, `${this.LoginParams.user.empID}`);
       //this.fetchEmployeeData('106957','106957');
    }
  ngOnDestroy(): void {
    this.renderer.setStyle(
      document.body,
      'background',
      'url(body_bg.png) repeat'
    );
    this.renderer.setStyle(document.body, 'background-size', '250px');
    this.renderer.setStyle(
      document.body,
      'background-color',
      'rgba(0, 114, 188, 0.04)'
    );
  }
  fetchEmployeeData(empId: string, password: string): void {
    this.loading = true; 
    this.isInvalidCredentials = false;  

this.authservice.eCard(empId, password).subscribe(
  (data) => {
    if (data && data.error === 'Invalid employee credentials') {
      this.isInvalidCredentials = true;  
      this.loading = false;
    } else {
      this.employeeData = data;  
      this.isInvalidCredentials = false;  
      this.loading = false;
    }
  },
  (error) => {
    if (error.status === 401) {
      this.isInvalidCredentials = true;  
      this.loading = false;
    }
  }
);
}
navToVendor(userparam: any, passwordparam: any){ 


  //alert(userparam+"---"+passwordparam)
  // let params = this.encryptedData;
  // const url = 'https://vendorapp.heterohealthcare.com/VendorManagement/login.jsp';
  // const finalURL =  url;
  // this.dom.bypassSecurityTrustResourceUrl(finalURL)
  // window.open(finalURL, '_blank');    

  //let username='10515'
  //let password='Hetero@321'
  //const { username, password } = this.LogininputParams;
  let username = userparam;
  let password = passwordparam;

 

  const encodedUsername = btoa(username);  // Base64 encode username
  const encodedPassword = btoa(password);  // Base64 encode password
  
  // Generate the authcode by combining the encoded username and password
  const authcode = btoa(encodedUsername + encodedPassword); // Base64 encode the concatenated string
  
  // Construct the URL with query parameters (username, password, authcode)
  const url = 'http://iconnect.heterohcl.com/VendorManagement/User_Auth_main';
  const finalURL = `${url}?username=${encodedUsername}&authcode=${authcode}&password=${encodedPassword}`;
  
  // Open the constructed URL in a new window/tab
  this.dom.bypassSecurityTrustResourceUrl(finalURL);
  window.open(finalURL, '_blank');

}
navToHetero(){
   const url = 'https://www.heterohealthcare.com/';
  const finalURL =  url;
  this.dom.bypassSecurityTrustResourceUrl(finalURL)
  window.open(finalURL, '_blank'); 
}
navToAzista(){
 const url = 'https://www.azistaindustries.com/';
  const finalURL =  url;
  this.dom.bypassSecurityTrustResourceUrl(finalURL)
  window.open(finalURL, '_blank'); 
}
navToQRCode(){
  const empID = this.LoginParams.user.empID; 
  const pemail = this.LoginParams.user.proemail;
  const name = this.LoginParams.user.name;
  const url = `https://www.hhclleaflets.com/request?type=userlogin&empid=${empID}&empemail=${pemail}&empname=${name}`;
  const finalURL = url; 
  this.dom.bypassSecurityTrustResourceUrl(finalURL)
  window.open(finalURL, '_blank');  
 }
navToECards(){
  const empID = this.LoginParams.user.empID; 
   //const url = `https://services.heterohcl.com/ecards-v2/Employee/utilities?iconnect=true&employeecode=106957`;
  const url = `https://services.heterohcl.com/ecards-v2/Employee/utilities?iconnect=true&employeecode=${empID}`;
  const finalURL =  url;
  this.dom.bypassSecurityTrustResourceUrl(finalURL)
  window.open(finalURL, '_blank');  
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
