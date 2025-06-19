import { Component, OnInit, Renderer2, Inject} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; 
import 'moment/locale/es' ;
 

@Component({
  selector: 'app-payslipsuploads',
  templateUrl: './payslipsuploads.component.html',
  styleUrls: ['./payslipsuploads.component.sass']
})
export class PayslipsuploadsComponent implements OnInit {
  loggedUser: any = {};
  userData: any;
  myDate:any;
  empObj:any;

  default:any;
  BU_list:any;
  flexiPolcyForm:FormGroup;
  flxiTableData:any;
  isDisable:boolean;
  authBoolean:boolean;
  privil_eges:any= {};
  isData:any;
  isLoading:boolean;
  showError:boolean;
  public submitted: boolean;
  constructor(public router: Router,public authService: AuthService, public fb: FormBuilder) { }

  ngOnInit(): void {     
    this.default = "--Select Payperiod--"
    this.isDisable= false; 
    this.isLoading =false;
    this.showError= false;
    this.submitted = false;
    //this.loggedUser = atob(localStorage.getItem('userData'))
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    //this.myDate = atob(localStorage.getItem('currentDate'));

    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');
    //let x = atob(localStorage.getItem('privileges'));
    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privil_eges =   JSON.parse(x).Rights;  

    this.empObj = {'empID': "" + this.userData.user.empID + ""};
 
    this.getApiData();

    this.flexiPolcyForm= this.fb.group({
      businessunitid:['', Validators.required],      
      //userid:[''],
      //reporttype: ['', Validators.required]
    })
    this.flexiPolcyForm.get('businessunitid').setValue(this.default)

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
  // End of ngOninit
  get f() { return this.flexiPolcyForm.controls; }
  getApiData(){ 
    this.authBoolean=false;
    for (let i = 0; i < this.privil_eges.length; i++) {   
      if(this.privil_eges[i].Payslips == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }


    this.isLoading =true;
    this.authService.empPayPeriod(this.empObj).subscribe(res=>{ 
      // console.log(res)
      this.BU_list = res.Payperiod;
      this.isLoading =false;
    })
  }
  selectValidtn(){
   // alert(this.flexiPolcyForm.value.businessunitid);
    if(this.flexiPolcyForm.value.businessunitid==this.default){
      this.showError= true;
      // this.flexiPolcyForm.get('businessunitid').setValue('')
    }
    else{
      this.showError= false;
    }
  }
  onOptionsSelected(){
   this.selectValidtn()
  }

  setradio(item){ 
    this.flexiPolcyForm.get('reporttype').setValue(item)
  }a
   
   
  selectedFile: File | null = null;
  csvError = false;
   
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
        const file = event.target.files[0];

        // Check if the file type is CSV
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            this.selectedFile = file;
            this.csvError = false; // Reset CSV error
        } else {
            this.selectedFile = null; // Reset selected file
            this.csvError = true; // Set CSV error
        }
    } else {
        this.selectedFile = null; // Reset selected file
    }
}


onSubmit(fileInput: HTMLInputElement) {
  // Reset error flags
  this.showError = false;
  this.csvError = false;
//alert("11");

//alert(this.flexiPolcyForm.valid);

if(this.flexiPolcyForm.value.businessunitid=='--Select Payperiod--')
  {
    this.showError = true;
  }

  else if(!this.selectedFile)
    {
      this.csvError = true;
    }
  
  // Check if the form is valid and a file is selected
  else if (this.flexiPolcyForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('payPeriod', this.flexiPolcyForm.value.businessunitid);

      this.isLoading = true; // Start loading indicator

      this.authService.PayslipUploadCSVFILE(formData).subscribe(
          res => {
              alert(res.message);
              this.flexiPolcyForm.reset();
              this.selectedFile = null;
             
              fileInput.value = '';
              this.BU_list = res.Payperiod; // Update your list with the response
              this.isLoading = false; // Stop loading indicator
              this.ngOnInit();
              
          },
          error => {
              console.error('Upload failed:', error);
              const errorMessage = error.error; // "No valid employee codes found."
              console.log(errorMessage.error); // Log the error message
              alert(errorMessage.error);
              this.isLoading = false; // Stop loading indicator
              this.showError = true; // Show error message to the user
          }
      );
  } else {
       
          this.showError = true;
       
     // Show error message if form is invalid
      if (!this.selectedFile) {
          this.csvError = true; // Show CSV error if no file is selected
      }
  }
}

 
  

  
// numbers input 
numberOnly(event): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;

}
   

}
