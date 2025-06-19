import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 

@Component({
  selector: 'app-process-of-assessment',
  templateUrl: './process-of-assessment.component.html',
  styleUrls: ['./process-of-assessment.component.sass']
})
export class ProcessOfAssessmentComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;
  assmntData:any;
  isMasterSel:boolean;
  checkedCategoryList:any;
  finalData:any= [];
  isData:any;
  isLoading:boolean;
  authBoolean:boolean;
  privil_eges:any= {};
  public searchText:any;
  isDisabled:boolean ;
  btnDsble:boolean ;
  constructor(private authService: AuthService, public router: Router) {}
  
  ngOnInit(): void {
    this.isDisabled = false;
    this.btnDsble= true;
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
    this.getapiData()

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
  // End of ngOnInit 



  
  getapiData(){ 
    this.searchText='';
    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Initiate_Assessment_Process == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }

    this.isLoading = true;
    this.isMasterSel = false;
    this.authService.assesment_initiate(this.empObj).subscribe(
      (res)=>{  
        this.isLoading = false;
        this.assmntData = res.intiate;
        // console.log(this.assmntData)
        this.isData = res.intiate.length;      
    });
   
  }


  // filterSearching() {   
  //   this.assmntData = this.assmntData.filter(obj => (obj['FullName'] == this.searchText)|| 
  //   (obj['EMPID'] == this.searchText) ||(obj['DOJ'] == this.searchText) );  
  //   console.log(this.assmntData )
  //  }
  // searchJobMethod() { 
  //   this.assmntData = this.assmntData.filter(object => {
  //       return object['EMPID'] == this.searchText;
  //   });
  // }

  checkVal(){ 
    if(this.searchText.length>=1){
      this.isDisabled= true; 
      if(this.isMasterSel == true){
        this.isMasterSel = this.assmntData.every(function(item:any) {
          return item.isSelected == false;
        })
      }
      this.checkUncheckAll();
    }
    else{
      this.checkUncheckAll();
      this.isDisabled= false;
    }
  }


  checkUncheckAll() {
    for (var i = 0; i < this.assmntData.length; i++) {
      this.assmntData[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }

  isAllSelected() {
    this.isMasterSel = this.assmntData.every(function(item:any) {
        return item.isSelected == true;
      })
    this.getCheckedItemList();
    // console.log(this.assmntData)
  }
  getCheckedItemList(){
    this.checkedCategoryList = [];
    this.finalData = [];
    for (var i = 0; i < this.assmntData.length; i++) {
      if(this.assmntData[i].isSelected){
      this.checkedCategoryList.push(this.assmntData[i]);
      this.finalData.push(JSON.parse(this.assmntData[i].EMPID));
    }
    }
    this.checkedCategoryList = JSON.stringify(this.checkedCategoryList);  
      //  console.log(this.finalData, 'finalData')
      if(this.finalData.length!=0){
        this.btnDsble = false;
      }else{
        this.btnDsble = true;
      }
  }

   
  enableEMP(){
    // console.log(this.finalData, 'finalData');
    this.isLoading = true;
    let x = {userid: ""+ this.finalData +""}
    let passngParam= Object.assign(this.empObj,x);
    // console.log(passngParam);
    var Swal_Msg = "Selected ("+ this.finalData.length+")Records Processed Successfully "
    this.authService.assesment_hrprocess(passngParam).subscribe(
      (res)=>{
      this.isLoading = false;
      // console.log(res)
      if(res.hrprocess==1){
        Swal.fire({  
          icon: 'success',  
          title: "You're Done",  
          text: Swal_Msg,
          showConfirmButton: true,  
          // timer: 2000  
        })  
        this.ngOnInit();
      }
    }) 
  }



}
