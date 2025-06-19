import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-leavequota',
  templateUrl: './leavequota.component.html',
  styleUrls: ['./leavequota.component.sass']
})
export class LeavequotaComponent implements OnInit {
  myDate: any;
  veiwModal: any;
  listOfReqsts: any;
  empData: any;
  searchText: string = ''; 
  prevData: any;
  search: any[] = [];
  reqData: any;
  isLoading: boolean;
  myArray: any;
  ImgBasepath: any;
  pdfData: any;
  userData: any;
  modalType: any;
  ReasonForm: FormGroup;
  leaveForm: FormGroup;
  leaveFormAdd: FormGroup;
  editingLeave: any;
  leavedata: any[] = [];
  unassignedlist:any[]=[];
  Employeeid:any;
  Assineddata:any;
  UnAssineddata:any;
  employeesequenceno:any;
  sublocation:any;
  isdiabled:any;
  experience :any;
  Total:any;
  authBoolean:boolean;
  privil_eges:any= {}; 
  constructor(
    public authService: AuthService, 
    private renderer: Renderer2, 
    public fb: FormBuilder, 
    public router: Router
  ) {}

  ngOnInit(): void {
    this.modalType = '';
    this.isLoading = false;
    let loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(loggedUser);
    //console.log("data" + JSON.stringify(this.userData));  // Convert object to string
this.sublocation=this.userData.user.sublocation;


let x =decodeURIComponent(window.atob(localStorage.getItem('privileges')));;
    this.privil_eges =   JSON.parse(x).Rights;

    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].LeaveQuota == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }


//alert(this.sublocation)
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    this.getApiData();
    this.leaveForm = this.fb.group({
      QUANTITY: ['', Validators.required ]  
    });
    
  }
  getApiData() {
    this.isLoading = true;
    this.ImgBasepath = this.authService.imgbase;
    const formdata=new FormData();
    //this.userData.user.empID
    formdata.append('employeeSequenceNo',this.userData.user.empID);
    //let editBlockParam = { "REQUESTTYPE": "BANKADD", "empID": "" + this.userData.user.empID + "" }
    this.authService.getEligibleleaveEmployees(formdata).subscribe(res => {
      this.listOfReqsts = res;
      this.search = res; 
      this.isLoading = false;
    

  //console.log(res);
     // this.Employeeid=res.Employeeid;
      // if (this.listOfReqsts.length == 0) {
      //   this.router.navigate(['/profileRequests'], { replaceUrl: true });
      // }
      
    });  
  }

  View(item:any)
  {
    this.Assigned(item);
    this.getunassignedleaves(item);
    this.Employeeid=item.Employeeid;
    this.employeesequenceno=item.EmployeeSeq;
    this.experience=item.Experience;
    //alert(this.experience);
  }
  Assigned(item: any) {
    this.Assineddata=item;
    this.empData = item;
  
    console.log("getdataa"+this.empData);
    const formdata = new FormData();
    formdata.append("employeeSequenceNo",item.EmployeeSeq);
    formdata.append("location",this.sublocation);
    this.authService.getleavedata(formdata).subscribe((res: any) => {
      this.leavedata = res;
      //console.log("--->"+res)
    
    });
   
   
  }


  getunassignedleaves(item:any){
    this.UnAssineddata=item;
    const formdata=new FormData();
    formdata.append("employeeSequenceNo",item.EmployeeSeq);
    formdata.append("location",this.sublocation);
    this.authService.getunassigneddata(formdata).subscribe((res:any)=>{
      this.unassignedlist=res;
      //this.Employeeid=res.Employeeid;
      //console.log("unassigned"+res);

      //

    })
  }
  
  closeVeiwModal() {
    this.modalType = '';
    this.veiwModal = false;
    this.renderer.removeClass(document.body, 'modal-open');
  }
  showmyModal() {
    this.veiwModal = !this.veiwModal;
    this.renderer.addClass(document.body, 'modal-open');
  }
  Action(leaves: any, action: any) {

    //alert(action);
    
    let api: boolean = true; // This is valid
    //alert(this.Employeeid);
    const formdata = new FormData();
    formdata.append('Leavetypeid', leaves.LEAVETYPEID);
    formdata.append('employeeid', this.Employeeid);
    formdata.append('createdby', this.userData.user.empID);
    formdata.append('actiontype', action);
//alert(action)

     if (action === 'Edit') {
        this.editingLeave = leaves;
        this.leaveForm.patchValue({ QUANTITY: leaves.QUANTITY });
         api=false;
      } 
     
    else if (action === 'Update') {
      this.editingLeave = leaves;
      //this.leaveForm.patchValue({ QUANTITY: leaves.QUANTITY });

      const quantity = this.leaveForm.get('QUANTITY')?.value;
      //alert(quantity);
      if (quantity=== undefined || quantity=== null ||quantity=== 0||quantity=== '') {
        // Handle the case where Total is undefined, null, or 0
        //alert(`Total is either undefined, null, or zero. ${leaves.NAME}'s quantity is not valid.`);
        Swal.fire({
          title: 'Warning!',
          text: `Total is either undefined, null, or zero. ${leaves.NAME}'s quantity is not valid.`,
          icon: 'warning',
          confirmButtonText: 'OK'
      });
        api = false;  // Prevent further actions
        } 
       else if(leaves.QUANTITY>quantity)
        {
          //alert(leaves.NAME)
         // alert(`The ${leaves.NAME} quantity cannot be less than the current balance of ${leaves.QUANTITY}`);
          Swal.fire({
            title: 'Warning!',
            text: `The ${leaves.NAME} quantity cannot be less than the current balance of ${leaves.QUANTITY}`,
            icon: 'warning',
            confirmButtonText: 'OK'
        });
           api=false;
         // this.Assigned(this.Assineddata);
         // this.getunassignedleaves(this.UnAssineddata);
        }
        else if(leaves.QUANTITY==quantity)
        {
          //alert(`The '${leaves.NAME}' quantity is the same as the current balance of '${leaves.QUANTITY}'. No changes were made.`);
          Swal.fire({
            title: 'Warning!',
            text: `The ${leaves.NAME} quantity is the same as the current balance of ${leaves.QUANTITY}. No changes were made.`,
            icon: 'warning',
            confirmButtonText: 'OK'
        });
          api = false; // Set api to false, indicating no changes
        }
          
      //alert(quantity);
      formdata.append('Total', quantity);
    } 
  //  else if (action === 'Add') {
   
  //     this.Total = leaves.Total;
  //     //alert("Total: " + this.Total);
      
  //     if (this.Total === undefined || this.Total === null || this.Total === 0) {
  //         // Handle the case where Total is undefined, null, or 0
  //         alert(`Total is either undefined, null, or zero. ${leaves.NAME}'s quantity is not valid.`);
  //         api = false;  // Prevent further actions
  //     } 
     
  //     formdata.append('Total', this.Total);

     
  //  }
  else if (action === 'Add') {
    // Check for experience before proceeding if Leavetypeid is 4
    if (leaves.LEAVETYPEID === 4) {
        let match = this.experience.match(/(\d+)\s*(year|month)s?/g);
        let years = 0;
        let months = 0;

        // Check for years and months in the experience string
        if (match) {
            match.forEach(item => {
                if (item.includes('year')) years = parseInt(item);
                if (item.includes('month')) months = parseInt(item);
            });
        }

        // If the experience is less than 1 year (12 months), alert
        if (years < 1 || (years === 0 && months <=6)) {
           // alert("Please verify,Experience is less than 1 year.");
            Swal.fire({
              title: 'Warning!',
              text: `Please verify,Experience is less than 6 Months.`,
              icon: 'warning',
              confirmButtonText: 'OK'
          });
            api = false;
        }
    }

    this.Total = leaves.Total;
    
    if (this.Total === undefined || this.Total === null || this.Total === 0) {
        //alert(`Total is either undefined, null, or zero. ${leaves.NAME}'s quantity is not valid.`);
        Swal.fire({
          title: 'Warning!',
          text: `Total is either undefined, null, or zero. ${leaves.NAME}'s quantity is not valid.`,
          icon: 'warning',
          confirmButtonText: 'OK'
      });
        api = false;
    }

    formdata.append('Total', this.Total);
} 
   
    else {
      formdata.append('Total', null);
    } 

 
    //alert(action);
    if(api)
    {
      formdata.append('employeesequenceno', this.employeesequenceno);
      this.authService.getleavesByAction(formdata).subscribe(
        (res: any) => {
          console.log(res);
          Swal.fire({
            title: 'Success!',
            text: 'Successfully updated!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
    
          this.Assigned(this.Assineddata);
          this.getunassignedleaves(this.UnAssineddata);
        },
        (error: any) => {
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred while updating the data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          console.error('Error details:', error);
        }
      );
    }
 
  }

  onlyNumbers(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 0 && event.key === '0') {
      event.preventDefault();
      return;
    }
    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) {
      event.preventDefault(); 
    }
    if (input.value.startsWith('0') && input.value.length > 0) {
      event.preventDefault();
    }
  }
  
  applySearchFilter() {
    if (!this.searchText) {
      this.listOfReqsts = this.search;  
      return;
    }
    const searchTextLower = this.searchText.toLowerCase();
    this.listOfReqsts = this.search.filter(item => {
      return (
        item.Employeename && item.Employeename.toLowerCase().includes(searchTextLower) ||
        item.EmployeeSeq && item.EmployeeSeq.toString().toLowerCase().includes(searchTextLower) ||
        item.BUNAME && item.BUNAME.toLowerCase().includes(searchTextLower) ||
        item.Department && item.Department.toLowerCase().includes(searchTextLower) ||
        item.Designation && item.Designation.toLowerCase().includes(searchTextLower)
      );
    
    });
  
  }
  allowOnlyLettersAndSpaces(event: KeyboardEvent) {
    const charCode = event.key;
    const inputField = event.target as HTMLInputElement;
    const inputValue = inputField.value;
    if (charCode === "Backspace") {
      return; 
    }
  
    if (charCode === " " && inputValue.length === 0) {
      event.preventDefault(); 
    } else if (!/^[a-zA-Z0-9\s.]$/.test(charCode)) {
      event.preventDefault(); 
    }
  }
}
