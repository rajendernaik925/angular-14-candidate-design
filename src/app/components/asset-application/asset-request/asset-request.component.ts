import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { formattedError } from '@angular/compiler';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment';
@Component({
  selector: 'app-asset-data',
  templateUrl: './asset-request.component.html',
  styleUrls: ['./asset-request.component.sass']
})
export class AssetRequestComponent implements OnInit {
  userData: any;
  myDate: any;
  listofpayperioddates: any[] = [];
  leavereportdata: any[] = [];
  leavesdates:any[]=[];
  search: any[] = [];
  tableHeader:any;
  tableHeaders: any;
  sublocation: any;
  leaveDateForm: FormGroup;
  leaveReportForm: FormGroup;
  public selected: boolean = true;
  selectedView: string = 'leavebalancereport';
  public isLoading: boolean = false;
  private routeSubscription: Subscription;
  colorTheme = 'theme-dark-blue';  
  private valueChangesSubscription: Subscription;
  currentYear:any;
  isYearWise: boolean = true;
  formSubmitted: boolean = false;
  searchText: string = '';
 
  years:any;
  loggedUser: string;
  empObj: { empID: string; };
  privil_eges: any;
  constructor(private service: AuthService, private fb: FormBuilder,private router: Router, private datePipe: DatePipe ) {}
    ngOnInit(): void {

     // this.loggedUser = atob(localStorage.getItem('userData'))
      this.loggedUser =decodeURIComponent(window.atob(localStorage.getItem('userData')));
      this.userData = JSON.parse(this.loggedUser);
     // this.myDate = atob(localStorage.getItem('currentDate'));
      this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
      moment.locale('en');
      
     // let x = atob(localStorage.getItem('privileges'));
      let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
      this.privil_eges =   JSON.parse(x).Rights;  
      let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
      this.empObj = emp[0];    
      
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
 
}
 


