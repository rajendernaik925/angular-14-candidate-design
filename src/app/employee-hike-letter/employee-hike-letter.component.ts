import {Component, OnInit, Renderer2, Injectable, Inject} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-employee-hike-letter',
  templateUrl: './employee-hike-letter.component.html',
  styleUrls: ['./employee-hike-letter.component.sass']
})
export class EmployeeHikeLetterComponent implements OnInit {

  
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  Ryts: any = {};
  public form16: any;
  form16_mob: any;
  public form16Modal: boolean;
  authBoolean: boolean;

  constructor(
    public authService: AuthService,
    public router: Router,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private dom: DomSanitizer
  ) { }
  
  ngOnInit(): void {
    // Retrieve and decode user data from localStorage
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);

    // Retrieve and decode current date from localStorage
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    // Retrieve and decode privileges from localStorage
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.Ryts = JSON.parse(x).Rights;

    // Initialize date language to English
    moment.locale('en');

    // Check user session; navigate to login if not logged in
    // Note: This section is commented out in the provided code snippet

    // Scroll to top after every route navigation
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    // Check user authentication and privileges
    //this.getApiData();
  }

  // Method to check user authentication and privileges
  getApiData() {
    this.authBoolean = false;
    for (let i = 0; i < this.Ryts.length; i++) {
      if (this.Ryts[i].HRActions == "true" || this.Ryts[i].parent == "1") {
        this.authBoolean = true;
      }
    }
    if (this.authBoolean == false) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
    }
  }   

  // Method to show Form 16A modal and fetch PDF
  showFormModal() {
    this.authService.getAppointmentPdf(this.userData.user.empID, this.userData.user.pwd, "form16a").subscribe((responseMessage) => {
      let file = new Blob([responseMessage], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      this.form16 = fileURL;
      this.form16_mob = this.dom.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
    });
    this.form16Modal = !this.form16Modal;
    this.renderer.addClass(this.document.body, 'modal-open');
  }

  // Method to close Form 16A modal
  closeformModal() {
    this.form16Modal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

}
