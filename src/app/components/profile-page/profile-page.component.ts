import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js'; 
import { ImageCroppedEvent } from 'ngx-image-cropper'; 
import { of } from 'rxjs'; 
import * as moment from 'moment'; 
import 'moment/locale/es' ; 
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.sass']
})

export class ProfilePageComponent implements OnInit {
  loggedUser: any = {};
  public userData: any;
  public empData: any={};
  public location:any;
  isMale = false;
  isFemale = false;

  myDate: any;
  today_date: any;
  emp: any = [];
  empObj: any;
  curntExpYrs: any;
  curntExpmonths: any;
  myExp: any;
  totalExpYrs: any;
  totalExpMonths: any;

  pastExprncs: any;
  LoginParams:any;
  myForm: FormGroup;   
  public imagePath;
  imgURL: any; 
  public profilepic:any;
  showAlert:boolean = false;
  showDeleteIcon:boolean = false;

  public message: string;
  selectedFiles: FileList;  
  currentFileUpload: File;
  fileValue:any;

  currentFile:any;
  docOriginalName:any;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  finalCroppdImg:any;
  finalCropddImgName: any;
  showConfirmBtn: boolean = false;
  showCropper: boolean = false;
  public EditModal: boolean;
  RequestStatus:any;
  CAddrss_flag:boolean;
  PAddrss_flag:boolean;
  EC_Addrss_flag:boolean;
  AccountInfo_flag:boolean;
  PanInfo_flag:boolean;

  
  public theForm:any;
  isLoading:boolean;
  slctdStateCode:any; 
  slctdStateCode1:any; 
  slctdStateCode2:any; 

  stateName:any; 
  stateName1:any; 
  stateName2:any; 

  slctdCityName:any;
  slctdCityName1:any;
  slctdCityName2:any;
 
  statesList:any;
  citiesList:any;
  citiesList1:any;
  citiesList2:any;

  C_cityList = []; 
  C_cityList1 = []; 
  C_cityList2 = []; 

  C_stateList = [];

  commAddrssForm:FormGroup;
  c_Form:FormGroup; 
  p_Form:FormGroup;
  PerAddrssForm:FormGroup;
  EmrgncyContactForm: FormGroup;
  EC_Form: FormGroup;
  AccountInfoForm: FormGroup;
  AI_Form: FormGroup;

  PanInfoForm: FormGroup;

  getBankNamesList:any;
  public banksList:any;
  SlctdBankName:any;
  P_City:any;
  P_State:any;

  relationshipList:any;
 public relationship_List:any;
  relationName:any;  
public passbookFile:any;
public passbookFileName: any;
public passbook:any;
public finalpassbookImg: any;

public panFile:any;
public panFileName: any;
public panNum:any;
public fianlpanFile: any;

public disableButton: boolean ;
public CommdisableButton: boolean ;
public PermntDisableButton: boolean ;
public ICEDisableButton: boolean ;

public submitted: boolean ;
public panSubmitted: boolean ;
public CommSubmitted: boolean ;
public PerSubmitted: boolean ;
public ICESubmitted: boolean ;
empWorkingDays:any;

public isFileUploaded:boolean =false;
public unamePattern:any;
inputPan:any;
ExistPan:boolean=false;
enableApi:boolean=false;

@ViewChild('passbook', {static: false}) 
// this InputVar is a reference to our input. 
mypassbookFile: ElementRef;

  constructor(public router: Router,private authService: AuthService, private imageCompress: NgxImageCompressService,
    public datepipe: DatePipe,private fb: FormBuilder, private renderer: Renderer2) { }

  // numbers input 
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true; 
  }

  ngOnInit(): void { 
    this.theForm = '';
    this.ExistPan = false;
    this.enableApi = false;
    this.CAddrss_flag= false;
    this.PAddrss_flag= false;
    this.EC_Addrss_flag= false;
    this.AccountInfo_flag=  false;
    this.PanInfo_flag = false;
     
    
    // this.isLoading= false;
    this.EditModal = false;
    
    // this.empData = this.userData.user;
    // this.empData = {};
   
    this.isLoading = true; 
    this.getEmpData();
   


  

    // today date 
    //this.myDate = atob(localStorage.getItem('currentDate'));
    this.myDate =decodeURIComponent(window.atob(localStorage.getItem('currentDate')));

    moment.locale('en');// initiate date language 'english'
    // this.today_date = this.datepipe.transform(this.myDate, 'EEEE, MMM dd, yyyy, hh:mm a ');  
    this.today_date = moment(this.myDate).format('dddd, MMM Do, yyyy, hh:mm a ');   
  

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


  

  // upload profile pic  
  this.myForm = this.fb.group({
    file: ['',[Validators.required]]
  });

  // COMMUNICATIONADDRESS
  this.commAddrssForm= this.fb.group({
    C_Address: [''],
    C_Address2: [''],
    C_Address3: [''],
    C_Address4: [''], 
    C_State: [''], 
    C_City: [''], 
    C_Zip:['', [Validators.required, Validators.minLength(5)]]     
  })
   
  this.c_Form= this.fb.group({
    COMMUNICATIONADDRESS: [''],
    COMMUNICATIONADDRESS2: [''],
    COMMUNICATIONADDRESS3: [''],
    COMMUNICATIONADDRESS4: [''], 
    COMMUNICATION_STATE_ID: [''],
    COMMUNICATION_STATE_NAME: [''],  
    COMMUNICATION_CITY_ID:  [''],
    COMMUNICATION_CITY_NAME: [''],
    COMMUNICATIONZIP: ['']
  })

  // PERMANENTADDRESS
  this.PerAddrssForm = this.fb.group({
    P_Address: [''],
    P_Address2: [''],
    P_Address3: [''],
    P_Address4: [''],
    P_State: [''],
    P_City: [''],
    P_Zip: ['',[Validators.required, Validators.minLength(5)]] 
  })
  this.p_Form = this.fb.group({
    PERMANENTADDRESS: [''],
    PERMANENTADDRESS2: [''],
    PERMANENTADDRESS3: [''],
    PERMANENTADDRESS4: [''],
    PERMANENT_STATE_ID: [''],
    PERMANENT_STATE_NAME: [''],  
    PERMANENT_CITY_ID:  [''],
    PERMANENT_CITY_NAME: [''],
    PERMANENTZIP: ['']
  })

  // Emergency Contact 
  this.EmrgncyContactForm = this.fb.group({
    frstName: [''],
    lastName: [''],
    relation: [''],
    icemobile: ['',[Validators.minLength(10),  Validators.maxLength(10)] ],
    iceaddress: [''],
    iceaddress2: [''],
    iceaddress3: [''],
    iceaddress4: [''],
    icestate: [''],
    icecity: [''] 
  })
  this.EC_Form = this.fb.group({
    FIRSTNAME:[''],
    LASTNAME:[''],
    RELATIONID: [''],
    RELATIONNAME: [''],
    MOBILE: [''],
    ADDRESS:[''],
    ADDRESS2:[''],
    ADDRESS3:[''],
    ADDRESS4:[''],
    ICE_STATE_ID:[''], 
    ICE_STATE_NAME:[''], 
    ICE_CITY_ID:[''],
    ICE_CITY_NAME:['']
  }) 
  // this.unamePattern  = "[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$";
  this.PanInfoForm= this.fb.group({  
    PAN_Number: ['',[Validators.required, checkPanInputValidator(/([A-Za-z]){5}([0-9]){4}([A-Za-z]){1}$/)]],updateOn: "keypress",
    Pan_file: ['', [Validators.required, fileTypeValidator()]]  
  })

  this.AccountInfoForm = this.fb.group({    
    Bank_Name: [''],
    Bank_ifsc_Number: ['',[Validators.required,Validators.minLength(11), Validators.maxLength(11)]],
    Bank_Acct_Number: ['',[Validators.required,Validators.minLength(9), Validators.maxLength(20)]],
    Bank_Passbook_file: ['', [Validators.required, fileTypeValidator()]] 
  })

  this.AI_Form = this.fb.group({    
    BANKID: [''],    
    BANKNAME: [''], 
    BANKIFC: [''],
    BANKACC: [''] , 
  })

 
} //End - ngOnInIt 

get e() { return this.commAddrssForm.controls;}
get pA() { return this.PerAddrssForm.controls;}

get f() { return this.EmrgncyContactForm.controls; }
get g() { return this.AccountInfoForm.controls; }
get p(){ return this.PanInfoForm.controls;}

getEmpData(){
  //this.LoginParams = atob(localStorage.getItem('loginData'));
 // this.loggedUser = atob(localStorage.getItem('userData'));
  this.LoginParams = decodeURIComponent(window.atob(localStorage.getItem('loginData')));
  this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
  this.userData = JSON.parse(this.loggedUser);    
  this.emp = [{ 'empID': "" + this.userData.user.empID + "" }];
  this.empObj = this.emp[0];
  

  let param = {"userName": this.userData.user.empID, "REQUESTTYPE": ""};
  this.authService.empProfileEditReqsts(param).subscribe(res=>{ 
      this.isLoading = false; 
    // console.log(res.Previous_Fields);
    // this.empData={};
    this.empData = res.Previous_Fields;  
    this.empWorkingDays= this.empData.workingdays;


    this.commAddrssForm.patchValue({
      C_Address: this.empData.communicationaddress,
      C_Address2: this.empData.communicationaddress2,
      C_Address3: this.empData.communicationaddress3,
      C_Address4: this.empData.communicationaddress4,
      C_Zip: this.empData.comm_ZIP,
      C_State: this.empData.commstate_LOCATIONID,
      C_City: this.empData.commcity_LOCATIONID,
    });
    this.PerAddrssForm.patchValue({
      P_Address: this.empData.permanentaddress,
      P_Address2: this.empData.permanentaddress2,
      P_Address3: this.empData.permanentaddress3,
      P_Address4: this.empData.permanentaddress4,
      P_State: this.empData.perstate_LOCATIONID,
      P_City: this.empData.percity_LOCATIONID,
      P_Zip: this.empData.pzipcode, 
    });
    
    this.EmrgncyContactForm.patchValue({
      frstName: this.empData.ice_FIRSTNAME,
      lastName:  this.empData.ice_LASTNAME,
      relation: this.empData.relationid,
      icemobile: this.empData.icemobile,
      iceaddress: this.empData.iceaddress,
      iceaddress2: this.empData.iceaddress2,
      iceaddress3: this.empData.iceaddress3,
      iceaddress4: this.empData.iceaddress4,
      icestate: this.empData.ice_STATE_ID,
      icecity: this.empData.ice_CITY_ID 
    });
    

    this.AccountInfoForm.patchValue({ 
      Bank_Name: this.empData.bankid,
      Bank_ifsc_Number: this.empData.ifsc,
      Bank_Acct_Number: this.empData.accountno
    });

    this.PanInfoForm.patchValue({
      PAN_Number: this.empData.pan,
    });
    // this.statesList = [{"LOCATIONID": '', "NAME": this.empData.commstate}];
  this.citiesList = [{"LOCATIONID": '', "NAME": this.empData.commcity}];
  this.citiesList1 = [{"LOCATIONID": '', "NAME": this.empData.pcity}];
  this.citiesList2 = [{"LOCATIONID": '', "NAME": this.empData.icecity}];

   


 // async Cities
//  of(this.getCities()).subscribe(list => {
//    this.C_cityList = list;   
//  });

//  of(this.getCities1()).subscribe(list => {
//   this.C_cityList1 = list;  
//   this.PerAddrssForm.controls.P_City.patchValue(this.empData.pcity); 
//  });
//  of(this.getCities2()).subscribe(list => {
//   this.C_cityList2 = list;   
//   this.EmrgncyContactForm.controls.icecity.patchValue(this.empData.ice_CITY_ID);
//  });


 
  // console.log(this.empData) 
  this.location = this.empData.location; 
    //  show profile image based on gender
    if (this.empData.genderid == 1) {
      this.isMale = true;
    } else if (this.empData.genderid == 2) {
      this.isFemale = true;
    }

    //current experience
    let expStrng: any;
    expStrng = this.empData.curExp;
    if(expStrng!= null){
      var x = expStrng.split("."); 
      this.curntExpYrs = x[0];
      this.curntExpmonths = x[1];
    }
    // total experience 
    let Exp: any;
    let spltdVal: any;
    spltdVal = this.empData.totalexp   

    // console.log(spltdVal)
    if(spltdVal != null || spltdVal != undefined){    
    var y = spltdVal.split(".");
    this.totalExpYrs = y[0];
    this.totalExpMonths = y[1];
    Exp = spltdVal.toString()
  }
  else{
    Exp = 0
  } 
  //For ngIf condition in html/view page    
  this.myExp = Exp;   
  
  this.authService.emp_EditRequest_Status(this.empObj).subscribe(res=>{ 
    // console.log("RequestStatus : ",res.Request_Status)
    this.RequestStatus= res.Request_Status;
    for(let i=0; i<this.RequestStatus.length;i++){
      if(this.RequestStatus[i].REQUESTTYPE == 'COMMADD' && this.RequestStatus[i].FLAG == 'P'){
        this.CAddrss_flag = true;
      }
      if(this.RequestStatus[i].REQUESTTYPE == 'PERADD' && this.RequestStatus[i].FLAG == 'P'){
        this.PAddrss_flag = true;
      }
      if(this.RequestStatus[i].REQUESTTYPE== 'ICEADD' && this.RequestStatus[i].FLAG == 'P'){
        this.EC_Addrss_flag= true;
      }
      if(this.RequestStatus[i].REQUESTTYPE== 'BANKADD' && this.RequestStatus[i].FLAG == 'P'){
        this.AccountInfo_flag= true;
      }
      if(this.RequestStatus[i].REQUESTTYPE== 'PANADD' && this.RequestStatus[i].FLAG == 'P'){
        this.PanInfo_flag= true;
      }
      
    }
  });

 this.authService.editProfile_statesList(this.empObj).subscribe(res=>{ 
   this.statesList = res.states;
    // console.log(this.statesList)

   // async States
  of(this.getStates()).subscribe(list => {
    this.C_stateList = list; 
    // console.log(this.C_stateList)
    this.commAddrssForm.controls.C_State.patchValue(this.empData.commstate_LOCATIONID);  
    this.PerAddrssForm.controls.P_State.patchValue(this.empData.perstate_LOCATIONID); 
    
    this.EmrgncyContactForm.controls.icestate.patchValue(this.empData.ice_STATE_ID);  
    this.EmrgncyContactForm.controls.relation.patchValue(this.empData.relationid);

    this.AccountInfoForm.controls.Bank_Name.patchValue(this.empData.bankid);

  }); 

  
        this.slctdStateCode =  {"location": this.empData.commstate_LOCATIONID };    
        this.getCitiesApi();  
        
        this.slctdStateCode1 =  {"location": this.empData.perstate_LOCATIONID }; 
        this.getCitiesApi1(); 
        

        this.slctdStateCode2 =  {"location": this.empData.ice_STATE_ID }; 
        this.getCitiesApi2();  

        this.getRelations();
        this.getBank_Names();
 })
})  

this.getapiData();
} // End of getEmpData


// modal show/hide 
closeEditModal() {
  this.EditModal = false;
  this.renderer.removeClass(document.body, 'modal-open');  
  // window.location.reload()
  this.ngOnInit();
  this.theForm = ''; 
  this.stateName= ''; 
  this.stateName1= ''; 
  this.stateName2= ''; 
  this.resetPanFile();
  this.resetPassbookInputFile();
}
// showEditModal() {
//   this.EditModal = !this.EditModal
//   this.renderer.addClass(document.body, 'modal-open'); 
// }
showEditModal(val:any){  
  this.theForm= val;
  this.EditModal = !this.EditModal
  this.renderer.addClass(document.body, 'modal-open');  
   
}




getStates() { 
  return this.statesList;
}
getCities() { 
  return this.citiesList; 
}

getCities1() { 
  return this.citiesList1; 
}

getCities2() { 
  return this.citiesList2; 
}

getBankNames(){
  return this.getBankNamesList;
}
 
getRelationList(){
  return this.relationshipList
}

onFileChange(event: any) { 
 
  // if(this.currentFile.size > 1048576){   
    // 2 MB 2097152 Bytes
    // 3 MB 3145728 Bytes
    // 4 MB 4194304 Bytes
    // 5 MB 5242880 Bytes
    // 6 MB 6291456 Bytes
    // 7 MB 7340032 Bytes  
  if(event.target.files[0].size > 10485760){ 
        Swal.fire({  
          icon: 'info',  
          title: 'File is too big!',  
          text: 'Maximum File Size Allowed 2 MB Only',
          showConfirmButton: true,  
          timer: 5000  
        })   
     }
  else{ 
    this.imageChangedEvent = event;
    this.showCropper = true;
    this.currentFile = event.target.files[0];
    // console.log(  this.currentFile)
    this.docOriginalName = this.currentFile.name;
    var reader = new FileReader();
      this.imagePath = event;
      reader.readAsDataURL(event.target.files[0]); 
      reader.onload = (_event) => { 
        this.imgURL = reader.result;   
        if(this.currentFile.size > 1048576){
        this.compressFile(this.imgURL,this.docOriginalName)
        }
      } 
      // if (this.currentFile.length !== 0 || this.currentFile.length !== null){
      //   this.submit() ; 
      // }
      if (this.currentFile.length === 0 ||this.currentFile.length === null)
          return; 
      
    }
  } 
   
//   fileChangeEvent(event: any): void {
//     this.imageChangedEvent = event;
// }
imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    const base64 = this.croppedImage;
    const imageName = this.currentFile.name;
    const imageBlob = this.base64ToFile(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    this.finalCroppdImg = imageFile;
    this.finalCropddImgName = imageName;
    this.imgURL = this.croppedImage; 
}
imageLoaded() {
    /* show cropper */
    
}
cropperReady() {
    /* cropper ready */    
    // this.showConfirmBtn = true;
}
loadImageFailed() {
    /* show message */
}
cropImg(){
  // this.showCropper = false;
  // this.showConfirmBtn = true;
}
resetUpload(){
  this.currentFile = '';
  this.showCropper = false;
  // this.showConfirmBtn = false;  
  this.ngOnInit();
}

public base64ToFile(base64Image: string): Blob {
  const split = base64Image.split(',');
  const type = split[0].replace('data:', '').replace(';base64', '');
  const byteString = atob(split[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type});
}


//****** */ COMPRESSING OF FILE/IMAGE  USING NgxImageCompressService*****
imgResultBeforeCompress:string;
imgResultAfterCompress:string;
localCompressedURl:any;
sizeOfOriginalImage:number;
sizeOFCompressedImage:number;
compressFile(image,fileName) {
var orientation = -1;
this.sizeOfOriginalImage = this.imageCompress.byteCount(image)/(1024*1024);
// console.log('Size in bytes is now:',  this.sizeOfOriginalImage);
this.imageCompress.compressFile(image, orientation, 30, 30).then(
result => {
this.imgResultAfterCompress = result;
this.localCompressedURl = result;
this.sizeOFCompressedImage = this.imageCompress.byteCount(result)/(1024*1024)
// console.log('Size in bytes after compression:',  this.sizeOFCompressedImage); 
const imageName = fileName; 
const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]); 
const imageFile = new File([result], imageName, { type: 'image/jpeg' });
});
} 
dataURItoBlob(dataURI) {
  const byteString = window.atob(dataURI);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
  int8Array[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([int8Array], { type: 'image/jpeg' });
  return blob;
  }

//------ End of COMPRESSING OF FILE/IMAGE  USING NgxImageCompressService------




submit() {   
    const formData: FormData = new FormData();
    const model: any = {};
   let emp:any =  this.userData.user.empID ;
    formData.append('file', this.finalCroppdImg, this.finalCropddImgName.name);
    formData.append('empID', emp); 
    this.showCropper = false;
    // console.log(this.finalCroppdImg)
    this.authService.addFileUplaodService(formData).then(resp => {
      // console.log(resp)    
      if(resp >= '1'){
        // this.imgURL= "http://172.19.1.84:8000/"+ this.empData.profilepic ;  
        this.showConfirmBtn = false;
        this.showAlert = true; 
        setTimeout(() => { this.showAlert = false; }, 9000);
          // this.getEmpData(); 
          this.ngOnInit();
      }else{
        console.log("profile-pic uploading failed");
        Swal.fire({  
          icon: 'error',  
          title: "Profile pic uploading failed",   
          text: 'Try Again',
          showConfirmButton: true,  
          // timer: 2000  
        }); 
      }  
    });
  
}



// Remove  profile pic 
removeProfilePic(){ 

    Swal.fire({
      title: 'Are you sure want to remove?',
      text: 'You will not be able to recover this file!',
      icon: 'warning', 
      timer: 9000,  
      timerProgressBar: true,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {

      if (result.value) {  
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Profile Pic has been deleted.',
          icon: 'success', 
          timer: 4000,  
          showConfirmButton: false,
          timerProgressBar: true,
        }) 
        // remove profile pic API 
        this.authService.removeProPic(this.empObj).subscribe(res=>{ 
          this.currentFile = '';
          this.getapiData();
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) { 
        Swal.fire({
          title: 'Cancelled',
          text: 'Your Profile Pic is safe :)',
          icon: 'error', 
          timer: 3500,  
          showConfirmButton: false,
          timerProgressBar: true,
        })


      }

    })

   
  // this.authService.removeProPic(this.empObj).subscribe(res=>{
  //   console.log(res);
  //   this.ngOnInit();
  // })
}



hideAlert(){
  this.showAlert = false;
}

getapiData(){ 
  this.profilepic = '';
  this.authService.profilepicview(this.empObj).subscribe(
    (res)=>{
      // console.log(res);
     this.profilepic = res.profilepicview; 
     if(this.profilepic!=0){
        this.imgURL= this.authService.imgbase + this.profilepic ; 
        // console.log(this.imgURL)
        this.showDeleteIcon = true;
      }
      else{
        this.showDeleteIcon = false;
      }
    }
  ) 
  this.authService.experience(this.empObj).subscribe(
    (res) => {      
        this.pastExprncs =  res.experience;
      },err => {
        console.log(err);
        this.router.navigate(['/errorPage', {errorType: err.status}]);
      }); 
      
}
 

// *****************State/City Change Funtions **********

onStateChange(val1:any, event:any){ 
  this.isLoading = true;
  let StateCode = val1; 
//  let stateCode =  event.target['options'][event.target['options'].selectedIndex].value; 
 let stateName =  event.target['options'][event.target['options'].selectedIndex].text; 
 this.stateName = stateName;
  // console.log("state:", StateCode, stateName)
  this.slctdStateCode =  {"location": StateCode } ;  
  this.getCitiesApi();  

  //*** reset zip code on State change 
  this.commAddrssForm.get('C_Zip').setValue('');
}

getCitiesApi(){ 
  this.authService.editProfile_citiesList(this.slctdStateCode).subscribe(res=>{
      // console.log(res)
      if(res)this.isLoading = false;
      this.citiesList = res.cities;
      // async Cities
      of(this.getCities()).subscribe(list => {
        this.C_cityList = list; 

        // ******select first option(city) on State change event 
        if(this.stateName){
          this.commAddrssForm.controls.C_City.patchValue(this.C_cityList[0].LOCATIONID);
          this.slctdCityName = this.C_cityList[0].NAME;
        }
        
      });  
    })
}

onStateChange1(val1:any, event:any){ 
  this.isLoading = true;
  let StateCode = val1; 
//  let stateCode =  event.target['options'][event.target['options'].selectedIndex].value; 
 let stateName =  event.target['options'][event.target['options'].selectedIndex].text; 
 this.stateName1 = stateName;
  // console.log("state:", StateCode, stateName)
  this.slctdStateCode1 =  {"location": StateCode };  
  this.getCitiesApi1();

  //*** reset zip code on state change 
  this.PerAddrssForm.get('P_Zip').setValue('');
}

getCitiesApi1(){ 
  this.authService.editProfile_citiesList(this.slctdStateCode1).subscribe(res=>{
      // console.log(res)
      if(res)this.isLoading = false;
      this.citiesList1 = res.cities;
      // async Cities
      of(this.getCities1()).subscribe(list => {
        this.C_cityList1 = list;     

          // ******select first option(city) on State change event 
          if(this.stateName1){
            this.PerAddrssForm.controls.P_City.patchValue(this.C_cityList1[0].LOCATIONID);
            this.slctdCityName1 = this.C_cityList1[0].NAME;
          }  
      });  
    })
}


onStateChange2(val1:any, event:any){ 
  this.isLoading = true;
  let StateCode = val1; 
//  let stateCode =  event.target['options'][event.target['options'].selectedIndex].value; 
 let stateName =  event.target['options'][event.target['options'].selectedIndex].text; 
 this.stateName2 = stateName;
  // console.log("state:", StateCode, stateName)
  this.slctdStateCode2 =  {"location": StateCode }; 
  this.getCitiesApi2(); 
}

getCitiesApi2(){
  this.authService.editProfile_citiesList(this.slctdStateCode2).subscribe(res=>{
    // console.log(res)
    if(res)this.isLoading = false;
    this.citiesList2 = res.cities;
    // async Cities
    of(this.getCities2()).subscribe(list => {
      this.C_cityList2 = list;   

      // ******select first option(city) on State change event 
      if(this.stateName2){
        this.EmrgncyContactForm.controls.icecity.patchValue(this.C_cityList2[0].LOCATIONID);
        this.slctdCityName2 = this.C_cityList2[0].NAME;
      } 
      
    });  
  })
}


onCityChange(val1:any, event:any){ 
  let slctdCityCode = val1;
  let cityName = event.target['options'][event.target['options'].selectedIndex].text;
  this.slctdCityName= cityName;

   //*** reset zip code on city change 
  this.commAddrssForm.get('C_Zip').setValue('');
  // console.log("city:", slctdCityCode, cityName)
}

onCityChange1(val1:any, event:any){ 
  let slctdCityCode = val1;
  let cityName = event.target['options'][event.target['options'].selectedIndex].text;
  this.slctdCityName1= cityName;

  //*** reset zip code on city change 
  this.PerAddrssForm.get('P_Zip').setValue('');
  // console.log("city:", slctdCityCode, cityName)
}

onCityChange2(val1:any, event:any){ 
  let slctdCityCode = val1;
  let cityName = event.target['options'][event.target['options'].selectedIndex].text;
  this.slctdCityName2= cityName;
  // console.log("city:", slctdCityCode, cityName)
}

// *****************End of State/City Change Funtions **********




getRelations(){
  this.authService.empRelationshipList(this.empObj).subscribe(res=>{
    // console.log(res.Relations)
    this.relationshipList = res.Relations;  
     of(this.getRelationList()).subscribe(list => { 
      this.relationship_List = list; 
      this.EmrgncyContactForm.controls.relation.patchValue(this.empData.relationid);
     });
 })
} 
onRelationChange(val1:any, event:any ){ 
  //  let stateCode =  event.target['options'][event.target['options'].selectedIndex].value; 
   this.relationName =  event.target['options'][event.target['options'].selectedIndex].text;  
    // console.log("Relation:", val1, this.relationName) 
}

getBank_Names(){
  this.authService.bankNamesList(this.empObj).subscribe(res=>{
    // console.log(res.BankDetails)
    this.getBankNamesList= res.BankDetails;
    of(this.getBankNames()).subscribe(list => { 
      this.banksList = list; 
      this.AccountInfoForm.controls.Bank_Name.patchValue(this.empData.bankid);
     });
  })
}
onBankChange(val1:any, event:any){
  this.SlctdBankName =  event.target['options'][event.target['options'].selectedIndex].text; 
  // console.log("Bank:", val1, this.SlctdBankName) 

  //**reset Bank Inputs on Bank Change */
  this.AccountInfoForm.get('Bank_ifsc_Number').setValue('');
  this.AccountInfoForm.get('Bank_Acct_Number').setValue('');

}


  
 
 


send_to_HR(){

  if(this.empData.communicationaddress != this.commAddrssForm.value.C_Address){
    this.c_Form.get('COMMUNICATIONADDRESS').setValue(this.commAddrssForm.value.C_Address)
  }else{
    this.c_Form.get('COMMUNICATIONADDRESS').setValue('')
  }
  
  if(this.empData.communicationaddress2 != this.commAddrssForm.value.C_Address2){
    this.c_Form.get('COMMUNICATIONADDRESS2').setValue(this.commAddrssForm.value.C_Address2)
  }else{
    this.c_Form.get('COMMUNICATIONADDRESS2').setValue('')
  }
  if(this.empData.communicationaddress3 != this.commAddrssForm.value.C_Address3){
    this.c_Form.get('COMMUNICATIONADDRESS3').setValue(this.commAddrssForm.value.C_Address3)
  }else{
    this.c_Form.get('COMMUNICATIONADDRESS3').setValue('')
  }
  if(this.empData.communicationaddress4 != this.commAddrssForm.value.C_Address4){
    this.c_Form.get('COMMUNICATIONADDRESS4').setValue(this.commAddrssForm.value.C_Address4)
  }else{
    this.c_Form.get('COMMUNICATIONADDRESS4').setValue('')
  }
  if(this.empData.commstate_LOCATIONID != this.commAddrssForm.value.C_State){
    this.c_Form.get('COMMUNICATION_STATE_ID').setValue(this.commAddrssForm.value.C_State);
    this.c_Form.get('COMMUNICATION_STATE_NAME').setValue(this.stateName);
    
  }else{
    this.c_Form.get('COMMUNICATION_STATE_ID').setValue('');
    this.c_Form.get('COMMUNICATION_STATE_NAME').setValue(''); 
  }
  
  if(this.empData.commcity_LOCATIONID != this.commAddrssForm.value.C_City){
    this.c_Form.get('COMMUNICATION_CITY_ID').setValue(this.commAddrssForm.value.C_City);
    this.c_Form.get('COMMUNICATION_CITY_NAME').setValue(this.slctdCityName);     
  }else{
    this.c_Form.get('COMMUNICATION_CITY_ID').setValue('');
    this.c_Form.get('COMMUNICATION_CITY_NAME').setValue('');  
  }

  if(this.empData.comm_ZIP != this.commAddrssForm.value.C_Zip){
    this.c_Form.get('COMMUNICATIONZIP').setValue(this.commAddrssForm.value.C_Zip); 
    
  }else{
    this.c_Form.get('COMMUNICATIONZIP').setValue(''); 
  
  }
  
   
  let formValue = { ...this.c_Form.value };
  
  for (let prop in formValue) {
    if (!formValue[prop]) {
      delete formValue[prop];
    } 
    if (Array.isArray(formValue[prop])) {
      let resultArray = formValue[prop].filter(item => item);
      if (resultArray.length > 0) {
        formValue[prop] = resultArray;
      } else {
        delete formValue[prop];
      }
    }
  }
  
  // alert(JSON.stringify(this.c_Form.value));
  
  let fixedParams = {
          "EMPLOYEEID": "" + this.userData.user.empID + "",
          "REQUESTTYPE": "COMMADD",
        } 
  let totalParams= Object.assign(fixedParams, formValue);
  // alert(JSON.stringify(totalParams)); 
  let arrayLength= JSON.stringify(formValue).length;
  if(arrayLength != 2){ 
    this.isLoading = true;
    this.authService.emp_EditProfileRequest(JSON.stringify(totalParams)).subscribe(res=>{
      // console.log(res);
      let Comm_res = res.employee_request;
      if(Comm_res==1){
        this.isLoading = false;
        this.closeEditModal();
        Swal.fire({  
          icon: 'success',  
          title: "Request Sent Successfuly",   
          text: 'Requested Changes are Affect Once Approved by the HR Team',
          showConfirmButton: true,  
          // timer: 2000  
        }); 
        this.ngOnInit();
      }
    })
  }
  else{
    alert("No Changes Requested")
  }

}// End of SendtoHR
   
validateCOMMAddrssForm(){
  this.CommdisableButton = true;
  this.CommSubmitted = true; 
  if(this.commAddrssForm.invalid){
    this.CommdisableButton = false;
    return; 
  }
  else{
    this.send_to_HR();
    this.CommdisableButton = false;
    this.CommSubmitted = false;
  }
}



send_to_HR1(){
  if(this.empData.permanentaddress != this.PerAddrssForm.value.P_Address){
    this.p_Form.get('PERMANENTADDRESS').setValue(this.PerAddrssForm.value.P_Address)
  }else{
    this.p_Form.get('PERMANENTADDRESS').setValue('')
  }
  if(this.empData.permanentaddress2 != this.PerAddrssForm.value.P_Address2){
    this.p_Form.get('PERMANENTADDRESS2').setValue(this.PerAddrssForm.value.P_Address2)
  }else{
    this.p_Form.get('PERMANENTADDRESS2').setValue('')
  }
  if(this.empData.permanentaddress3 != this.PerAddrssForm.value.P_Address3){
    this.p_Form.get('PERMANENTADDRESS3').setValue(this.PerAddrssForm.value.P_Address3)
  }else{
    this.p_Form.get('PERMANENTADDRESS3').setValue('')
  }
  if(this.empData.permanentaddress4 != this.PerAddrssForm.value.P_Address4){
    this.p_Form.get('PERMANENTADDRESS4').setValue(this.PerAddrssForm.value.P_Address4)
  }else{
    this.p_Form.get('PERMANENTADDRESS4').setValue('')
  }
    
  if(this.empData.perstate_LOCATIONID != this.PerAddrssForm.value.P_State){
    this.p_Form.get('PERMANENT_STATE_ID').setValue(this.PerAddrssForm.value.P_State);
    this.p_Form.get('PERMANENT_STATE_NAME').setValue(this.stateName1);
    
  }else{
    this.p_Form.get('PERMANENT_STATE_ID').setValue('');
    this.p_Form.get('PERMANENT_STATE_NAME').setValue(''); 
  }
  
  if(this.empData.percity_LOCATIONID != this.PerAddrssForm.value.P_City){
    this.p_Form.get('PERMANENT_CITY_ID').setValue(this.PerAddrssForm.value.P_City);
    this.p_Form.get('PERMANENT_CITY_NAME').setValue(this.slctdCityName1);     
  }else{
    this.p_Form.get('PERMANENT_CITY_ID').setValue('');
    this.p_Form.get('PERMANENT_CITY_NAME').setValue('');  
  }

  if(this.empData.pzipcode != this.PerAddrssForm.value.P_Zip){
    this.p_Form.get('PERMANENTZIP').setValue(this.PerAddrssForm.value.P_Zip); 
    
  }else{
    this.p_Form.get('PERMANENTZIP').setValue(''); 
  
  }
  
   
  let formValue = { ...this.p_Form.value };
  
  for (let prop in formValue) {
    if (!formValue[prop]) {
      delete formValue[prop];
    } 
    if (Array.isArray(formValue[prop])) {
      let resultArray = formValue[prop].filter(item => item);
      if (resultArray.length > 0) {
        formValue[prop] = resultArray;
      } else {
        delete formValue[prop];
      }
    }
  }
  
  // alert(JSON.stringify(this.c_Form.value));
  
  let fixedParams = {
          "EMPLOYEEID": "" + this.userData.user.empID + "",
          "REQUESTTYPE": "PERADD"
        } 
  let totalParams= Object.assign(fixedParams, formValue);
  
  let arrayLength= JSON.stringify(formValue).length;
  if(arrayLength != 2){
    // alert(JSON.stringify(totalParams))
    this.isLoading = true;
    this.authService.emp_EditProfileRequest(JSON.stringify(totalParams)).subscribe(res=>{
      // console.log(res)
      let Per_res = res.employee_request;
      if(Per_res==1){
        this.isLoading = false;
        this.closeEditModal();
        Swal.fire({  
          icon: 'success',  
          title: "Request Sent Successfuly",   
          text: 'Requested Changes are Affect Once Approved by the HR Team',
          showConfirmButton: true,  
          // timer: 2000  
        }); 
        this.ngOnInit();
      }
    })
  }
  else{
    alert("No Changes Requested")
  }
}// End of SendtoHR1
  
validatePERMNTADDRSForm(){
  this.PermntDisableButton = true;
  this.PerSubmitted = true; 
  if(this.PerAddrssForm.invalid){
    this.PermntDisableButton = false;
    return;
    
  }
  else{
    this.send_to_HR1();
    this.PermntDisableButton = false;
    this.PerSubmitted = false;
  }
}





Send_Ice_Req(){
  if(this.empData.ice_FIRSTNAME != this.EmrgncyContactForm.value.frstName){
    this.EC_Form.get('FIRSTNAME').setValue(this.EmrgncyContactForm.value.frstName);
  }else{
    this.EC_Form.get('FIRSTNAME').setValue('');
  }
  if(this.empData.ice_LASTNAME != this.EmrgncyContactForm.value.lastName){
    this.EC_Form.get('LASTNAME').setValue(this.EmrgncyContactForm.value.lastName);
  }else{
    this.EC_Form.get('LASTNAME').setValue('');
  }
  if(this.empData.relationid != this.EmrgncyContactForm.value.relation){
    this.EC_Form.get('RELATIONID').setValue(this.EmrgncyContactForm.value.relation);
    this.EC_Form.get('RELATIONNAME').setValue(this.relationName);
  }else{
    this.EC_Form.get('RELATIONID').setValue('');
    this.EC_Form.get('RELATIONNAME').setValue('') ;
  }
  if(this.empData.icemobile != this.EmrgncyContactForm.value.icemobile){
    this.EC_Form.get('MOBILE').setValue(this.EmrgncyContactForm.value.icemobile) ;
  }else{
    this.EC_Form.get('MOBILE').setValue('') ;
  }
  if(this.empData.iceaddress != this.EmrgncyContactForm.value.iceaddress){
    this.EC_Form.get('ADDRESS').setValue(this.EmrgncyContactForm.value.iceaddress) ;
  }else{
    this.EC_Form.get('ADDRESS').setValue(''); 
  }
  if(this.empData.iceaddress2 != this.EmrgncyContactForm.value.iceaddress2){
    this.EC_Form.get('ADDRESS2').setValue(this.EmrgncyContactForm.value.iceaddress2) ;
  }else{
    this.EC_Form.get('ADDRESS2').setValue('') ;
  }
  if(this.empData.iceaddress3 != this.EmrgncyContactForm.value.iceaddress3){
    this.EC_Form.get('ADDRESS3').setValue(this.EmrgncyContactForm.value.iceaddress3) ;
  }else{
    this.EC_Form.get('ADDRESS3').setValue('') ;
  }
  if(this.empData.iceaddress4 != this.EmrgncyContactForm.value.iceaddress4){
    this.EC_Form.get('ADDRESS4').setValue(this.EmrgncyContactForm.value.iceaddress4) ;
  }else{
    this.EC_Form.get('ADDRESS4').setValue('') ;
  }

  if(this.empData.ice_STATE_ID != this.EmrgncyContactForm.value.icestate){
    this.EC_Form.get('ICE_STATE_ID').setValue(this.EmrgncyContactForm.value.icestate); 
    this.EC_Form.get('ICE_STATE_NAME').setValue(this.stateName2) ;

  }else{
    this.EC_Form.get('ICE_STATE_ID').setValue('') ;
    this.EC_Form.get('ICE_STATE_NAME').setValue('')  ;
  }
  
  if(this.empData.ice_CITY_ID != this.EmrgncyContactForm.value.icecity){
    this.EC_Form.get('ICE_CITY_ID').setValue(this.EmrgncyContactForm.value.icecity) ;
    this.EC_Form.get('ICE_CITY_NAME').setValue(this.slctdCityName2) ;

  }else{
    this.EC_Form.get('ICE_CITY_ID').setValue('') ;
    this.EC_Form.get('ICE_CITY_NAME').setValue('')  ;
  }




  let formValue = { ...this.EC_Form.value }; 
  for (let prop in formValue) {
    if (!formValue[prop]) {
      delete formValue[prop];
    } 
    if (Array.isArray(formValue[prop])) {
      let resultArray = formValue[prop].filter(item => item);
      if (resultArray.length > 0) {
        formValue[prop] = resultArray;
      } else {
        delete formValue[prop];
      }
    }
  }
   
  
  let fixedParams = {
          "EMPLOYEEID": "" + this.userData.user.empID + "",
          "REQUESTTYPE": "ICEADD"
        } 
        let totalParams= Object.assign(fixedParams, formValue);
  
        let arrayLength= JSON.stringify(formValue).length;
 
        if(arrayLength != 2){
          // alert(JSON.stringify(totalParams))
          this.isLoading = true;
          this.authService.emp_EditProfileRequest(JSON.stringify(totalParams)).subscribe(res=>{
            // console.log(res)
            let Per_res = res.employee_request;
            if(Per_res==1){
              this.isLoading = false;
              this.closeEditModal();
              Swal.fire({  
                icon: 'success',  
                title: "Request Sent Successfuly",   
                text: 'Requested Changes are Affect Once Approved by the HR Team',
                showConfirmButton: true,  
                // timer: 2000  
              }); 
              this.ngOnInit();
            }
          })
        }
        else{
          alert("No Changes Requested")
        }
}

validateECForm(){
  this.ICEDisableButton = true;
  this.ICESubmitted = true; 
  if(this.EmrgncyContactForm.invalid){
    this.ICEDisableButton = false;
    return; 
  }
  else{
    this.Send_Ice_Req();
    this.ICEDisableButton = false;
    this.ICESubmitted = false;
  }
}



 
uploadPassbook($event: any) {   
   
  // if(this.currentFile.size >2097152 ){   
    if($event.target.files[0]){
      if($event.target.files[0].size > 2097152){ 
            Swal.fire({  
              icon: 'info',  
              title: 'File is too big!',  
              text: 'Maximum File Size Allowed 2 MB Only',
              showConfirmButton: true,  
              timer: 5000  
            })   
            this.resetPassbookInputFile() 
        }
        
      else{  
        this.passbookFile= ($event.target as HTMLInputElement).files[0];   
        if(this.passbookFile){
          this.passbookFileName = this.passbookFile.name;   
          this.isFileUploaded = true;
          // File Reader 
          const reader = new FileReader();
          reader.onload = () => {
            this.passbook = reader.result; 
          };
          reader.readAsText($event.target.files[0]);  

          // BLOB 
          var blob = $event.target.files[0].slice(0, $event.target.files[0].size, 'image/png');  
          const newFile = new File([blob], this.passbookFile.name, {type: 'image/png'}) 
          this.finalpassbookImg = newFile;    
          
        } 
        
      }
    }  
  else{
    this.resetPassbookInputFile() 
  }
  }
   
  
resetPassbookInputFile(){  
  this.passbookFile= ''
  this.passbookFileName= ''
  this.AccountInfoForm.get('Bank_Passbook_file').setValue('');
  this.submitted = false;
}
   

Send_Bank_Req(){
     
  if(this.empData.bankid != this.AccountInfoForm.value.Bank_Name){
    this.AI_Form.get('BANKID').setValue(this.AccountInfoForm.value.Bank_Name)
    this.AI_Form.get('BANKNAME').setValue(this.SlctdBankName) 
  }else{
    this.AI_Form.get('BANKID').setValue('0')
    this.AI_Form.get('BANKNAME').setValue('0') 
  }
  if(this.empData.ifsc != this.AccountInfoForm.value.Bank_ifsc_Number){
    this.AI_Form.get('BANKIFC').setValue(this.AccountInfoForm.value.Bank_ifsc_Number) 
  }else{
    this.AI_Form.get('BANKIFC').setValue('0') 
  }
  if(this.empData.accountno != this.AccountInfoForm.value.Bank_Acct_Number){
    this.AI_Form.get('BANKACC').setValue(this.AccountInfoForm.value.Bank_Acct_Number) 
  }else{
    this.AI_Form.get('BANKACC').setValue('0') 
  }
  

  let formValue = { ...this.AI_Form.value }; 
  for (let prop in formValue) {
    if (!formValue[prop]) {
      delete formValue[prop];
    } 
    if (Array.isArray(formValue[prop])) {
      let resultArray = formValue[prop].filter(item => item);
      if (resultArray.length > 0) {
        formValue[prop] = resultArray;
      } else {
        delete formValue[prop];
      }
    }
  }
  // let fixedParams = {
  //   "EMPLOYEEID": "" + this.userData.user.empID + "",
  //   "REQUESTTYPE": "BANKADD"
  // } 
  // let totalParams= Object.assign(fixedParams, formValue);
 
  if((formValue.BANKID!='0'||formValue.BANKNAME!='0'||formValue.BANKIFC!='0'||formValue.BANKACC!='0')&& this.passbookFile){
     
  // alert(param)
  var formData1: FormData = new FormData(); 
  formData1.append("EMPLOYEEID", this.userData.user.empID ); 
  formData1.append("REQUESTTYPE", 'BANKADD'); 
  formData1.append("PAN", '0');
  formData1.append('FILE', this.finalpassbookImg);
  formData1.append("BANKID", formValue.BANKID);
  formData1.append("BANKNAME", formValue.BANKNAME);
  formData1.append("BANKIFC", formValue.BANKIFC); 
  formData1.append("BANKACC", formValue.BANKACC);
  // if(formValue.BANKID){
  //   formData1.append("BANKID", formValue.BANKID);
  //   formData1.append("BANKNAME", formValue.BANKNAME); 
  // } 
  // if(formValue.BANKIFC){
  //   formData1.append("BANKIFC", formValue.BANKIFC); 
  // }
  // if(formValue.BANKACC){
  //   formData1.append("BANKACC", formValue.BANKACC); 
  // }


 
  this.isLoading = true;
  this.authService.empAccntFileUpload(formData1).subscribe(res => {
      // console.log(res)
      this.isLoading = false;
      if(res){ 
        this.closeEditModal();
        Swal.fire({  
          icon: 'success',  
          title: "Request Sent Successfuly",   
          text: 'Requested Fields are Affect Once Approved by the HR Team',
          showConfirmButton: true,  
          // timer: 2000  
        }); 
        this.getEmpData();
      }
  })

} else{
 
  if(this.passbookFileName){
    alert("No Changes Requested")
  }
   
}

}

 
validateBankForm(){  
  this.disableButton = true;
  this.submitted = true; 
  if(this.AccountInfoForm.valid){
    this.Send_Bank_Req(); 
    this.disableButton = false;
    this.submitted = false;
    
  }
  else{
    this.disableButton = false;
    return;
  }
}  





uploadPan($event: any) {  
  // if(this.currentFile.size > 1048576){   
    if($event.target.files[0]){
  if($event.target.files[0].size > 2097152){ 
        Swal.fire({  
          icon: 'info',  
          title: 'File is too big!',  
          text: 'Maximum File Size Allowed 2 MB Only',
          showConfirmButton: true,  
          timer: 5000  
        })   
        this.resetPanFile() 
     }
     
  else{  
    this.panFile= ($event.target as HTMLInputElement).files[0];  
    if(this.panFile){
      this.panFileName = this.panFile.name;   
      this.isFileUploaded = true;
      // File Reader 
      const reader = new FileReader();
      reader.onload = () => {
        this.panNum = reader.result;
      };
      reader.readAsText($event.target.files[0]); 

      // BLOB 
      var blob = $event.target.files[0].slice(0, $event.target.files[0].size, 'image/png');  
      const newFile = new File([blob], this.panFile.name, {type: 'image/png'}) 
      this.fianlpanFile = newFile;  
      if(!this.inputPan) {
        this.handleInput(this.empData.pan)
      }
    } 
    
  }
}  
else{
  this.resetPanFile() 
}
  }

  resetPanFile(){ 
    this.panFile= ''
    this.panFileName= ''
    this.PanInfoForm.get('Pan_file').setValue(''); 
    this.panSubmitted =false;
  }

  handleInput(e: any) { 
    if(e.length=='10' && this.PanInfoForm.controls.PAN_Number.valid){
      this.inputPan = e; 
      this.getPanData();
    }
    else{
      this.ExistPan = false;
    }
  }
  
  getPanData(){
    let param = {"PAN": this.inputPan}
    this.authService.panverify(param).subscribe(res=>{      
      let x = res.count[0].COUNT;
      // console.log("pan verify:",x)
      if(x==1){
        this.ExistPan = true;
      }
      else{
        this.ExistPan = false;
        this.enableApi= true;
        //final api
      }
    })
  }
  

send_to_HR4(){ 
   this.panSubmitted = true; 
  if(this.enableApi && this.PanInfoForm.valid){ 
    let PanNumber = (this.PanInfoForm.value.PAN_Number).toUpperCase( ) ;
    // alert(PanNumber)
    var formData2: FormData = new FormData(); 
    formData2.append("EMPLOYEEID", this.userData.user.empID ); 
    formData2.append("REQUESTTYPE", "PANADD"); 
    formData2.append('FILE', this.fianlpanFile);
    formData2.append("PAN", PanNumber); 
    formData2.append("BANKID", '0');
    formData2.append("BANKNAME", '0');
    formData2.append("BANKIFC", '0'); 
    formData2.append("BANKACC", '0');

    this.isLoading = true;
    this.authService.empAccntFileUpload(formData2).subscribe(res => {
        // console.log(res)
        this.isLoading = false;
        if(res){ 
          this.closeEditModal();
          Swal.fire({  
            icon: 'success',  
            title: "Request Sent Successfuly",   
            text: 'Requested Fields are Affect Once Approved by the HR Team',
            showConfirmButton: true,  
            // timer: 2000  
          }); 
          this.panSubmitted = false;
          this.getEmpData(); 
        }
    })


     
  }
  
}


}



//***************** custom validators for Form *************
export function fileTypeValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
      let fileName = control.value;
      let ext = fileName.substring(fileName.lastIndexOf('.') + 1);
      return (ext === 'PNG' ||ext === 'png' ||ext === 'JPEG' ||ext === 'jpg' || ext === 'jpeg' ||ext === 'pdf') ? null : {'invalidFile': true};
  };
}

export function checkPanInputValidator(nameRe: RegExp): ValidatorFn {
  return (control:AbstractControl): {[key:string]: any} | null => {
    // if input field is empty return as valid else test
    let ret = (control.value !== '') ? nameRe.test(control.value) : true;
    return !ret ? {'invalidNumber': {value: control.value}} : null;
  };
}