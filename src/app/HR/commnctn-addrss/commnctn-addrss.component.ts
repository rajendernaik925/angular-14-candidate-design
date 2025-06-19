import { Component, OnInit,Renderer2  } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
@Component({
  selector: 'app-commnctn-addrss',
  templateUrl: './commnctn-addrss.component.html',
  styleUrls: ['./commnctn-addrss.component.sass']
})
export class CommnctnAddrssComponent implements OnInit {

  constructor( public authService: AuthService, private renderer: Renderer2, public fb: FormBuilder, public router: Router) { }
  myDate:any;
  veiwModal:any;
  listOfReqsts:any;
  empData:any;
  prevData:any;
  reqData:any;
  isLoading:boolean;
  myArray:any;
  userData:any;
  modalType:any;
  ReasonForm: FormGroup;
  ngOnInit(): void {
    this.modalType = '';
    this.isLoading = false;
   // let loggedUser = atob(localStorage.getItem('userData'))
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser); 
   // this.myDate = atob(localStorage.getItem('currentDate')); 
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    //after routing page load at top
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    this.getApiData();
  }

getApiData(){
  this.isLoading = true;
  let editBlockParam= {"REQUESTTYPE": "COMMADD", "empID": "" + this.userData.user.empID + ""}
  this.authService.empHR_view(editBlockParam).subscribe(res=>{
    // console.log(res.hr_view)
    this.listOfReqsts =  res.hr_view;
    this.isLoading = false;
    if(this.listOfReqsts.length == 0){
      this.router.navigate(['/profileRequests'], { replaceUrl: true });
    }
  })

  this.ReasonForm = this.fb.group({
    reasonComment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]]
  });
}

// Reason form validation 
get f() { return this.ReasonForm.controls; }

  // modal show/hide 
  closeVeiwModal() {
    this.modalType = '';
    this.ReasonForm.reset();
    this.veiwModal = false;
    this.renderer.removeClass(document.body, 'modal-open');
  }
  showmyModal() {
    this.veiwModal = !this.veiwModal
    this.renderer.addClass(document.body, 'modal-open');
  }

  get_Item(item:any){
    this.isLoading = true;
    // console.log(item)
    this.empData = item;
    let param = {"userName":""+this.empData.EMPLOYEEID+"", "REQUESTTYPE": "COMMADD"}
    this.authService.empProfileEditReqsts(param).subscribe(res=>{
      // console.log(res.Request_Fields)
      this.isLoading = false;
      this.prevData = res.Previous_Fields;
      this.reqData = res.Request_Fields; 
      this.myArray = {"EMPLOYEEID":""+this.empData.EMPLOYEEID+"","REQUESTTYPE":"COMMADD", "ACTIONTYPE": "A", "ACTION_BY": ""+this.userData.user.empID+""};
      for(let i = 0; i<this.reqData.length; i ++){
        // console.log(this.reqData[i]);  
        // this.myArray.push(""+this.reqData[i].FIELD_NAME+""+":"+""+this.reqData[i].FIELD_VALUE+"");  
        this.myArray[this.reqData[i].FIELD_NAME] = this.reqData[i].FIELD_VALUE; 
      }  
      // console.log(JSON.stringify(this.myArray)); 
    }) 
  }

//APPROVE EMP REQUESTS
approve(){
  this.isLoading = true;
  let param = JSON.stringify(this.myArray);
  this.authService.empProfileEditReqstsApprove(param).subscribe(res=>{
    // console.log(res)
    let message = this.empData.EMPLOYEEID + "-"+ this.empData.EMPLOYEENAME+ ': Request Approved Successfuly';
    if(res.employee_request=="1"){
      this.isLoading = false;
      this.closeVeiwModal();
      Swal.fire({  
        icon: 'success',  
        title: "You're Done",   
        text: message,
        showConfirmButton: true,  
        // timer: 2000  
      }); 
      this.ngOnInit();
    }
  })
}


// REJECT EMP REQUESTS
reject(e:any){
  this.modalType = e;
}

submitReason(){
  let x= {"ACTIONTYPE": "R", "REASON": this.ReasonForm.value.reasonComment}
  let param = Object.assign(this.myArray,x);
  this.authService.empProfileEditReqstsApprove(param).subscribe(res=>{
    // console.log(res);
    let message = this.empData.EMPLOYEEID + "-"+ this.empData.EMPLOYEENAME+ ': Request Rejected';
    if(res){
      this.closeVeiwModal();
      Swal.fire({  
        icon: 'warning',  
        title: "You're Done",   
        text: message,
        showConfirmButton: true,  
        // timer: 2000  
      });
      this.ngOnInit();
    }
  });
}

}
