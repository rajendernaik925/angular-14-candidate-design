import { Component, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';
import { AuthService } from '../auth.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { ImageCroppedEvent} from 'ngx-image-cropper';
import { FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { element } from 'protractor';
@Component({
  selector: 'app-idcard',
  templateUrl: './idcard.component.html',
  styleUrls: ['./idcard.component.sass']
})
export class IdcardComponent implements OnInit {
   public imagePath;
  loggedUser: any = {};
  userData: any;
  myDate: any;
  empObj: any;
  assmntData: any;
  isMasterSel: boolean;
  checkedCategoryList: any;
  finalData: any = [];
  mydata:any=[];
  isData: any;
  isLoading: boolean;
  authBoolean: boolean;
  privileges: any = {};
  undo:boolean=false;
  isDisabled: boolean;
  btnDsble: boolean;
 showAlert:boolean = false;
  showDeleteIcon:boolean = false;
  form16: string; // Variable to hold PDF blob URL
  form16_mob: SafeResourceUrl; // Sanitized resource URL for PDF
  form16Modal: boolean;
  document: any;
  imageFile: null;
  addresses: any[] = [];
  addressId: number | null = null;
  bloodgroupId:number | null =null;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  finalCropddImgName: any;
  showConfirmBtn: boolean = false;
  showCropper: boolean = false;
  showCropperData:any[]= [];
  finalCroppdImg:any;
  currentFileUpload: File;
  fileValue:any;
  imgURL: any; 
  currentFile:any;
  docOriginalName:any;
  myForm: FormGroup;  
  fb: any;
  filteredEmployees : any; 
  searchText: any='';
  disableAddressDropdown: boolean = false;
  isSaved: boolean = false;
  employees: any[] = [];
  IDCARDDEATILS: any[] = [];
  bloodgroupvalue: any[]=[];
  currentlyEditingId: number | null = null; 
  currentlyUpdatingId: number | null = null;
  employeeId: number | null = null;
  fileUploaded: boolean = false;
   editingRowId: number | null = null;

   baseUrl: string; // Declare a property to hold baseUrl value

  constructor(
    private authService: AuthService,
    public router: Router,
    
    private renderer: Renderer2,
    private dom: DomSanitizer, private imageCompress: NgxImageCompressService
  ) {}


  ngOnInit(): void {

    this.baseUrl = this.authService.baseUrl;
 this.authService.getAddresses().subscribe(
      (data) => {
        this.addresses = data;
      },
      (error) => {
      }
    );
  
  this.authService.getBloodgroup().subscribe(
    (data) => {
      this.bloodgroupvalue = data;
    },
    (error) => {
    }
  );

   
    this.isDisabled = false;
    this.btnDsble = true;
    this.loggedUser = decodeURIComponent(window.atob(localStorage.getItem('userData')));
    this.userData = JSON.parse(this.loggedUser);
    this.myDate = decodeURIComponent(window.atob(localStorage.getItem('currentDate')));
    moment.locale('en');

    let x = decodeURIComponent(window.atob(localStorage.getItem('privileges')));
    this.privileges = JSON.parse(x).Rights;


    this.authBoolean=false;
    for (let i = 0; i < this.privileges.length; i++) {   
      if(this.privileges[i].IDCARD == "true"){ 
        this.authBoolean=true;
      }
    }
    if(this.authBoolean== false){
      let x = 'false'; 
      this.router.navigate(['/errorPage', {AuthrzdUser: x}]); 
    }

    let emp = [{ 'empID': "" + this.userData.user.empID + "" }];
    this.empObj = emp[0];
    this.getEmployeeDetails();

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
getEmployeeDetails() {
  this.isLoading = true;
  this.authService.getEmployeeDetails().subscribe(
    (data: any[]) => {
      this.mydata=data;
      this.employees = data.map(employee => {
        // Here, we directly use the imageBytes from the API response as the src for the image
      employee.imageUrl = `data:image/png;base64,${employee.imageBytes}`;
      this.isLoading = false;
      return employee;
      });
      return;
    },
    
    (error) => {
    }
  );
}
 selectedImage: string | null = null; 
 selectedFile: File | null = null;    
  viewImage(employee: any) {
    this.selectedImage = employee.imageUrl;
  }
showModal = false;
  closeModal() {
    this.selectedImage = null;
  }
closeModal1()
{
  this.showModal=false;
}
  closeModal2() {
    this.showCropper = false;
  }

onFileChange(event: any, item: any) {
  if (item.selectedImage && item.selectedImage.length > 0) {
    item.selectedImage = []; 
  }
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    Swal.fire({
      icon: 'info',
      title: 'File is too big!',
      text: 'Maximum file size allowed is 5 MB.',
      showConfirmButton: true,
      timer: 5000
    });
    return;
  }

  // Validate file type (PNG, JPEG, JPG)
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      icon: 'info',
      title: 'Invalid file type!',
      text: 'Only PNG, JPEG, and JPG images are allowed.',
      showConfirmButton: true,
      timer: 5000
    });
    return;
  }

  // If the file is valid, proceed with the processing
  this.imageChangedEvent = event;
  this.showCropper = true;
  this.fileUploaded = true;
  this.currentFile = file;
  item.selectedImage = this.currentFile;
  this.selectedFile = this.currentFile;

  // Store the original file name
  this.docOriginalName = file.name;

  // Use FileReader to preview the image (for cropping or displaying)
  var reader = new FileReader();
  this.imagePath = event;
  reader.readAsDataURL(file);
  reader.onload = (_event) => {
    this.imgURL = reader.result;

    // Optionally compress the image if it exceeds 1MB (custom logic for compression)
    if (file.size > 1024 * 1024) {
      this.compressFile(this.imgURL, this.docOriginalName);
    }
  }

  // Store the data for showing cropper (if any)
  this.showCropperData = [item];

  // Check if the file is empty or invalid
  if (file.length === 0 || file === null) {
    return;
  }
}

imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    const base64 = this.croppedImage;
    const imageName = this.currentFile.name;
    const imageBlob = this.base64ToFile(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    this.finalCroppdImg = imageFile;
    this.finalCropddImgName = imageName;
    this.imgURL = this.croppedImage; 

    // alert(this.finalCroppdImg);
    // alert( this.finalCropddImgName);
    //  alert(this.imgURL);
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
  }
imageLoaded() {
}
cropperReady() {
}
loadImageFailed() {
}
cropImg(item:any){
   this.showCropper = false;
 
}
resetUpload(){
  this.fileUploaded = false;
   this.docOriginalName = null;
  this.currentFile = '';
  this.showCropper = false;
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
isEditable(item: any): boolean {
  item.viewImg=true;
    return item.addressId !== '' && item.addressId !== '1' && 
           item.bloodGroupId !== '' && item.bloodGroupId !== 0 &&
           item.imageBytes !== null && item.imageBytes !== '';
  }


filterEmployees(): void {
  // If searchText is empty, return all employees
  if (!this.searchText) {
    this.employees = this.mydata;  
    return;
  }

  // Convert searchText to lowercase for case-insensitive comparison
  const searchTextLower = this.searchText.toLowerCase();

  // Filter employees based on the search text
  this.employees = this.mydata.filter(item => {
    return (
      // Check if employeeId matches the search text (convert to string)
      item.employeeId && item.employeeId.toString().toLowerCase().includes(searchTextLower) ||
      
      // Check if name matches the search text
      item.name && item.name.toLowerCase().includes(searchTextLower) ||
      
      // Check if BU name matches the search text
      item.buName && item.buName.toLowerCase().includes(searchTextLower)
    );
  });
}
 
editEmployeeImage(item: any,action:any): void {

//alert(action);
let api=true;
if(action=='update')
{
    if (this.finalCropddImgName === undefined || this.finalCropddImgName === null) {
    // alert("Please Upload Profile Pic");
      api=false;
      //return;
    } else {
  
   }
}
if(api)
 {
  if (item.isEditing) {  
    this.saveOrUpdateEmployeeImage(item);  
    this.employeeId = item.employeeId; 
    this.showCropper = false; 
    item.isEditing = false;
  
  } else {
    item.isEditing = true;  
    if (this.currentlyEditingId !== null) {
      const previousRow = this.employees.find(emp => emp.employeeId === this.currentlyEditingId);
      if (previousRow) {

         previousRow.isEditing = false; 
         previousRow.undo = false; 
         previousRow.selectedImage=false;
        // previousRow.file="";
        // item.undo=false;
       
      }      
    }
    item.viewImg=false;
    item.undo=true;
    this.docOriginalName=" ";
    this.fileUploaded=false;
    item.isEditing = true;  
    this.editingRowId = item.employeeId;
    this.currentlyEditingId = item.employeeId; 
  }

}
}

 UNDO(){
     this.getEmployeeDetails();
  }

saveOrUpdateEmployeeImage(item: any): void {
  Swal.fire({
    title: 'Processing...',
    text: 'Please wait while we save the employee data.',
    icon: 'info',
    showConfirmButton: false,
    allowOutsideClick: false,
  });

  // Prepare form data to send
  const formData = new FormData();
  formData.append('employeeId', item.employeeId);
  formData.append('addressId', item.addressId);  
  formData.append('bloodGroupId', item.bloodGroupId); 
  if (this.finalCroppdImg) {
   formData.append('employeeImage', this.finalCroppdImg, this.finalCropddImgName.name);
  
  } else {
    formData.append('employeeImage', ''); 
  }
 
  // Call the service to save or update the employee data
  this.authService.insertEmployeeImage(formData).subscribe(
    (response) => {
       this.getEmployeeDetails();
      Swal.close(); 
      Swal.fire({
        title: 'Success!',
        text: 'Employee data has been saved/updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.disableAddressDropdown = true;
      item.isEditing = false;  
    },
    (error) => {
      Swal.close();
      Swal.fire({
        title: 'Error',
        text: 'There was an error while saving/updating the data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      this.isLoading = false;
    }
  );
}


insertEmployeeImage(item: any) {
   // Check if addressId is missing or equals '1'
if (!item.addressId || item.addressId === '1') {
  Swal.fire({
    title: 'Validation Error',
    text: 'Please select a valid Address.',
    icon: 'warning',
    confirmButtonText: 'OK'
  });
  return; 
}
// Check if bloodGroupId is missing or equals '1'
else if (!item.bloodGroupId || item.bloodGroupId == 0) {
  Swal.fire({
    title: 'Validation Error',
    text: 'Please select a valid Blood Group.',
    icon: 'warning',
    confirmButtonText: 'OK'
  });
  return; 
}
// Check if selectedImage is missing or not properly uploaded
else if (!item.selectedImage) {
  Swal.fire({
    title: 'Validation Error',
    text: 'Please upload an image.',
    icon: 'warning',
    confirmButtonText: 'OK'
  });
  return; 
}

//alert("dnt call")
 item.isEditing = false; 
  this.editingRowId = item.employeeId; 
  const formData = new FormData();
  formData.append('employeeId', item.employeeId);
  formData.append('addressId', item.addressId);
  formData.append('bloodGroupId', item.bloodGroupId); 
if (item.selectedImage) {
formData.append('employeeImage', this.finalCroppdImg, this.finalCropddImgName.name);}
else{
  Swal.fire({
    title: 'Validation Error',
    text: 'Please upload an image.',
    icon: 'warning',
    confirmButtonText: 'OK'
  });
  return; 
}
  Swal.fire({
    title: 'Please Wait...',
    text: 'Inserting employee data...',
    icon: 'info',
    showConfirmButton: false,
    allowOutsideClick: false,
  });
  this.authService.insertEmployeeImage(formData).subscribe(
    (response) => {
      this.disableAddressDropdown = true;
      this.getEmployeeDetails();
      Swal.close();
      Swal.fire({
        title: 'Success!',
        text: 'Employee data has been inserted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.editingRowId=null;
    },
    (error) => {
      this.isLoading = false;
      Swal.close();

      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while inserting employee data.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    }
  );
}

VIEWPDF(employee: any): void {

  //this.baseUrl = this.authService.baseUrl;

  this.IDCARDDEATILS = Array.isArray(employee) ? employee : [employee];
  console.log(this.IDCARDDEATILS);
  //alert("1");
  
  //return;
  this.showModal = true; 
 return;
}
downloadPdf(employee: any) {
  // Create a FormData object and append the employeeId
  const formData = new FormData();
  formData.append('employeeId', employee.employeeId.toString());
  formData.append('code', employee.code.toString());
 // console.log(employee);
  
   this.isLoading=true;
    Swal.fire({
    title: 'Generating PDF...',
    text: 'Please wait while we generate the PDF.',
    icon: 'info',
    showConfirmButton: false,
  });
 
  // Call the API and handle the file response
  this.authService.generateIdcard(formData).subscribe((response: Blob) => {

    // Create a blob from the response
    const blob = new Blob([response], { type: 'application/pdf' });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Employee_ID_${employee.employeeId}.pdf`; 
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
   
     Swal.fire({
        title: 'Success!',
        text: 'Your PDF has been downloaded successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      this.isLoading=false;
     this.showModal=false;
  }, (error) => {

    //console.error('Failed to download file', error);
  });
}

 
getBackgroundStyle(imageName: string): string {
  //console.log('Checking background image name:', imageName);
  if (imageName === 'HHC.png') {
    return 'special-background'; 
  }
  return '';
}

}
