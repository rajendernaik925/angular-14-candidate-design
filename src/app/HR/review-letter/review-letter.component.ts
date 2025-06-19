import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-review-letter',
  templateUrl: './review-letter.component.html',
  styleUrls: ['./review-letter.component.sass']
})
export class ReviewLetterComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  assmntData: any;
  isMasterSel: boolean;
  checkedCategoryList: any;
  finalData: any = [];
  isData: any;
  isLoading: boolean;
  authBoolean: boolean;
  privileges: any = {};
  searchText: any;
  isDisabled: boolean;
  btnDsble: boolean;

  form16: string; // Variable to hold PDF blob URL
  form16_mob: SafeResourceUrl; // Sanitized resource URL for PDF
  form16Modal: boolean;

  constructor(
    private authService: AuthService,
    public router: Router,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private dom: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isDisabled = false;
    this.btnDsble = true;
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');

    let privileges = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privileges = JSON.parse(privileges).Rights;

    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];
    this.getapiData();

    if (!this.loggedUser) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  getapiData() {
    this.searchText = '';
    this.authBoolean = false;
    for (let i = 0; i < this.privileges.length; i++) {
      if (this.privileges[i].Review_Letters === "true") {
        this.authBoolean = true;
        break;
      }
    }

    if (!this.authBoolean) {
      let x = 'false';
      this.router.navigate(['/errorPage', { AuthrzdUser: x }]);
      return;
    }

    this.isLoading = true;
    this.isMasterSel = false;
    this.authService.reviewletter(this.empObj).subscribe(
      (res) => {
        this.isLoading = false;
        this.assmntData = res.letters;
        this.isData = res.letters.length;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      }
    );
  }

  getCheckedItemList() {
    this.checkedCategoryList = [];
    this.finalData = [];
    for (let i = 0; i < this.assmntData.length; i++) {
      if (this.assmntData[i].isSelected) {
        this.checkedCategoryList.push(this.assmntData[i]);
        this.finalData.push(JSON.parse(this.assmntData[i].EMPID));
      }
    }

    this.checkedCategoryList = JSON.stringify(this.checkedCategoryList);

    if (this.finalData.length !== 0) {
      this.btnDsble = false;
    } else {
      this.btnDsble = true;
    }
  }

  enableEMP() {
    this.isLoading = true;
    let x = { userid: "" + this.finalData + "" };
    let passngParam = Object.assign(this.empObj, x);

    this.authService.assesment_hrprocess(passngParam).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.hrprocess === 1) {
          Swal.fire({
            icon: 'success',
            title: "You're Done",
            text: `Selected (${this.finalData.length}) Records Processed Successfully`,
            showConfirmButton: true
          });
          this.ngOnInit();
        }
      },
      (error) => {
        console.error('Error processing assessment:', error);
        this.isLoading = false;
      }
    );
  }

  showFormModal(value: any) {
    this.authService.getAppointmentPdf(value, this.userData.user.pwd, "form16a").subscribe(
      (responseMessage: ArrayBuffer) => {
        const file = new Blob([responseMessage], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        this.form16 = fileURL;
        this.form16_mob = this.dom.bypassSecurityTrustResourceUrl(fileURL);
        this.form16Modal = true;
        this.renderer.addClass(this.document.body, 'modal-open');
      },
      (error) => {
        console.error('Error fetching PDF:', error);
        // Handle error if necessary
      }
    );
  }

  closeformModal() {
    this.form16Modal = false;
    this.renderer.removeClass(this.document.body, 'modal-open');
    if (this.form16) {
      URL.revokeObjectURL(this.form16);
    }
  }

  Generate(item: any, event: any,type) {
    let params = {
      "userid": "" + item.EMPLOYEEID + "",
      "empID": "" + this.userData.user.empID + "",
       "Type": "" + type+ ""
    };

    this.authService.Genrateletter(params).subscribe(
      (res) => {
        if (res.count ==1) {
          event.target.disabled = true;
         // event.target.textContent = "Generating letter. Please wait.";

          Swal.fire({
            icon: 'success',
            title: "You're Done",
            text: "Selected Records Processed Successfully",
            showConfirmButton: true
          });

          this.ngOnInit();
        } else {
          alert("Please contact admin.");
        }
      },
      (error) => {
        console.error('Error generating letter:', error);
      }
    );
  }
}
